"""Run the configured evaluator on a small synthetic, labeled cross-media diagnostic."""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))

from config.models import NEMOTRON
from schemas.evaluation import EvidenceDocument
from services.evaluation import EvaluationService
from services.evidence_validation import validate_evidence


def score(rows):
    labels = sorted({row["expected"] for row in rows})
    per_label = {}
    for label in labels:
        tp = sum(r["expected"] == r["predicted"] == label for r in rows)
        fp = sum(r["expected"] != label and r["predicted"] == label for r in rows)
        fn = sum(r["expected"] == label and r["predicted"] != label for r in rows)
        precision = tp / (tp + fp) if tp + fp else 0
        recall = tp / (tp + fn) if tp + fn else 0
        per_label[label] = {"precision": precision, "recall": recall,
                            "f1": 2 * tp / (2 * tp + fp + fn) if 2 * tp + fp + fn else 0}
    return {"count": len(rows), "perLabel": per_label,
            "macroF1": sum(v["f1"] for v in per_label.values()) / len(labels) if labels else 0}


def main():
    evaluator = EvaluationService()
    rows = []
    for case in json.loads(Path(__file__).with_name("tests").joinpath("research_cases.json").read_text()):
        docs = [EvidenceDocument(url=f"https://{kind}.example/{case['id']}", source_type=kind,
                                 source=kind, text=case[kind]) for kind in ("news", "social")]
        try:
            raw = evaluator._analyze("Compare these two reports, accounting for negation, scope and dates. If they do not address a shared proposition, abstain.", docs)
        except Exception:
            print(json.dumps({"protocol": "synthetic-cross-media-v1", "model": NEMOTRON["MODEL_NAME"],
                              "status": "incomplete", "completedCases": len(rows), "cases": rows,
                              "error": "Provider inference failed; inspect local service logs. No aggregate score is published."}, indent=2))
            sys.exit(1)
        checked = validate_evidence(raw, docs)
        predicted = checked.comparisons[0].relationship
        rows.append({"id": case["id"], "expected": case["expected"], "predicted": predicted,
                     "documents": [d.model_dump() for d in docs], "analysis": checked.model_dump()})
    print(json.dumps({"protocol": "synthetic-cross-media-v1", "model": NEMOTRON["MODEL_NAME"],
                      "generatedAt": datetime.now(timezone.utc).isoformat(),
                      "limits": "Five synthetic cases; first comparison scored. Not a real-world benchmark or end-to-end retrieval test.",
                      "scores": score(rows), "cases": rows}, indent=2))


if __name__ == "__main__":
    main()
