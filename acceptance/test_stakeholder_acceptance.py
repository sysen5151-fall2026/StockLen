"""Report-derived red acceptance scaffold (Lab 3); not the green wiring suite.

These fail explicitly until the corresponding assessment evidence exists.
Do not replace failure with a stub check or a manually toggled success flag.
"""
import json
from pathlib import Path
import unittest

BASELINE = json.loads((Path(__file__).resolve().parents[1] / "model-artifacts/submitted-baseline.json").read_text(encoding="utf-8"))


class StakeholderAcceptancePending(unittest.TestCase):
    pass


def assessment_case(record):
    def check(self):
        self.fail(f"NOT ASSESSED: {record['requirement_id']}. {record['acceptance']} Required method: {record['method']}")
    return check


for record in BASELINE["requirements"]:
    setattr(StakeholderAcceptancePending,
            f"test_{record['need_id'].replace('-', '_')}_{record['requirement_id'].replace('-', '_')}",
            assessment_case(record))
