"""Orchestrator — the ONLY entry point teammates call.

Routes events to the appropriate agent pipeline and returns clean JSON results.
All operations are async and wrapped in retry logic for resilience.

Usage:
    from agents.orchestrator import orchestrator

    result = await orchestrator({"type": "NEW_LISTING", "seller_input": "...", "seller_email": "..."})
    result = await orchestrator({"type": "BID_PLACED", "bid_data": {...}, "buyer_email": "..."})
    result = await orchestrator({"type": "AUCTION_ENDED", "bid_data": {...}, "buyer_email": "...",
                                  "seller_history": {...}, "seller_wallet": "0x...", "seller_email": "..."})
"""

import asyncio
import json
import logging
import os
import re
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

# Load .env from project root (contains GROQ_API_KEY + OPENAI_API_KEY)
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# pyrefly: ignore [missing-import]
import litellm
# pyrefly: ignore [missing-import]
from crewai import Crew
from tenacity import retry, stop_after_attempt, wait_exponential

# Tell LiteLLM to silently drop unsupported top-level params
litellm.drop_params = True

# Monkey-patch litellm.completion to strip 'cache_breakpoint' from messages.
# CrewAI 1.14.5 injects this Anthropic-specific key into message dicts but
# does not strip it for non-Anthropic providers. Groq's strict validation
# rejects the unknown property. This patch removes it before the API call.
_original_completion = litellm.completion


def _patched_completion(*args, **kwargs):
    messages = kwargs.get("messages") or (args[1] if len(args) > 1 else None)
    if messages and isinstance(messages, list):
        for msg in messages:
            if isinstance(msg, dict):
                msg.pop("cache_breakpoint", None)
    return _original_completion(*args, **kwargs)


litellm.completion = _patched_completion

from agents.listing.task import make_listing_task
from agents.fraud.task import make_fraud_task
from agents.bidding.task import make_bidding_task
from agents.reputation.task import make_reputation_task

logger = logging.getLogger("agents.orchestrator")


def _extract_json(raw: str) -> dict:
    """Extract a JSON object from raw agent output.

    Handles cases where the agent wraps JSON in markdown fences
    or adds preamble text.

    Args:
        raw: Raw string output from a CrewAI task.

    Returns:
        Parsed dict from the JSON content.

    Raises:
        ValueError: If no valid JSON object can be extracted.
    """
    text = raw.strip()

    # Strip markdown code fences if present
    fence_pattern = r"```(?:json)?\s*([\s\S]*?)\s*```"
    fence_match = re.search(fence_pattern, text)
    if fence_match:
        text = fence_match.group(1).strip()

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try to find a JSON object in the text
    brace_match = re.search(r"\{[\s\S]*\}", text)
    if brace_match:
        try:
            return json.loads(brace_match.group())
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not extract valid JSON from agent output: {text[:200]}")


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=4, max=30))
def _run_crew(crew: Crew) -> str:
    """Execute a CrewAI crew with retry logic.

    Args:
        crew: A configured CrewAI Crew instance.

    Returns:
        Raw string output from the crew execution.
    """
    result = crew.kickoff()
    return str(result)


async def _handle_new_listing(event: dict[str, Any]) -> dict[str, Any]:
    """Handle NEW_LISTING event: Listing Agent → Fraud Agent pipeline.

    Args:
        event: Event dict with 'seller_input' and 'seller_email'.

    Returns:
        APPROVED result with listing data, or REJECTED with reason.
    """
    seller_input = event["seller_input"]
    seller_email = event["seller_email"]

    # Step 1: Run Listing Agent
    listing_task = make_listing_task(seller_input, seller_email)
    listing_crew = Crew(
        agents=[listing_task.agent],
        tasks=[listing_task],
        verbose=False,
    )

    logger.info("Running Listing Agent for seller: %s", seller_email)
    raw_listing = await asyncio.to_thread(_run_crew, listing_crew)
    listing = _extract_json(raw_listing)
    logger.info("Listing generated: %s", listing.get("title", "untitled"))

    # Step 2: Run Fraud Agent on listing output
    fraud_task = make_fraud_task(listing, seller_email)
    fraud_crew = Crew(
        agents=[fraud_task.agent],
        tasks=[fraud_task],
        verbose=False,
    )

    logger.info("Running Fraud Agent on listing: %s", listing.get("title", "untitled"))
    raw_fraud = await asyncio.to_thread(_run_crew, fraud_crew)
    fraud_result = _extract_json(raw_fraud)
    logger.info(
        "Fraud check complete — score: %s, flagged: %s",
        fraud_result.get("trust_score"),
        fraud_result.get("flagged"),
    )

    # Step 3: Return based on fraud result
    if fraud_result.get("flagged", False):
        return {
            "status": "REJECTED",
            "reason": fraud_result.get("reason", "Flagged by fraud detection"),
            "trust_score": fraud_result.get("trust_score", 0),
        }

    return {
        "status": "APPROVED",
        "listing": listing,
        "trust_score": fraud_result.get("trust_score", 0),
    }


