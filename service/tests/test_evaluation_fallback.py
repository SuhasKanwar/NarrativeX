import unittest
from unittest.mock import Mock

from schemas.evaluation import (
    CoverageComparison,
    JudgeAssessment,
    MathematicalMetrics,
    NarrativeAnalysis,
)
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

    def test_report_explicitly_compares_news_and_social_evidence(self):
        model = Mock()
        model.generate_structured.side_effect = [
            NarrativeAnalysis(
                summary="Both source classes discuss AI policy.",
                comparisons=[CoverageComparison(
                    topic="AI policy",
                    relationship="different_emphasis",
                    news_position="News describes legislation.",
                    social_position="Posts debate enforcement.",
                    news_urls=["https://news.example/0"],
                    social_urls=["https://social.example/0"],
                    confidence=0.8,
                    rationale="The sources cover the same topic with different emphasis.",
                )],
            ),
            JudgeAssessment(
                groundedness=1,
                answer_relevance=1,
                completeness=1,
                source_quality=1,
                comparison_quality=1,
            ),
        ]
        metrics = Mock()
        metrics.evaluate.return_value = MathematicalMetrics(
            embedding_backend="test",
            query_source_cosine_mean=1,
            query_source_cosine_max=1,
            claim_evidence_cosine_mean=0,
            claim_evidence_jaccard_mean=0,
            evidence_coverage=0,
            citation_validity=0,
            comparison_citation_validity=1,
            cross_media_coverage=1,
            cross_source_corroboration=0,
            source_diversity=1,
            source_redundancy=0,
            temporal_span_hours=0,
        )

        response = EvaluationService(model, metrics).evaluate("Compare AI policy", SOURCES, [])["response"]

        self.assertIn("## News vs social", response)
        self.assertIn("**News:** News describes legislation.", response)
        self.assertIn("**Social:** Posts debate enforcement.", response)
        self.assertIn("https://news.example/0", response)
        self.assertIn("https://social.example/0", response)
        self.assertIn("## Research coverage", response)
        self.assertIn("## Sources", response)


if __name__ == "__main__":
    unittest.main()
