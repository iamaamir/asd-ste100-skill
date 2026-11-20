from __future__ import annotations
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("ste_check", ROOT / "scripts/ste_check.py")
module = importlib.util.module_from_spec(spec)
sys.modules["ste_check"] = module
spec.loader.exec_module(module)


class StructuralTests(unittest.TestCase):
    def findings(self, text, mode="procedure"):
        return module.check_text(text, mode)

    def rules(self, text, mode="procedure", severity=None):
        return [f.rule for f in self.findings(text, mode) if severity is None or f.severity == severity]

    def test_clean_imperative(self):
        self.assertEqual([], self.findings("Remove the cover. Install the new filter."))

    def test_overlong_procedure(self):
        sentence = " ".join(["Remove"] + ["the"] * 19 + ["cover."])
        self.assertIn("5.1", self.rules(sentence))

    def test_exact_twenty_word_procedure(self):
        sentence = " ".join(["Remove"] + ["the"] * 18 + ["cover."])
        self.assertNotIn("5.1", self.rules(sentence))

    def test_description_25_limit(self):
        ok = " ".join(["The"] + ["unit"] * 23 + ["operates."])
        bad = " ".join(["The"] + ["unit"] * 24 + ["operates."])
        self.assertNotIn("6.3", self.rules(ok, "description"))
        self.assertIn("6.3", self.rules(bad, "description"))

    def test_description_paragraph_seven_sentences(self):
        self.assertIn("6.6", self.rules("The fan operates. " * 7, "description"))

    def test_blank_line_separates_paragraphs(self):
        self.assertNotIn("6.6", self.rules("The fan operates. " * 4 + "\n\n" + "The fan stops. " * 4, "description"))

    def test_semicolon(self):
        self.assertIn("8.1", self.rules("Open the cover; remove the filter."))

    def test_fenced_code_not_linted(self):
        self.assertEqual([], self.findings("```js\nconst test = 'a;b';\n```\n\nRemove the cover."))

    def test_inline_code_not_linted(self):
        self.assertNotIn("8.1", self.rules("Run `printf 'a;b'` in the terminal."))

    def test_contraction_but_not_possessive(self):
        self.assertIn("4.2", self.rules("Don't remove the technician's cover."))
        self.assertNotIn("4.2", self.rules("Remove the technician's cover."))

    def test_parenthetical_counts_as_single_outer_word(self):
        sentence = " ".join(["Remove"] + ["the"] * 17 + ["cover", "(the cover is blue)."])
        self.assertNotIn("5.1", self.rules(sentence))

    def test_parenthetical_checked_separately(self):
        parenthetical = "(" + " ".join(["the"] * 21) + ")"
        self.assertIn("8.5/5.1", self.rules("Remove the cover " + parenthetical + "."))

    def test_hyphenated_and_measurement_count(self):
        self.assertEqual(4, module.count_words("Install the 20-mm spacer."))
        self.assertEqual(5, module.count_words("Set the pressure to 10 psi."))
        self.assertEqual(4, module.count_words("The unit weighs 20 kilograms."))

    def test_ste_source_counting_patterns(self):
        self.assertEqual(4, module.count_words(module.protected_text("The unit weighs 20 kg.")[0]))
        self.assertEqual(10, module.count_words(module.protected_text("Make sure that the temperature in the room is 10 °C.")[0]))
        self.assertEqual(13, module.count_words(module.protected_text("The maintenance team does a test of this system each day at 10 a.m.")[0]))
        self.assertEqual(5, module.count_words(module.protected_text("Examine the No. 1 bearing installation.")[0]))
        self.assertEqual(4, module.count_words(module.protected_text("Tag circuit breaker 36L7.")[0]))
        self.assertEqual(5, module.count_words(module.protected_text("Set the limit to 50,000 psi.")[0]))

    def test_link_and_quote_not_counted_as_urls(self):
        text = 'Refer to [Section 3](https://example.com/a;b) and select "Service Overview".'
        self.assertNotIn("8.1", self.rules(text))
        self.assertLess(module.count_words(module.protected_text(text)[0]), 20)

    def test_list_items_count_separately(self):
        text = "Remove these items:\n- The left access panel\n- The right access panel"
        self.assertNotIn("5.1", self.rules(text))

    def test_passive_voice_advisory_not_error(self):
        x = self.findings("The cover was installed.", "description")
        self.assertTrue(any(f.severity == "review" and f.rule == "3.6" for f in x))
        self.assertFalse(any(f.severity == "error" for f in x))

    def test_progressive_voice_advisory(self):
        self.assertIn("3.2/3.5", self.rules("The engine is running.", "description"))

    def test_abbreviation_does_not_split_sentence(self):
        self.assertEqual(1, len(module.split_sentences(module.protected_text("Start at 10 a.m. and open the cover.")[0])))

    def test_json_cli_and_status_code(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "sample.md"
            path.write_text("Open the panel; remove the filter.", encoding="utf-8")
            cmd = [sys.executable, str(ROOT / "scripts/ste_check.py"), "--mode", "procedure", "--format", "json", str(path)]
            p = subprocess.run(cmd, capture_output=True, text=True)
            self.assertEqual(1, p.returncode)
            obj = json.loads(p.stdout)
            self.assertEqual("NOT VERIFIED", obj["dictionary_status"])
            self.assertEqual("8.1", obj["findings"][0]["rule"])

    def test_missing_file_returns_error_two(self):
        p = subprocess.run([sys.executable, str(ROOT / "scripts/ste_check.py"), "--mode", "procedure", "/nonexistent/ste_check.txt"], capture_output=True, text=True)
        self.assertEqual(2, p.returncode)


if __name__ == "__main__":
    unittest.main()
