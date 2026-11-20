---
name: ste-technical-writing
description: Draft, rewrite, and review technical procedures, maintenance instructions, system descriptions, safety notices, and software documentation using ASD-STE100 Simplified Technical English (Issue 9, January 2025). Use when a user requests STE, controlled technical English, unambiguous technical writing, a manual, a procedure, or a technical-document language review. Apply strict dictionary verification only when the official standard and approved technical terminology are available.
compatibility: Portable Agent Skills skill. Optional structural checker needs Python 3.9+ (standard library only). Full lexical review needs the official ASD-STE100 Issue 9 dictionary available separately.
metadata:
  version: "1.0.0"
  standard: "ASD-STE100 Issue 9 (2025-01-15)"
---

# Technical writing with STE

Use this skill to make technical text accurate, easy to understand, and consistent. Follow **ASD-STE100 Issue 9**, not an older issue. The standard has two essential parts: **53 writing rules** and **a dictionary with approved words, parts of speech, meanings, and examples**. The dictionary also identifies unapproved alternatives. The two parts work together.

This skill is an **independent aid**, not an official ASD publication, a replacement for the standard, or a certification of compliance. Do not say a document is fully STE compliant only because its sentences are short or it passes the checker.

## 1. Determine the task and preserve meaning

1. Identify whether the user wants to **draft**, **rewrite**, or **review**. Ask for a specific target only if necessary; otherwise use the supplied text and context.
2. Separate **procedural** text (actions for a reader to perform) from **descriptive** text (information about a system, process, or item). Run different checks on each; do not impose imperative verbs on descriptions.
3. Identify the reader, product, required technical terminology, safety risks, and non-negotiable terms (part numbers, UI labels, command-line flags, literal error messages, quotations, identifiers, and regulatory text). **Do not change technical meaning or silently invent missing facts.**
4. Use the user's official terms or established glossary consistently. Do not assume that a familiar technical word is automatically an approved STE word.

## 2. Apply the writing rules

Use [the rule map](references/rules.md) for all 53 rule identifiers and the eight general recommendations. Priority checks:

- **Vocabulary (1.1–1.14):** Use dictionary-approved words only with their approved part of speech, meaning, and form. Non-dictionary words are permitted only as valid technical nouns or technical verbs under the standard's category and usage rules. Technical nouns must not become verbs, and technical verbs must not become nouns. Prefer approved wording where technically accurate. Use consistent terminology and normally American English spelling.
- **Noun groups (2.1–2.2):** Prefer noun groups of up to three words. Preserve a longer **official technical noun** in full when required; do not truncate a part name to force a limit.
- **Verbs (3.1–3.7):** Prefer the permitted basic tenses and forms. Do not use progressive or other complex constructions. Do not treat every `-ing` word as prohibited: some are valid technical nouns or noun modifiers. Use active voice; descriptive passive is a narrow exception when the agent is unknown. Use imperatives for instructions.
- **General syntax (4.1–4.5):** Make each sentence clear and complete. Do not use contractions. Use lists for complicated information. Use appropriate articles and clear connections between ideas.
- **Procedures (5.1–5.5):** Maximum **20 words per sentence**; generally one action per sentence (except simultaneous actions); imperative instruction; put a necessary condition before the command; use notes only for information.
- **Descriptions (6.1–6.6):** Maximum **25 words per sentence**, one topic per paragraph, maximum **six sentences per paragraph**, logical information flow; do not convert descriptive statements into commands.
- **Safety (7.1–7.3):** Select the correct risk indicator for the domain, give an explicit action or condition, then explain the hazard or consequence. **Never weaken, infer, or invent safety details.** Refer disputed hazards and legally controlled wording for human review.
- **Punctuation/counting (8.1–8.7):** No semicolons. Follow the standard's non-obvious word-count rules: a parenthetical expression counts as one word in its containing sentence; check the parenthetical text separately; quoted text, certain identifiers, numbers with measurement units, and hyphenated words each count as one word. In vertical lists a colon separates the introduction from the list items for counting.
- **Review (9.1–9.4):** Reconstruct a sentence when a direct word substitution does not work. Avoid phrasal verbs. Apply words in their permitted meanings and keep wording consistent.

## 3. Verify dictionary and terminology; never bluff

Read [the dictionary review protocol](references/dictionary-review.md) before a strict review. The supplied Issue 9 PDF is the authoritative source when available, but **do not bundle, reprint, or redistribute its dictionary**. For each uncertain ordinary word, check its dictionary entry for approved/unapproved status, part of speech, approved meaning, and verb/adjective form. Check proposed substitutions in context. For each domain term, establish whether it is an allowed technical noun/verb, its category and authoritative source. Do not silently excuse unapproved general-purpose words as technical terms.

When the dictionary is not available, do **not** claim full STE compliance. Label lexical verification **NOT VERIFIED** and provide the specific open items. Never manufacture dictionary entries, rule citations, or approved synonyms.

## 4. Run the optional deterministic checker

For `.txt` or `.md` drafts, execute from this skill's root (or use absolute paths):

```bash
python3 scripts/ste_check.py --mode procedure --format text /path/to/procedure.md
python3 scripts/ste_check.py --mode description --format json /path/to/description.txt
```

For mixed documents, check procedure and description sections separately with the correct mode. Use `-` for standard input. The checker detects semicolons and common contractions, tests sentence and paragraph length, and marks some verb constructions for **manual review**. Its sentence and word counts are **best-effort approximations**: inspect each finding using Issue 9 rules 8.4–8.7. It does **not** validate the official dictionary, grammar, safety accuracy, allowable technical terms, or full compliance. It does not execute or edit input files.

## 5. Deliver and report precisely

When asked to write or rewrite, give the usable revised text first. When asked to audit, provide the original passage, a suggested revision, the **specific rule ID** for each substantial change, and any uncertainty. If changing a safety-relevant step would need missing technical information, flag it rather than guessing.

Report these independently:

1. **Structural check:** PASS / FAIL / NOT RUN (with count and remaining findings).
2. **Dictionary and approved-form review:** VERIFIED / PARTIAL / NOT VERIFIED (with reference availability).
3. **Technical and safety review:** REVIEWED / NEEDS SUBJECT-MATTER REVIEW.

Only call the text **verified against Issue 9** when every applicable rule, the dictionary, technical terminology, and factual/safety requirements were actually reviewed. A test script PASS is never proof of complete STE compliance.

## Resources

- [All rule IDs and brief operational guidance](references/rules.md)
- [Dictionary lookup and technical terminology workflow](references/dictionary-review.md)
- [Manual quality gates and review output](references/review-checklist.md)
- `assets/term-register.csv` — empty term-register template
- `scripts/ste_check.py` — offline, dependency-free structural checker
- `scripts/verify_skill.py` — checks packaging and runs regression tests

**Source and attribution:** Aerospace, Security and Defence Industries Association of Europe (ASD), *ASD-STE100 Simplified Technical English*, Issue 9, 2025-01-15, Part 1 (writing rules) and Part 2 (dictionary). Official source: https://www.asd-ste100.org/ . ASD retains its copyright and trademark. This independent skill is not authorized, certified, or endorsed by ASD or STEMG.
