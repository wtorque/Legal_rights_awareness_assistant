"""Read-only catalogue over JSONL corpora produced by the ingestion scripts.

This is the seam for the PostgreSQL-backed repository (see ADR-020): the service layer only uses these methods.
"""
import json
import re
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from app.legal.catalogue.schemas import (
    Authority, Category, Domain, Jurisdiction, LegalDocument, Provision, Remedy, Right, Source,
)

_RECORDS = {
    "sources": Source, "jurisdictions": Jurisdiction, "domains": Domain, "categories": Category,
    "documents": LegalDocument, "provisions": Provision, "authorities": Authority, "remedies": Remedy, "rights": Right,
}


def _tokens(text: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", text.lower())


@dataclass(frozen=True)
class RightFilter:
    q: str | None = None
    domain: str | None = None
    category: str | None = None
    kind: str | None = None
    jurisdiction: str | None = None
    verification: str | None = None
    status: str | None = None


class CatalogueRepository:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.sources: dict[str, Source] = {}
        self.jurisdictions: dict[str, Jurisdiction] = {}
        self.domains: dict[str, Domain] = {}
        self.categories: dict[str, Category] = {}
        self.documents: dict[str, LegalDocument] = {}
        self.provisions: dict[str, Provision] = {}
        self.authorities: dict[str, Authority] = {}
        self.remedies: dict[str, Remedy] = {}
        self.rights: dict[str, Right] = {}
        self.audits: list[dict[str, Any]] = []
        self._haystack: dict[str, str] = {}
        self._load()

    def _load(self) -> None:
        if not self.root.exists():
            return
        for corpus in sorted(p for p in self.root.iterdir() if p.is_dir()):
            for name, model in _RECORDS.items():
                f = corpus / f"{name}.jsonl"
                if not f.exists():
                    continue
                target: dict = getattr(self, name)
                for line in f.read_text(encoding="utf-8").splitlines():
                    if line.strip():
                        rec = model.model_validate_json(line)
                        target[rec.id] = rec
            audit = corpus / "audit.json"
            if audit.exists():
                self.audits.append({"corpus": corpus.name, **json.loads(audit.read_text(encoding="utf-8"))})
        for r in self.rights.values():
            quotes = " ".join(ref.quote for ref in r.provision_refs)
            heading = " ".join(self.provisions[ref.provision_id].heading or "" for ref in r.provision_refs
                               if ref.provision_id in self.provisions)
            self._haystack[r.id] = " ".join([
                r.title, r.title, r.title, heading, self.categories[r.category_id].name if r.category_id in self.categories else "",
                quotes, self.documents[r.document_id].title if r.document_id in self.documents else "",
            ]).lower()

    # ---- search ------------------------------------------------------------------------------
    def _matches(self, r: Right, f: RightFilter, skip: str | None = None) -> bool:
        checks = {
            "domain": f.domain is None or r.domain_id == f.domain,
            "category": f.category is None or r.category_id == f.category,
            "kind": f.kind is None or r.kind == f.kind,
            "jurisdiction": f.jurisdiction is None or r.jurisdiction_id == f.jurisdiction,
            "verification": f.verification is None or r.verification.status == f.verification,
            "status": f.status is None or r.status == f.status,
        }
        return all(v for k, v in checks.items() if k != skip)

    def _score(self, r: Right, tokens: list[str]) -> float | None:
        if not tokens:
            return 0.0
        hay = self._haystack[r.id]
        if not all(t in hay for t in tokens):
            return None
        title = r.title.lower()
        return sum(3.0 for t in tokens if t in title) + sum(hay.count(t) * 0.1 for t in tokens)

    def search_rights(self, f: RightFilter, *, limit: int, offset: int) -> tuple[list[Right], int]:
        tokens = _tokens(f.q or "")
        scored: list[tuple[float, Right]] = []
        for r in self.rights.values():
            if not self._matches(r, f):
                continue
            s = self._score(r, tokens)
            if s is not None:
                scored.append((s, r))
        scored.sort(key=lambda x: (-x[0], x[1].provenance.locator, x[1].id))
        return [r for _, r in scored[offset:offset + limit]], len(scored)

    def facets(self, f: RightFilter) -> dict[str, list[dict[str, Any]]]:
        """Counts per option, with every filter applied except the facet's own (so options stay selectable)."""
        tokens = _tokens(f.q or "")

        def count(skip: str, key) -> Counter:
            c: Counter = Counter()
            for r in self.rights.values():
                if self._matches(r, f, skip) and self._score(r, tokens) is not None:
                    c[key(r)] += 1
            return c

        def build(skip: str, key, label) -> list[dict[str, Any]]:
            counts = count(skip, key)
            return [{"id": k, "label": label(k), "count": n} for k, n in sorted(counts.items(), key=lambda x: (-x[1], str(x[0])))]

        return {
            "domains": build("domain", lambda r: r.domain_id, lambda k: self.domains[k].name if k in self.domains else k),
            "categories": build("category", lambda r: r.category_id, lambda k: self.categories[k].name if k in self.categories else k),
            "kinds": build("kind", lambda r: r.kind, lambda k: k),
            "jurisdictions": build("jurisdiction", lambda r: r.jurisdiction_id, lambda k: self.jurisdictions[k].name if k in self.jurisdictions else k),
            "verification": build("verification", lambda r: r.verification.status, lambda k: k),
            "status": build("status", lambda r: r.status, lambda k: k),
        }

    # ---- coverage ------------------------------------------------------------------------------
    def coverage(self) -> dict[str, Any]:
        rights_by_j = Counter(r.jurisdiction_id for r in self.rights.values())
        docs_by_j = Counter(d.jurisdiction_id for d in self.documents.values())
        return {
            "complete": False,
            "audit_status": "not_started",
            "statement": ("Coverage is NOT complete and has not been audited. Only the documents listed below "
                          "have been indexed; every other Central Act, State Act, rule, notification, judgment and scheme is missing."),
            "counts": {
                "rights": len(self.rights), "provisions": len(self.provisions), "documents": len(self.documents),
                "sources": len(self.sources), "jurisdictions": len(self.jurisdictions), "authorities": len(self.authorities),
                "remedies": len(self.remedies), "categories": len(self.categories), "domains": len(self.domains),
            },
            "verification": dict(Counter(r.verification.status for r in self.rights.values())),
            "kinds": dict(Counter(r.kind for r in self.rights.values())),
            "documents": [
                {"id": d.id, "title": d.title, "doc_type": d.doc_type, "jurisdiction_id": d.jurisdiction_id,
                 "effective_date": d.effective_date.isoformat() if d.effective_date else None,
                 "repeal_status": d.repeal_status, "edition_note": d.edition_note, "source_id": d.source_id}
                for d in self.documents.values()
            ],
            "jurisdictions": [
                {"id": j.id, "name": j.name, "kind": j.kind, "documents": docs_by_j.get(j.id, 0), "rights": rights_by_j.get(j.id, 0),
                 "state_legislation_indexed": j.kind != "country" and docs_by_j.get(j.id, 0) > 0}
                for j in self.jurisdictions.values()
            ],
            "audits": self.audits,
        }
