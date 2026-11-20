# Contributing

This repository is an independently authored aid for working with ASD-STE100 Issue 9. Contributions should improve accuracy, clarity, test coverage, and honest verification reporting.

1. Keep the official ASD-STE100 PDF and dictionary out of the repository. Do not submit copied dictionary entries or substantial copyrighted source text.
2. Cite the relevant Issue 9 rule number when proposing a behavioral change. Clearly distinguish the original standard from your interpretation.
3. Preserve safety semantics, identifiers, and technical terminology. Prefer flagging uncertain content to inventing terms or compliance claims.
4. Add regression tests to `skills/ste-technical-writing/tests` for checker changes.
5. Run `python3 skills/ste-technical-writing/scripts/verify_skill.py` before opening a pull request.
6. Update the verification record when changing verified behavior or its limitations.

This project and its checker are not official or certified ASD-STE100 tools.
