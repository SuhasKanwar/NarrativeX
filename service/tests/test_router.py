import unittest

from services.router import ModelRouter


class ModelRouterTest(unittest.TestCase):
    def test_source_comparison_uses_research_workflow(self):
        route, _ = ModelRouter().route_request(
            "Compare news and social coverage of AI regulation. Where do they disagree?"
        )

        self.assertEqual(route, "narrative_analysis")

    def test_greeting_uses_general_workflow(self):
        route, _ = ModelRouter().route_request("Hello, what is NarrativeX?")

        self.assertEqual(route, "general")


if __name__ == "__main__":
    unittest.main()
