#!/usr/bin/env python3
"""Heuristic ASD-STE100 Issue 9 structural checks (not a compliance validator).

Python standard library only. The checker does not read or replicate the STE dictionary.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import List, Tuple

WORD_RE = re.compile(r"[\w]+(?:[-‐‑][\w]+)*(?:['’][\w]+)?", re.UNICODE)
LIST_RE = re.compile(r"^\s*(?:[-*+]\s+|\d+[.)]\s+|[a-zA-Z][.)]\s+)")
FENCE_RE = re.compile(r"^\s*(`{3,}|~{3,})")
CONTRACTION_RE = re.compile(
    r"\b(?:\w+n['’]t|(?:I|you|we|they|he|she|it|there|that|who|what|where|how)['’](?:m|re|ve|ll|d|s))\b",
    re.IGNORECASE,
)
PROGRESSIVE_RE = re.compile(r"\b(?:am|is|are|was|were|be|been|being)\s+(?:\w+\s+)?\w+ing\b", re.I)
PASSIVE_RE = re.compile(r"\b(?:is|are|was|were|be|been|being)\s+(?:\w+\s+)?\w+ed\b", re.I)
LINK_RE = re.compile(r"\[([^\]]+)\]\(<?[^)]+>?\)")
CODE_RE = re.compile(r"`+[^`\n]+`+")
URL_RE = re.compile(r"\b(?:https?://|www\.)\S+", re.I)
QUOTE_RE = re.compile(r"\"[^\"\n]*\"|“[^”\n]*”|‘[^’\n]*’")
PAREN_RE = re.compile(r"\([^()]*\)")
UNIT_RE = re.compile(
    r"(?<!\w)\d+(?:[.,]\d+)?\s+(?:degrees\s+(?:Celsius|Fahrenheit)|"
    r"kilograms?|grams?|milligrams?|millimeters?|centimeters?|meters?|kilometers?|"
    r"minutes?|hours?|seconds?|ohms?|°[CF]|µg|mg|kg|km|cm|mm|mA|kPa|MPa|"
    r"psi|MHz|kHz|Hz|GB|MB|ms|Pa|kg|mg|m|g|V|A|s)\b",
    re.I,
)
ABBREV_RE = re.compile(r"\b(?:a\.m\.|p\.m\.|e\.g\.|i\.e\.|No\.\s*\d+|Fig\.\s*\d+)", re.I)


@dataclass
class Finding:
    severity: str
    rule: str
    line: int
    message: str
    excerpt: str


@dataclass
class Block:
    kind: str
    line: int
    text: str


def blocks_from_markdown(text: str) -> List[Block]:
    blocks: List[Block] = []
    buffer: List[str] = []
    buffer_line = 1
    fence = None

    def flush() -> None:
        nonlocal buffer
        if buffer:
            blocks.append(Block("paragraph", buffer_line, " ".join(buffer)))
            buffer = []

    for line_number, raw in enumerate(text.splitlines(), 1):
        marker = FENCE_RE.match(raw)
        if marker:
            chars = marker.group(1)
            if fence is None:
                flush()
                fence = (chars[0], len(chars))
            elif chars[0] == fence[0] and len(chars) >= fence[1]:
                fence = None
            continue
        if fence:
            continue
        line = raw.strip()
        if not line or re.match(r"^[-*_]{3,}$", line):
            flush()
            continue
        if line.startswith("#") and re.match(r"^#{1,6}\s", line):
            flush()
            continue
        if line.startswith("|") and line.endswith("|"):
            flush()
            # Table cells are not parsed as prose. Check them manually.
            continue
        line = re.sub(r"^\s*>\s?", "", raw).strip()
        if LIST_RE.match(line):
            flush()
            blocks.append(Block("list", line_number, LIST_RE.sub("", line, count=1)))
            continue
        if not buffer:
            buffer_line = line_number
        buffer.append(line)
    flush()
    return blocks


def protected_text(text: str) -> Tuple[str, List[str]]:
    """Mask snippets that count as one word; return inner parentheticals to audit."""
    text = LINK_RE.sub(lambda m: m.group(1), text)
    text = CODE_RE.sub(" IDENTIFIER ", text)
    text = URL_RE.sub(" IDENTIFIER ", text)
    text = QUOTE_RE.sub(" QUOTEDTEXT ", text)
    inners: List[str] = []
    # Repeatedly replace innermost spans so nested parentheses do not crash.
    for _ in range(20):
        matches = list(PAREN_RE.finditer(text))
        if not matches:
            break
        for m in reversed(matches):
            inner = m.group()[1:-1].strip()
            if re.search(r"[a-zA-Z]", inner) and len(WORD_RE.findall(inner)) > 1:
                inners.append(inner)
            text = text[:m.start()] + " PARENTHETICAL " + text[m.end():]
    # Protect punctuation in abbreviations and decimal numbers.
    # STE treats number + time abbreviation and certain named identifiers as one word.
    text = re.sub(r"\b\d+(?:[.,]\d+)?\s+(?:a\.m\.|p\.m\.)", " TIMEUNIT ", text, flags=re.I)
    text = re.sub(r"\b(?:No\.|Fig\.)\s*\d+", " IDENTIFIER ", text, flags=re.I)
    text = ABBREV_RE.sub(lambda m: m.group().replace(".", "_"), text)
    text = re.sub(r"(?<=\d)\.(?=\d)", "_", text)
    return text, inners


def split_sentences(text: str) -> List[str]:
    # Do not split after decimals, abbreviations, or inside quoted/parenthetical spans.
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+(?=\S)", text.strip()) if s.strip()]


def count_words(sentence: str) -> int:
    sentence = UNIT_RE.sub(" UNITPAIR ", sentence)
    sentence = re.sub(r"(?<!\w)\d{1,3}(?:,\d{3})+(?:\.\d+)?", " NUMBER ", sentence)
    return len(WORD_RE.findall(sentence))


def _finding(severity: str, rule: str, line: int, message: str, text: str) -> Finding:
    return Finding(severity, rule, line, message, text[:160].strip())


def check_text(text: str, mode: str) -> List[Finding]:
    if mode not in ("procedure", "description"):
        raise ValueError("mode must be procedure or description")
    findings: List[Finding] = []
    limit, length_rule = (20, "5.1") if mode == "procedure" else (25, "6.3")
    for block in blocks_from_markdown(text):
        processed, parentheticals = protected_text(block.text)
        if ";" in processed:
            findings.append(_finding("error", "8.1", block.line, "Semicolon in prose.", block.text))
        for m in CONTRACTION_RE.finditer(processed):
            findings.append(_finding("error", "4.2", block.line, f"Possible contraction: {m.group()}.", block.text))
        if PROGRESSIVE_RE.search(processed):
            findings.append(_finding("review", "3.2/3.5", block.line, "Possible progressive verb construction; review its function.", block.text))
        if PASSIVE_RE.search(processed):
            findings.append(_finding("review", "3.6", block.line, "Possible passive voice or participial adjective; inspect context.", block.text))
        sentences = split_sentences(processed)
        if mode == "description" and block.kind == "paragraph" and len(sentences) > 6:
            findings.append(_finding("error", "6.6", block.line, f"Paragraph has {len(sentences)} sentences (maximum 6).", block.text))
        for sentence in sentences:
            n = count_words(sentence)
            if n > limit:
                findings.append(_finding("error", length_rule, block.line, f"Approximately {n} words (limit {limit}); verify count using STE Section 8.", sentence))
        for inner in parentheticals:
            # The parenthetical has its own sentence count under 8.5.
            for sentence in split_sentences(inner):
                n = count_words(sentence)
                if n > limit:
                    findings.append(_finding("error", "8.5/" + length_rule, block.line, f"Parenthetical has approximately {n} words (limit {limit}).", sentence))
    return sorted(findings, key=lambda f: (f.line, 0 if f.severity == "error" else 1, f.rule))


def main(argv: List[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Offline STE Issue 9 structural lint (NOT a full compliance check)")
    parser.add_argument("input", help="UTF-8 .md or .txt file, or - for stdin")
    parser.add_argument("--mode", required=True, choices=["procedure", "description"], help="Review procedures and descriptions separately")
    parser.add_argument("--format", choices=["text", "json"], default="text", help="Machine-readable or human-readable findings")
    args = parser.parse_args(argv)
    try:
        text = sys.stdin.read() if args.input == "-" else Path(args.input).read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        print(f"Cannot read input: {exc}", file=sys.stderr)
        return 2
    findings = check_text(text, args.mode)
    errors = sum(f.severity == "error" for f in findings)
    reviews = len(findings) - errors
    if args.format == "json":
        print(json.dumps({
            "tool": "ste-technical-writing structural checker",
            "issue": "9",
            "mode": args.mode,
            "structural_status": "FAIL" if errors else "PASS (limited checks)",
            "dictionary_status": "NOT VERIFIED",
            "errors": errors,
            "manual_review_flags": reviews,
            "findings": [asdict(f) for f in findings],
            "limitations": "Heuristic counts; no dictionary, technical-term, semantic or safety validation.",
        }, indent=2, ensure_ascii=False))
    else:
        print(f"Structural status: {'FAIL' if errors else 'PASS (limited checks)'} | {errors} errors; {reviews} manual-review flags")
        print("Dictionary: NOT VERIFIED | Semantic/safety review: NOT VERIFIED")
        for f in findings:
            print(f"{f.severity.upper()} line {f.line} rule {f.rule}: {f.message}\n  {f.excerpt}")
        print("NOTICE: Word counts are approximate; verify special cases against Issue 9 Section 8.")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
