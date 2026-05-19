// api/_helpers/locked-library-blobs.js
//
// Conservative locked-book safety gate for the Library.
//
// This helper is intentionally pattern-based (not just exact matches) so that
// obvious families of likely-copyrighted content from the audit are covered
// even when filenames vary slightly (case, separators, splits, "Part X",
// "Combined", "OCR", etc.).
//
// Source of truth: the audit report's HIGH-risk groups, including NRCA, IIBEC,
// SMACNA, ASTM, ASCE, ANSI/SPRI, ICC/IEBC, PDFDrive-sourced files,
// CSI Project Delivery, "Combined PDFs", "First 100 Pages", scan/ocr split
// families, 2023-05-gilmore internal staging dumps, "Study Material" dumps,
// J. Paul Guyer titles, and miscellaneous flagged manufacturer manuals/guides.
//
// Rules:
//   - This file blocks SERVING and LISTING only. It does not delete or move
//     anything in blob storage.
//   - When in doubt, lock. We will unlock individually as permissions clear.
//
// Public API:
//   isBlobLocked(name)      -> boolean
//   lockReason(name)        -> string | null   (which pattern matched)
//   filterLockedOut(list, getName) -> { kept, removed }   (utility for arrays)

"use strict";

/**
 * Each entry: { id, re, note }
 *   - id:   short identifier for logs (no PII, safe to debug-log)
 *   - re:   case-insensitive RegExp matched against the NORMALIZED base name
 *           (see `normalizeForMatch` below — non-alphanumeric runs become
 *           single spaces, lowercased). This lets `\b` behave intuitively
 *           even around underscores, parentheses, dots, etc.
 *   - note: human-readable reason
 */
const LOCK_PATTERNS = [
  // ---- Standards-development orgs (HIGH-risk in audit) ----
  { id: "NRCA",        re: /\bnrca\b/,                          note: "NRCA-sourced material" },
  { id: "IIBEC",       re: /\biibec\b/,                         note: "IIBEC-sourced material" },
  { id: "SMACNA",      re: /\bsmacna\b/,                        note: "SMACNA-sourced material" },
  { id: "ASTM",        re: /\bastm\b/,                          note: "ASTM standard or excerpt" },
  { id: "ASCE",        re: /\basce\b/,                          note: "ASCE standard or excerpt" },
  { id: "ANSI",        re: /\bansi\b/,                          note: "ANSI standard or excerpt" },
  { id: "SPRI",        re: /\bspri\b/,                          note: "SPRI standard or excerpt" },
  { id: "ICC",         re: /\bicc\b/,                           note: "ICC code material" },
  { id: "IEBC",        re: /\biebc\b/,                          note: "IEBC code material" },

  // ---- Known suspect provenance ----
  { id: "PDFDrive",    re: /\bpdf\s*drive\b/,                   note: "PDFDrive-sourced (likely pirated)" },

  // ---- Bulk / staging dumps from the audit ----
  { id: "CSI_PD",      re: /\bcsi\s+project\s+delivery\b/,      note: "CSI Project Delivery bundle" },
  { id: "Combined",    re: /\bcombined\s+pdfs?\b/,              note: "Combined PDFs staging dump" },
  { id: "First100",    re: /\bfirst\s+100\s+pages?\b/,          note: "First 100 Pages preview slice" },
  { id: "StudyMat",    re: /\bstudy\s+materials?\b/,            note: "Bulk Study Material dump" },

  // Scan/OCR split families: e.g. "...-scan-1.pdf", "...-ocr-split-3.pdf",
  // "scan_part_2", "ocr_split-04". We deliberately require a "split-ish"
  // token (or trailing number) alongside scan/ocr so we don't catch
  // legitimate filenames that merely mention "scan" or "ocr".
  { id: "ScanSplit",   re: /\b(?:scan|ocr)\s+(?:split|part|pt|page|pg|seg|slice)\b/,
                       note: "scan/ocr split family" },
  { id: "OcrSuffix",   re: /\b(?:scan|ocr)\s+\d+\b/,            note: "scan/ocr numeric split" },

  // ---- Internal staging that should never have shipped ----
  { id: "GilmoreDump", re: /\b2023\s+05\s+gilmore\b/,           note: "2023-05-gilmore internal staging" },
  { id: "GilmoreAny",  re: /\bgilmore\b/,                       note: "Gilmore internal material (be cautious)" },

  // ---- Author flagged HIGH in audit ----
  { id: "JPaulGuyer",  re: /\b(?:j\s+paul\s+guyer|guyer)\b/,    note: "J. Paul Guyer author bundle" },

  // ---- Manufacturer manuals/guides flagged HIGH in audit ----
  // Conservative subset of vendor names whose technical manuals were
  // explicitly flagged. Extend as the audit clarifies more names.
  { id: "MfgGAF",      re: /\bgaf\b.*\b(?:manual|guide|specification|spec)\b/,
                       note: "GAF manufacturer manual/guide" },
  { id: "MfgFirestone",re: /\bfirestone\b.*\b(?:manual|guide|specification|spec)\b/,
                       note: "Firestone manufacturer manual/guide" },
  { id: "MfgCarlisle", re: /\bcarlisle\b.*\b(?:manual|guide|specification|spec)\b/,
                       note: "Carlisle manufacturer manual/guide" },
  { id: "MfgJM",       re: /\bjohns\s+manville\b.*\b(?:manual|guide|specification|spec)\b/,
                       note: "Johns Manville manufacturer manual/guide" },
  { id: "MfgSika",     re: /\bsika(?:plan)?\b.*\b(?:manual|guide|specification|spec)\b/,
                       note: "Sika/Sikaplan manufacturer manual/guide" },
  { id: "MfgSoprema",  re: /\bsoprema\b.*\b(?:manual|guide|specification|spec)\b/,
                       note: "Soprema manufacturer manual/guide" },
];

