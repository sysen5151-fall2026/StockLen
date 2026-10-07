"""Check repository transcription against the retained source extraction, not model approval."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
baseline = json.loads((root / "model-artifacts/submitted-baseline.json").read_text(encoding="utf-8"))
spec = (root / "SPEC.md").read_text(encoding="utf-8")
matrix = (root / "requirements/TRACEABILITY.md").read_text(encoding="utf-8")
records = baseline["requirements"]
assert [r["requirement_id"] for r in records] == [f"SR-{n:02}" for n in range(1, 9)]
for r in records:
    for field in ("need", "requirement", "acceptance"):
        assert r[field] in spec, f"Source wording drift: {r['requirement_id']} {field}"
    assert r["method"] in matrix, f"Assessment method drift: {r['requirement_id']}"
    assert f"{r['need_id']} → {r['requirement_id']}" in matrix
    assert r["model"] in matrix
opscon = (root / "model-artifacts/opscon-verbatim.md").read_text(encoding="utf-8").split("\n\n", 1)[1].strip()
assert opscon in (root / "README.md").read_text(encoding="utf-8"), "OpsCon transcription drift"
print("PASS: 8 needs, requirements, criteria and methods retain extracted source wording; OpsCon matches.")
print("This is a transcription check, not stakeholder acceptance or a native Innoslate inspection.")
