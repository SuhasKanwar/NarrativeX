import unittest

from schemas.evaluation import ClaimAssessment, ClaimRelationship, CoverageComparison, EvidenceDocument, EvidencePassage, NarrativeAnalysis
from services.evidence_validation import validate_evidence
from services.evidence_graph import build_evidence_graph


class EvidenceValidationTest(unittest.TestCase):
    def test_fabricated_quotes_missing_media_and_ambiguous_edges_are_rejected(self):
        docs = [EvidenceDocument(url="news", source_type="news", source="N", text="The vote is scheduled for May."),
                EvidenceDocument(url="social", source_type="social", source="S", text="The vote has not happened.")]
        good = EvidencePassage(url="news", quote="The vote is scheduled for May.", stance="supports")
        fabricated = EvidencePassage(url="social", quote="The law passed.", stance="supports")
        analysis = NarrativeAnalysis(summary="A vote.", claims=[
            ClaimAssessment(id="C1", claim="A vote is scheduled.", status="supported", confidence=.8,
                            rationale="Schedule", passages=[good]),
            ClaimAssessment(id="C2", claim="The law passed.", status="supported", confidence=.9,
                            rationale="Unsupported", passages=[fabricated])], comparisons=[
            CoverageComparison(topic="Vote", relationship="agree", news_position="Scheduled", social_position="Passed",
                               news_urls=["news"], social_urls=["social"], confidence=.8, rationale="Test",
                               passages=[good, fabricated])], relationships=[
            ClaimRelationship(passages=[], source_claim_id="C1", target_claim_id="missing", relationship="supports",
                              confidence=.9, rationale="Invalid")])
        result = validate_evidence(analysis, docs)
        self.assertEqual(result.claims[0].status, "supported")
        self.assertEqual(result.claims[1].status, "insufficient_evidence")
        self.assertEqual(result.comparisons[0].relationship, "insufficient_evidence")
        self.assertEqual(result.relationships, [])
        self.assertEqual(analysis.claims[1].status, "supported")
        graph = build_evidence_graph(result, docs)
        self.assertEqual(graph["nodes"][2]["passages"][0]["quote"], good.quote)
        self.assertTrue(any(e["verification"] == "quotation_present" for e in graph["edges"]))
        self.assertEqual(len(graph["provenance"]["evidenceSha256"]), 64)
        self.assertEqual(graph["provenance"]["documents"][0]["text"], docs[0].text)


if __name__ == "__main__":
    unittest.main()
