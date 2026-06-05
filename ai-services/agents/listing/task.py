"""Listing task — creates a CrewAI Task for listing generation."""

from crewai import Task

from .agent import get_listing_agent


def make_listing_task(seller_input: str, seller_email: str) -> Task:
    """Create a listing generation task.

    Args:
        seller_input: Raw product description from the seller.
        seller_email: Seller's email address for follow-up.

    Returns:
        A configured CrewAI Task.
    """
    return Task(
        description=(
            f"Transform this raw seller description into a professional auction listing.\n\n"
            f"Seller email: {seller_email}\n"
            f"Raw description: {seller_input}\n\n"
            f"Respond with ONLY valid JSON — no markdown fences, no explanation.\n"
            f"Required fields: title, description, starting_price_usd, condition, tags"
        ),
        expected_output=(
            'A JSON object with keys: "title" (max 8 words), "description" (2-3 sentences), '
            '"starting_price_usd" (number), "condition" (New|Like New|Good|Fair), '
            '"tags" (list of 3-5 strings). No markdown fences.'
        ),
        agent=get_listing_agent(),
    )
