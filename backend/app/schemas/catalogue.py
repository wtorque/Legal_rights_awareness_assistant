from datetime import date
from typing import Any, Literal

from pydantic import BaseModel

from app.legal.catalogue.schemas import (
    Authority, Category, Domain, Jurisdiction, LegalDocument, Provision, ProvisionRef, Remedy, Right, Source,
    Verification,
)


class Ref(BaseModel):
    id: str
    name: str


class RightSummary(BaseModel):
    id: str
    title: str
    kind: str
    status: str
    domain: Ref
    category: Ref
    jurisdiction: Ref
    document_title: str
    locators: list[str]
    excerpt: str
    verification: Verification
    effective_date: date | None


class FacetOption(BaseModel):
    id: str
    label: str
    count: int


class RightsPage(BaseModel):
    items: list[RightSummary]
    total: int
    next_offset: int | None
    facets: dict[str, list[FacetOption]]


class ProvisionDetail(BaseModel):
    provision: Provision
    refs: list[ProvisionRef]


class RightDetail(BaseModel):
    right: Right
    domain: Domain
    category: Category
    jurisdiction: Jurisdiction
    document: LegalDocument
    source: Source
    provisions: list[ProvisionDetail]
    authorities: list[Authority]
    remedies: list[Remedy]
    related: list[RightSummary]
    kind_explanation: str
    caveats: list[str]


class Coverage(BaseModel):
    complete: Literal[False]
    audit_status: str
    statement: str
    counts: dict[str, int]
    verification: dict[str, int]
    kinds: dict[str, int]
    documents: list[dict[str, Any]]
    jurisdictions: list[dict[str, Any]]
    audits: list[dict[str, Any]]
