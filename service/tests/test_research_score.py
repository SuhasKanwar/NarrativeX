import unittest

from verify_research import score


class ResearchScoreTest(unittest.TestCase):
    def test_wrong_label_counts_as_false_positive_and_false_negative(self):
        result = score([{"expected": "agree", "predicted": "agree"},
                        {"expected": "disagree", "predicted": "agree"}])
        self.assertAlmostEqual(result["macroF1"], 1 / 3)
        self.assertEqual(result["perLabel"]["agree"]["precision"], .5)
        self.assertEqual(result["perLabel"]["disagree"]["recall"], 0)
