from typing import Literal

from fastapi import APIRouter, Depends, Query

from app.legal.catalogue.repository import CatalogueRepository, RightFilter
from app.legal.catalogue.schemas import Right
from app.legal.catalogue.service import get_repository, require_right
from app.schemas.catalogue import (
    Coverage, FacetOption, ProvisionDetail, Ref, RightDetail, RightsPage, RightSummary,
)

router = APIRouter(prefix="/catalogue", tags=["catalogue"])

KIND_EXPLANATIONS = {
    "enforceable_right": "A right that a court or tribunal can enforce directly under a statute.",
    "constitutional_protection": "A protection set out in the Constitution. It limits what the State may do and can be enforced through the courts the Constitution names.",
    "procedural_right": "A right about how the State or a court must proceed, or a route for getting a right enforced.",
    "scheme_benefit": "An entitlement created by a government scheme or notification, usually subject to eligibility rules and available funds.",
}


def repo() -> CatalogueRepository:
    return get_repository()


def _summary(r: Right, c: CatalogueRepository) -> RightSummary:
    first = r.provision_refs[0]
    quote = " ".join(first.quote.split())
    return RightSummary(
        id=r.id, title=r.title, kind=r.kind, status=r.status,
        domain=Ref(id=r.domain_id, name=c.domains[r.domain_id].name),
        category=Ref(id=r.category_id, name=c.categories[r.category_id].name),
        jurisdiction=Ref(id=r.jurisdiction_id, name=c.jurisdictions[r.jurisdiction_id].name),
        document_title=c.documents[r.document_id].title,
        locators=[(c.provisions[x.provision_id].locator + (x.clause or "")) for x in r.provision_refs],
        excerpt=quote[:280] + ("…" if len(quote) > 280 else ""),
        verification=r.verification, effective_date=r.effective_date,
    )


@router.get("/rights", response_model=RightsPage)
def list_rights(
    q: str | None = Query(None, max_length=200),
    domain: str | None = Query(None, max_length=100),
    category: str | None = Query(None, max_length=100),
    kind: Literal["enforceable_right", "constitutional_protection", "procedural_right", "scheme_benefit"] | None = None,
    jurisdiction: str | None = Query(None, max_length=20),
    verification: Literal["unverified", "machine_extracted", "human_verified"] | None = None,
    status: Literal["in_force", "partially_repealed", "repealed", "unknown"] | None = None,
    limit: int = Query(24, ge=1, le=100),
    offset: int = Query(0, ge=0),
    c: CatalogueRepository = Depends(repo),
) -> RightsPage:
    f = RightFilter(q=q, domain=domain, category=category, kind=kind, jurisdiction=jurisdiction,
                    verification=verification, status=status)
    rows, total = c.search_rights(f, limit=limit, offset=offset)
    facets = {k: [FacetOption(**o) for o in v] for k, v in c.facets(f).items()}
    nxt = offset + limit
    return RightsPage(items=[_summary(r, c) for r in rows], total=total, next_offset=nxt if nxt < total else None, facets=facets)


@router.get("/rights/{right_id}", response_model=RightDetail)
def get_right(right_id: str, c: CatalogueRepository = Depends(repo)) -> RightDetail:
    r = require_right(c, right_id)
    doc = c.documents[r.document_id]
    related = [x for x in c.rights.values() if x.category_id == r.category_id and x.id != r.id][:6]
    caveats = []
    if r.verification.status != "human_verified":
        caveats.append("The text was extracted from the official source by software and has not been checked by a person.")
    if r.kind_basis.startswith("EDITORIAL") or r.verification.needs_review:
        caveats.append("The classification of this entry as a type of right is an editorial choice that has not been reviewed.")
    if doc.edition_note:
        caveats.append(doc.edition_note)
    if r.plain_language is None:
        caveats.append("No plain-language explanation has been written or reviewed for this right yet; the official text is shown instead.")
    return RightDetail(
        right=r, domain=c.domains[r.domain_id], category=c.categories[r.category_id],
        jurisdiction=c.jurisdictions[r.jurisdiction_id], document=doc, source=c.sources[doc.source_id],
        provisions=[ProvisionDetail(provision=c.provisions[ref.provision_id], refs=[ref]) for ref in r.provision_refs],
        authorities=[c.authorities[a] for a in r.authority_ids if a in c.authorities],
        remedies=[c.remedies[x] for x in r.remedy_ids if x in c.remedies],
        related=[_summary(x, c) for x in related],
        kind_explanation=KIND_EXPLANATIONS[r.kind], caveats=caveats,
    )


@router.get("/coverage", response_model=Coverage)
def coverage(c: CatalogueRepository = Depends(repo)) -> Coverage:
    return Coverage(**c.coverage())
