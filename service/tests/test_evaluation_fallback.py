import unittest

from services.evaluation import EvaluationService, _flatten_sources, _select_evidence


SOURCES = {
    "calls": [
        {"tool": "search_news", "data": {"articles": [
            {"url": f"https://news.example/{index}", "source": "News", "title": "AI policy"}
            for index in range(8)
        ]}},
        {"tool": "search_social_posts", "data": {"posts": [
            {"url": f"https://social.example/{index}", "platform": "bluesky", "content": "AI policy debate"}
            for index in range(8)
        ]}},
    ],
}


class EvaluationFallbackTest(unittest.TestCase):
    def test_evidence_selection_preserves_news_and_social_sources(self):
        selected = _select_evidence("AI policy", _flatten_sources(SOURCES), 8)

        self.assertEqual(sum(item.source_type == "news" for item in selected), 4)
        self.assertEqual(sum(item.source_type == "social" for item in selected), 4)

    def test_fallback_returns_source_links_without_model_error_details(self):
        result = EvaluationService.__new__(EvaluationService).fallback(SOURCES)

        self.assertIn("https://news.example/0", result["response"])
        self.assertIn("https://social.example/0", result["response"])
        self.assertNotIn("Failed to analyze due to model error", result["response"])


if __name__ == "__main__":
    unittest.main()
