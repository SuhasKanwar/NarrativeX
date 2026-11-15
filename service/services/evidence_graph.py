"""Build an inspectable citation graph from evaluated evidence, without another model call."""

from schemas.evaluation import EvidenceDocument, NarrativeAnalysis
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json


def build_evidence_graph(analysis: NarrativeAnalysis, documents: list[EvidenceDocument]) -> dict:
    documents = list({document.url: document for document in documents}.values())
    sources = {document.url: f"source:{index}" for index, document in enumerate(documents)}
    nodes = [{
        "id": sources[document.url], "kind": document.source_type,
        "label": document.title or document.text[:180] or document.source,
        "detail": document.text, "url": document.url,
        "publisher": document.source, "publishedAt": document.published_at,
    } for document in documents]
    edges = []
    gaps = []
    claim_ids = {}
    counts = Counter(claim.id for claim in analysis.claims)
    for index, claim in enumerate(analysis.claims):
        node_id = f"claim:{index}"
        if counts[claim.id] == 1:
            claim_ids[claim.id] = node_id
        nodes.append({"id": node_id, "kind": "claim", "label": claim.claim,
                      "detail": claim.rationale, "status": claim.status})
        citations = (("cites", claim.evidence_urls), ("counter_cites", claim.counter_evidence_urls))
        for relation, urls in citations:
            for url in dict.fromkeys(urls):
                if url in sources:
                    edges.append({"source": node_id, "target": sources[url], "relation": relation})
        valid = set(claim.evidence_urls + claim.counter_evidence_urls) & sources.keys()
        media = {document.source_type for document in documents if document.url in valid}
        if not valid:
            gaps.append({"node": node_id, "reason": "No retrieved evidence cited", "action": "Find a primary source that directly addresses this claim."})
        elif len(media) < 2:
            gaps.append({"node": node_id, "reason": "Only one media type cited", "action": "Check how the missing news or social side frames this claim."})
        if not set(claim.counter_evidence_urls) & sources.keys():
            gaps.append({"node": node_id, "reason": "No counter-evidence retrieved", "action": "Search for disconfirming evidence; absence here does not establish consensus."})

    for index, comparison in enumerate(analysis.comparisons):
        node_id = f"comparison:{index}"
        nodes.append({"id": node_id, "kind": "comparison", "label": comparison.topic,
                      "detail": f"News: {comparison.news_position}\nSocial: {comparison.social_position}\n{comparison.rationale}",
                      "status": comparison.relationship})
        for media, urls in (("news", comparison.news_urls), ("social", comparison.social_urls)):
            valid = {document.url for document in documents if document.source_type == media}
            for url in dict.fromkeys(urls):
                if url in valid:
                    edges.append({"source": node_id, "target": sources[url], "relation": "compares"})
            if not set(urls) & valid:
                gaps.append({"node": node_id, "reason": f"Missing valid {media} citation", "action": f"Retrieve {media} evidence before accepting this comparison."})

    for relationship in analysis.relationships:
        source = claim_ids.get(relationship.source_claim_id)
        target = claim_ids.get(relationship.target_claim_id)
        if source and target and source != target:
            edge = {"source": source, "target": target, "relation": relationship.relationship,
                    "detail": relationship.rationale + "".join(
                        f"\nExact excerpt ({p.url}): {p.quote}" for p in relationship.passages)}
            if edge not in edges:
                edges.append(edge)
                if relationship.relationship == "contradicts":
                    gaps.append({"node": source, "reason": "Potential conflict between claims",
                                 "action": "Check the linked claim, dates, and scope against primary evidence before resolving this model-inferred conflict."})

    findings = {f"claim:{i}": item for i, item in enumerate(analysis.claims)}
    findings.update({f"comparison:{i}": item for i, item in enumerate(analysis.comparisons)})
    for node in nodes:
        if node["id"] in findings:
            item = findings[node["id"]]
            node["passages"] = [p.model_dump() for p in item.passages]
            if not item.passages:
                gaps.append({"node": node["id"], "reason": "No exact evidence excerpts",
                             "action": "Retrieve passages before accepting this finding."})
    for edge in edges:
        item = findings.get(edge["source"])
        if edge["target"].startswith("source:") and item:
            edge["verification"] = "quotation_present" if any(
                sources.get(p.url) == edge["target"] for p in item.passages) else "citation_only"
        else:
            edge["verification"] = "model_inferred"
    snapshot = [doc.model_dump() for doc in documents]
    return {"version": 1, "nodes": nodes, "edges": edges, "gaps": gaps,
            "provenance": {"generatedAt": datetime.now(timezone.utc).isoformat(),
                "evidenceSha256": hashlib.sha256(json.dumps(snapshot, sort_keys=True).encode()).hexdigest(),
                "documents": snapshot}}


def graph_report(graph: dict) -> list[str]:
    lines = ["", "## Verification priorities", "",
             "These are gaps in the retrieved sample, not conclusions about the wider evidence."]
    labels = {node["id"]: node["label"] for node in graph["nodes"]}
    lines.extend(["", "## Evidence ledger", "",
                  "Exact excerpt checks establish attribution only. Stance and conclusions are model interpretations.", "",
                  "| Finding | Source | Exact excerpt | Model stance |", "| --- | --- | --- | --- |"])
    def cell(value):
        return str(value).replace("|", "&#124;").replace("\n", " ").replace("<", "&lt;")
    for node in graph["nodes"]:
        for passage in node.get("passages", []):
            lines.append(f"| {cell(node['label'])} | {cell(passage['url'])} | {cell(passage['quote'])} | {passage['stance']} |")
    for gap in graph["gaps"]:
        label = labels[gap["node"]].replace("\n", " ")
        lines.append(f"- {label}: {gap['reason']}. {gap['action']}")
    if not graph["gaps"]:
        lines.append("No citation coverage gaps detected. Source quality and factual support still require review.")
    return lines
