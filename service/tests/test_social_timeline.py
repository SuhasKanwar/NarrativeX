import sys
import unittest
from unittest.mock import Mock

from schemas.evaluation import EvidenceDocument
from services.evaluation import EvaluationService
from services.social_timeline import SocialTransitions, social_timeline_report
from utils.exception import NarrativeXException


def post(name, time, text, source_type="social"):
    return EvidenceDocument(
        url=f"https://social.example/{name}", source="Bluesky",
        source_type=source_type, published_at=time, text=text,
    )


EARLY = post("early", "2026-11-20T11:00:00+02:00", "The bill cuts reporting requirements.")
LATER = post("later", "2026-11-20T09:30:00Z", "The bill keeps reporting requirements. It simplifies the forms.")
TRANSITION = {
    "earlier_post": 1, "later_post": 2, "relation": "challenges",
    "earlier_excerpt": 1, "later_excerpt": 1,
    "explanation": "The later post disputes the earlier claim that the bill cuts reporting requirements.",
}


class SocialTimelineTest(unittest.TestCase):
    def test_report_orders_utc_dates_and_resolves_both_excerpts(self):
        model = Mock()
        model.generate_structured.return_value = SocialTransitions(transitions=[TRANSITION])
        documents = [
            LATER, EARLY, EARLY,
            post("invalid", "2026-11-19", "No time zone."),
            post("news", "2026-11-19T08:00:00Z", "News article.", source_type="news"),
        ]
        report = "\n".join(social_timeline_report("Track the bill", documents, model))

        self.assertIn("2 of 3", report)
        self.assertLess(report.index(EARLY.url), report.index(LATER.url))
        self.assertIn("2026-11-20 09:00:00 UTC", report)
        self.assertIn("1 of 1", report)
        self.assertIn("Challenges the earlier framing", report)
        self.assertIn("**Earlier excerpt:** “The bill cuts reporting requirements.”", report)
        self.assertIn("**Later excerpt:** “The bill keeps reporting requirements.”", report)
        self.assertNotIn("No time zone", report)
        self.assertNotIn("News article", report)

    def test_ties_and_invalid_or_conflicting_references_cannot_produce_a_finding(self):
        tied = post("tie", EARLY.published_at, "Same time.")
        model = Mock()
        tied_pair = {**TRANSITION}
        unsupported_pair = {**TRANSITION, "earlier_post": 1, "later_post": 3}
        pair_missing_excerpt = {**TRANSITION, "earlier_post": 2, "later_post": 3, "later_excerpt": 99}
        model.generate_structured.return_value = SocialTransitions(
            transitions=[tied_pair, unsupported_pair, pair_missing_excerpt],
        )
        report = "\n".join(social_timeline_report("Track the bill", [LATER, tied, EARLY], model))
        self.assertIn("Same timestamp", report)
        self.assertIn("0 of 1", report)
        self.assertNotIn("disputes", report)

        model.generate_structured.return_value = SocialTransitions(transitions=[TRANSITION, TRANSITION])
        report = "\n".join(social_timeline_report("Track the bill", [EARLY, LATER], model))
        self.assertIn("0 of 1", report)
        self.assertNotIn("disputes", report)

    def test_missing_news_does_not_prevent_a_social_comparison(self):
        model = Mock()
        model.generate_structured.return_value = SocialTransitions(transitions=[TRANSITION])
        sources = {"calls": [{"data": {"posts": [
            {"url": doc.url, "platform": doc.source, "publishedAt": doc.published_at, "content": doc.text}
            for doc in (EARLY, LATER)
        ]}}]}

        report = EvaluationService(model).evaluate("Track the bill", sources, [])["response"]

        self.assertIn("# Research incomplete", report)
        self.assertIn("## Social narrative timeline", report)
        self.assertIn("Challenges the earlier framing", report)
        self.assertEqual(model.generate_structured.call_count, 1)

    def test_sparse_sample_and_provider_failure_retain_the_available_posts(self):
        model = Mock()
        report = "\n".join(social_timeline_report("Track the bill", [EARLY], model))
        self.assertIn("Two posts with different timestamps", report)
        self.assertIn(EARLY.url, report)
        model.generate_structured.assert_not_called()

        try:
            raise TimeoutError("test provider timeout")
        except TimeoutError:
            model.generate_structured.side_effect = NarrativeXException("unavailable", sys)
        report = "\n".join(social_timeline_report("Track the bill", [EARLY, LATER], model))
        self.assertIn("Model interpretation was unavailable", report)
        self.assertIn(EARLY.url, report)
        self.assertIn(LATER.url, report)
