"""Reputation Agent — scores sellers, mints badge NFTs, and saves reports."""

from pathlib import Path

from crewai import Agent, LLM

from agents.tools.ugf_tool import UGFTool
from agents.tools.mcp_tool import MCPNotifyTool, MCPDriveTool


_PROMPT_PATH = Path(__file__).parent / "prompt.txt"


def get_reputation_agent() -> Agent:
    """Create and return the Reputation Agent.

    Uses Groq LLM with UGFTool (mint badge NFT),
    MCPNotifyTool (email seller), and MCPDriveTool (save report).

    Returns:
        A configured CrewAI Agent for reputation scoring.
    """
    llm = LLM(
        model="groq/llama-3.3-70b-versatile",
        temperature=0.2,
    )

    system_prompt = _PROMPT_PATH.read_text(encoding="utf-8")

    return Agent(
        role="Seller Reputation Analyst",
        goal=(
            "Evaluate seller performance, assign accurate reputation badges, "
            "mint badge NFTs on-chain, and maintain comprehensive auction reports."
        ),
        backstory=system_prompt,
        llm=llm,
        tools=[UGFTool(), MCPNotifyTool(), MCPDriveTool()],
        memory=False,  # Requires OpenAI credits for embeddings — enable when billing is active
        verbose=False,
        max_retry_limit=3,
        allow_delegation=False,
    )
