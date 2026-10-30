# Project Overview

## Problem

Most people do not know their legal rights, cannot read legal text, and cannot tell which source to trust. Generic chatbots answer confidently without citing law, and often get the jurisdiction wrong.

## Product

Aequa helps ordinary people understand their rights through:

- Plain-language explanations.
- Multilingual AI assistance.
- Official legal information.
- Source-backed answers: every claim traces to a stored legal source.
- Legal document intelligence.
- Jurisdiction-aware retrieval.
- Practical next-step guidance.

Aequa provides general legal information only. It is not legal advice and creates no lawyer–client relationship. The disclaimer text lives in `frontend/src/config/site.ts` (`siteConfig.disclaimer`) and must be shown wherever answers appear.

## Target users

- People facing an everyday legal problem: tenancy, employment, consumer, police contact, family, immigration paperwork.
- People who read the local language poorly or not at all.
- People holding a document they do not understand (notice, contract, agreement).
- Community organisations and paralegals who explain rights to others.

## Core modules

| # | Module | Frontend route | Backend package |
|---|---|---|---|
| 1 | AI Legal Assistant | `/assistant` | `app/ai`, `app/rag` |
| 2 | Legal Rights Explorer | `/rights` | `app/legal` |
| 3 | Document Intelligence | `/documents` | `app/document_intelligence` |
| 4 | Legal Action Blueprint | `/blueprint` | `app/action_engine` |
| 5 | Legal Sources and Evidence | `/sources` | `app/legal/sources`, `app/rag/citations` |
| 6 | Jurisdiction Intelligence | cross-cutting | `app/legal/jurisdictions` |
| 7 | User Settings and Preferences | `/settings` | `app/api/v1` (planned) |

Current status of each: see [FEATURE_MAP](FEATURE_MAP.md).

## Positioning

- Source-first, not chat-first. The answer is secondary to the evidence behind it.
- Honest about uncertainty. "We do not have a verified source for your jurisdiction" is a valid, preferred answer over a guess.
- Premium, calm, architectural LegalTech identity (see [DESIGN_SYSTEM](DESIGN_SYSTEM.md)). Not a generic chatbot skin.
- Global-ready by design, but only claims coverage for jurisdictions whose sources are actually ingested and verified.

## Out of scope

- Legal advice, representation, or outcome prediction.
- Filing documents with courts or authorities.
- Any jurisdiction without ingested, verified sources (it must decline, not improvise).
