# Global Jurisdiction Research

**Prepared:** 31 Oct 2026 · All URLs accessed 2026-10-31.
**[V]** verified · **[A]** assumption · **[R]** recommendation

> Policy: the architecture is jurisdiction-agnostic; **coverage is claimed only for India (central) + Telangana (state)**, and only for the Acts listed in `OFFICIAL_LEGAL_DATA_SOURCES.md` §5.

---

## 1. Why "one global legal model" doesn't work

- Legal systems differ (common law, civil law, religious/personal law, customary law) **[A]**.
- Even inside India, the same topic is split between central and state law: tenancy in Telangana is a state Act [V] https://www.indiacode.nic.in/handle/123456789/8607 ; shop working hours are under a state Act and state notifications [V] https://www.indialaw.in/blog/labour/telangana-eases-working-hours-for-commercial-establishments//pdf/ ; legal-aid income ceilings differ by state (₹1,00,000 in Telangana vs ₹3,00,000 in Andhra Pradesh) [V] https://nyaaya.org/legal-explainer/eligibility-for-legal-aid/
- Labour Codes need matching state notifications for full operation [V] https://ksandk.com/labour-employment/all-four-labour-codes-enforced-from-21-november-2025/ — so "the law" for a worker depends on both central commencement and the state's rules.

## 2. Jurisdiction data model **[R]**

Use ISO 3166-2 style codes as a hierarchy:

```
IN            (India — central Acts, applies everywhere unless state law differs)
└─ IN-TG      (Telangana — state Acts, notifications, legal-aid ceiling)
   └─ IN-TG-HYD (district — DLSA contacts only; future)
```

Each chunk has exactly one `jurisdiction`. Retrieval filter for a user in Telangana = `{IN, IN-TG}`. A user selecting any other state gets `{IN}` only and a visible notice: "State-specific rules for <state> are not yet verified."

Each jurisdiction record carries a **coverage manifest**:

```json
{
  "code": "IN-TG",
  "verified_instruments": ["Telangana Shops & Establishments Act, 1988"],
  "known_gaps": ["Tenancy Act text not available on India Code"],
  "last_reviewed": "2026-10-31",
  "help_contacts": ["TSLSA", "NALSA 15100", "Tele-Law 14454"]
}
```

The UI reads this manifest to say *exactly* what is covered. This is how "global-ready, honestly scoped" is shown to judges.

## 3. Document identity & versioning standards

| Standard | What it gives us | Status |
|---|---|---|
| **Akoma Ntoso (OASIS LegalDocML)** | XML vocabulary + naming convention for legislative documents (work/expression/manifestation) [V] https://docs.oasis-open.org/legaldocml/akn-core/v1.0/csd01/part1-vocabulary/akn-core-v1.0-csd01-part1-vocabulary.html ; https://oasis-open.org/?p=4747 | Adopt the *naming idea* for IDs (`/akn/in/act/2019/35/!main~sec_69` style) **[A]** — exact Indian Act numbers to be confirmed per Act |
| **ELI (European Legislation Identifier)** | Framework for identifying and reusing legislation via stable URIs [V] https://data.europa.eu/en/news-events/news/european-legislation-identifier-making-eu-laws-easier-find-and-reuse | Pattern reference for future EU coverage |
| **Point-in-time legislation** (e.g. UK legislation.gov.uk) | Versions of law as at a date [V] (third-party tooling exists) https://apify.com/yummy_persimmon_er1/uk-legislation-history | Model for `valid_from`/`valid_to` fields |

## 4. Adding a jurisdiction — checklist **[R]**

1. Identify the official legislation source and its reuse terms (do not assume).
2. Confirm automated-access permission or plan manual download.
3. Define the language(s) of authoritative text.
4. Load only the instruments needed for target personas.
5. Populate `in_force` / `valid_from` from official commencement notices.
6. Add help routing (legal aid authority, helplines) from official sites.
7. Write 15-question eval set; publish results in the coverage manifest.
8. Only then flip the jurisdiction to "verified" in the UI.

## 5. Candidate next jurisdictions (post-hackathon)

| Candidate | Why | Known data facts |
|---|---|---|
| Andhra Pradesh, Karnataka | Neighbouring states, shared Telugu/Kannada users, central law reuse | AP legal-aid ceiling ₹3,00,000; Karnataka ₹1,00,000 [V] nyaaya.org (above); Nyaaya has a Kannada site [V] https://nyaaya.org/ |
| UK | Strong official versioned legislation source | Licence not verified this session **[A]** |
| EU | ELI + EUR-Lex | Reuse terms not verified this session **[A]** |

## 6. Research gaps
- No verification of non-Indian legislation licences in this session.
- Official Indian Act-number scheme for Akoma Ntoso-style IDs not confirmed.
