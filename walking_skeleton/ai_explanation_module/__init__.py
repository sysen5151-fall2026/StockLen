"""Internal AI Explanation Module: BMA 3.2.4 coordination, not external X.04.

The walking skeleton forwards the existing fixed score/evidence package and
returns the external stub response. Schema enforcement and real AI are pending.
"""
from walking_skeleton import ai_model_service
def coordinate_explanation(score_evidence: dict) -> dict:
    return ai_model_service.synthesize_grounded_ai_explanation(score_evidence)
