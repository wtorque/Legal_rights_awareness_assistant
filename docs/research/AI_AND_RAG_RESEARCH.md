# AI & RAG Architecture Research

**Prepared:** 31 Oct 2026 · All URLs accessed 2026-10-31.
**[V]** verified · **[A]** assumption · **[R]** recommendation

---

## 1. Verdict on the proposed AI stack

| Proposed | Verdict | Reason |
|---|---|---|
| NVIDIA API with GLM | **Keep, with a guard** | GLM models are available on NVIDIA's API catalog — `glm-5-3-flash` is listed [V] https://build.nvidia.com/models — but the lineup churns: GLM-5 was deprecated on 20 Apr 2026 and users reported its named replacement wasn't callable at first [V] https://forums.developer.nvidia.com/t/urgent-glm-5-deprecation-april-20-2026-replacement-z-ai-glm-5-1-not-available-in-nim-api/366610 . **[R]** Put the model ID in an env var, test it the morning of the hackathon, and keep one fallback model ID. |
| Python + FastAPI | **Keep** | Team familiarity; one service is enough |
| RAG | **Keep** | Mandatory for traceability |
| PostgreSQL + pgvector | **Optional — skip for 3–4h** | Corpus is <2,000 chunks [A]; in-memory NumPy cosine + BM25 is faster to build and has no DB to provision. Use pgvector later. |
| Sentence Transformers (local) | **Replace for deployment** | Free hosts give 512 MB RAM (Render) [V] https://render.com/docs/llms-full.txt — too small for a multilingual model like BGE-M3 **[A]**. Use NVIDIA-hosted embeddings instead. |
| Hybrid search | **Keep** | Legal queries contain exact tokens ("section 69", "RTI") that BM25 catches and embeddings miss |
| Multilingual embeddings | **Keep** | `nemotron-3.5-embed-1b` lists Hindi and Telugu in its evaluated languages; 32k context; 2048-d (truncatable to 1024/512) [V] https://build.nvidia.com/nvidia/nemotron-3_5-embed-1b/modelcard |

### GLM-5.3-Flash facts [V] https://build.nvidia.com/z-ai/glm-5-3-flash/modelcard
- 320B total / 18B active parameters (MoE), up to 1,048,576-token context, text + image input (up to 8 images/request on this endpoint), MIT-licensed weights, hosted endpoint under NVIDIA API Trial ToS, released 25 Aug 2026.
- Supported languages are **not** stated on the model card → **test Telugu output quality before committing** **[R]**.

### NVIDIA free API constraints
- OpenAI-compatible base URL `https://integrate.api.nvidia.com/v1`; keys begin `nvapi-`; ~40 requests/minute per model, best-effort, no SLA [V] https://jaesolshin.com/posts/nvidia-nim-api/ (secondary, May 2026); multiple developer-forum threads request increases from 40 → 200 RPM, consistent with a 40 RPM default [V] https://forums.developer.nvidia.com/t/request-for-nvidia-nim-api-rate-limit-increase-40-200-rpm/369357
- **Implication:** fine for a demo; cache answers to the 5 rehearsed demo questions to survive throttling **[R]**.

## 2. Ingestion pipeline (offline, run once)

```
India Code PDFs ──► PyMuPDF text ──► section splitter (regex on "^\d+[A-Z]?\.\s" + chapter headers)
      ──► clean (remove running headers/footnote markers) ──► chunk = 1 section (split long sections by sub-section "(1)","(2)")
      ──► metadata ──► embed (NVIDIA, batch) ──► corpus.jsonl + embeddings.npy + bm25.pkl
```

**Chunk metadata (minimum):** `chunk_id` (e.g. `CPA2019:s69`), `act_title`, `act_year`, `jurisdiction` (`IN` / `IN-TG`), `section`, `heading`, `text`, `source_url`, `downloaded_on`, `in_force` (`yes` / `partly` / `repealed`), `commencement_ref`, `persona_tags`.

Why section-level chunking **[R]**: a section is the unit people cite and the unit the verifier checks. Fixed-size token chunks split sections and break citations.

Scanned PDFs: India Code PDFs for the MVP Acts are text PDFs **[A]** — verify with PyMuPDF; if a page has no text layer, skip OCR and hand-fix (cheaper than OCR in a 4-hour build).

## 3. Query-time pipeline

