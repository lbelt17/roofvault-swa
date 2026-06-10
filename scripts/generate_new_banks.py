#!/usr/bin/env python3
"""Generate four new RoofVault exam bank JS modules from curated question data."""
from __future__ import annotations
import json
import os
import re
import textwrap

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "api", "exam")

SANITIZE = textwrap.dedent(r'''
function sanitizeText(s) {
  if (typeof s !== "string") return s;
  const map = {
    "\u00e2\u20ac\u2122": "\u2019",
    "\u00e2\u20ac\u0153": "\u201c",
    "\u00e2\u20ac\u009d": "\u201d",
    "\u00e2\u20ac\u201c": "\u2013",
    "\u00e2\u20ac\u201d": "\u2014",
    "\u00e2\u20ac\u00a6": "\u2026",
    "\u00c2\u00bd": "\u00bd",
    "\u00c2\u00bc": "\u00bc",
    "\u00c2\u00be": "\u00be",
    "\u00c2\u00b0": "\u00b0",
    "\u00c2\u00ae": "\u00ae",
    "\u00c2\u00a9": "\u00a9",
    "\u00c2\u00b1": "\u00b1",
    "\u00c2\u00b7": "\u00b7",
    "\u00c3\u2014": "\u00d7",
    "\u00c3\u00a9": "\u00e9",
    "\u00c3\u00a8": "\u00e8",
    "\u00c3\u00aa": "\u00ea",
    "\u00c3\u00a1": "\u00e1",
    "\u00c3\u00b3": "\u00f3",
    "\u00c3\u00ba": "\u00fa",
    "\u00c3\u00b1": "\u00f1",
    "\u00c2\u00a0": " ",
    "\u00e2\u20ac": "\u201d"
  };
  let out = s;
  for (const [bad, good] of Object.entries(map)) out = out.split(bad).join(good);
  return out;
}

function sanitizeOption(o) {
  if (!o || typeof o !== "object") return o;
  return { ...o, text: typeof o.text === "string" ? sanitizeText(o.text) : o.text };
}

function sanitizeQuestion(q) {
  if (!q || typeof q !== "object") return q;
  const out = { ...q };
  for (const f of ["question", "explanation", "cite"]) {
    if (typeof out[f] === "string") out[f] = sanitizeText(out[f]);
  }
  if (Array.isArray(out.options)) out.options = out.options.map(sanitizeOption);
  return out;
}
''').strip()


def js_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def render_question(q: dict) -> str:
    opts = ",\n".join(
        f'        {{ id: {js_str(o["id"])}, text: {js_str(o["text"])} }}'
        for o in q["options"]
    )
    return f"""    {{
      id: {js_str(q["id"])},
      type: "mcq",
      question: {js_str(q["question"])},
      options: [
{opts}
      ],
      answer: {js_str(q["answer"])},
      explanation: {js_str(q["explanation"])},
      cite: {js_str(q["cite"])},
      exhibitImage: "",
      imageRef: ""
    }}"""


def write_bank(filename: str, header: str, const_prefix: str, book: str, questions: list[dict]) -> int:
    # dedupe by normalized question stem
    seen = set()
    unique = []
    for q in questions:
        key = re.sub(r"\s+", " ", q["question"].lower().strip())
        if key in seen:
            continue
        seen.add(key)
        unique.append(q)

    raw = const_prefix + "_RAW"
    body = ",\n".join(render_question(q) for q in unique)
    content = f"""{header}

{SANITIZE}

const {raw} = {{
  book: {js_str(book)},
  questions: [
{body}
  ]
}};

const {const_prefix} = {{
  ...{raw},
  questions: {raw}.questions.map(sanitizeQuestion)
}};

module.exports = {const_prefix};
"""
    path = os.path.join(OUT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return len(unique)


import importlib.util

_DATA_PATH = os.path.join(os.path.dirname(__file__), "bank_questions_data.py")
_spec = importlib.util.spec_from_file_location("bank_questions_data", _DATA_PATH)
data = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(data)

if __name__ == "__main__":
    banks = [
        ("duro-last-maintenance-question-bank-2026.js", data.DUROLAST_HEADER, "DURO_LAST_MAINTENANCE_QUESTION_BANK_2026", data.DUROLAST_BOOK, data.DUROLAST),
        ("elevate-ultraply-tpo-question-bank-2026.js", data.ELEVATE_HEADER, "ELEVATE_ULTRAPLY_TPO_QUESTION_BANK_2026", data.ELEVATE_BOOK, data.ELEVATE),
        ("polyglass-technical-guide-question-bank-2026.js", data.POLYGLASS_HEADER, "POLYGLASS_TECHNICAL_GUIDE_QUESTION_BANK_2026", data.POLYGLASS_BOOK, data.POLYGLASS),
        ("jm-app-roofing-systems-question-bank-2026.js", data.JM_HEADER, "JM_APP_ROOFING_SYSTEMS_QUESTION_BANK_2026", data.JM_BOOK, data.JM),
    ]
    print("Generating exam banks...")
    for fn, hdr, prefix, book, qs in banks:
        n = write_bank(fn, hdr, prefix, book, qs)
        print(f"  {fn}: {n} questions")
