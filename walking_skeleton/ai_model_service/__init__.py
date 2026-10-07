"""X.04 AI Model Service: UC.1.6 fixed text; no model call."""
def synthesize_grounded_ai_explanation(score_evidence: dict) -> dict:
    return {"fixture": True,
            "text": "DEMO_A is shown first in this fixed fixture. No ranking algorithm or AI model was run.",
            "source_ids": ["FIXTURE-01"]}
