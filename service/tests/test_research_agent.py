import sys
import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

sys.modules.setdefault("langchain_nvidia_ai_endpoints", SimpleNamespace(ChatNVIDIA=Mock))
sys.modules.setdefault("httpx", Mock())

from agents.research import ResearchAgent


class ResearchAgentTest(unittest.TestCase):
    @patch("agents.research.search_news")
    def test_model_parameters_drive_server_tool(self, search_news: Mock):
        search_news.return_value = {"articles": []}
        tool_call = {
            "id": "call-1",
            "name": "search_news",
            "args": {"query": "verified climate claim", "page_size": 4},
        }
        client = Mock()
        client.bind_tools.return_value.invoke.return_value = SimpleNamespace(tool_calls=[tool_call])

        result = ResearchAgent(client).collect("check this climate claim", "token")

        search_news.assert_called_once_with(
            access_token="token", query="verified climate claim", page_size=4,
        )
        self.assertEqual(result["calls"][0]["tool"], "search_news")
        self.assertEqual(
            [call.kwargs["tool_choice"] for call in client.bind_tools.call_args_list],
            ["required"],
        )


if __name__ == "__main__":
    unittest.main()
