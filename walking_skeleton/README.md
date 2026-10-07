# StockLens Walking Skeleton

This folder contains the local HTTP demo and the browser-only demo. Both use fixed fictional results: DEMO_A = 60, DEMO_B = 40. No real market or AI service is called.

## Start on Windows

Open PowerShell in the repository root (the folder containing this folder):

```powershell
py -3.12 -m venv walking_skeleton/backend/.venv
./walking_skeleton/backend/.venv/Scripts/python.exe -m pip install -r walking_skeleton/backend/requirements.txt
./walking_skeleton/backend/.venv/Scripts/python.exe -m walking_skeleton
```

The first two commands are setup. For later runs, use only the last command. Open http://127.0.0.1:8765 and click **Compare fixture**. Stop with Ctrl+C.

On macOS/Linux, use `python3.12` for setup and `walking_skeleton/backend/.venv/bin/python` for the remaining commands. See the [operating guide](../docs/operations.md).

## Where the code is

| Folder or file | Role |
|---|---|
| backend/main.py | HTTP entry: GET / and POST /compare |
| frontend/index.html | Page served by the Python backend |
| dashboard_ui/ | Pass the request and prepare the display result |
| stocklens_system/ | Coordinate data, fixed ranking and explanation |
| market_data_provider/ | Fixed market-data stub |
| news_provider/ | Fixed news stub |
| ai_explanation_module/ | Internal explanation coordinator |
| ai_model_service/ | External X.04 service stub |
| browser/index.html and browser/skeleton.js | Browser-only mirror for the static website |

For the browser-only demo, run `python -m http.server 8080` from the repository root and open http://127.0.0.1:8080/walking_skeleton/browser/. It does not call the Python backend. The site build publishes the same files at the existing skeleton.html address.

## Model links and checks

[UC.1 call list](../docs/walking-skeleton.md) - [Need-to-model-to-code traceability](../requirements/TRACEABILITY.md)

From the repository root, run the virtual environment's Python with `scripts/verify.py`. These development checks verify the fixed-fixture path; they do not establish stakeholder acceptance.
