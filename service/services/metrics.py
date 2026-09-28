import math
import re
from collections import Counter
from datetime import datetime
from typing import Any

from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings

from config import NVIDIA_API_KEY
from config.models import EMBEDDING_MODEL
from schemas.evaluation import EvidenceDocument, MathematicalMetrics, NarrativeAnalysis


TOKEN_PATTERN = re.compile(r"[\w'-]+", re.UNICODE)


def _tokens(text: str) -> set[str]:
    return {token.casefold() for token in TOKEN_PATTERN.findall(text) if len(token) > 2}


def _cosine(left: dict[str, float] | list[float], right: dict[str, float] | list[float]) -> float:
    if isinstance(left, dict) and isinstance(right, dict):
        dot = sum(value * right.get(key, 0.0) for key, value in left.items())
        left_norm = math.sqrt(sum(value * value for value in left.values()))
        right_norm = math.sqrt(sum(value * value for value in right.values()))
    else:
        dot = sum(a * b for a, b in zip(left, right))
        left_norm = math.sqrt(sum(value * value for value in left))
        right_norm = math.sqrt(sum(value * value for value in right))
    return dot / (left_norm * right_norm) if left_norm and right_norm else 0.0


def _tfidf_vectors(texts: list[str]) -> list[dict[str, float]]:
    tokenized = [_tokens(text) for text in texts]
    document_count = len(texts)
    frequencies = Counter(token for tokens in tokenized for token in tokens)
    return [
        {token: math.log((document_count + 1) / (frequencies[token] + 1)) + 1 for token in tokens}
        for tokens in tokenized
    ]


def _mean(values: list[float]) -> float:
    return sum(values) / len(values) if values else 0.0


def _jaccard(left: str, right: str) -> float:
    left_tokens, right_tokens = _tokens(left), _tokens(right)
    union = left_tokens | right_tokens
    return len(left_tokens & right_tokens) / len(union) if union else 0.0


def _normalized_entropy(values: list[str]) -> float:
    if len(set(values)) <= 1:
        return 0.0
    counts = Counter(values)
    entropy = -sum((count / len(values)) * math.log(count / len(values)) for count in counts.values())
    return entropy / math.log(len(counts))


def _temporal_span_hours(documents: list[EvidenceDocument]) -> float:
    parsed: list[datetime] = []
    for document in documents:
        try:
            parsed.append(datetime.fromisoformat(document.published_at.replace("Z", "+00:00")))
        except (TypeError, ValueError):
            continue
    return (max(parsed) - min(parsed)).total_seconds() / 3600 if len(parsed) > 1 else 0.0


def rank_documents(
    query: str,
    documents: list[EvidenceDocument],
    limit: int,
) -> list[EvidenceDocument]:
    if len(documents) <= limit:
        return documents
    vectors = _tfidf_vectors([query, *[document.searchable_text() for document in documents]])
    ranked = sorted(
        zip(documents, vectors[1:]),
        key=lambda item: _cosine(vectors[0], item[1]),
        reverse=True,
    )
    return [document for document, _ in ranked[:limit]]


class MetricsEvaluator:
    def __init__(self, embedder: Any = None):
        self.embedder = embedder

    def evaluate(
        self,
        query: str,
        documents: list[EvidenceDocument],
        analysis: NarrativeAnalysis,
    ) -> MathematicalMetrics:
        document_texts = [document.searchable_text() for document in documents]
        similarities, document_vectors, backend = self._semantic_similarity(query, document_texts)
        urls = {document.url: document for document in documents}
        cited_urls = [url for claim in analysis.claims for url in claim.evidence_urls + claim.counter_evidence_urls]
        valid_urls = [url for url in cited_urls if url in urls]
        covered_claims = [claim for claim in analysis.claims if any(url in urls for url in claim.evidence_urls + claim.counter_evidence_urls)]
        corroborated = [
            claim
            for claim in analysis.claims
            if len({urls[url].source for url in claim.evidence_urls if url in urls}) >= 2
        ]
        claim_cosines: list[float] = []
        claim_jaccards: list[float] = []
        for claim in analysis.claims:
            evidence = [urls[url].searchable_text() for url in claim.evidence_urls + claim.counter_evidence_urls if url in urls]
            if not evidence:
                continue
            vectors = _tfidf_vectors([claim.claim, *evidence])
            claim_cosines.append(max(_cosine(vectors[0], vector) for vector in vectors[1:]))
            claim_jaccards.append(max(_jaccard(claim.claim, text) for text in evidence))

        pairwise = [
            _cosine(document_vectors[left], document_vectors[right])
            for left in range(len(document_vectors))
            for right in range(left + 1, len(document_vectors))
        ]
        sources = [f"{document.source_type}:{document.source}" for document in documents]
        claim_count = len(analysis.claims)
        return MathematicalMetrics(
            embedding_backend=backend,
            query_source_cosine_mean=round(_mean(similarities), 4),
            query_source_cosine_max=round(max(similarities, default=0.0), 4),
            claim_evidence_cosine_mean=round(_mean(claim_cosines), 4),
            claim_evidence_jaccard_mean=round(_mean(claim_jaccards), 4),
            evidence_coverage=round(len(covered_claims) / claim_count, 4) if claim_count else 0.0,
            citation_validity=round(len(valid_urls) / len(cited_urls), 4) if cited_urls else 0.0,
            cross_source_corroboration=round(len(corroborated) / claim_count, 4) if claim_count else 0.0,
            source_diversity=round(_normalized_entropy(sources), 4),
            source_redundancy=round(_mean(pairwise), 4),
            temporal_span_hours=round(_temporal_span_hours(documents), 2),
        )

    def _semantic_similarity(
        self,
        query: str,
        texts: list[str],
    ) -> tuple[list[float], list[list[float] | dict[str, float]], str]:
        if not texts:
            return [], [], "none"
        try:
            embedder = self.embedder or NVIDIAEmbeddings(
                model=EMBEDDING_MODEL["MODEL_NAME"],
                api_key=NVIDIA_API_KEY,
            )
            query_vector = embedder.embed_query(query)
            document_vectors = embedder.embed_documents(texts)
            return (
                [_cosine(query_vector, vector) for vector in document_vectors],
                document_vectors,
                EMBEDDING_MODEL["MODEL_NAME"],
            )
        except Exception:
            vectors = _tfidf_vectors([query, *texts])
            return (
                [_cosine(vectors[0], vector) for vector in vectors[1:]],
                vectors[1:],
                "tfidf-fallback",
            )
