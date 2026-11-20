# Verification record — 2026-11-20

## Source reviewed

- User-provided **ASD-STE100 Simplified Technical English**, Issue 9, dated **2025-01-15**; 434-page PDF.
- Checked Part 1, Sections 1–9; the rule-summary pages were used to cross-check the rule IDs and substantive constraints.
- Checked Part 2 introduction for dictionary scope: **875 approved** and **1,274 unapproved** entries; domain technical nouns and verbs are separate from dictionary entries.
- Manually cross-checked Section 8 punctuation and counting rules against the page image.
- Verified the portable `SKILL.md` packaging requirements against https://agentskills.io/specification.

## Automated checks

- **PASS** — Frontmatter present, name matches folder, description present and within 1,024 characters.
- **PASS** — Main SKILL.md under 500 lines; relative local links resolve; resources present.
- **PASS** — Exactly **53/53** Issue 9 numbered rule IDs, in the correct section distribution, in `references/rules.md`.
- **PASS** — **21 regression tests** for the checker, including 20/25-word boundaries, seven-sentence paragraphs, semicolons, contractions, code masking, parentheses, units, abbreviations, list items, quoted strings, passive/progressive advisories, and CLI errors.
- **PASS** — Python syntax compilation of scripts and tests.
- **PASS** — ZIP installation smoke test (unpack into a fresh directory, run `scripts/verify_skill.py`, inspect archive contents).

## Verification boundaries

- **Not verified:** full lexical/part-of-speech conformance; not embedded because the ASD-controlled dictionary is copyrighted and must be consulted separately.
- **Not verified:** semantic correctness, engineering accuracy, domain-allowed technical term classification, and safety consequences for a real document.
- **Not verified:** skill discovery and agent following instructions in a specific installed host runtime. The bundle follows the Agent Skills format but was not connected to a user's live Pi/Codex installation.
- The structural checker is an **approximation**, not a certified STE checker. It may produce false positives/negatives, particularly around headings, tables, proper names, complex formulas, quotes and syntax.
- This package is independently authored and **not endorsed, certified, or authorized by ASD or STEMG**.

## Reproduce

```bash
python3 scripts/verify_skill.py
python3 scripts/ste_check.py --mode procedure --format text /path/to/procedure.md
python3 scripts/ste_check.py --mode description --format json /path/to/description.txt
```
