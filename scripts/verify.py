"""Run development checks with one interpreter; stakeholder acceptance is separate."""
import os
from pathlib import Path
import shutil
import subprocess
import sys


def main():
    root = Path(__file__).resolve().parents[1]
    node = shutil.which("node")
    if node is None:
        print("Node.js 20+ is required for website checks.", file=sys.stderr)
        return 1
    env = dict(os.environ, PYTHON=sys.executable)
    commands = [
        [sys.executable, "-m", "unittest", "discover", "-s", "tests", "-v"],
        [node, "--test", "tests/site.test.mjs"],
        [sys.executable, "scripts/check_baseline.py"],
        [sys.executable, "scripts/check_http.py"],
    ]
    for command in commands:
        print("Running " + " ".join(command), flush=True)
        result = subprocess.run(command, cwd=root, env=env)
        if result.returncode:
            return result.returncode
    print("PASS: development verification. Stakeholder acceptance remains separately unassessed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
