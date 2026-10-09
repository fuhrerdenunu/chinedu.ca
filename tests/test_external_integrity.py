import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


REPO = Path(__file__).resolve().parents[1]
SCANNER = REPO / "scripts" / "check-external-integrity.py"


class ExternalIntegrityTests(unittest.TestCase):
    def run_scan(self, html: str) -> subprocess.CompletedProcess[str]:
        with tempfile.TemporaryDirectory() as directory:
            Path(directory, "index.html").write_text(html, encoding="utf-8")
            return subprocess.run(
                [sys.executable, str(SCANNER), directory],
                text=True,
                capture_output=True,
                check=False,
            )

    def test_external_script_without_integrity_fails(self) -> None:
        result = self.run_scan('<script src="https://unpkg.com/lib.js"></script>')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("missing integrity", result.stdout)

    def test_secured_external_script_passes(self) -> None:
        result = self.run_scan(
            '<script src="https://unpkg.com/lib.js" '
            'integrity="sha384-abc" crossorigin="anonymous"></script>'
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_google_fonts_stylesheet_is_an_exception(self) -> None:
        result = self.run_scan(
            '<link rel="stylesheet" '
            'href="https://fonts.googleapis.com/css2?family=Syne">'
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