```
user question (te/hi/en) + persona + state
  1. Repeal Radar regex on question ─────────────► banner if old law mentioned
  2. Query rewrite (LLM, short): translate to English legal query + extract dates/amounts
  3. Filter chunks: jurisdiction ∈ {IN, IN-TG} ∧ persona_tags
  4. Hybrid retrieve: BM25 top-20 ∪ embedding top-20 → Reciprocal Rank Fusion → top-6
  5. Generate (GLM) with STRICT JSON schema (below), answer language = user language
  6. Verify each claim (deterministic) ───────────► verified / unverified
  7. Repeal Radar regex on answer text
  8. Rights Clock + Legal-aid card (deterministic, no LLM)
  9. Render: verified claims, greyed unverified, source pane (English text), help card
```

Reranking: `nemotron-3.5-rerank-8b` is listed on the catalog [V] https://build.nvidia.com/models . **[R]** Skip in MVP (extra call, extra latency, rate limit); RRF over a tiny filtered corpus is enough.

## 4. Evidence-grounded generation contract

```json
{
  "answer_language": "te",
  "claims": [
    {
      "text": "<one plain-language sentence in user language>",
      "chunk_id": "CPA2019:s69",
      "support_quote": "<exact English substring copied from that chunk>"
    }
  ],
  "next_steps": ["..."],
  "insufficient_evidence": false
}
```

System-prompt rules **[R]**:
1. Use only the provided chunks. Every claim needs a `chunk_id` and a verbatim `support_quote`.
2. If the chunks don't answer the question, set `insufficient_evidence: true` and say what is missing — do not answer from memory.
3. Never state penalties, deadlines or amounts that are not in a quote.
4. Never say "you will win" or predict outcomes.

## 5. Citation verification (the signature feature)

```
for claim in claims:
    chunk = retrieved.get(claim.chunk_id)            # 1. was it retrieved?
    if not chunk: unverified("cited a source we didn't give it")
    q = normalize(claim.support_quote)                # lowercase, collapse whitespace, strip punctuation
    if len(q) < 25 or q not in normalize(chunk.text): # 2. is the quote really there?
        unverified("quote not found in section")
    for sec in re.findall(r"section\s+(\d+[A-Z]?)", claim.text, re.I):   # 3. section numbers match?
        if sec != chunk.section: unverified("section mismatch")
    if chunk.in_force == "repealed": flag("cites repealed law")
```

What this catches: invented sections, wrong-section citations, fabricated quotes, repealed law. What it does **not** catch: a real quote that is paraphrased misleadingly in the claim text. Optional P1 mitigation: second LLM call "does the quote entail the claim? yes/no" — doubles latency, so P1 only.

## 6. Confidence & uncertainty communication

Avoid fake probabilities. Show evidence coverage instead **[R]**:

| Display | Rule |
|---|---|
| ✅ **Verified** (green) | ≥1 claim and all claims verified |
| ⚠️ **Partly verified** (amber) | Some claims failed — failed ones greyed, labelled "not verified — check with legal aid" |
| ⛔ **Not enough information** (grey) | `insufficient_evidence` or zero verified claims → show help card prominently |

## 7. Versioning & amendments (designed now, built later)

- Model documents as **work** (the Act) → **expression** (text as of a date) → **section**, following the Akoma Ntoso FRBR-style naming idea [V] https://oasis-open.org/?p=4747
- Store `valid_from`, `valid_to`, `in_force` per chunk. MVP sets these by hand for ~8 Acts; P3 automates from Gazette notifications.

## 8. Multilingual handling

- Retrieve in English (statutes are English-authoritative per India Code [V]); generate in user language; always show English source quote.
- Indian-language RAG benchmarks exist (e.g. IndicRAGSuite) [V] https://arxiv.org/pdf/2506.01615 — not evaluated here.
- Fallback for Telugu quality: Sarvam Translate at ₹2 per 1,000 characters with ₹100 free credits [V] https://docs.sarvam.ai/api-reference-docs/pricing.md ; BHASHINI SDK supports NMT/ASR/TTS but Telugu availability and credential process were not confirmed [V] https://pypi.org/project/bhashini-client-sdk/

## 9. Hallucination-prevention summary

| Layer | Mechanism |
|---|---|
| Retrieval | Jurisdiction + persona filter; section chunks |
| Generation | JSON contract; quote-or-don't-claim; refusal path |
| Verification | Deterministic quote + section + in-force check |
| Deterministic tools | Deadlines, eligibility, repeal mapping never come from the LLM |
| UI | Unverified content visibly degraded; help card always available |

## 10. Research gaps
- GLM-5.3-Flash Telugu/Hindi quality untested.
- Full NVIDIA API Trial ToS not read.
- Exact current per-model rate limits not confirmed from an official NVIDIA page.
