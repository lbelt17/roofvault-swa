// force redeploy
/**
 * /api/books — list distinct document names by SELECTing likely fields.
 * Env:
 *   SEARCH_ENDPOINT=https://roofvaultsearch.search.windows.net
 *   SEARCH_API_KEY=xxxxx
 *   SEARCH_INDEX=azureblob-index
 */
const https = require("https");
const { URL } = require("url");

function safeDecodeURIComponent(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function baseNameFromValue(raw) {
  let s = String(raw || "").trim();
  if (!s) return "";

  // If it's a URL, keep only pathname
  // If it's a path, keep only last segment
  s = s.split("?")[0].split("#")[0];

  // Normalize slashes
  s = s.replace(/\\/g, "/");

  // Take last segment
  if (s.includes("/")) s = s.split("/").pop();

  // Decode %20 etc
  s = safeDecodeURIComponent(s);

  return s.trim();
}

function normalizeSpaces(s) {
  return String(s || "")
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Remove common "part" suffix patterns:
 * - "... Pt1-1"
 * - "... Pt1.10.1-1"
 * - "... Part 3 of 10"
 * - "... - Part_02"
 * - "... pt-3"
 */
function stripPartSuffix(name) {
  let s = name;

  // Remove extension first
  s = s.replace(/\.pdf$/i, "").trim();

  // Common trailing tokens like: " - Pt1.10.1-1", "_Pt2-3", " Part 2 of 10"
  // (We keep this aggressive but only at END of string.)
  s = s.replace(
    /(\s*[-–—_]\s*|\s+)(part|pt|section|sec|vol|volume|book)\s*[_-]?\s*\d+(\.\d+)*([_-]?\d+(\.\d+)*)*(\s*(of|\/)\s*\d+)?\s*$/i,
    ""
  );

  // Also strip patterns like "-p3", "_p3", " p3" at end (some scans do this)
  s = s.replace(/(\s*[-–—_]\s*|\s+)p\s*\d+\s*$/i, "");

  return s.trim();
}

function makeDisplayTitle(raw) {
  let s = normalizeSpaces(raw);

  // A little cleanup for common junk
  s = s.replace(/\s*-\s*/g, " - "); // normalize hyphen spacing
  s = s.replace(/\(\s*/g, "(").replace(/\s*\)/g, ")");

  // Remove double dashes
  s = s.replace(/\s*-\s*-\s*/g, " - ");

  return s.trim();
}

function makeGroupId(displayTitle) {
  return displayTitle
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function groupFromName(rawValue) {
  // 1) get basename (handles path fields)
  const base = baseNameFromValue(rawValue);

  // remove extension like .pdf, .docx, etc
  let s = String(base || "").replace(/\.[^.]+$/i, "");

  // normalize fancy dashes to "-"
  s = s.replace(/[–—]/g, "-").trim();

  // ----------------------------
  // CASE A: "… manual <vol> - <part>"
  // Examples:
  // "Architectural sheet metal manual 1-11"
  // "Architectural sheet metal manual 1 - 11"
  // ----------------------------
  let m = s.match(/^(.*?\bmanual)\s*(\d+)\s*-\s*(\d+)\s*$/i);
  if (m) {
    const title = normalizeSpaces(`${m[1]} ${m[2]}`); // keep "manual 1"
    const part = m[3];

    const displayTitle = makeDisplayTitle(title);
    const bookGroupId = makeGroupId(displayTitle);

    return { bookGroupId, displayTitle, partLabel: part };
  }

  // ----------------------------
  // CASE B: "… manual <vol><part>" (no dash)
  // This is what your API is showing now: manual 11, 12, 13...
  // We interpret: first digit = volume, remaining digits = part
  // Examples:
  // "… manual 11" -> vol=1 part=1
  // "… manual 112" -> vol=1 part=12
  // ----------------------------
  m = s.match(/^(.*?\bmanual)\s*(\d{2,})\s*$/i);
  if (m) {
    const digits = m[2];
    const vol = digits.slice(0, 1);
    const part = digits.slice(1);

    const title = normalizeSpaces(`${m[1]} ${vol}`); // "manual 1"
    const displayTitle = makeDisplayTitle(title);
    const bookGroupId = makeGroupId(displayTitle);

    return { bookGroupId, displayTitle, partLabel: part };
  }

  // default behavior
  const noPart = stripPartSuffix(base);
  const displayTitle = makeDisplayTitle(noPart);
  const bookGroupId = makeGroupId(displayTitle);
  return { bookGroupId, displayTitle };
}




function getJson(url, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: "GET",
        headers: { "Content-Type": "application/json", ...headers }
      },
      (res) => {
        let buf = "";
        res.on("data", (d) => (buf += d));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(buf || "{}") });
          } catch {
            resolve({ status: res.statusCode, body: { raw: buf } });
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function trySelect(endpoint, key, index, field) {
  const apiVersion = "2023-11-01";
  const url =
    `${endpoint}/indexes/${encodeURIComponent(index)}/docs` +
    `?api-version=${apiVersion}&search=*` +
    `&$select=${encodeURIComponent(field)}&$top=1000`;

  const { status, body } = await getJson(url, { "api-key": key });

  if (status >= 200 && status < 300 && body && Array.isArray(body.value)) {
    const vals = body.value
      .map((x) => (x && x[field]) || null)
      .filter(Boolean);

    return Array.from(new Set(vals)).sort((a, b) => String(a).localeCompare(String(b)));
  }
  return [];
}

module.exports = async function (context, req) {
  try {
    const endpoint = process.env.SEARCH_ENDPOINT;
    const key = process.env.SEARCH_API_KEY;
    const index = process.env.SEARCH_INDEX || "azureblob-index";

    if (!endpoint || !key || !index) {
      throw new Error("Missing SEARCH_ENDPOINT / SEARCH_API_KEY / SEARCH_INDEX");
    }

    const candidates = [
      "docName",
      "documentName",
      "fileName",
      "metadata_storage_name",
      "metadata_storage_path"
    ];

    let picked = null;
    let values = [];

    for (const f of candidates) {
      const list = await trySelect(endpoint, key, index, f);
      if (list.length) {
        picked = f;
        values = list;
        break;
      }
    }

    // If still empty, inspect schema and try a likely retrievable string field
    if (!values.length) {
      const schemaUrl = `${endpoint}/indexes/${encodeURIComponent(index)}?api-version=2023-11-01`;
      const { status, body } = await getJson(schemaUrl, { "api-key": key });

      if (status >= 200 && status < 300 && body && Array.isArray(body.fields)) {
        const field =
          body.fields.find(
            (f) =>
              f.type === "Edm.String" &&
              f.retrievable !== false &&
              /name|file|doc|path|title/i.test(f.name)
          ) ||
          body.fields.find((f) => f.type === "Edm.String" && f.retrievable !== false);

        if (field && field.name) {
          const list = await trySelect(endpoint, key, index, field.name);
          if (list.length) {
            picked = field.name;
            values = list;
          }
        }
      }
    }

    // Group into unified books
    const groups = new Map();

    for (const raw of values) {
      const { bookGroupId, displayTitle } = groupFromName(raw);
      if (!bookGroupId) continue;

      if (!groups.has(bookGroupId)) {
        groups.set(bookGroupId, { bookGroupId, displayTitle, parts: [] });
      }
      groups.get(bookGroupId).parts.push(raw);
    }

    const books = Array.from(groups.values()).sort((a, b) =>
      a.displayTitle.localeCompare(b.displayTitle)
    );

    for (const b of books) {
      b.parts = Array.from(new Set(b.parts)).sort((x, y) => String(x).localeCompare(String(y)));
    }

    context.res = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: {
        _ver: "books-v2",
        field: picked || "metadata_storage_name",
        values, // keep old output so frontend doesn't break
        books   // new grouped output (clean dropdown)
      }
    };
  } catch (e) {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { ok: false, error: String((e && e.message) || e) }
    };
  }
};
