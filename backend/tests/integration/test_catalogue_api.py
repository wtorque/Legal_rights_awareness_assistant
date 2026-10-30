import json
from datetime import UTC, datetime
from pathlib import Path

import pytest

from app.legal.catalogue.service import get_repository

pytestmark = pytest.mark.asyncio
SHA = "0" * 64
NOW = datetime(2026, 1, 1, tzinfo=UTC).isoformat()


def _ver(status="machine_extracted"):
    return {"status": status, "checked_by": None, "checked_at": None, "notes": None, "needs_review": True}


def _prov():
    return {"source_id": "x.src", "source_url": "https://example.org/x.pdf", "retrieved_at": NOW, "content_sha256": SHA, "locator": "p. 1"}


def _write(dirpath: Path, name: str, rows: list[dict]):
    (dirpath / f"{name}.jsonl").write_text("\n".join(json.dumps(r) for r in rows), encoding="utf-8")


@pytest.fixture
def fictional_corpus(tmp_path, settings_env):
    """A tiny corpus of FICTIONAL rights, so tests never depend on or invent real law."""
    d = tmp_path / "examplia"
    d.mkdir()
    _write(d, "sources", [{"id": "x.src", "name": "Example Gazette", "publisher": "Example", "base_url": "https://example.org", "trust_level": "unverified", "identity_evidence": "fixture", "verification": _ver("unverified")}])
    _write(d, "jurisdictions", [
        {"id": "XX", "name": "Examplia", "kind": "country", "parent_id": None, "verification": _ver()},
        {"id": "XX-N", "name": "North Examplia", "kind": "state", "parent_id": "XX", "verification": _ver()},
    ])
    _write(d, "domains", [{"id": "calm", "name": "Calm law", "description": None}])
    _write(d, "categories", [{"id": "quiet", "domain_id": "calm", "name": "Quiet rights", "name_basis": "fixture"}, {"id": "rest", "domain_id": "calm", "name": "Rest rights", "name_basis": "fixture"}])
    _write(d, "documents", [{"id": "x.doc", "title": "Example Calm Act", "doc_type": "central_act", "jurisdiction_id": "XX", "source_id": "x.src", "official_url": "https://example.org/x.pdf", "language": "en", "official_identifier": None, "effective_date": "2001-01-01", "effective_date_basis": "fixture", "edition_note": None, "repeal_status": "in_force", "provenance": _prov(), "verification": _ver()}])
    _write(d, "provisions", [{"id": "x.p1", "document_id": "x.doc", "jurisdiction_id": "XX", "locator": "Section 1", "number": "1", "heading": "Right to quiet", "text": "No noise in gardens.", "part": None, "group_heading": None, "status": "in_force", "amendments": [], "provenance": _prov(), "verification": _ver()}])
    rights = []
    for i, (title, kind, cat) in enumerate([("Quiet gardens", "enforceable_right", "quiet"), ("Afternoon nap", "scheme_benefit", "rest"), ("Silent streets", "enforceable_right", "quiet")]):
        rights.append({"id": f"x.r{i}", "title": title, "title_basis": "fixture", "kind": kind, "kind_basis": "fixture", "domain_id": "calm", "category_id": cat, "jurisdiction_id": "XX", "document_id": "x.doc", "provision_refs": [{"provision_id": "x.p1", "clause": None, "quote": "No noise in gardens."}], "authority_ids": [], "remedy_ids": [], "status": "in_force", "effective_date": None, "plain_language": None, "provenance": _prov(), "verification": _ver()})
    _write(d, "rights", rights)
    settings_env(CATALOGUE_DIR=str(tmp_path))
    get_repository.cache_clear()
    yield
    get_repository.cache_clear()


async def test_list_search_filter_and_paginate_without_a_fixed_count(client, fictional_corpus):
    r = (await client.get("/api/v1/catalogue/rights?limit=2")).json()
    assert r["total"] == 3 and len(r["items"]) == 2 and r["next_offset"] == 2
    r2 = (await client.get("/api/v1/catalogue/rights?limit=2&offset=2")).json()
    assert len(r2["items"]) == 1 and r2["next_offset"] is None
    q = (await client.get("/api/v1/catalogue/rights?q=nap")).json()
    assert [i["title"] for i in q["items"]] == ["Afternoon nap"]
    k = (await client.get("/api/v1/catalogue/rights?kind=scheme_benefit")).json()
    assert k["total"] == 1
    cat = (await client.get("/api/v1/catalogue/rights?category=quiet")).json()
    assert cat["total"] == 2
    # facet counts ignore the facet's own filter, so other options stay selectable
    assert {o["id"]: o["count"] for o in cat["facets"]["categories"]} == {"quiet": 2, "rest": 1}


async def test_detail_exposes_provenance_and_caveats(client, fictional_corpus):
    d = (await client.get("/api/v1/catalogue/rights/x.r1")).json()
    assert d["right"]["provenance"]["content_sha256"] == SHA
    assert d["provisions"][0]["provision"]["locator"] == "Section 1"
    assert any("not been checked by a person" in c for c in d["caveats"])
    assert d["kind_explanation"]
    assert (await client.get("/api/v1/catalogue/rights/missing")).status_code == 404


async def test_coverage_never_claims_completeness_and_lists_uncovered_jurisdictions(client, fictional_corpus):
    c = (await client.get("/api/v1/catalogue/coverage")).json()
    assert c["complete"] is False and c["audit_status"] == "not_started"
    north = next(j for j in c["jurisdictions"] if j["id"] == "XX-N")
    assert north["documents"] == 0 and north["rights"] == 0


async def test_input_validation(client, fictional_corpus):
    assert (await client.get("/api/v1/catalogue/rights?limit=1000")).status_code == 422
    assert (await client.get("/api/v1/catalogue/rights?kind=magic")).status_code == 422


REAL = Path(__file__).resolve().parents[2] / "data/corpus/india"


@pytest.mark.skipif(not (REAL / "rights.jsonl").exists(), reason="India corpus not generated")
async def test_real_corpus_invariants(client, settings_env):
    """Integrity checks on the generated corpus: provenance, verification, text and honest status."""
    get_repository.cache_clear()
    page = (await client.get("/api/v1/catalogue/rights?limit=100")).json()
    assert page["total"] >= 1
    for item in page["items"]:
        d = (await client.get(f"/api/v1/catalogue/rights/{item['id']}")).json()
        r = d["right"]
        assert len(r["provenance"]["content_sha256"]) == 64 and r["provenance"]["source_url"].startswith("https://")
        assert r["verification"]["status"] in {"machine_extracted", "human_verified"}
        assert all(ref["quote"].strip() for ref in r["provision_refs"])
        assert r["plain_language"] is None  # nothing is authored or AI-written into the corpus
        assert d["source"]["identity_evidence"]
    cov = (await client.get("/api/v1/catalogue/coverage")).json()
    assert cov["complete"] is False
