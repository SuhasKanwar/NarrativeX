import json
import sys
import unittest
from unittest.mock import Mock

from schemas.evaluation import (
    CoverageComparison,
    EvidencePassage,
    MathematicalMetrics,
    NarrativeAnalysis,
)
from services.evaluation import EvaluationService, _flatten_sources, _select_evidence
from utils.exception import NarrativeXException


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
        sources = {
            "topic": "AI policy",
            "calls": [{"data": {"articles": [{"url": "https://news.example/off-topic", "title": "Xbox trade-in"}]}}, *SOURCES["calls"]],
        }
        result = EvaluationService.__new__(EvaluationService).fallback(sources)

        self.assertIn("https://news.example/0", result["response"])
        self.assertIn("https://social.example/0", result["response"])
        self.assertNotIn("Failed to analyze due to model error", result["response"])
        self.assertNotIn("Xbox", result["response"])
        self.assertIn('"state": "incomplete"', result["response"])

    def test_report_explicitly_compares_news_and_social_evidence(self):
        model = Mock()
        try:
            raise TimeoutError("judge timeout")
        except TimeoutError:
            unavailable = NarrativeXException("judge timeout", sys)
        model.generate_structured.side_effect = [
            NarrativeAnalysis(
                summary="Both source classes discuss AI policy.",
                comparisons=[CoverageComparison(
                    passages=[
                        EvidencePassage(reference="D1.1", stance="context"),
                        EvidencePassage(reference="D5.1", stance="context"),
                        EvidencePassage(reference="D99.1", stance="context"),
                    ],
                    topic="AI policy",
                    relationship="different_emphasis",
                    news_position="News describes legislation.",
                    social_position="Posts debate enforcement.",
                    news_urls=["https://news.example/0"],
                    social_urls=["https://social.example/0"],
                    confidence=0.8,
                    rationale="The sources cover the same topic with different emphasis.",
                    next_check="Find the legislation text.",
                )],
            ),
            unavailable,
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
        self.assertIn("```narrativex-graph", response)
        self.assertIn("## Verification priorities", response)
        self.assertIn("The model judge was unavailable", response)
        graph = json.loads(response.split("```narrativex-graph\n")[1].split("\n```")[0])
        comparison = next(node for node in graph["nodes"] if node["kind"] == "comparison")
        self.assertEqual([p["quote"] for p in comparison["passages"]], ["AI policy", "AI policy debate"])
        self.assertEqual(comparison["status"], "different_emphasis")
        self.assertEqual(comparison["nextCheck"], "Find the legislation text.")
        self.assertIsNone(graph["provenance"]["evaluation"]["judge"])


if __name__ == "__main__":
    unittest.main()
