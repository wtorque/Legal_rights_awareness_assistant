# Legal Data Licensing & Reuse

**Prepared:** 31 Oct 2026 · All URLs accessed 2026-10-31.
**[V]** verified · **[A]** assumption · **[R]** recommendation
**This is research, not legal advice.** Before any commercial launch, a lawyer should review.

---

## 1. Core rule: public ≠ free to reuse

The research brief is right to insist on this. Indian law has a specific statutory carve-out for legal materials, but it has conditions.

## 2. Copyright Act, 1957 — s.52(1)(q) and (r)

Per the official text on copyright.gov.in [V] https://copyright.gov.in/Copyright_Act_1957/chapter_xi.html , the following are **not** infringement:

| Material | Condition | Implication for us |
|---|---|---|
| Matter in an **Official Gazette** | Except an Act of a Legislature | Gazette notifications (e.g. Code commencement) can be reproduced |
| An **Act of a Legislature** | Only "together with any commentary thereon or any other original matter" | Showing section text **alongside our plain-language explanation** fits this; a bare-text dump with no added matter is less clearly covered **[A]** |
| Reports of committees/commissions laid before the Legislature | Unless Government prohibits | Not needed for MVP |
| **Judgments/orders** of courts and tribunals | Unless the court prohibits | Future case-law features OK by default |
| **s.52(1)(r)** — translations of Acts into Indian languages | Only if no Govt translation exists in that language, or it isn't on sale; must state prominently that the translation "has not been authorised or accepted as authentic by the Government" | **Our Telugu/Hindi outputs must carry this disclaimer** |

**[R] Required UI text on every translated answer:**
> "This translation is generated for your understanding. It has not been authorised or accepted as authentic by the Government. The English text of the Act prevails."
(The second sentence reflects India Code's own disclaimer [V] https://www.indiacode.nic.in/disclaimer.jsp?locale=en)

## 3. Source-by-source

| Source | Licence / terms found | Commercial use | Automated access | Our use **[R]** |
|---|---|---|---|---|
| **India Code** | Disclaimer: "as is", English prevails; no explicit reuse licence on disclaimer page [V] | Statutory carve-out s.52(1)(q) applies to Acts with commentary [V] | Not addressed [V]; robots.txt not checked | Manual PDF download (~8 files); cite URL + date; no crawling |
| **e-Gazette** | Not fetched | s.52(1)(q)(i) covers Gazette matter [V] | Unknown | Metadata references only in MVP |
| **AWS Indian SC Judgments** | **CC-BY-4.0** [V] https://registry.opendata.aws/indian-supreme-court-judgments/ | Allowed with attribution | Yes — public S3 bucket, no AWS account needed [V] | Future; attribute Dattam Labs / source |
| **Indian Kanoon API** | Prepaid; mandatory "powered by IKanoon" attribution including for RAG/fine-tuning [V] https://api.indiankanoon.org/terms/ | Terms don't address separately [V] | Via paid API only | Not in MVP |
| **NALSA / SLSA websites** | Not checked | Facts (phone numbers, eligibility rules from the statute) are not copyrightable expression **[A]** | Unknown | Hand-copy a few facts with citation |
| **Nyaaya** | Licence not stated on homepage [V] | Unknown | Unknown | **Do not ingest.** Link out only. |
| **Secondary law-firm/news articles** (used in this research) | All-rights-reserved by default **[A]** | No | No | Use only to locate primary sources; never ingest |
| **GODL-India** (data.gov.in datasets) | We could only find commentary on the 2016 *draft* licence, not its final terms [V] https://www.medianama.com/2016/07/223-medianama-open-data-license/ | Unverified | — | Not needed for MVP; verify final text before use |

## 4. Model & API licensing (do not confuse the two)

| Component | Model-weight licence | Hosted API terms | Practical meaning |
|---|---|---|---|
| **GLM-5.3-Flash** on build.nvidia.com | MIT [V] https://build.nvidia.com/z-ai/glm-5-3-flash/modelcard | NVIDIA API **Trial** Terms of Service [V] (same page) | Free trial endpoint is fine for a hackathon demo; production would need a paid/self-hosted route |
| **Nemotron 3.5 Embed 1B** | OpenMDW-1.1; "ready for commercial or non-commercial use" [V] https://build.nvidia.com/nvidia/nemotron-3_5-embed-1b/modelcard | NVIDIA API Trial Terms [V] | Same as above |
| **Sarvam APIs** (optional translation/TTS) | n/a | Paid; ₹100 free credits on signup [V] https://docs.sarvam.ai/api-reference-docs/pricing.md | Optional fallback for Telugu |

NVIDIA staff on the developer forum only point to the Trial ToS and state that user and generated content is used "solely to provide users with the API Service" [V] https://forums.developer.nvidia.com/t/clarification-on-trial-api-use/334275 . **[A]** We did not read the full Trial ToS text; whether trial use is restricted to evaluation should be checked before anything beyond the hackathon.

## 5. Checklist before the demo **[R]**

- [ ] Every chunk stores `source_url`, `downloaded_on`, `act_title`, `section`.
- [ ] Translated answers show the s.52(1)(r) disclaimer.
- [ ] Source pane shows English section text with our explanation (satisfies "with commentary").
- [ ] No content from Nyaaya, law-firm blogs, or news sites is in the corpus.
- [ ] Footer: "Built on official texts from India Code (Legislative Department). Not legal advice."

## 6. Research gaps
- India Code terms of use / robots.txt not read.
- Full NVIDIA API Trial ToS not read.
- Final GODL-India text not located.
