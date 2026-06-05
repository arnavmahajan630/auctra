"""Bidding task — creates CrewAI Tasks for bid placement and auction settlement."""

from crewai import Task

from .agent import get_bidding_agent


def make_bidding_task(bid_data: dict, buyer_email: str) -> Task:
    """Create a bidding task for bid placement or auction settlement.

    Args:
        bid_data: Bid information dict. Must include:
            - For BID_PLACED: auction_id, current_bid, new_bid, max_budget,
              buyer_wallet, i_am_winning
            - For AUCTION_ENDED: auction_id, winner_wallet, final_amount,
              seller_email (optional)
        buyer_email: Buyer's email for notifications.

    Returns:
        A configured CrewAI Task.
    """
    event_type = bid_data.get("event_type", "BID_PLACED")

    if event_type == "AUCTION_ENDED":
        description = (
            f"Settle this completed auction.\n\n"
            f"Auction ID: {bid_data.get('auction_id', 'N/A')}\n"
            f"Winner wallet: {bid_data.get('winner_wallet', 'N/A')}\n"
            f"Final amount: ${bid_data.get('final_amount', 0)}\n"
            f"Winner email: {buyer_email}\n"
            f"Seller email: {bid_data.get('seller_email', 'N/A')}\n\n"
            f"Steps:\n"
            f"1. Use ugf_tool to settle payment — format: "
            f"'settle_payment|{bid_data.get('winner_wallet', '')}|{bid_data.get('final_amount', 0)}'\n"
            f"2. Notify winner via mcp_notify: '{buyer_email}|Auction Won!|"
            f"Congratulations! You won auction {bid_data.get('auction_id', '')} "
            f"for ${bid_data.get('final_amount', 0)}.'\n"
            f"3. Notify seller via mcp_notify: '{bid_data.get('seller_email', '')}|"
            f"Auction Sold!|Your item in auction {bid_data.get('auction_id', '')} "
            f"sold for ${bid_data.get('final_amount', 0)}.'\n\n"
            f"Respond with ONLY valid JSON — no markdown fences."
        )
        expected = (
            'A JSON object with keys: "action" ("settled"), '
            '"final_amount" (number), "reason" (one sentence). No markdown fences.'
        )
    else:
        description = (
            f"Validate and place this bid.\n\n"
            f"Bid data:\n"
            f"  Auction ID: {bid_data.get('auction_id', 'N/A')}\n"
            f"  Current bid: ${bid_data.get('current_bid', 0)}\n"
            f"  New bid: ${bid_data.get('new_bid', 0)}\n"
            f"  Max budget: ${bid_data.get('max_budget', 0)}\n"
            f"  Buyer wallet: {bid_data.get('buyer_wallet', 'N/A')}\n"
            f"  Buyer email: {buyer_email}\n"
            f"  Currently winning: {bid_data.get('i_am_winning', False)}\n\n"
            f"Steps:\n"
            f"1. Validate: new_bid (${bid_data.get('new_bid', 0)}) > "
            f"current_bid (${bid_data.get('current_bid', 0)})?\n"
            f"2. Validate: new_bid (${bid_data.get('new_bid', 0)}) <= "
            f"max_budget (${bid_data.get('max_budget', 0)})?\n"
            f"3. If valid: use ugf_tool — format: "
            f"'place_bid|{bid_data.get('buyer_wallet', '')}|{bid_data.get('new_bid', 0)}'\n"
            f"4. Lock 10% deposit: use ugf_tool — format: "
            f"'lock_deposit|{bid_data.get('buyer_wallet', '')}|"
            f"{round(bid_data.get('new_bid', 0) * 0.1, 2)}'\n"
            f"5. If buyer was previously winning and outbid, notify via mcp_notify\n\n"
            f"Respond with ONLY valid JSON — no markdown fences."
        )
        expected = (
            'A JSON object with keys: "action" ("bid_placed" or "rejected"), '
            '"amount" (number), "deposit_locked" (number), "reason" (one sentence). '
            "No markdown fences."
        )

    return Task(
        description=description,
        expected_output=expected,
        agent=get_bidding_agent(),
    )
