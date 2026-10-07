# Development environment

Python 3.12; FastAPI 0.135.1; uvicorn 0.41.0 (walking_skeleton/backend/requirements.txt). Standard-library unittest; static HTML/CSS/ES modules for the site. Node.js 20+ runs the website tests; no npm package install is needed. Git and a modern browser are required.

Local API: see docs/walking-skeleton.md. Static preview: `python3 scripts/build_site.py` then `python3 -m http.server 8080 --directory .site --bind 127.0.0.1`, then http://127.0.0.1:8080. Tests: `python3 -m unittest discover -s tests -v` and `node --test tests/site.test.mjs` from repository root. Set PYTHON if the Python executable has another name.

No API keys, accounts or live model are needed for this increment. Codex assists development; the in-product AI service is a fixed stub. GitHub Pages publishes .site/, assembled from website/ and walking_skeleton/browser/. Future backend hosting is a separate decision.
