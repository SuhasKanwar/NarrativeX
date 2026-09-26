import json
import sys
import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

sys.modules.setdefault("groq", SimpleNamespace(Groq=Mock))
sys.modules.setdefault("httpx", Mock())

from agents.research import ResearchAgent


class ResearchAgentTest(unittest.TestCase):
    @patch("agents.research.search_news")
    def test_model_parameters_drive_server_tool(self, search_news: Mock):
        search_news.return_value = {"articles": []}
        tool_call = SimpleNamespace(
            id="call-1",
            function=SimpleNamespace(
                name="search_news",
                arguments=json.dumps({"query": "verified climate claim", "page_size": 4}),
            ),
        )
        client = Mock()
        client.chat.completions.create.side_effect = [
            SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(tool_calls=[tool_call]))]),
            SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(tool_calls=[]))]),
        ]

        result = ResearchAgent(client).collect("check this climate claim", "token")

        search_news.assert_called_once_with(
            access_token="token", query="verified climate claim", page_size=4,
        )
        self.assertEqual(result["calls"][0]["tool"], "search_news")


if __name__ == "__main__":
    unittest.main()
