"""Bidding Agent — validates bids, places on-chain bids, and settles auctions via UGF."""

from pathlib import Path

from crewai import Agent, LLM

from agents.tools.ugf_tool import UGFTool
from agents.tools.mcp_tool import MCPNotifyTool


_PROMPT_PATH = Path(__file__).parent / "prompt.txt"


def get_bidding_agent() -> Agent:
    """Create and return the Bidding Agent.

    Uses Groq LLM with UGFTool (on-chain bid/settlement)
    and MCPNotifyTool (outbid alerts, winner notifications).

    Returns:
        A configured CrewAI Agent for bid management.
    """
    llm = LLM(
        model="groq/llama-3.3-70b-versatile",
        temperature=0.1,  # Low temperature for deterministic bid validation
    )

    system_prompt = _PROMPT_PATH.read_text(encoding="utf-8")

    return Agent(
        role="Auction Bid Manager",
        goal=(
            "Validate bids, execute on-chain bid placement and deposit locking via UGF, "
            "and settle auctions fairly when they end."
        ),
        backstory=system_prompt,
        llm=llm,
        tools=[UGFTool(), MCPNotifyTool()],
        memory=False,  # Requires OpenAI credits for embeddings — enable when billing is active
        verbose=False,
        max_retry_limit=3,
        allow_delegation=False,
    )
