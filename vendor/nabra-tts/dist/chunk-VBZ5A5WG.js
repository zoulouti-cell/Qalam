// src/g2p/arabic.ts
var ARABIC_PHONEME_FIXUPS = {
  "\u032A": "",
  // ◌̪ combining bridge below (dental)
  "\u02E4": "",
  // pharyngealization marker
  "[": "",
  "]": "",
  "{": "",
  "}": ""
};
var EXTRA_SYMBOLS = { \u0295: 7, \u0127: 8 };
var SYLLABLE_DOT = /(?<=\S)\.(?=\S)/g;
var LATIN_RUN = /[A-Za-z]+/g;
var CITATION = /\[[^\]]*\]/g;
var WS = /\s+/g;
var TASHKEEL = /[ً-ْٰ]/g;
var ARABIC_LETTER = /[ء-ي]/g;
function isDiacritized(text, minRatio = 0.2) {
  const letters = text.match(ARABIC_LETTER)?.length ?? 0;
  const marks = text.match(TASHKEEL)?.length ?? 0;
  return letters > 0 && marks / letters >= minRatio;
}
function normalizeText(text) {
  return text.replace(CITATION, " ").replace(LATIN_RUN, " ").replace(WS, " ").trim();
}
function cleanPhonemes(ps) {
  ps = ps.replace(SYLLABLE_DOT, "");
  for (const [from, to] of Object.entries(ARABIC_PHONEME_FIXUPS)) ps = ps.split(from).join(to);
  return ps;
}

// src/cache.ts
var CACHE_NAME = "nabra-tts";
async function openCache() {
  try {
    return typeof caches !== "undefined" ? await caches.open(CACHE_NAME) : null;
  } catch {
    return null;
  }
}
async function readBody(res, onProgress) {
  const total = Number(res.headers.get("Content-Length")) || 0;
  if (!res.body || !onProgress) return new Uint8Array(await res.arrayBuffer());
  const reader = res.body.getReader();
  const parts = [];
  let loaded = 0;
  for (; ; ) {
    const { done, value } = await reader.read();
    if (done) break;
    parts.push(value);
    loaded += value.byteLength;
    onProgress(loaded, total);
  }
  const out = new Uint8Array(loaded);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.byteLength;
  }
  return out;
}
async function fetchCached(url, useCache, onProgress) {
  const cache = useCache ? await openCache() : null;
  const hit = await cache?.match(url);
  if (hit) {
    const bytes2 = await readBody(hit);
    onProgress?.(bytes2.byteLength, bytes2.byteLength);
    return bytes2;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`nabra-tts: failed to fetch ${url} (${res.status})`);
  const bytes = await readBody(res, onProgress);
  if (cache) {
    const headers = { "Content-Type": "application/octet-stream", "Content-Length": String(bytes.byteLength) };
    await cache.put(url, new Response(bytes, { headers })).catch(() => {
    });
  }
  return bytes;
}
async function clearCache() {
  if (typeof caches !== "undefined") await caches.delete(CACHE_NAME);
}

export {
  EXTRA_SYMBOLS,
  isDiacritized,
  normalizeText,
  cleanPhonemes,
  fetchCached,
  clearCache
};
