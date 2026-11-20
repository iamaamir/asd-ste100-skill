#!/usr/bin/env python3
"""Portable validation for the skill bundle. Python standard library only."""
from __future__ import annotations
import importlib.util
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = {f"1.{i}" for i in range(1, 15)}
for section, maximum in ((2, 2), (3, 7), (4, 5), (5, 5), (6, 6), (7, 3), (8, 7), (9, 4)):
    EXPECTED.update(f"{section}.{i}" for i in range(1, maximum + 1))


def verify() -> None:
    skill = (ROOT / "SKILL.md").read_text(encoding="utf-8")
    parts = skill.split("---", 2)
    assert len(parts) == 3 and not parts[0].strip(), "Missing YAML frontmatter"
    header = parts[1]
    name = re.search(r"^name:\s*(\S+)\s*$", header, re.M)
    desc = re.search(r"^description:\s*(.+)$", header, re.M)
    assert name and desc, "name and description required"
    assert name.group(1) == ROOT.name, "Directory and skill name differ"
    assert re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", name.group(1)) and len(name.group(1)) <= 64
    assert 0 < len(desc.group(1)) <= 1024, "Description length outside specification"
    assert len(skill.splitlines()) < 500, "Main SKILL.md is too long"
    for path in ["references/rules.md", "references/dictionary-review.md", "references/review-checklist.md", "assets/term-register.csv", "scripts/ste_check.py"]:
        assert (ROOT / path).is_file(), f"Missing expected resource: {path}"
    for link in re.findall(r"\]\(([^)]+)\)", skill):
        if not re.match(r"^(?:https?://|/)", link):
            assert (ROOT / link).exists(), f"Broken local link: {link}"
    rules = (ROOT / "references/rules.md").read_text(encoding="utf-8")
    found = set(re.findall(r"^\|\s*([1-9]\.\d+)\s*\|", rules, re.M))
    assert found == EXPECTED, f"Rule coverage mismatch: missing={EXPECTED-found}, extra={found-EXPECTED}"
    result = subprocess.run([sys.executable, "-m", "unittest", "discover", "-s", str(ROOT / "tests"), "-v"], cwd=ROOT)
    assert result.returncode == 0, "Checker regression tests failed"
    print(f"VALIDATED: Agent Skills metadata, links, 53/53 rule coverage, supporting files, tests")
    print("BOUNDARY: The official STE dictionary, engineering content, and semantics were not certified by this tool.")


if __name__ == "__main__":
    try:
        verify()
    except AssertionError as exc:
        print(f"VALIDATION FAILED: {exc}", file=sys.stderr)
        sys.exit(1)