async def _handle_bid_placed(event: dict[str, Any]) -> dict[str, Any]:
    """Handle BID_PLACED event: validate and place bid on-chain.

    Args:
        event: Event dict with 'bid_data' and 'buyer_email'.

    Returns:
        Bid decision JSON (bid_placed or rejected).
    """
    bid_data = event["bid_data"]
    buyer_email = event["buyer_email"]

    bid_task = make_bidding_task(bid_data, buyer_email)
    bid_crew = Crew(
        agents=[bid_task.agent],
        tasks=[bid_task],
        verbose=False,
    )

    logger.info(
        "Running Bidding Agent — auction: %s, bid: $%s",
        bid_data.get("auction_id"),
        bid_data.get("new_bid"),
    )
    raw_bid = await asyncio.to_thread(_run_crew, bid_crew)
    bid_result = _extract_json(raw_bid)
    logger.info("Bid result: %s", bid_result.get("action"))

    return bid_result


async def _handle_auction_ended(event: dict[str, Any]) -> dict[str, Any]:
    """Handle AUCTION_ENDED event: settle payment + reputation badge.

    Args:
        event: Event dict with 'bid_data', 'buyer_email',
               'seller_history', 'seller_wallet', 'seller_email'.

    Returns:
        Settlement and reputation result.
    """
    bid_data = event.get("bid_data", {})
    buyer_email = event.get("buyer_email", "")
    seller_history = event["seller_history"]
    seller_wallet = event["seller_wallet"]
    seller_email = event["seller_email"]

    # Step 1: Settle the auction via Bidding Agent (UGF touchpoint #3)
    bid_data_with_type = {**bid_data, "event_type": "AUCTION_ENDED"}
    settlement_task = make_bidding_task(bid_data_with_type, buyer_email)
    settlement_crew = Crew(
        agents=[settlement_task.agent],
        tasks=[settlement_task],
        verbose=False,
    )

    logger.info("Settling auction: %s", bid_data.get("auction_id"))
    raw_settlement = await asyncio.to_thread(_run_crew, settlement_crew)
    settlement_result = _extract_json(raw_settlement)
    logger.info("Settlement complete: %s", settlement_result.get("action"))

    # Brief pause between sequential agent calls to stay within Groq TPM limit
    await asyncio.sleep(10)

    # Step 2: Run Reputation Agent (UGF touchpoint #4)
    rep_task = make_reputation_task(seller_history, seller_wallet, seller_email)
    rep_crew = Crew(
        agents=[rep_task.agent],
        tasks=[rep_task],
        verbose=False,
    )

    logger.info("Running Reputation Agent for seller: %s", seller_wallet[:10])
    raw_rep = await asyncio.to_thread(_run_crew, rep_crew)
    reputation_result = _extract_json(raw_rep)
    logger.info("Badge awarded: %s", reputation_result.get("badge"))

    return {
        "status": "SETTLED",
        "settlement": settlement_result,
        "reputation": reputation_result,
    }


# ── Event handler dispatch table ──────────────────────────────────────
_HANDLERS = {
    "NEW_LISTING": _handle_new_listing,
    "BID_PLACED": _handle_bid_placed,
    "AUCTION_ENDED": _handle_auction_ended,
}


async def orchestrator(event: dict[str, Any]) -> dict[str, Any]:
    """Main orchestrator — the ONLY function teammates call.

    Routes events to the appropriate agent pipeline. Returns clean JSON.
    All failures are caught and returned as structured error responses.

    Args:
        event: Event dict with a 'type' key and event-specific data.
            Supported types: NEW_LISTING, BID_PLACED, AUCTION_ENDED

    Returns:
        A dict with 'status' key and event-specific result data.
        On failure: {"status": "ERROR", "fallback": "...", "error": "..."}
    """
    try:
        event_type = event.get("type")
        if not event_type:
            return {
                "status": "ERROR",
                "fallback": "agent temporarily unavailable",
                "error": "Missing 'type' in event payload",
            }

        handler = _HANDLERS.get(event_type)
        if not handler:
            return {
                "status": "ERROR",
                "fallback": "agent temporarily unavailable",
                "error": f"Unknown event type: {event_type}",
            }

        logger.info("Orchestrator handling event: %s", event_type)
        result = await handler(event)
        logger.info("Orchestrator completed: %s → %s", event_type, result.get("status", "OK"))
        return result

    except Exception as e:
        logger.exception("Orchestrator error for event type '%s'", event.get("type", "unknown"))
        return {
            "status": "ERROR",
            "fallback": "agent temporarily unavailable",
            "error": str(e),
        }
