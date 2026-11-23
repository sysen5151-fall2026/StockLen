"""Embed the StockLens site and data routes in a dependency-free Worker module."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main(source, target):
    types = {".html": "text/html", ".css": "text/css", ".mjs": "text/javascript"}
    paths = sorted(path for path in source.rglob("*") if path.is_file() and path.suffix in types)
    assets = {"/" + path.relative_to(source).as_posix(): [types[path.suffix], path.read_text()] for path in paths}
    provider = (ROOT / "server" / "market-api.mjs").read_text()
    universe = (ROOT / "website" / "research" / "universe.mjs").read_text()
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(provider + "\n" + universe + "\nconst assets = " + json.dumps(assets) + """
const api = createMarketApi(universe);
export default {
  async fetch(request, env) {
    const result = await api(request, env);
    if (result) return result;
    const path = new URL(request.url).pathname;
    const asset = assets[path === '/' ? '/index.html' : path];
    if (!asset) return new Response('Not found', { status: 404 });
    return new Response(asset[1], {
      headers: { 'Content-Type': asset[0] + '; charset=utf-8', 'X-Content-Type-Options': 'nosniff' },
    });
  },
};
""", encoding="utf-8")


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))
