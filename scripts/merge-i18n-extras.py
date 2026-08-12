#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Deep-merge scripts/i18n-extras/{en,fr}/*.json into messages/{en,fr}."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXTRAS = ROOT / "scripts" / "i18n-extras"
MESSAGES = ROOT / "messages"


def deep_merge(base: dict, extra: dict) -> dict:
    out = dict(base)
    for key, value in extra.items():
        if key in out and isinstance(out[key], dict) and isinstance(value, dict):
            out[key] = deep_merge(out[key], value)
        else:
            out[key] = value
    return out


def main() -> None:
    merged = 0
    for locale in ("en", "fr"):
        extra_dir = EXTRAS / locale
        if not extra_dir.exists():
            continue
        for extra_path in sorted(extra_dir.glob("*.json")):
            dest = MESSAGES / locale / extra_path.name
            extra = json.loads(extra_path.read_text(encoding="utf-8"))
            if dest.exists():
                base = json.loads(dest.read_text(encoding="utf-8"))
                data = deep_merge(base, extra)
            else:
                data = extra
            dest.write_text(
                json.dumps(data, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            merged += 1
            print(f"merged {locale}/{extra_path.name}")
    print(f"done ({merged} files)")


if __name__ == "__main__":
    main()
