"""File-backed document store. Stand-in for the PostgreSQL repository (see ADR-023); the service only uses these methods.

Layout under the root: `<id>.pdf` (original bytes) and `<id>.json` (record, text, analysis). Names are random ids,
never client filenames, and ids are validated before they touch a path.
"""
import os
import re
from datetime import UTC, datetime, timedelta
from pathlib import Path

from app.core.exceptions import NotFound
from app.schemas.documents import StoredDocument

_ID = re.compile(r"^[0-9a-f]{32}$")


def _check(document_id: str) -> str:
    if not _ID.fullmatch(document_id):
        raise NotFound("Document not found")
    return document_id


class DocumentRepository:
    def __init__(self, root: Path) -> None:
        self.root = root

    def _json(self, document_id: str) -> Path:
        return self.root / f"{_check(document_id)}.json"

    def _pdf(self, document_id: str) -> Path:
        return self.root / f"{_check(document_id)}.pdf"

    def save(self, doc: StoredDocument) -> None:
        self.root.mkdir(parents=True, exist_ok=True)
        target = self._json(doc.record.id)
        tmp = target.with_suffix(".json.tmp")
        tmp.write_text(doc.model_dump_json(), encoding="utf-8")
        os.replace(tmp, target)

    def save_pdf(self, document_id: str, data: bytes) -> None:
        self.root.mkdir(parents=True, exist_ok=True)
        self._pdf(document_id).write_bytes(data)

    def get(self, document_id: str, owner_id: str) -> StoredDocument:
        """Another user's document is reported as not found, so ids cannot be probed."""
        path = self._json(document_id)
        if not path.is_file():
            raise NotFound("Document not found")
        doc = StoredDocument.model_validate_json(path.read_text(encoding="utf-8"))
        if doc.owner_id != owner_id:
            raise NotFound("Document not found")
        return doc

    def pdf_path(self, document_id: str, owner_id: str) -> Path:
        self.get(document_id, owner_id)
        path = self._pdf(document_id)
        if not path.is_file():
            raise NotFound("Document not found")
        return path

    def _all(self) -> list[StoredDocument]:
        if not self.root.is_dir():
            return []
        return [StoredDocument.model_validate_json(p.read_text(encoding="utf-8")) for p in self.root.glob("*.json")]

    def list(self, owner_id: str) -> list[StoredDocument]:
        docs = [d for d in self._all() if d.owner_id == owner_id]
        return sorted(docs, key=lambda d: d.record.uploaded_at, reverse=True)

    def delete(self, document_id: str, owner_id: str) -> None:
        self.get(document_id, owner_id)
        self._pdf(document_id).unlink(missing_ok=True)
        self._json(document_id).unlink()

    def purge_older_than(self, days: int) -> int:
        """Delete every user's documents uploaded before the retention window. Returns how many were removed."""
        cutoff = datetime.now(UTC) - timedelta(days=days)
        stale = [d for d in self._all() if d.record.uploaded_at < cutoff]
        for d in stale:
            self.delete(d.record.id, d.owner_id)
        return len(stale)
