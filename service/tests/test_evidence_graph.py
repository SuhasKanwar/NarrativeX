import unittest

from schemas.evaluation import ClaimAssessment, ClaimRelationship, CoverageComparison, EvidenceDocument, NarrativeAnalysis
from services.evidence_graph import build_evidence_graph, graph_report


class EvidenceGraphTest(unittest.TestCase):
    def test_graph_keeps_provenance_rejects_dangling_edges_and_exposes_gaps(self):
        documents = [EvidenceDocument(url="https://news.example/a", source_type="news", source="Outlet")]
        analysis = NarrativeAnalysis(
            summary="A limited sample.",
            claims=[ClaimAssessment(id="C1", claim="A policy passed.", status="unverified", confidence=0.2,
                                    evidence_urls=[documents[0].url, "https://invented.example"], rationale="Needs review.")],
            comparisons=[CoverageComparison(topic="Policy", relationship="insufficient_evidence",
                news_position="Reported", social_position="Unavailable", news_urls=[documents[0].url],
                social_urls=["https://invented.example"], confidence=0.1, rationale="Missing social evidence.")],
            relationships=[ClaimRelationship(source_claim_id="C1", target_claim_id="missing",
                relationship="supports", confidence=0.1, rationale="Invalid endpoint.")],
        )
        graph = build_evidence_graph(analysis, documents)
        self.assertEqual(len(graph["edges"]), 2)
        ids = {node["id"] for node in graph["nodes"]}
        self.assertTrue(all(edge["source"] in ids and edge["target"] in ids for edge in graph["edges"]))
        self.assertEqual(len(graph["gaps"]), 3)
        self.assertIn("No counter-evidence", "\n".join(graph_report(graph)))
        self.assertEqual(graph["nodes"][0]["url"], documents[0].url)


if __name__ == "__main__":
    unittest.main()
