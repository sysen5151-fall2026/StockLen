"""Package the StockLens public dashboard or the local engineering views."""
import argparse
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
WEBSITE = ROOT / "website"
BROWSER = ROOT / "pmc2" / "browser"
MODULES = ("evidence.mjs", "system.mjs", "local-explanation.mjs")


def build(engineering=False):
    target = ROOT / (".engineering-site" if engineering else ".site")
    target.mkdir(exist_ok=True)
    (target / "js").mkdir(exist_ok=True)
    for name in MODULES:
        shutil.copyfile(BROWSER / name, target / "js" / name)
    for name in (".nojekyll", "index.html"):
        shutil.copyfile(WEBSITE / name, target / name)
    shutil.copytree(WEBSITE / "research", target / "research", dirs_exist_ok=True)

    if not engineering:
        # Remove files left by a build made before the public package was reduced.
        for name in ("compare.html", "evidence.html", "skeleton.html", "research-lab.html", "app.css", "package.json"):
            (target / name).unlink(missing_ok=True)
        for name in ("app.js", "historical-adapter.js", "scoring.js", "skeleton.js"):
            (target / "js" / name).unlink(missing_ok=True)
        for name in ("data", "demo"):
            if (target / name).exists():
                shutil.rmtree(target / name)
    else:
        for name in ("app.css", "research-lab.html"):
            shutil.copyfile(WEBSITE / name, target / name)
        shutil.copytree(WEBSITE / "data", target / "data", dirs_exist_ok=True)
        shutil.copytree(WEBSITE / "js", target / "js", dirs_exist_ok=True)
        shutil.copytree(ROOT / "demo", target / "demo", dirs_exist_ok=True)
        skeleton = ROOT / "walking_skeleton" / "browser"
        page = (skeleton / "index.html").read_text(encoding="utf-8")
        page = page.replace('"./skeleton.js"', '"./js/skeleton.js"')
        page = page.replace('href="../../website/index.html"', 'href="./index.html"')
        (target / "skeleton.html").write_text(page, encoding="utf-8")
        shutil.copyfile(skeleton / "skeleton.js", target / "js" / "skeleton.js")
        for source, destination in (("index.html", "evidence.html"), ("compare.html", "compare.html")):
            page = (BROWSER / source).read_text(encoding="utf-8")
            for name in MODULES:
                page = page.replace(f"./{name}", f"./js/{name}")
            (target / destination).write_text(page, encoding="utf-8")

    print(f"Static site ready in {target.name}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--engineering", action="store_true", help="Build local course verification views.")
    build(parser.parse_args().engineering)
