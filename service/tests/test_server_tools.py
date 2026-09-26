import unittest
import sys
from unittest.mock import Mock, patch

sys.modules.setdefault("httpx", Mock())

from tools.server import search_news, search_social_posts


class ServerToolsTest(unittest.TestCase):
    @patch("tools.server.httpx.request")
    def test_tools_forward_model_parameters_and_authentication(self, request: Mock):
        response = request.return_value
        response.json.return_value = {"data": {"items": []}}

        self.assertEqual(search_news("climate policy", "token", page_size=5), {"items": []})
        request.assert_called_with(
            "GET",
            "http://localhost:9000/api/news/search",
            headers={"Authorization": "Bearer token"},
            timeout=20,
            params={"q": "climate policy", "pageSize": 5, "language": "en", "sortBy": "publishedAt"},
        )

        search_social_posts(["climate policy"], "token", ["reddit"], 3)
        self.assertEqual(request.call_args.kwargs["json"], {
            "topics": ["climate policy"], "platforms": ["reddit"], "limit": 3,
        })


if __name__ == "__main__":
    unittest.main()
