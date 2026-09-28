import re


class ModelRouter:
    RESEARCH_TERMS = re.compile(
        r"\b(news|social|coverage|narratives?|claim|evidence|source|misinformation|"
        r"disinformation|compare|comparison|agree|disagree|timeline|propagation|"
        r"headlines?|events?|regulations?|polic(?:y|ies)|geopolitics?)\b",
        re.IGNORECASE,
    )

    def route_request(self, prompt: str) -> tuple[str, str]:
        if self.RESEARCH_TERMS.search(prompt):
            return "narrative_analysis", "The request requires external source comparison."
        return "general", "The request does not require external evidence collection."
