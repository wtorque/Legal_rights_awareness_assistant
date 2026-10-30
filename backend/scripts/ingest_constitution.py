"""Download the official Constitution PDF, extract Part III, and write the catalogue corpus.

Usage: python -m scripts.ingest_constitution [--pdf PATH] [--out data/corpus/india]
The raw PDF is cached under storage/raw/ (git-ignored); only its SHA-256 is recorded in the corpus.
"""
import argparse
import json
import sys
from pathlib import Path

import httpx

from app.legal.ingestion.build_constitution import PDF_URL, build

ROOT = Path(__file__).resolve().parent.parent


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--pdf", type=Path, default=ROOT / "storage/raw/constitution-of-india-2022.pdf")
    ap.add_argument("--out", type=Path, default=ROOT / "data/corpus/india")
    args = ap.parse_args()

    if not args.pdf.exists():
        args.pdf.parent.mkdir(parents=True, exist_ok=True)
        print(f"Downloading {PDF_URL}")
        with httpx.stream("GET", PDF_URL, follow_redirects=True, timeout=120) as r:
            r.raise_for_status()
            if "pdf" not in r.headers.get("content-type", ""):
                print("Unexpected content type", file=sys.stderr)
                return 1
            args.pdf.write_bytes(b"".join(r.iter_bytes()))

    records, report = build(args.pdf)
    failed = [k for k, v in report["checks"].items() if isinstance(v, bool) and not v]
    args.out.mkdir(parents=True, exist_ok=True)
    for name, items in records.items():
        with (args.out / f"{name}.jsonl").open("w", encoding="utf-8") as f:
            for item in items:
                f.write(item.model_dump_json() + "\n")
    (args.out / "audit.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(report["counts"]), "checks failed:", failed or "none")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
