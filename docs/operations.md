# Run and hand over the demonstration

This procedure supports SR-06. A second member must execute it and record the outcome before claiming acceptance.

## Windows PowerShell

From the repository root, with Python 3.12 installed:

```powershell
py -3.12 -m venv backend/.venv
./backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
./backend/.venv/Scripts/python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8765 --no-access-log
```

Open `http://127.0.0.1:8765`, select **Compare fixture**, inspect the two fixed scores, explanation and source. Ctrl+C stops the server. Confirm the page cannot be freshly loaded from that server afterward.

## macOS / Linux

```sh
python3.12 -m venv backend/.venv
backend/.venv/bin/python -m pip install -r backend/requirements.txt
backend/.venv/bin/python -m uvicorn backend.main:app --host 127.0.0.1 --port 8765 --no-access-log
```

Use the same demonstration and shutdown steps. No real data/AI account or credential is required. Static website preview and HTTP backend are separate; the website does not host the backend.

## Verification

```powershell
./backend/.venv/Scripts/python.exe -m unittest discover -s tests -v
./backend/.venv/Scripts/python.exe scripts/check_http.py
./backend/.venv/Scripts/python.exe scripts/check_baseline.py
$env:PYTHON=(Resolve-Path ./backend/.venv/Scripts/python.exe).Path
node --test tests/site.test.mjs
```

On macOS/Linux use `backend/.venv/bin/python` and `PYTHON=backend/.venv/bin/python node --test tests/site.test.mjs`. Separate stakeholder acceptance checks are intentionally unmet: `python -m unittest discover -s acceptance -v`.

## Handover or retirement

The team selects the transition path and names its owner. For handover, retain the commit/version, environment, source baseline, known gaps and these instructions; have the receiving member repeat setup, run and shutdown independently. For retirement, stop the local processes, identify records to retain and the responsible member, and review any actual service access for revocation. This fixed-stub increment creates no provider credentials; existing organization/repository access remains a separate team decision.

Record operator, date, commit, chosen path, each completed step, help required and unresolved steps. Leave results pending until performed; this guide alone does not pass MOE-06.
