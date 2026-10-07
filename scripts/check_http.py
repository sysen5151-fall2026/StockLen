"""Run the real local HTTP boundary against the fixed UC.1 fixture. No live services."""
import json
from pathlib import Path
import socket
import subprocess
import sys
import time
from urllib.error import URLError
from urllib.request import Request, urlopen


def main():
    root = Path(__file__).resolve().parents[1]
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        port = listener.getsockname()[1]
    server = subprocess.Popen([sys.executable, "-m", "uvicorn", "backend.main:app",
                               "--host", "127.0.0.1", "--port", str(port), "--no-access-log"], cwd=root)
    base = f"http://127.0.0.1:{port}"
    try:
        deadline = time.monotonic() + 15
        while True:
            if server.poll() is not None:
                raise RuntimeError("Local API exited before becoming ready")
            try:
                with urlopen(base, timeout=1) as response:
                    page = response.read().decode()
                break
            except (URLError, TimeoutError):
                if time.monotonic() >= deadline:
                    raise RuntimeError("Local API did not start within the smoke-check timeout")
                time.sleep(.1)
        assert 'id="comparison"' in page and "fetch('/compare'" in page
        results = []
        for pair, date in [(["DEMO_A", "DEMO_B"], "2026-09-18"), (["OTHER_A", "OTHER_B"], "2020-01-01")]:
            query = {"stock_a": pair[0], "stock_b": pair[1], "analysis_date": date}
            request = Request(base + "/compare", data=json.dumps(query).encode(), headers={"Content-Type": "application/json"})
            with urlopen(request, timeout=5) as response:
                assert response.status == 200
                result = json.load(response)
            assert result["mode"] == "walking-skeleton-fixed-fixture"
            assert result["requested_query"] == {"stock_pair": pair, "analysis_date": date}
            assert result["ranking"]["stock_pair"] == ["DEMO_A", "DEMO_B"]
            assert [row["score"] for row in result["ranking"]["scores"]] == [60, 40]
            assert result["ranking"]["analysis_date"] == "2026-09-18"
            assert result["ranking"]["observation_date"] == "2026-09-18"
            assert result["ranking"]["sources"][0]["published_at"] == "2026-09-18"
            assert result["explanation"]["source_ids"] == ["FIXTURE-01"]
            results.append(result)
        assert results[0]["ranking"] == results[1]["ranking"]
        print("PASS: GET / and two POST /compare requests; fixed fixture and requested query remain distinct.")
        print("This checks HTTP wiring, not browser rendering or stakeholder acceptance.")
    finally:
        server.terminate()
        try:
            server.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server.kill()
            server.wait()


if __name__ == "__main__":
    main()
