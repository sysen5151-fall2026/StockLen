"""Report the recorded evidence status; this is not an acceptance test."""
import json
import os
from pathlib import Path


def main():
    root = Path(__file__).resolve().parents[1]
    records = json.loads((root / "model-artifacts/submitted-baseline.json").read_text(encoding="utf-8"))["requirements"]
    lines = ["## Stakeholder acceptance readiness", "",
             "Report generation only. No stakeholder acceptance is established by this workflow.", "",
             "| Requirement | Recorded evidence status |", "|---|---|"]
    for record in records:
        lines.append(f"| {record['requirement_id']} | {record['evidence_status']} |")
    lines.extend(["", "The strict acceptance scaffold remains available through the manual workflow option",
                  "or `python -m unittest discover -s acceptance -v`. Missing evidence still fails that scaffold."])
    report = "\n".join(lines) + "\n"
    print(report)
    if summary := os.environ.get("GITHUB_STEP_SUMMARY"):
        with Path(summary).open("a", encoding="utf-8") as stream:
            stream.write(report)


if __name__ == "__main__":
    main()
