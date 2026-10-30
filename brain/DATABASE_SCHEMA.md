# Database Schema

**State: nothing exists.** No SQLAlchemy models, no `alembic.ini`, no `env.py`, and `backend/migrations/versions/` is empty. This file is a **proposed** logical schema to guide the first migrations. Ratify it (see [DECISIONS](DECISIONS.md)) and then update this file to reflect what is actually migrated.

Engineering how-to (naming, async sessions, Alembic, pgvector indexes, transactions): `docs/backend/DATABASE_DESIGN.md`.

Environment: PostgreSQL 15+ with the `vector` extension (`.env.example`). `EMBEDDING_DIM=1024` fixes the vector column width; changing it needs a migration and full re-embed.

## Proposed tables

### Identity and preferences
| Table | Key columns | Notes |
|---|---|---|
| `users` | id, email (unique, citext), password_hash (argon2), created_at, deleted_at | Email optional if anonymous use is allowed (decision pending) |
| `refresh_tokens` | id, user_id → users, token_hash, expires_at, revoked_at | Store hashes only |
| `user_preferences` | user_id (PK/FK), language, default_jurisdiction_id, theme | |

### Legal knowledge (the trust core)
| Table | Key columns | Notes |
|---|---|---|
| `jurisdictions` | id, code (e.g. ISO 3166-2), name, parent_id → self, level, coverage_status | Hierarchy: country → region → locality |
| `legal_sources` | id, jurisdiction_id, publisher, title, url, source_type, retrieved_at, content_hash, license, verified_by, verified_at | Registry of official origins |
| `legal_documents` | id, source_id, title, citation_label, effective_from, effective_to, language, version | An Act, rule, regulation, case |
| `legal_sections` | id, document_id, parent_section_id, label (e.g. "12(3)"), heading, text, ordinal | Smallest citeable unit |
| `section_chunks` | id, section_id, chunk_text, embedding `vector(1024)`, tsv `tsvector`, language | Retrieval unit. HNSW index on embedding, GIN on tsv |

### Conversations and evidence
| Table | Key columns | Notes |
|---|---|---|
| `conversations` | id, user_id (nullable), jurisdiction_id, language, created_at | |
| `messages` | id, conversation_id, role, content, refusal_reason, model_id, created_at | Content is sensitive |
| `message_citations` | id, message_id, section_id, quote, verified (bool), verification_method | Only verified rows are shown |

### Documents and action plans
| Table | Key columns | Notes |
|---|---|---|
| `user_documents` | id, user_id, storage_key, mime, size, sha256, status, expires_at, deleted_at | File bytes live in storage, not DB |
| `document_analyses` | id, document_id, summary, model_id, created_at | |
| `document_clauses` | id, analysis_id, ordinal, text, category, risk_level, explanation | |
| `action_plans` | id, user_id, jurisdiction_id, situation, created_at | |
| `action_steps` | id, plan_id, ordinal, title, detail, deadline_hint, section_id (nullable) | Steps cite law where possible |

### Operations
| Table | Notes |
|---|---|
| `audit_events` | Security-relevant events; no document text or questions |
| `ingestion_runs` | Source ingestion history, counts, errors |

## Constraints to enforce

- A `message_citations` row must reference an existing `legal_sections` row.
- `legal_documents` effective ranges must not be silently overlapped for the same label and jurisdiction.
- `user_documents.expires_at` is mandatory; a scheduled job hard-deletes expired rows and files.
- All foreign keys indexed. Soft-delete columns only where erasure semantics require them.

## Status table

| Area | Status |
|---|---|
| Models | Missing |
| Migrations | Missing |
| pgvector extension setup | Missing |
| Seed / ingestion tooling | Missing |
