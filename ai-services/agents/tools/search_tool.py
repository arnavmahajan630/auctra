"""DuckDuckGo Instant Answer search tool — free, no API key required."""

from crewai.tools import BaseTool
from pydantic import Field
import httpx


class WebSearchTool(BaseTool):
    """Searches DuckDuckGo Instant Answer API for market prices and product info."""

    name: str = "web_search"
    description: str = (
        "Search the web for product market prices and general information. "
        "Input should be a concise search query string."
    )

    def _run(self, query: str) -> str:
        """Execute a DuckDuckGo instant answer search.

        Args:
            query: The search query string.

        Returns:
            The search result text, or an error message on failure.
        """
        try:
            url = "https://api.duckduckgo.com/"
            params = {
                "q": query,
                "format": "json",
                "no_html": 1,
                "skip_disambig": 1,
            }
            with httpx.Client(timeout=10.0) as client:
                response = client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

            # Try multiple fields for the best result
            result = (
                data.get("AbstractText")
                or data.get("Answer")
                or data.get("Definition")
                or data.get("AbstractURL")
            )

            if not result:
                # Fall back to related topics
                related = data.get("RelatedTopics", [])
                if related and isinstance(related[0], dict):
                    result = related[0].get("Text", "No result found")
                else:
                    result = "No result found"

            return str(result)

        except httpx.TimeoutException:
            return "Search timed out after 10 seconds"
        except Exception as e:
            return f"Search failed: {str(e)}"
