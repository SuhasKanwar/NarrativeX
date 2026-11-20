"""Deterministic attribution checks; quotation presence does not establish entailment."""

from collections import Counter

from schemas.evaluation import EvidenceDocument, NarrativeAnalysis


def validate_evidence(analysis: NarrativeAnalysis, documents: list[EvidenceDocument]) -> NarrativeAnalysis:
    analysis = analysis.model_copy(deep=True)
    texts = {doc.url: " ".join(part for part in (doc.title, doc.text) if part).strip() for doc in documents}
    media = {doc.url: doc.source_type for doc in documents}
    ids = Counter(claim.id for claim in analysis.claims)
    analysis.relationships = [relation for relation in analysis.relationships
        if ids[relation.source_claim_id] == ids[relation.target_claim_id] == 1
        and relation.source_claim_id != relation.target_claim_id]
    for item in [*analysis.claims, *analysis.comparisons, *analysis.relationships]:
        original = len(item.passages)
        item.passages = [passage for passage in item.passages
            if passage.url in texts and passage.quote.strip() and passage.quote in texts[passage.url]]
        if len(item.passages) != original:
            analysis.unknowns.append("Rejected a quotation absent from its cited retrieved document.")
    for claim in analysis.claims:
        claim.evidence_urls = list(dict.fromkeys(p.url for p in claim.passages if p.stance == "supports"))
        claim.counter_evidence_urls = list(dict.fromkeys(p.url for p in claim.passages if p.stance == "contradicts"))
        if not claim.evidence_urls and claim.status == "supported":
            claim.status = "insufficient_evidence"
        if not claim.counter_evidence_urls and claim.status in {"disputed", "misleading"}:
            claim.status = "insufficient_evidence"
        if not claim.passages:
            claim.status = "insufficient_evidence"
    for comparison in analysis.comparisons:
        comparison.news_urls = list(dict.fromkeys(p.url for p in comparison.passages if media[p.url] == "news"))
        comparison.social_urls = list(dict.fromkeys(p.url for p in comparison.passages if media[p.url] == "social"))
        if not comparison.news_urls or not comparison.social_urls:
            comparison.relationship = "insufficient_evidence"
    supported_ids = {claim.id for claim in analysis.claims if claim.passages}
    analysis.relationships = [
        relationship for relationship in analysis.relationships
        if relationship.passages and relationship.relationship != "unrelated"
        and relationship.source_claim_id in supported_ids and relationship.target_claim_id in supported_ids
    ]
    analysis.unknowns = list(dict.fromkeys(analysis.unknowns))
    return analysis
