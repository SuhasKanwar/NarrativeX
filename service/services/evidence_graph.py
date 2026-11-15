"""Build an inspectable citation graph from evaluated evidence, without another model call."""

from schemas.evaluation import EvidenceDocument, NarrativeAnalysis


def build_evidence_graph(analysis: NarrativeAnalysis, documents: list[EvidenceDocument]) -> dict:
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
    for index, claim in enumerate(analysis.claims):
        node_id = f"claim:{index}"
        claim_ids.setdefault(claim.id, node_id)
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
                    "detail": relationship.rationale}
            if edge not in edges:
                edges.append(edge)

    return {"version": 1, "nodes": nodes, "edges": edges, "gaps": gaps}


def graph_report(graph: dict) -> list[str]:
    lines = ["", "## Verification priorities", "",
             "These are gaps in the retrieved sample, not conclusions about the wider evidence."]
    labels = {node["id"]: node["label"] for node in graph["nodes"]}
    for gap in graph["gaps"]:
        label = labels[gap["node"]].replace("\n", " ")
        lines.append(f"- {label}: {gap['reason']}. {gap['action']}")
    if not graph["gaps"]:
        lines.append("No citation coverage gaps detected. Source quality and factual support still require review.")
    return lines
