"""Builds catalogue records for Part III of the Constitution of India from the official PDF.

Everything that is law (titles, text, amendment notes, dates) is extracted from the PDF. Choices that are
editorial are listed in `constitution.py` and in the `*_basis` fields, and every record is flagged for review.
"""
import hashlib
import re
from datetime import UTC, date, datetime
from pathlib import Path

import pymupdf

from app.legal.catalogue.schemas import (
    Amendment, Authority, Category, Domain, Jurisdiction, LegalDocument, Provenance, Provision, ProvisionRef,
    Remedy, Right, Source, Verification,
)
from app.legal.ingestion.constitution import (
    PART_III_ARTICLES, PROCEDURAL_ARTICLES, RIGHT_ARTICLES, PageText, ParsedArticle, effective_date_from_commencement,
    parse_articles, split_clause_rights, split_page,
)

PDF_URL = "https://cdnbbsr.s3waas.gov.in/s380537a945c7aaa788ccfcdf1b99b5d8f/uploads/2023/05/2023050195.pdf"
SOURCE_ID = "in.src.legislative-dept-constitution-pdf"
DOC_ID = "in.const"
DOMAIN_ID = "constitutional-law"

# Jurisdiction names are administrative facts. They are checked against the Constitution's First Schedule
# in this same PDF; ISO 3166-2 codes are NOT verified here and are flagged as such.
STATES = {
    "AP": "Andhra Pradesh", "AR": "Arunachal Pradesh", "AS": "Assam", "BR": "Bihar", "CG": "Chhattisgarh", "GA": "Goa",
    "GJ": "Gujarat", "HR": "Haryana", "HP": "Himachal Pradesh", "JH": "Jharkhand", "KA": "Karnataka", "KL": "Kerala",
    "MP": "Madhya Pradesh", "MH": "Maharashtra", "MN": "Manipur", "ML": "Meghalaya", "MZ": "Mizoram", "NL": "Nagaland",
    "OD": "Odisha", "PB": "Punjab", "RJ": "Rajasthan", "SK": "Sikkim", "TN": "Tamil Nadu", "TG": "Telangana",
    "TR": "Tripura", "UP": "Uttar Pradesh", "UK": "Uttarakhand", "WB": "West Bengal",
}
UNION_TERRITORIES = {
    "AN": "Andaman and Nicobar Islands", "CH": "Chandigarh", "DH": "Dadra and Nagar Haveli and Daman and Diu",
    "DL": "Delhi", "JK": "Jammu and Kashmir", "LA": "Ladakh", "LD": "Lakshadweep", "PY": "Puducherry",
}
# A name must contain every one of these words in the First Schedule to count as confirmed.
_SCHEDULE_KEYS = {"Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman and Diu"]}


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def _ver(status="machine_extracted", notes: str | None = None) -> Verification:
    return Verification(status=status, notes=notes, needs_review=True)


def _first_schedule_text(doc: "pymupdf.Document") -> str:
    out = []
    for i in range(doc.page_count):
        t = doc[i].get_text()
        if re.search(r"\(First Schedule\)", t) or re.search(r"FIRST SCHEDULE\s+\[Articles 1 and 4\]", t):
            out.append(t)
    return re.sub(r"\s+", " ", " ".join(out))


