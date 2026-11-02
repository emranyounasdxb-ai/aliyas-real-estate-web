"""Read-only PDF extraction for manual project research; never imports claims."""
import json
from pathlib import Path
import sys
from pypdf import PdfReader

sys.stdout.reconfigure(encoding="utf-8")
owner, slug = sys.argv[1:3]
folder = Path("artifacts/project-details") / owner
for path in sorted(folder.glob(f"{slug}-*.pdf")):
    target = path.with_suffix(".pages.json")
    if not target.exists():
        pages = [page.extract_text() or "" for page in PdfReader(path).pages]
        target.write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding="utf-8")
    else:
        pages = json.loads(target.read_text(encoding="utf-8"))
    print(f"{path.name}: {len(pages)} pages -> {target.name}")
