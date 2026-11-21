# ste-technical-writing

An independent, portable skill for drafting and reviewing technical documents with the *ASD-STE100 Simplified Technical English*, Issue 9 (2025-01-15), as a reference. No dictionary is bundled. **This is not an ASD/STEMG-authorized or certified checking tool.**

## Contents

- `SKILL.md`: trigger, workflow, and compliance boundaries.
- `references/rules.md`: paraphrased operational map of all **53** rules and the **8** general recommendations.
- `references/dictionary-review.md`: how to verify words, forms, technical terms and exceptions with a separately available authorized copy of the source.
- `references/review-checklist.md`: technical and semantic quality gates.
- `scripts/ste_check.py`: offline Python 3.9+ *structural* checker.
- `scripts/verify_skill.py`: local package checks and regression tests.
- `assets/term-register.csv`: empty organizational terminology-register template.

## Install with `npx skills`

For a published copy of this repository, install the skill with:

```bash
npx skills add iamaamir/asd-ste100-skill --skill ste-technical-writing
```

For global use with all supported coding agents:

```bash
npx skills add iamaamir/asd-ste100-skill --skill ste-technical-writing -g -a '*' -y
```

## Manual installation

Unzip the archive, then copy the **whole** `ste-technical-writing` directory to a standard skills location, for example:

```bash
# Common cross-agent per-user location (including Pi and Codex):
mkdir -p ~/.agents/skills
cp -R ste-technical-writing ~/.agents/skills/

# Alternative dedicated Pi location:
# ~/.pi/agent/skills/ste-technical-writing/
```

Invoke it by asking the agent to **use the ste-technical-writing skill** when drafting, rewriting, or reviewing a procedure or a technical description. Hosts may differ in discovery/reload behavior.

## Check a draft

```bash
python3 scripts/ste_check.py --mode procedure --format text my-procedure.md
python3 scripts/ste_check.py --mode description --format json my-description.txt
python3 scripts/verify_skill.py
```

For mixed documents, check section by section. The script checks basic word counts, semicolons, contractions, and some possible verb constructions; it cannot validate vocabulary, meaning, or factual safety. Line/word counts are approximations; assess disputed counts against Part 1 Section 8 of the official standard.

## Provenance and copyright

Derived as an independent practical guide from a user-provided copy of *ASD-STE100*, Issue 9, January 15, 2025. The **official PDF is not bundled** and its dictionary is not reproduced. Obtain it from https://www.asd-ste100.org/ and consult its copyright notice and permitted-use conditions. The ASD-STE100 name and associated trademark belong to ASD. This package is neither endorsed nor certified by ASD or STEMG.
