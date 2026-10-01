from typing import Literal

from pydantic import BaseModel, Field


ClaimStatus = Literal[
    "supported",
    "disputed",
    "misleading",
    "unverified",
    "insufficient_evidence",
]
RelationshipType = Literal[
    "supports",
    "contradicts",
    "repeats",
    "reframes",
    "temporal_update",
    "causal_association",
    "unrelated",
]
ComparisonRelation = Literal[
    "agree",
    "partially_agree",
    "disagree",
    "different_emphasis",
    "insufficient_evidence",
]


class EvidenceDocument(BaseModel):
    url: str
    source_type: Literal["news", "social"]
    source: str
    title: str = ""
    text: str = ""
    published_at: str = ""

    def searchable_text(self) -> str:
        return " ".join(part for part in (self.title, self.text) if part).strip()[:1000]


class ClaimAssessment(BaseModel):
    id: str = Field(description="Stable short identifier such as C1")
    claim: str
    status: ClaimStatus
    confidence: float = Field(ge=0, le=1)
    evidence_urls: list[str] = Field(default_factory=list)
    counter_evidence_urls: list[str] = Field(default_factory=list)
    rationale: str


class ClaimRelationship(BaseModel):
    source_claim_id: str
    target_claim_id: str
    relationship: RelationshipType
    confidence: float = Field(ge=0, le=1)
    rationale: str


class CoverageComparison(BaseModel):
    topic: str
    relationship: ComparisonRelation
    news_position: str
    social_position: str
    news_urls: list[str] = Field(min_length=1)
    social_urls: list[str] = Field(min_length=1)
    confidence: float = Field(ge=0, le=1)
    rationale: str


class NarrativeAnalysis(BaseModel):
    summary: str
    comparisons: list[CoverageComparison] = Field(default_factory=list)
    claims: list[ClaimAssessment] = Field(default_factory=list)
    relationships: list[ClaimRelationship] = Field(default_factory=list)
    entities: list[str] = Field(default_factory=list)
    propagation_signals: list[str] = Field(default_factory=list)
    unknowns: list[str] = Field(default_factory=list)


class JudgeAssessment(BaseModel):
    groundedness: float = Field(ge=0, le=1)
    answer_relevance: float = Field(ge=0, le=1)
    completeness: float = Field(ge=0, le=1)
    source_quality: float = Field(ge=0, le=1)
    comparison_quality: float = Field(ge=0, le=1)
    unsupported_claims: list[str] = Field(default_factory=list)
    notes: list[str] = Field(default_factory=list)


class MathematicalMetrics(BaseModel):
    embedding_backend: str
    query_source_cosine_mean: float = Field(ge=0, le=1)
    query_source_cosine_max: float = Field(ge=0, le=1)
    claim_evidence_cosine_mean: float = Field(ge=0, le=1)
    claim_evidence_jaccard_mean: float = Field(ge=0, le=1)
    evidence_coverage: float = Field(ge=0, le=1)
    citation_validity: float = Field(ge=0, le=1)
    comparison_citation_validity: float = Field(ge=0, le=1)
    cross_media_coverage: float = Field(ge=0, le=1)
    cross_source_corroboration: float = Field(ge=0, le=1)
    source_diversity: float = Field(ge=0, le=1)
    source_redundancy: float = Field(ge=0, le=1)
    temporal_span_hours: float = Field(ge=0)


class EvaluationResult(BaseModel):
    quality_score: float = Field(ge=0, le=1)
    judge: JudgeAssessment
    metrics: MathematicalMetrics
