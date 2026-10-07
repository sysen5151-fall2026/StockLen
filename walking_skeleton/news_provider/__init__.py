"""X.03 News Provider: UC.1.4.2 fixed evidence, never live news."""
def return_news_evidence(query: dict) -> list[dict]:
    return [{"id": "FIXTURE-01", "published_at": "2026-09-18",
             "title": "Fictional classroom evidence",
             "excerpt": "Demonstration evidence only; not real company news."}]