def build(pdf_path: Path, retrieved_at: datetime | None = None) -> tuple[dict[str, list], dict]:
    """Return (records by type, audit report)."""
    retrieved_at = retrieved_at or datetime.now(UTC)
    digest = sha256_file(pdf_path)
    doc = pymupdf.open(pdf_path)

    start = next(i for i in range(doc.page_count)
                 if "FUNDAMENTAL RIGHTS" in doc[i].get_text() and "12. Definition" in doc[i].get_text())
    end = next(i for i in range(start + 1, doc.page_count) if re.search(r"(?m)^PART IV\s*$", doc[i].get_text()))
    pages: list[PageText] = [split_page(i + 1, doc[i].get_text()) for i in range(start, end + 1)]
    pages[-1].body = re.split(r"(?m)^PART IV\s*$", pages[-1].body)[0]
    articles = parse_articles(pages)
    by_num = {a.number: a for a in articles}

    full_text = " ".join(doc[i].get_text() for i in range(doc.page_count))
    m394 = re.search(r"394\.\s+Commencement\.—.*?commencement of this Constitution\.", full_text, re.S)
    effective = effective_date_from_commencement(re.sub(r"\s+", " ", m394.group(0))) if m394 else None
    preface = doc[1].get_text()
    edition = re.search(r"amendments up to the (Constitution \(.*?Amendment\) Act, \d{4})", re.sub(r"\s+", " ", preface))

    def prov(art: ParsedArticle) -> Provenance:
        return Provenance(source_id=SOURCE_ID, source_url=PDF_URL, retrieved_at=retrieved_at, content_sha256=digest,
                          locator=f"PDF pp. {art.pages[0]}-{art.pages[-1]}" if len(art.pages) > 1 else f"PDF p. {art.pages[0]}")

    source = Source(
        id=SOURCE_ID,
        name="The Constitution of India (pocket edition, diglot), PDF",
        publisher="Legislative Department, Ministry of Law and Justice, Government of India (as identified by the preface, which is signed by the Secretary to the Government of India)",
        base_url=PDF_URL,
        trust_level="official",
        identity_evidence="The PDF's preface describes it as the fifth pocket-size diglot edition of the Constitution and is signed by the Secretary to the Government of India. The file is hosted on cdnbbsr.s3waas.gov.in. The link from legislative.gov.in was NOT confirmed.",
        verification=_ver(notes="Publisher inferred from the document itself; confirm against legislative.gov.in."),
    )

    schedule = _first_schedule_text(doc)
    jurisdictions = [Jurisdiction(id="IN", name="India", kind="country", verification=_ver(
        notes="Country of the source document."))]
    unconfirmed = []
    for code, name in {**STATES, **UNION_TERRITORIES}.items():
        keys = _SCHEDULE_KEYS.get(name, [name])
        ok = all(re.sub(r"\s+", " ", k).lower() in schedule.lower() for k in keys)
        if not ok:
            unconfirmed.append(name)
        jurisdictions.append(Jurisdiction(
            id=f"IN-{code}", name=name, kind="state" if code in STATES else "union_territory", parent_id="IN",
            verification=_ver(
                status="machine_extracted" if ok else "unverified",
                notes=("Name found in the First Schedule of the source PDF. " if ok else "Name NOT found in the First Schedule text. ")
                + "The ISO 3166-2 style code in the id is not verified."),
        ))

    document = LegalDocument(
        id=DOC_ID, title="The Constitution of India", doc_type="constitution", jurisdiction_id="IN", source_id=SOURCE_ID,
        official_url=PDF_URL, language="en", effective_date=date.fromisoformat(effective) if effective else None,
        effective_date_basis="Article 394 of the document itself" if effective else None,
        edition_note=(f"Pocket edition, text 'as on May, 2022', amended up to the {edition.group(1)}. "
                      "Later amendments are not reflected." if edition else "Edition not parsed."),
        repeal_status="in_force",
        provenance=Provenance(source_id=SOURCE_ID, source_url=PDF_URL, retrieved_at=retrieved_at, content_sha256=digest,
                              locator="Whole PDF"),
        verification=_ver(notes="Currency limited to the edition stated in edition_note."),
    )

    group_names = []
    for a in articles:
        if a.group_heading and a.group_heading not in group_names and a.group_heading not in ("General", "Saving of Certain Laws"):
            group_names.append(a.group_heading)
    domain = Domain(id=DOMAIN_ID, name="Constitutional law",
                    description="Rights set out in the Constitution of India. Name chosen by the catalogue editors.")
    categories = [Category(id=_slug(g), domain_id=DOMAIN_ID, name=g,
                           name_basis="Heading of a group of articles in Part III of the source document")
                  for g in group_names]
    cat_by_name = {c.name: c.id for c in categories}

    provisions: list[Provision] = []
    for a in articles:
        provisions.append(Provision(
            id=f"{DOC_ID}.art-{a.number.lower()}", document_id=DOC_ID, jurisdiction_id="IN", locator=f"Article {a.number}",
            number=a.number, heading=a.heading, text=a.text, part="Part III", group_heading=a.group_heading,
            status="repealed" if a.repealed else "in_force",
            amendments=[Amendment(marker=m, text=t) for m, t in a.amendments], provenance=prov(a),
            verification=_ver()))

    sc_id = f"{DOC_ID}.sc"
    authorities = [Authority(id="in.auth.supreme-court", name="Supreme Court of India", evidence_provision_id=f"{DOC_ID}.art-32",
                             verification=_ver(notes="Named in Article 32(1)-(2) of the source text."))]

    art32 = by_num["32"]
    remedy = Remedy(
        id="in.remedy.art-32", title=art32.heading or "Remedies for enforcement of rights conferred by Part III",
        description=None, authority_ids=["in.auth.supreme-court"],
        provision_refs=[ProvisionRef(provision_id=f"{DOC_ID}.art-32", clause="(1)-(2)",
                                     quote=" ".join(art32.text.splitlines()[:2]))],
        verification=_ver(notes="Linked to every Part III right because Article 32(1) refers to enforcement of 'the rights conferred by this Part'."))

    rights: list[Right] = []

    def make_right(rid, title, title_basis, art, refs, kind):
        cat = cat_by_name.get(art.group_heading or "")
        if not cat:
            return
        rights.append(Right(
            id=rid, title=title, title_basis=title_basis, kind=kind,
            kind_basis="EDITORIAL: procedure or remedy" if kind == "procedural_right" else "Article is in Part III, headed 'Fundamental Rights'",
            domain_id=DOMAIN_ID, category_id=cat, jurisdiction_id="IN", document_id=DOC_ID, provision_refs=refs,
            authority_ids=["in.auth.supreme-court"], remedy_ids=["in.remedy.art-32"],
            status="repealed" if art.repealed else "in_force", effective_date=document.effective_date, plain_language=None,
            provenance=prov(art), verification=_ver(notes="Title and quote are extracted; classification is editorial and unreviewed.")))

    for num in RIGHT_ARTICLES:
        art = by_num[num]
        pid = f"{DOC_ID}.art-{num.lower()}"
        if num == "19":
            for letter, text, omitted in split_clause_rights(art.text, "1"):
                if omitted:
                    continue
                # Drop footnote markers and the trailing list conjunction; the words themselves are kept.
                label = re.sub(r"(?<![\w(])\d{1,2}\[|\]", "", text)
                label = re.sub(r"[;,.\s]*(and)?\s*$", "", label).strip()
                label = re.sub(r"^to\s+", "", label)
                title = label[0].upper() + label[1:]
                make_right(f"{DOC_ID}.art-19-1-{letter}", title,
                           f"Derived from the text of Article 19(1)({letter}); the article's heading covers several rights",
                           art, [ProvisionRef(provision_id=pid, clause=f"(1)({letter})", quote=text)], "constitutional_protection")
            continue
        kind = "procedural_right" if num in PROCEDURAL_ARTICLES else "constitutional_protection"
        make_right(f"{DOC_ID}.art-{num.lower()}", art.heading or f"Article {num}", "Official marginal heading of the article",
                   art, [ProvisionRef(provision_id=pid, clause=None, quote=art.text)], kind)

    # ---- automated checks recorded in the audit report ------------------------------------------
    checks = {
        "all_part_iii_articles_found": [a.number for a in articles] == PART_III_ARTICLES,
        "every_right_has_nonempty_quote": all(r.provision_refs and all(p.quote.strip() for p in r.provision_refs) for r in rights),
        "effective_date_parsed_from_article_394": effective == "1950-01-26",
        "repealed_articles": [a.number for a in articles if a.repealed],
        "jurisdiction_names_not_found_in_first_schedule": unconfirmed,
        "state_count": len(STATES), "union_territory_count": len(UNION_TERRITORIES),
    }
    report = {
        "source_url": PDF_URL, "content_sha256": digest, "retrieved_at": retrieved_at.isoformat(), "pdf_pages": doc.page_count,
        "part_iii_pdf_pages": [start + 1, end + 1], "counts": {
            "provisions": len(provisions), "rights": len(rights), "jurisdictions": len(jurisdictions),
            "categories": len(categories), "authorities": len(authorities), "remedies": 1},
        "checks": checks,
        "scope": "Part III (Fundamental Rights) of the Constitution of India only. No Central Act, State Act, rule, notification, judgment or scheme has been indexed.",
        "human_verified_records": 0,
    }
    records = {
        "sources": [source], "jurisdictions": jurisdictions, "domains": [domain], "categories": categories,
        "documents": [document], "provisions": provisions, "authorities": authorities, "remedies": [remedy], "rights": rights,
    }
    return records, report


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
