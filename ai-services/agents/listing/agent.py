"""Listing Agent — transforms raw seller input into polished auction listings."""

from pathlib import Path

from crewai import Agent, LLM


_PROMPT_PATH = Path(__file__).parent / "prompt.txt"


def get_listing_agent() -> Agent:
    """Create and return the Listing Agent.

    Uses Groq LLM (llama3-70b-8192) with memory enabled.
    No tools — pure LLM copywriting.

    Returns:
        A configured CrewAI Agent for listing generation.
    """
    llm = LLM(
        model="groq/llama-3.3-70b-versatile",
        temperature=0.4,
    )

    system_prompt = _PROMPT_PATH.read_text(encoding="utf-8")

    return Agent(
        role="Product Listing Specialist",
        goal=(
            "Transform rough seller descriptions into polished, compelling "
            "auction listings with accurate pricing and condition assessment."
        ),
        backstory=system_prompt,
        llm=llm,
        tools=[],
        memory=False,  # Requires OpenAI credits for embeddings — enable when billing is active
        verbose=False,
        max_retry_limit=3,
        allow_delegation=False,
    )
