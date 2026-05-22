"""Fraud Detection Agent — analyzes listings for fraud using web search and notifications."""

from pathlib import Path

from crewai import Agent, LLM

from agents.tools.search_tool import WebSearchTool
from agents.tools.mcp_tool import MCPNotifyTool


_PROMPT_PATH = Path(__file__).parent / "prompt.txt"


def get_fraud_agent() -> Agent:
    """Create and return the Fraud Detection Agent.

    Uses Groq LLM with WebSearchTool (market price verification)
    and MCPNotifyTool (seller email notification).

    Returns:
        A configured CrewAI Agent for fraud detection.
    """
    llm = LLM(
        model="groq/llama-3.3-70b-versatile",
        temperature=0.1,  # Low temperature for consistent analytical judgments
    )

    system_prompt = _PROMPT_PATH.read_text(encoding="utf-8")

    return Agent(
        role="Fraud Detection Analyst",
        goal=(
            "Analyze product listings to detect fraud, verify market pricing, "
            "and protect buyers from scams while ensuring legitimate sellers are approved quickly."
        ),
        backstory=system_prompt,
        llm=llm,
        tools=[WebSearchTool(), MCPNotifyTool()],
        memory=False,  # Requires OpenAI credits for embeddings — enable when billing is active
        verbose=False,
        max_retry_limit=3,
        allow_delegation=False,
    )
