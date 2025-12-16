// force redeploy
/**
 * /api/books — list distinct document names by selecting likely fields.
 * Env:
 *   SEARCH_ENDPOINT=https://roofvaultsearch.search.windows.net
 *   SEARCH_API_KEY=xxxxx
 *   SEARCH_INDEX=azureblob-index-meta   (default)
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

  // remove query/hash if URL
  s = s.split("?")[0].split("#")[0];

  // normalize slashes
  s = s.replace(/\\/g, "/");

  // keep only last segment if path-like
  if (s.includes("/")) s = s.split("/").pop();

  // decode %20 etc
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
 * Remove common part-ish suffix patterns AT END of string:
 * - "... Pt1-1"
 * - "... Pt1.10.1-1"
 * - "... Part 3 of 10"
 * - "... - Part_02"
 * - "... pt-3"
 * - "... - pt.4"
 */
function stripPartSuffix(name) {
  let s = String(name || "").trim();

  // remove .pdf
  s = s.replace(/\.pdf$/i, "").trim();

  // strip trailing part/pt/section/etc INCLUDING dot formats
  s = s.replace(
    /(\s*[-–—_]\s*|\s+)(part|pt|section|sec|vol|volume|book)\s*[._-]?\s*\d+(\.\d+)*([._-]?\d+(\.\d+)*)*(\s*(of|\/)\s*\d+)?\s*$/i,
    ""
  );

  // strip trailing p3 / p.3 / -p3 styles
  s = s.replace(/(\s*[-–—_]\s*|\s+)p[._]?\d+\s*$/i, "");

  return s.trim();
}


function makeDisplayTitle(raw) {
  let s = normalizeSpaces(raw);

  // normalize hyphen spacing
  s = s.replace(/\s*-\s*/g, " - ");
  s = s.replace(/\(\s*/g, "(").replace(/\s*\)/g, ")");

  // remove weird double dashes
  s = s.replace(/\s*-\s*-\s*/g, " - ");

  return s.trim();
}

