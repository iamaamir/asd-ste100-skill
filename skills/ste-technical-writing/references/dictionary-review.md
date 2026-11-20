# Dictionary and technical terminology review

## Authoritative reference

Use **Part 2 of the official ASD-STE100 Issue 9 PDF**, not an unverified online word list and not the remembered behavior of older issues. The Issue 9 introduction states that its dictionary includes **875 approved entries and 1,274 unapproved entries**. The dictionary gives words, parts of speech, meanings or alternatives, and examples. Its approved general vocabulary is **not a complete inventory of permitted domain-specific technical nouns and verbs**.

The standard's PDF is **not distributed with this skill**, and this skill does not reproduce its entries. Obtain the official version using https://www.asd-ste100.org/ and check the license/permission applicable to your use.

## Verification sequence

1. Compile a list of distinct lexical items in the document. Keep multi-word expressions, brand names, named products, numbers, parts, UI labels, and code identifiers separate.
2. For an **ordinary vocabulary word**, consult the dictionary entry. Check the status, indicated part of speech, approved meaning, permitted form, and sentence context. Lowercase entries in the printed dictionary represent unapproved words. Do not infer that a word is permitted just because it appears in the PDF as a cross-reference or unapproved example.
3. If the entry is unapproved, use the official suggested construction **only if it preserves meaning**. Restructure the sentence when a one-word substitution changes its meaning (9.1).
4. For a proposed **technical noun**, check the section 1 technical-noun categories, the official part nomenclature or organizational glossary, its grammatical role, and the consistent naming of the same item. The categories are permissions, not a general escape hatch for complicated words.
5. For a proposed **technical verb**, verify a category from Rule 1.12, the *particular technical use*, the applicable industry/field, and whether an approved ordinary verb expresses the idea. An acceptable computer-process verb in a UI instruction might be invalid in ordinary prose.
6. Check inflections, comparatives, spellings, verb tenses, technical noun groups, and prohibited phrasal verbs against the relevant Part 1 rule.
7. Record unresolved words, meaning ambiguity, and domain-specific term approvals. Seek subject-matter review for dangerous substitutions.

## Review record

Use a private register with these fields for each disputed term:

| Field | Example value type |
| --- | --- |
| `term` | the source word or exact phrase |
| `role` | noun, verb, adjective, etc. |
| `source` | dictionary / technical noun / technical verb / protected literal |
| `category_or_entry` | page or rule/category identifier |
| `approved_meaning_or_use` | short paraphrase in context |
| `authority` | dictionary page / approved company terminology / drawing number |
| `decision` | keep / revise / unresolved |
| `reviewer` | human or agent reviewer identifier |

`assets/term-register.csv` is a blank starting template. Do not populate it with copied dictionary content for redistribution.

## Strictness and evidence

- **Verified**: each applicable word/phrase reviewed against the actual Issue 9 entry or authorized technical register, with the structural and factual reviews complete.
- **Partial**: some words checked but unresolved cases remain; state which.
- **Not verified**: the source dictionary or authorized technical terminology was not available.

A language model, plain-English rewrite, or regex checker alone cannot establish official conformance. ASD and STEMG do not certify or endorse this skill or third-party checking tools.