function safeDecode(s) {
  try { return decodeURIComponent(s); } catch { return s; }
}

/**
 * Reduce an input to a comparable base name:
 *  - strip path
 *  - strip query/hash
 *  - URL-decode (%20 etc)
 *  - trim
 * The original casing is preserved here; normalization (below) lowercases.
 */
function baseName(input) {
  let s = String(input == null ? "" : input).trim();
  if (!s) return "";
  s = s.split("?")[0].split("#")[0];
  s = s.replace(/\\/g, "/");
  if (s.includes("/")) s = s.split("/").pop();
  return safeDecode(s).trim();
}

/**
 * Normalize the base name for robust matching:
 *  - lowercase
 *  - replace every run of non-alphanumeric characters with a single space
 *  - collapse and trim whitespace
 *
 * This means underscores, dots, parens, hyphens, etc. all become spaces,
 * so JS's `\b` (which treats `_` as a word char) behaves as expected.
 */
function normalizeForMatch(base) {
  return String(base || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Returns the matching lock pattern id (e.g. "ASTM") or null if not locked.
 * Useful for debug logging without exposing user-controlled blob names.
 */
function lockReason(name) {
  const base = baseName(name);
  if (!base) return null;
  const normalized = normalizeForMatch(base);
  if (!normalized) return null;
  for (let i = 0; i < LOCK_PATTERNS.length; i++) {
    const p = LOCK_PATTERNS[i];
    if (p.re.test(normalized)) return p.id;
  }
  return null;
}

/**
 * Returns true if the blob name matches any locked pattern.
 */
function isBlobLocked(name) {
  return lockReason(name) !== null;
}

/**
 * Convenience filter: split an array into kept/removed based on the lock.
 *   getName(item) -> string (the blob/file name to test)
 */
function filterLockedOut(list, getName) {
  const kept = [];
  const removed = [];
  if (!Array.isArray(list)) return { kept, removed };
  const getter = typeof getName === "function" ? getName : (x) => x;
  for (const item of list) {
    const candidate = getter(item);
    if (isBlobLocked(candidate)) {
      removed.push({ item, reason: lockReason(candidate) });
    } else {
      kept.push(item);
    }
  }
  return { kept, removed };
}

module.exports = {
  isBlobLocked,
  lockReason,
  filterLockedOut,
  // exported for tests / introspection only — do NOT expose to clients
  _LOCK_PATTERNS: LOCK_PATTERNS,
};
