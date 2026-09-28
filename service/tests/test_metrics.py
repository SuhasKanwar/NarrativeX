import unittest

from schemas.evaluation import ClaimAssessment, EvidenceDocument, NarrativeAnalysis
from services.metrics import MetricsEvaluator


class FakeEmbedder:
    def embed_query(self, _text: str) -> list[float]:
        return [1.0, 0.0]

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [[1.0, 0.0] for _ in texts]


class MetricsEvaluatorTest(unittest.TestCase):
    def test_valid_independent_citations_are_covered_and_corroborated(self):
        documents = [
            EvidenceDocument(
                url=f"https://example.com/{index}",
                source_type="news",
                source=source,
                text="The city opened a public park.",
            )
            for index, source in enumerate(("Outlet A", "Outlet B"), 1)
        ]
        analysis = NarrativeAnalysis(
            summary="Two outlets report the opening.",
            claims=[ClaimAssessment(
                id="C1",
                claim="The city opened a public park.",
                status="supported",
                confidence=0.9,
                evidence_urls=[document.url for document in documents],
                rationale="Two independent sources report the event.",
            )],
        )

        metrics = MetricsEvaluator(FakeEmbedder()).evaluate("Did the park open?", documents, analysis)

        self.assertEqual(metrics.citation_validity, 1.0)
        self.assertEqual(metrics.evidence_coverage, 1.0)
        self.assertEqual(metrics.cross_source_corroboration, 1.0)


if __name__ == "__main__":
    unittest.main()
