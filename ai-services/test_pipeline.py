"""Local test script for the full agent pipeline.

Tests all 3 event types: NEW_LISTING, BID_PLACED, AUCTION_ENDED.
Keys are loaded automatically from .env file.

Usage:
    python test_pipeline.py
"""

import asyncio
import json
import logging
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv

# Load .env and ensure the project root is on the path
_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(_ROOT))
load_dotenv(_ROOT / ".env")

# Groq free tier allows 12k tokens/minute.
# Each agent flow uses ~3-5k tokens, so we need to wait between flows.
RATE_LIMIT_COOLDOWN = 65  # seconds — just over 1 minute to reset TPM window


def _pretty(label: str, data: dict) -> None:
    """Print a labeled JSON result."""
    print(f"\n{'='*60}")
    print(f"  {label}")
    print(f"{'='*60}")
    print(json.dumps(data, indent=2))
    print()


def _cooldown(label: str) -> None:
    """Wait for rate limit window to reset."""
    print(f"\n  >> Cooling down {RATE_LIMIT_COOLDOWN}s for Groq rate limit reset...")
    for remaining in range(RATE_LIMIT_COOLDOWN, 0, -5):
        print(f"     {remaining}s remaining...", end="\r")
        time.sleep(5)
    print(f"  >> Cooldown complete. Resuming {label}...\n")


async def test_new_listing():
    """Test the NEW_LISTING flow (Listing Agent -> Fraud Agent)."""
    from agents.orchestrator import orchestrator

    result = await orchestrator({
        "type": "NEW_LISTING",
        "seller_input": "old nike air max 90 shoes size 10 worn maybe 3 times, still look fresh, original box included",
        "seller_email": "seller@example.com",
    })
    _pretty("NEW_LISTING Result", result)
    return result


async def test_bid_placed():
    """Test the BID_PLACED flow (Bidding Agent)."""
    from agents.orchestrator import orchestrator

    result = await orchestrator({
        "type": "BID_PLACED",
        "bid_data": {
            "auction_id": "AUC-001",
            "current_bid": 30,
            "new_bid": 35,
            "max_budget": 50,
            "buyer_wallet": "0x1234567890abcdef1234567890abcdef12345678",
            "i_am_winning": False,
        },
        "buyer_email": "buyer@example.com",
    })
    _pretty("BID_PLACED Result", result)
    return result


async def test_auction_ended():
    """Test the AUCTION_ENDED flow (Settlement + Reputation)."""
    from agents.orchestrator import orchestrator

    result = await orchestrator({
        "type": "AUCTION_ENDED",
        "bid_data": {
            "auction_id": "AUC-001",
            "winner_wallet": "0x1234567890abcdef1234567890abcdef12345678",
            "final_amount": 45,
            "seller_email": "seller@example.com",
        },
        "buyer_email": "buyer@example.com",
        "seller_history": {
            "items_sold": 12,
            "fraud_flags": 0,
            "avg_trust_score": 91,
        },
        "seller_wallet": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        "seller_email": "seller@example.com",
    })
    _pretty("AUCTION_ENDED Result", result)
    return result


async def test_error_handling():
    """Test error handling with missing/invalid event type."""
    from agents.orchestrator import orchestrator

    # Missing type
    result = await orchestrator({})
    _pretty("MISSING TYPE (should be ERROR)", result)

    # Unknown type
    result = await orchestrator({"type": "UNKNOWN_EVENT"})
    _pretty("UNKNOWN TYPE (should be ERROR)", result)


async def main():
    """Run all tests sequentially with rate limit cooldowns."""
    # Check for API key
    if not os.environ.get("GROQ_API_KEY"):
        print("ERROR: Set GROQ_API_KEY environment variable first.")
        print("  Windows:  set GROQ_API_KEY=gsk_your_key_here")
        print("  Linux:    export GROQ_API_KEY=gsk_your_key_here")
        sys.exit(1)

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
    )

    print("\n" + "="*60)
    print("  GASLESS AUCTION dApp -- Agent Layer Test Suite")
    print("  NOTE: Groq free tier = 12k TPM. Cooldowns between tests.")
    print("="*60)

    # Test error handling first (no LLM calls needed)
    print("\n[1/4] Testing error handling...")
    await test_error_handling()

    # Test NEW_LISTING (Listing + Fraud agents)
    print("\n[2/4] Testing NEW_LISTING flow...")
    print("  This calls Groq API (Listing Agent -> Fraud Agent)")
    listing_result = await test_new_listing()

    # Cooldown before next flow
    _cooldown("BID_PLACED")

    # Test BID_PLACED (Bidding agent)
    print("\n[3/4] Testing BID_PLACED flow...")
    print("  This calls Groq API (Bidding Agent)")
    await test_bid_placed()

    # Cooldown before next flow
    _cooldown("AUCTION_ENDED")

    # Test AUCTION_ENDED (Settlement + Reputation)
    print("\n[4/4] Testing AUCTION_ENDED flow...")
    print("  This calls Groq API (Bidding Agent -> Reputation Agent)")
    await test_auction_ended()

    print("\n" + "="*60)
    print("  ALL TESTS COMPLETE")
    print("="*60)
    print("\nNote: UGF and MCP tool calls will show errors if")
    print("ugf_bridge.js and MCP server are not running locally.")
    print("This is expected -- the LLM logic still executes correctly.\n")


if __name__ == "__main__":
    asyncio.run(main())

