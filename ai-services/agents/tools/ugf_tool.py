"""UGF (Universal Gas Framework) tool — calls ugf_bridge.js via subprocess."""

import subprocess
from pathlib import Path

from crewai.tools import BaseTool


# Resolve the path to ugf_bridge.js relative to project root
_BRIDGE_SCRIPT = Path(__file__).resolve().parents[2] / "blockchain" / "ugf_bridge.js"


class UGFTool(BaseTool):
    """Executes on-chain UGF operations by calling the ugf_bridge.js Node.js script.

    Supported actions: place_bid, settle_payment, mint_badge, lock_deposit
    """

    name: str = "ugf_tool"
    description: str = (
        "Execute on-chain UGF operations (place_bid, settle_payment, mint_badge, lock_deposit). "
        "Input must be a pipe-separated string: 'action|wallet_address|data'. "
        "Example: 'place_bid|0xABC...|35'"
    )

    def _run(self, command: str) -> str:
        """Execute a UGF bridge command.

        Args:
            command: Pipe-separated string of 'action|wallet|data'.

        Returns:
            stdout from ugf_bridge.js, or an error message on failure.
        """
        try:
            parts = command.split("|")
            if len(parts) != 3:
                return (
                    "UGF error: input must be 'action|wallet|data' "
                    f"(got {len(parts)} parts)"
                )

            action, wallet, data = parts[0].strip(), parts[1].strip(), parts[2].strip()

            valid_actions = {"place_bid", "settle_payment", "mint_badge", "lock_deposit"}
            if action not in valid_actions:
                return f"UGF error: unknown action '{action}'. Valid: {valid_actions}"

            result = subprocess.run(
                ["node", str(_BRIDGE_SCRIPT), action, wallet, data],
                capture_output=True,
                text=True,
                timeout=30,
            )

            if result.returncode != 0:
                return f"UGF error: {result.stderr.strip()}"

            return result.stdout.strip() or "UGF operation completed successfully"

        except subprocess.TimeoutExpired:
            return "UGF call timed out after 30 seconds — retry"
        except FileNotFoundError:
            return "UGF error: Node.js not found or ugf_bridge.js missing"
        except Exception as e:
            return f"UGF error: {str(e)}"
