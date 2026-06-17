"""MCP (Model Context Protocol) notification and drive tools — httpx POST to local MCP server."""

import httpx
from crewai.tools import BaseTool


_MCP_BASE_URL = "http://localhost:3100"


class MCPNotifyTool(BaseTool):
    """Sends email notifications via the MCP server."""

    name: str = "mcp_notify"
    description: str = (
        "Send an email notification to a user. "
        "Input must be a pipe-separated string: 'to_email|subject|body'. "
        "Example: 'user@example.com|Listing Approved|Your listing has been approved.'"
    )

    def _run(self, command: str) -> str:
        """Send a notification email via MCP server.

        Args:
            command: Pipe-separated string of 'to_email|subject|body'.

        Returns:
            Success or error message.
        """
        try:
            parts = command.split("|", 2)  # Split into at most 3 parts
            if len(parts) != 3:
                return (
                    "MCP notify error: input must be 'to_email|subject|body' "
                    f"(got {len(parts)} parts)"
                )

            to_email, subject, body = (
                parts[0].strip(),
                parts[1].strip(),
                parts[2].strip(),
            )

            with httpx.Client(timeout=10.0) as client:
                response = client.post(
                    f"{_MCP_BASE_URL}/notify",
                    json={"to": to_email, "subject": subject, "body": body},
                )
                response.raise_for_status()

            return f"Notification sent to {to_email}: {subject}"

        except httpx.TimeoutException:
            return "MCP notify timed out after 10 seconds"
        except Exception as e:
            return f"MCP notify failed: {str(e)}"


class MCPDriveTool(BaseTool):
    """Saves files/reports to storage via the MCP server."""

    name: str = "mcp_drive_save"
    description: str = (
        "Save a file or report to cloud storage via MCP. "
        "Input must be a pipe-separated string: 'filename|content'. "
        "Example: 'auction_report_123.json|{\"winner\": \"0xABC\", \"amount\": 50}'"
    )

    def _run(self, command: str) -> str:
        """Save a file to storage via MCP server.

        Args:
            command: Pipe-separated string of 'filename|content'.

        Returns:
            Success or error message.
        """
        try:
            parts = command.split("|", 1)  # Split into at most 2 parts
            if len(parts) != 2:
                return (
                    "MCP drive error: input must be 'filename|content' "
                    f"(got {len(parts)} parts)"
                )

            filename, content = parts[0].strip(), parts[1].strip()

            with httpx.Client(timeout=10.0) as client:
                response = client.post(
                    f"{_MCP_BASE_URL}/save",
                    json={"filename": filename, "content": content},
                )
                response.raise_for_status()

            return f"File saved: {filename}"

        except httpx.TimeoutException:
            return "MCP drive timed out after 10 seconds"
        except Exception as e:
            return f"MCP drive failed: {str(e)}"
