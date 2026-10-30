"""Records of the legal rights catalogue.

Every record carries `provenance` (where the text came from) and `verification` (who checked it).
Nothing in the catalogue is written from memory: text fields are extracted from registered official sources,
and anything editorial (classification, grouping) is flagged `needs_review`.
"""
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

# What kind of entitlement a right is. Never merge these: users must be able to tell a court-enforceable
# right from a scheme benefit.
RightKind = Literal["enforceable_right", "constitutional_protection", "procedural_right", "scheme_benefit"]
VerificationStatus = Literal["unverified", "machine_extracted", "human_verified"]
RepealStatus = Literal["in_force", "partially_repealed", "repealed", "unknown"]
DocType = Literal["constitution", "central_act", "state_act", "rules", "notification", "judgment", "scheme", "other"]


class Strict(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Provenance(Strict):
    source_id: str
    source_url: str
    retrieved_at: datetime
    content_sha256: str = Field(min_length=64, max_length=64)
    locator: str  # e.g. "PDF pp. 36-37"


class Verification(Strict):
    status: VerificationStatus
    checked_by: str | None = None
    checked_at: datetime | None = None
    notes: str | None = None
    needs_review: bool = True


class Source(Strict):
    id: str
    name: str
    publisher: str
    base_url: str
    trust_level: Literal["official", "verified_secondary", "unverified"]
    identity_evidence: str
    verification: Verification


class Jurisdiction(Strict):
    id: str  # "IN", "IN-TG"
    name: str
    kind: Literal["country", "state", "union_territory"]
    parent_id: str | None = None
    verification: Verification


class Domain(Strict):
    id: str
    name: str
    description: str | None = None


class Category(Strict):
    id: str
    domain_id: str
    name: str
    name_basis: str  # where the name comes from, e.g. "Heading of a group of articles in Part III"


class Authority(Strict):
    id: str
    name: str
    evidence_provision_id: str  # the provision that names this authority
    verification: Verification


class LegalDocument(Strict):
    id: str
    title: str
    doc_type: DocType
    jurisdiction_id: str
    source_id: str
    official_url: str
    language: str = "en"
    official_identifier: str | None = None
    effective_date: date | None = None
    effective_date_basis: str | None = None
    edition_note: str | None = None  # which amendments the stored text reflects
    repeal_status: RepealStatus
    provenance: Provenance
    verification: Verification


class Amendment(Strict):
    """A footnote of the official text, verbatim."""
    marker: str
    text: str


class Provision(Strict):
    id: str
    document_id: str
    jurisdiction_id: str
    locator: str  # "Article 21"
    number: str
    heading: str | None  # official marginal heading, verbatim
    text: str  # verbatim as extracted
    part: str | None = None
    group_heading: str | None = None
    status: RepealStatus
    amendments: list[Amendment] = Field(default_factory=list)
    provenance: Provenance
    verification: Verification


class ProvisionRef(Strict):
    provision_id: str
    clause: str | None = None  # "(1)(a)"
    quote: str  # verbatim text this right rests on


class Remedy(Strict):
    id: str
    title: str
    description: str | None = None
    authority_ids: list[str]
    provision_refs: list[ProvisionRef]
    verification: Verification


class Right(Strict):
    id: str
    title: str
    title_basis: str  # "official marginal heading" | "derived from sub-clause text"
    kind: RightKind
    kind_basis: str
    domain_id: str
    category_id: str
    jurisdiction_id: str
    document_id: str
    provision_refs: list[ProvisionRef]
    authority_ids: list[str] = Field(default_factory=list)
    remedy_ids: list[str] = Field(default_factory=list)
    status: RepealStatus
    effective_date: date | None = None
    # Plain-language text is not written yet: it must be authored and reviewed, never invented here.
    plain_language: str | None = None
    provenance: Provenance
    verification: Verification
