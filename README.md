# ASD-STE100 Simplified Technical English — Agent Skill

[**Explore the interactive landing page and live example →**](https://iamaamir.github.io/asd-ste100-skill/)

**An agent skill for clear, consistent technical writing.** Draft, rewrite, and review procedures, maintenance instructions, product documentation, safety notices, and software documentation using guidance from **ASD-STE100 Simplified Technical English (STE), Issue 9 (2025)**.

A portable [Agent Skills](https://agentskills.io/) package for Pi, Codex, Claude Code, and other compatible coding agents. It contains an **offline Python structural checker**, all **53 writing-rule identifiers** with concise operational guidance, a terminology-review workflow, and regression tests.

> [!IMPORTANT]
> This is an **independent aid**, not an official ASD/STEMG publication or a certified STE compliance checker. The copyrighted official dictionary and PDF are **not included**. Full vocabulary and technical/safety compliance require an authorized copy of the standard and qualified human review.

## Install with `npx skills`

Install into the current project (the CLI offers agent choices interactively):

```bash
npx skills add iamaamir/asd-ste100-skill --skill ste-technical-writing
```

Install at user scope for all supported agents, without prompts:

```bash
npx skills add iamaamir/asd-ste100-skill --skill ste-technical-writing --global --agent '*' --yes
```

To inspect what this repository provides before installation:

```bash
npx skills add iamaamir/asd-ste100-skill --list
```

**Requirement:** Node.js and npm for `npx`; Python 3.9+ only for the optional checker. The writing skill itself does not need a Python runtime.

These commands use the open-source [Skills CLI](https://github.com/vercel-labs/skills), not an npm package published by this repository. The CLI installs the skill from GitHub. The repository is public, and the CLI installs the skill directly from GitHub.

## Use it

Ask your agent to use `ste-technical-writing` for a relevant task, for example:

> Use the ste-technical-writing skill to rewrite this maintenance procedure in Simplified Technical English. Preserve every safety constraint and part identifier. Show any wording that requires dictionary verification.

> Use the ste-technical-writing skill to review this troubleshooting guide against ASD-STE100 Issue 9. Report structural findings, dictionary-review gaps, and technical risks separately.

> Draft a short software release procedure in STE style. Keep imperative procedure steps separate from descriptive notes.

### Optional offline checker

From the repository root:

```bash
python3 skills/ste-technical-writing/scripts/ste_check.py --mode procedure --format text procedure.md
python3 skills/ste-technical-writing/scripts/ste_check.py --mode description --format json description.md
```

The checker flags several structural issues (such as length limits, semicolons, and common contractions). It provides **advisories**, not full grammar or dictionary validation. Sentence and word counts are best-effort approximations.

## What is included

| Path | Purpose |
| --- | --- |
| [`skills/ste-technical-writing/SKILL.md`](skills/ste-technical-writing/SKILL.md) | Skill instructions and review workflow |
| [`references/rules.md`](skills/ste-technical-writing/references/rules.md) | Paraphrased reference map for the 53 writing rules and 8 recommendations |
| [`references/dictionary-review.md`](skills/ste-technical-writing/references/dictionary-review.md) | Dictionary, forms, and technical-term verification protocol |
| [`references/review-checklist.md`](skills/ste-technical-writing/references/review-checklist.md) | Structural, semantic, and safety review gates |
| [`scripts/ste_check.py`](skills/ste-technical-writing/scripts/ste_check.py) | Local standard-library-only structural checker |
| [`tests/test_ste_check.py`](skills/ste-technical-writing/tests/test_ste_check.py) | Regression tests |
| [`VERIFICATION.md`](skills/ste-technical-writing/VERIFICATION.md) | Verification record and limits |

## Verification

Run tests and packaging checks:

```bash
python3 skills/ste-technical-writing/scripts/verify_skill.py
```

The baseline package passed **21/21 regression tests** and its rule-ID coverage check found **53/53 numbered rules**. This verifies implementation properties only; it does **not** establish full ASD-STE100 lexical, technical, or safety compliance. See the [verification record](skills/ste-technical-writing/VERIFICATION.md).

## Why "Simplified Technical English"?

ASD-STE100 is a controlled language created for technical information. It limits vocabulary and certain grammar constructions to reduce ambiguity. This skill adapts those practices for technical writers and AI coding agents, while preserving essential distinctions between **procedure**, **description**, **terminology**, and **safety**.

**Source:** ASD, *ASD-STE100 Simplified Technical English*, Issue 9, January 15, 2025. Refer to the official [ASD-STE100 website](https://www.asd-ste100.org/) for the standard and permitted-use terms. ASD retains its intellectual-property rights and trademarks. No endorsement, authorization, or certification is claimed.

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md). The independently authored code and skill text in this repository are distributed under the [MIT License](LICENSE); this license does not cover the official ASD-STE100 standard, its dictionary, or ASD trademarks.
