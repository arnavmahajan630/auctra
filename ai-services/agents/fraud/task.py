"""Fraud detection task — creates a CrewAI Task for listing fraud analysis."""

from crewai import Task

from .agent import get_fraud_agent


def make_fraud_task(listing: dict, seller_email: str) -> Task:
    """Create a fraud detection task for a given listing.

    Args:
        listing: The listing JSON object from the Listing Agent.
        seller_email: Seller's email for notification of results.

    Returns:
        A configured CrewAI Task.
    """
    return Task(
        description=(
            f"Analyze this auction listing for potential fraud.\n\n"
            f"Listing data:\n"
            f"  Title: {listing.get('title', 'N/A')}\n"
            f"  Description: {listing.get('description', 'N/A')}\n"
            f"  Starting Price: ${listing.get('starting_price_usd', 'N/A')}\n"
            f"  Condition: {listing.get('condition', 'N/A')}\n"
            f"  Tags: {listing.get('tags', [])}\n\n"
            f"Seller email: {seller_email}\n\n"
            f"Steps:\n"
            f"1. Use web_search to find the current market price for '{listing.get('title', '')}'\n"
            f"2. Compare with the listing starting price of ${listing.get('starting_price_usd', 0)}\n"
            f"3. Check description for red flags\n"
            f"4. Email the seller the result using mcp_notify with format: "
            f"'{seller_email}|<subject>|<body>'\n\n"
            f"Respond with ONLY valid JSON — no markdown fences, no explanation.\n"
            f"Required fields: trust_score (0-100), flagged (boolean), reason (string)"
        ),
        expected_output=(
            'A JSON object with keys: "trust_score" (integer 0-100), '
            '"flagged" (boolean), "reason" (one sentence). No markdown fences.'
        ),
        agent=get_fraud_agent(),
    )
