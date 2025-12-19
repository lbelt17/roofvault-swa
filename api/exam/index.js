const crypto = require("crypto");

const DEFAULT_COUNT = 25;
const MAX_COUNT = 50;
const SEARCH_TOP = 50;
const MAX_SOURCE_CHARS = 14000;
const AOAI_TIMEOUT_MS = 28000;
const SEARCH_TIMEOUT_MS = 8000;

function send(context, status, body) {
  context.res = {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept"
    },
    body: JSON.stringify(body)
  };
}

function clamp(n, min, max, d) {
  n = parseInt(n, 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : d;
}

function stripFences(s) {
  if (!s) return "";
  return s.replace(/```json|```/gi, "").trim();
}

function recoverItems(raw) {
  raw = stripFences(raw);

  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");

  if (start === -1 || end === -1 || end <= start) return [];

  try {
    const arr = JSON.parse(raw.slice(start, end + 1));
    return Array.isArray(arr) ? arr : [];
  } catch {
    // progressive salvage
    const items = [];
    const parts = raw.slice(start + 1).split("},");
    for (const p of parts) {
      try {
        const obj = JSON.parse(p.endsWith("}") ? p : p + "}");
        items.push(obj);
      } catch {}
    }
    return items;
  }
}

async function fetchJson(url, options, timeoutMs) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const r = await fetch(url, { ...options, signal: ac.signal });
    const text = await r.text();
    return { ok: r.ok, status: r.status, text };
  } finally {
    clearTimeout(t);
  }
}

function compactSources(hits) {
  let out = "";
  for (const h of hits) {
    const block = `\n\n[${h.metadata_storage_name}]\n${h.content || ""}`;
    if (out.length + block.length > MAX_SOURCE_CHARS) break;
    out += block;
  }
  return out.trim();
}

module.exports = async function (context, req) {
  try {
    if (req.method === "OPTIONS") return send(context, 204, {});
    if (req.method === "GET") return send(context, 200, { ok: true });

    const count = clamp(req.body?.count, 1, MAX_COUNT, DEFAULT_COUNT);
    const parts = req.body?.parts;
    if (!Array.isArray(parts) || !parts.length) {
      return send(context, 400, { error: "parts[] required" });
    }

    const SEARCH_ENDPOINT = process.env.SEARCH_ENDPOINT;
    const SEARCH_API_KEY = process.env.SEARCH_API_KEY;
    const INDEX = process.env.SEARCH_INDEX_CONTENT;

    const AOAI_ENDPOINT = process.env.AOAI_ENDPOINT;
    const AOAI_API_KEY = process.env.AOAI_API_KEY;
    const DEPLOYMENT = process.env.AOAI_DEPLOYMENT;

    const base = parts[0].replace(/\s*-\s*Part\s*\d+$/i, "");

    const searchRes = await fetchJson(
      `${SEARCH_ENDPOINT}/indexes/${INDEX}/docs/search?api-version=2023-11-01`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": SEARCH_API_KEY },
        body: JSON.stringify({
          search: base,
          top: SEARCH_TOP,
          select: "content,metadata_storage_name"
        })
      },
      SEARCH_TIMEOUT_MS
    );

    if (!searchRes.ok) {
      return send(context, 502, { error: "Search failed", raw: searchRes.text });
    }

    const hits = JSON.parse(searchRes.text).value || [];
    const sources = compactSources(hits);
    if (!sources) return send(context, 404, { error: "No sources" });

    const prompt =
      `Create ${count} multiple-choice questions.\n` +
      `Return ONLY JSON with an "items" array.\n\nSOURCES:\n${sources}`;

    const aoaiRes = await fetchJson(
      `${AOAI_ENDPOINT}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=2024-06-01`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": AOAI_API_KEY
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You generate exams. JSON only." },
            { role: "user", content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 3500
        })
      },
      AOAI_TIMEOUT_MS
    );

    if (!aoaiRes.ok) {
      return send(context, 502, { error: "AOAI failed", raw: aoaiRes.text });
    }

    const content = JSON.parse(aoaiRes.text).choices[0].message.content;
    const items = recoverItems(content).slice(0, count);

    if (!items.length) {
      return send(context, 500, { error: "No recoverable questions" });
    }

    send(context, 200, {
      items: items.map((q, i) => ({
        id: String(i + 1),
        type: "mcq",
        question: q.question,
        options: q.options,
        answer: q.answer,
        cite: q.cite,
        explanation: q.explanation
      })),
      modelDeployment: DEPLOYMENT,
      returned: items.length
    });
  } catch (e) {
    send(context, 500, { error: e.message });
  }
};
