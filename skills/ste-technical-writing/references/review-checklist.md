# Human and agent review checklist

Use after drafting or after the script has run. There is no fully automatic substitute for this checklist.

## Content, semantics, and scope

- Did the rewrite preserve *each* technical instruction, measurement, precondition, consequence, and sequence?
- Are numbered steps in the required order? Is each step executable without guessing?
- Have model-specific commands, file paths, option names, API names, identifiers, and UI strings been preserved exactly where required?
- Was the material correctly divided into instructions (procedural) and factual descriptions (descriptive)?
- Has a subject expert checked safety consequences and required labels where appropriate?

## Language

- Have all uncertain general words been checked for the approved **part of speech and meaning** in the original Issue 9 dictionary?
- Have technical nouns/verbs been justified under Sections 1.5–1.13 with an authoritative domain source?
- Have approved inflections, elementary tenses, active voice rules, and the restricted `-ing` uses been checked?
- Are noun groups, articles, conditions, lists, and paragraph boundaries correct?
- Are there no semicolons, contractions, or prohibited phrasal verbs?
- Have word counts been checked **using Section 8**, especially parentheticals, quoted text, units, labels, identifiers, and list-introducing colons?
- Do all explanations communicate the intended meaning without unnecessary jargon or extra actions?

## Typical review output

```text
Mode: procedural
Structural check: FAIL (2 findings; 1 advisory)
Dictionary review: NOT VERIFIED (no Issue 9 dictionary attached for lookups)
Technical/safety review: NEEDS SUBJECT-MATTER REVIEW

- Sentence 2: 22 words (approximate), Rule 5.1: split the instruction.
- Sentence 5: semicolon, Rule 8.1: use a full stop and separate sentences.
- Sentence 6: possible passive construction, Rule 3.6: inspect in context.

Revised text:
[Provide usable text or request indispensable technical facts.]
```

Never write `STE certified` or imply endorsement. For short, low-risk tasks, report only actionable findings and the verification boundary; do not add a lengthy checklist to every response.
