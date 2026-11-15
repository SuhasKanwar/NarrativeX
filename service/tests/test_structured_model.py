import unittest
from unittest.mock import Mock

from models.nemotron import Nemotron
from schemas.evaluation import JudgeAssessment


class StructuredModelTest(unittest.TestCase):
    def test_uses_named_tool_and_validates_output(self):
        model = Nemotron.__new__(Nemotron)
        model.system_prompt = "Evaluate"
        model.llm = Mock()
        args = dict(groundedness=1, answer_relevance=1, completeness=1, source_quality=1, comparison_quality=1)
        model.llm.bind_tools.return_value.invoke.return_value.tool_calls = [
            {"name": "JudgeAssessment", "args": args}]
        result = model.generate_structured("Evidence", JudgeAssessment)
        self.assertEqual(result.groundedness, 1)
        self.assertEqual(model.llm.bind_tools.call_args.kwargs["tool_choice"], "JudgeAssessment")
        model.llm.bind_tools.return_value.invoke.return_value.tool_calls = []
        with self.assertRaises(Exception):
            model.generate_structured("Evidence", JudgeAssessment)