function makeGroupId(displayTitle) {
  return String(displayTitle || "")
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Try to detect parts for specific naming patterns, otherwise fallback.
 * Returns:
 *  - bookGroupId
 *  - displayTitle (the rolled-up book title)
 *  - partLabel (optional)
 */
function groupFromName(rawValue) {
  const base = baseNameFromValue(rawValue);

  // strip extension (any)
  let s = String(base || "").replace(/\.[^.]+$/i, "");
  s = s.replace(/[–—]/g, "-").trim();

  // ------------------------------------------------------
  // PRIMARY: "... manual <volume>-<part>"
  // "Architectural sheet metal manual 1-11"
  // group -> "Architectural sheet metal manual 1"
  // partLabel -> "11"
  // ------------------------------------------------------
  let m = s.match(/^(.*?\bmanual)\s*(\d+)\s*-\s*(\d+)\s*$/i);
  if (m) {
    const volume = m[2];
    const part = m[3];

    const title = normalizeSpaces(`${m[1]} ${volume}`);
    const displayTitle = makeDisplayTitle(title);
    const bookGroupId = makeGroupId(displayTitle);

    return { bookGroupId, displayTitle, partLabel: part };
  }

  // ------------------------------------------------------
  // SECONDARY: "... manual <digits>" like 11,12,13
  // force volume = first digit, remainder = part
  // "manual 12" -> volume 1, part 2
  // ------------------------------------------------------
  m = s.match(/^(.*?\bmanual)\s*(\d{2,})$/i);
  if (m) {
    const digits = m[2];
    const volume = digits.charAt(0);
    const part = digits.slice(1);

    const title = normalizeSpaces(`${m[1]} ${volume}`);
    const displayTitle = makeDisplayTitle(title);
    const bookGroupId = makeGroupId(displayTitle);

    return { bookGroupId, displayTitle, partLabel: part };
  }

  // ------------------------------------------------------
  // GENERAL: "... PartX" / "... PtX" / "... - pt.3" etc
  // We keep partLabel if we can detect it,
  // but we ALWAYS roll up the displayTitle.
  // ------------------------------------------------------
  let partLabel = null;
  const partMatch = s.match(
    /(?:^|[-–—_\s])(part|pt)\s*[_-]?\s*(\d+(\.\d+)?([_-]?\d+(\.\d+)?)*)\s*$/i
  );
  if (partMatch) {
    partLabel = String(partMatch[2] || "").trim();
  }

  const noPart = stripPartSuffix(base);
  const displayTitle = makeDisplayTitle(noPart);
  const bookGroupId = makeGroupId(displayTitle);

  return { bookGroupId, displayTitle, partLabel: partLabel || undefined };
}

function getJson(url, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: "GET",
        headers: { "Content-Type": "application/json", ...headers },
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
    `&$select=${encodeURIComponent(field)}&$top=5000`;

  const { status, body } = await getJson(url, { "api-key": key });

  if (status >= 200 && status < 300 && body && Array.isArray(body.value)) {
    const vals = body.value
      .map((x) => (x && x[field]) || null)
      .filter(Boolean);

    return Array.from(new Set(vals)).sort((a, b) =>
      String(a).localeCompare(String(b))
    );
  }
  return [];
}

module.exports = async function (context, req) {
  try {
    const endpoint = process.env.SEARCH_ENDPOINT;
    const key = process.env.SEARCH_API_KEY;

    // ✅ default to your new working index
    const index = process.env.SEARCH_INDEX || "azureblob-index-meta";

    if (!endpoint || !key || !index) {
      throw new Error("Missing SEARCH_ENDPOINT / SEARCH_API_KEY / SEARCH_INDEX");
    }

    // ✅ prefer metadata_storage_name (best for clean dropdown)
    const candidates = [
      "metadata_storage_name",
      "docName",
      "documentName",
      "fileName",
      "metadata_storage_path",
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

    // If still empty: inspect schema for a retrievable string field
    if (!values.length) {
      const schemaUrl = `${endpoint}/indexes/${encodeURIComponent(
        index
      )}?api-version=2023-11-01`;
      const { status, body } = await getJson(schemaUrl, { "api-key": key });

      if (status >= 200 && status < 300 && body && Array.isArray(body.fields)) {
        const field =
          body.fields.find(
            (f) =>
              f.type === "Edm.String" &&
              f.retrievable !== false &&
              /name|file|doc|path|title/i.test(f.name)
          ) || body.fields.find((f) => f.type === "Edm.String" && f.retrievable !== false);

        if (field && field.name) {
          const list = await trySelect(endpoint, key, index, field.name);
          if (list.length) {
            picked = field.name;
            values = list;
          }
        }
      }
    }

    // ✅ Group into unified books
    const groups = new Map();

    for (const raw of values) {
      const { bookGroupId, displayTitle, partLabel } = groupFromName(raw);
      if (!bookGroupId) continue;

      if (!groups.has(bookGroupId)) {
        groups.set(bookGroupId, {
          bookGroupId,
          displayTitle,
          parts: [],
        });
      }

      groups.get(bookGroupId).parts.push({
        raw,
        fileName: baseNameFromValue(raw),
        partLabel: partLabel || null,
      });
    }

    const books = Array.from(groups.values()).sort((a, b) =>
      a.displayTitle.localeCompare(b.displayTitle)
    );

    // de-dupe parts
    for (const b of books) {
      const seen = new Set();
      b.parts = b.parts
        .filter((p) => {
          const k = String(p.raw);
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        })
        .sort((x, y) => String(x.fileName).localeCompare(String(y.fileName)));
    }

    context.res = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: {
        _ver: "books-v2",
        indexUsed: index,
        field: picked || "metadata_storage_name",
        values, // keep old output so frontend doesn't break
        books,  // new grouped output (clean dropdown)
      },
    };
  } catch (e) {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { ok: false, error: String((e && e.message) || e) },
    };
  }
};
