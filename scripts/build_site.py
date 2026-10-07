"""Assemble the research site and the browser-only skeleton for Pages."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]

def build():
    target = ROOT / ".site"
    shutil.copytree(ROOT / "website", target, dirs_exist_ok=True)
    browser = ROOT / "walking_skeleton" / "browser"
    page = (browser / "index.html").read_text(encoding="utf-8")
    page = page.replace('"./skeleton.js"', '"./js/skeleton.js"')
    page = page.replace('href="../../website/index.html"', 'href="./index.html"')
    (target / "skeleton.html").write_text(page, encoding="utf-8")
    shutil.copyfile(browser / "skeleton.js", target / "js" / "skeleton.js")
    print("Static site ready in .site; preview with python -m http.server 8080 --directory .site")

if __name__ == "__main__":
    build()
