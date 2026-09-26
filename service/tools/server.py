from typing import Any

import httpx

from config import SERVER_BASE_URL

SOCIAL_PLATFORMS = ("reddit", "bluesky", "hackernews")


def _request(method: str, path: str, access_token: str | None, **kwargs) -> dict[str, Any]:
    if not access_token:
        raise ValueError("An authenticated NarrativeX session is required to collect sources")

    response = httpx.request(
        method,
        f"{SERVER_BASE_URL}{path}",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=20,
        **kwargs,
    )
    response.raise_for_status()
    return response.json().get("data", {})


def search_news(
    query: str,
    access_token: str | None,
    page_size: int = 10,
    language: str = "en",
    sort_by: str = "publishedAt",
) -> dict[str, Any]:
    query = query.strip()
    if not query or len(query) > 200:
        raise ValueError("News query must contain 1 to 200 characters")
    if not 1 <= page_size <= 20:
        raise ValueError("News page_size must be between 1 and 20")
    if sort_by not in {"relevancy", "popularity", "publishedAt"}:
        raise ValueError("Unsupported news sort order")

    return _request(
        "GET",
        "/api/news/search",
        access_token,
        params={"q": query, "pageSize": page_size, "language": language, "sortBy": sort_by},
    )


def search_social_posts(
    topics: list[str],
    access_token: str | None,
    platforms: list[str] | None = None,
    limit: int = 10,
) -> dict[str, Any]:
    topics = list(dict.fromkeys(topic.strip() for topic in topics if topic.strip()))
    platforms = list(dict.fromkeys(platforms or SOCIAL_PLATFORMS))
    if not 1 <= len(topics) <= 10 or any(len(topic) > 100 for topic in topics):
        raise ValueError("Social topics must contain 1 to 10 values of at most 100 characters")
    if not platforms or any(platform not in SOCIAL_PLATFORMS for platform in platforms):
        raise ValueError("Unsupported social platform")
    if not 1 <= limit <= 25:
        raise ValueError("Social limit must be between 1 and 25")

    return _request(
        "POST",
        "/api/social/search",
        access_token,
        json={"topics": topics, "platforms": platforms, "limit": limit},
    )
