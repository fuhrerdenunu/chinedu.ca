#!/usr/bin/env python3
from __future__ import annotations

import argparse
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


STYLESHEET_EXCEPTIONS = {"fonts.googleapis.com"}


class Scanner(HTMLParser):
    def __init__(self, source: Path) -> None:
        super().__init__()
        self.source = source
        self.errors: list[str] = []

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        values = dict(attrs)
        if tag == "script" and self.external(values.get("src")):
            self.require("script", values.get("src", ""), values)

        rel = (values.get("rel") or "").split()
        if tag == "link" and "stylesheet" in rel:
            href = values.get("href")
            if (
                self.external(href)
                and urlparse(href or "").hostname not in STYLESHEET_EXCEPTIONS
            ):
                self.require("stylesheet", href or "", values)

    @staticmethod
    def external(url: str | None) -> bool:
        return bool(url and urlparse(url).scheme in {"http", "https"})

    def require(
        self, kind: str, url: str, values: dict[str, str | None]
    ) -> None:
        if not values.get("integrity"):
            self.errors.append(f"{self.source}: {kind} {url} missing integrity")
        if values.get("crossorigin") != "anonymous":
            self.errors.append(
                f"{self.source}: {kind} {url} missing crossorigin=anonymous"
            )


def scan(root: Path) -> list[str]:
    errors: list[str] = []
    for path in sorted(root.rglob("*.html")):
        scanner = Scanner(path)
        scanner.feed(path.read_text(encoding="utf-8"))
        errors.extend(scanner.errors)
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path)
    root = parser.parse_args().root
    errors = scan(root)
    if errors:
        print("\n".join(errors))
        return 1
    print("All external executable resources satisfy the integrity policy.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
