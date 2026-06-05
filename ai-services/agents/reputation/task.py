"""Reputation task — creates a CrewAI Task for seller reputation evaluation."""

from crewai import Task

from .agent import get_reputation_agent


def make_reputation_task(
    seller_history: dict,
    seller_wallet: str,
    seller_email: str,
) -> Task:
    """Create a reputation evaluation task.

    Args:
        seller_history: Dict with keys: items_sold, fraud_flags, avg_trust_score.
        seller_wallet: Seller's blockchain wallet address.
        seller_email: Seller's email for badge notification.

    Returns:
        A configured CrewAI Task.
    """
    items_sold = seller_history.get("items_sold", 0)
    fraud_flags = seller_history.get("fraud_flags", 0)
    avg_trust_score = seller_history.get("avg_trust_score", 0)

    return Task(
        description=(
            f"Evaluate this seller's reputation and mint their badge NFT.\n\n"
            f"Seller data:\n"
            f"  Wallet: {seller_wallet}\n"
            f"  Email: {seller_email}\n"
            f"  Items sold: {items_sold}\n"
            f"  Fraud flags: {fraud_flags}\n"
            f"  Average trust score: {avg_trust_score}\n\n"
            f"Badge rules:\n"
            f"  - 0-2 sales OR any fraud_flags > 0 → 'New Seller'\n"
            f"  - 3-9 sales AND trust > 70 → 'Verified Seller'\n"
            f"  - 10-19 sales AND trust > 85 → 'Trusted Seller'\n"
            f"  - 20+ sales AND trust > 92 → 'Elite Seller'\n\n"
            f"Steps:\n"
            f"1. Determine badge from rules above\n"
            f"2. Generate NFT metadata\n"
            f"3. Mint badge via ugf_tool: 'mint_badge|{seller_wallet}|<badge_name>'\n"
            f"4. Email seller via mcp_notify: '{seller_email}|Reputation Badge Awarded|"
            f"<message with badge details>'\n"
            f"5. Save report via mcp_drive_save: "
            f"'reputation_report_{seller_wallet[:10]}.json|<full JSON report>'\n\n"
            f"Respond with ONLY valid JSON — no markdown fences."
        ),
        expected_output=(
            'A JSON object with keys: "badge" (string), "score" (number), '
            '"nft_metadata" (object with name, description, attributes). '
            "No markdown fences."
        ),
        agent=get_reputation_agent(),
    )
