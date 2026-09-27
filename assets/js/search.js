// Hybrid retrieval over the résumé knowledge base.
//  - Keyword: BM25 with light stemming + synonym expansion (instant, zero download).
//  - Semantic: all-MiniLM-L6-v2 sentence embeddings via Transformers.js, loaded on demand and run
//    in a Web Worker, entirely in the browser. Passage vectors are cached content-addressed
//    (hash of model + text), so on repeat visits only new or edited passages are re-embedded.
import { KB } from './data.js';

const MODEL = 'Xenova/all-MiniLM-L6-v2';
const CACHE_PREFIX = 'emb:v1:';

const STOP = new Set('a an and are as at be by can could did do does for from had has have he her his how i in is it its me my of on or our she so that the their them there they this to was we were what when where which who why will with would you your about any into than then also just more most such only very tell does doing done has been being him'.split(' '));

const SYNONYMS = {
  llm: ['gpt', 'openai', 'rag', 'generative'], llms: ['gpt', 'openai', 'rag'], genai: ['generative', 'llm', 'openai'],
  ai: ['llm', 'openai', 'machine', 'learning'], ml: ['machine', 'learning', 'scikit'],
  cloud: ['azure', 'gcp', 'kubernetes', 'docker'], devops: ['ci', 'cd', 'github', 'actions', 'docker'],
  security: ['vulnerability', 'authentication', 'entra', 'waf', 'cybersecurity'], secure: ['security', 'authentication'],
  auth: ['authentication', 'entra'], accessibility: ['wcag', 'axe', 'visually', 'impaired'], a11y: ['accessibility', 'wcag'],
  test: ['pytest', 'playwright', 'testing'], tests: ['pytest', 'playwright', 'testing'], qa: ['testing', 'pytest'],
  frontend: ['react', 'typescript', 'tailwind'], backend: ['fastapi', 'api', 'rest'], fullstack: ['react', 'fastapi'],
  api: ['rest', 'fastapi', 'endpoint'], data: ['etl', 'sql', 'pandas', 'pipeline'], database: ['sql', 'oracle', 'mysql'],
  k8s: ['kubernetes'], js: ['javascript'], ts: ['typescript'], py: ['python'], degree: ['master', 'bachelor', 'education'],
  school: ['university', 'education'], college: ['university'], study: ['university', 'master'], job: ['worked', 'role'],
  experience: ['worked', 'years'], scraping: ['scraper', 'selenium'], scrape: ['scraper'], search: ['semantic', 'embedding'],
  realtime: ['websocket', 'real'], email: ['contact'], reach: ['contact', 'email'], hire: ['contact', 'open', 'roles'],
  microsoft: ['world', 'edge', 'azure'], award: ['prize', 'achievement'], awards: ['prize', 'achievement'], vector: ['embedding'],
};

const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const stem = (w) => {
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
};
export const tokenize = (s) =>
  fold(s).replace(/c\+\+/g, 'cpp').split(/[^a-z0-9]+/).filter((w) => w && !STOP.has(w)).map(stem);

/* ---------------- BM25 ---------------- */
const K1 = 1.2, B = 0.75;
const docs = KB.map((d) => {
  const toks = tokenize(`${d.title} ${d.title} ${d.text}`);
  const tf = new Map();
  toks.forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));
  return { ...d, len: toks.length, tf };
});
const avgLen = docs.reduce((s, d) => s + d.len, 0) / docs.length;
const df = new Map();
docs.forEach((d) => d.tf.forEach((_, t) => df.set(t, (df.get(t) || 0) + 1)));
const idf = (t) => Math.log(1 + (docs.length - (df.get(t) || 0) + 0.5) / ((df.get(t) || 0) + 0.5));

const expand = (q) => {
  const base = tokenize(q);
  const weights = new Map(base.map((t) => [t, 1]));
  fold(q).split(/[^a-z0-9+]+/).forEach((w) => (SYNONYMS[w] || []).forEach((s) => {
    const t = stem(s);
    if (!weights.has(t)) weights.set(t, 0.45);
  }));
  return weights;
};

function bm25(q) {
  const terms = expand(q);
  return docs.map((d) => {
    let score = 0;
    const hits = [];
    terms.forEach((w, t) => {
      const f = d.tf.get(t);
      if (!f) return;
      score += w * idf(t) * (f * (K1 + 1)) / (f + K1 * (1 - B + B * d.len / avgLen));
      if (w === 1) hits.push(t);
    });
    return { doc: d, score, hits };
  });
}

/* ---------------- semantic ---------------- */
let worker = null;
let vectors = null; // Float32Array[] aligned with KB
let loading = null;
let seq = 0;
const pending = new Map();
let onModelProgress = () => {};

const call = (msg, transfer) => new Promise((resolve, reject) => {
  const id = ++seq;
  pending.set(id, { resolve, reject });
  worker.postMessage({ ...msg, id }, transfer || []);
});

function startWorker() {
  worker = new Worker(new URL('./embed-worker.js', import.meta.url), { type: 'module' });
  const files = new Map();
  worker.onmessage = ({ data }) => {
    if (data.type === 'progress') {
      files.set(data.file, [data.loaded, data.total]);
      let l = 0, t = 0;
      files.forEach(([a, b]) => { l += a; t += b; });
      onModelProgress({ phase: 'model', pct: t ? l / t : 0, mb: t / 1e6 });
      return;
    }
    const p = pending.get(data.id);
    if (!p) return;
    pending.delete(data.id);
    data.ok ? p.resolve(data) : p.reject(new Error(data.error));
  };
  worker.onerror = (e) => { pending.forEach((p) => p.reject(new Error(e.message || 'worker failed'))); pending.clear(); };
}

async function embedMany(texts) {
  const { data, dim } = await call({ type: 'embed', texts });
  return texts.map((_, i) => data.slice(i * dim, (i + 1) * dim));
}

const hash = (str) => { // cyrb53 — fast, stable content address
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
};
const toB64 = (f32) => btoa(String.fromCharCode(...new Uint8Array(f32.buffer, f32.byteOffset, f32.byteLength)));
const fromB64 = (s) => new Float32Array(Uint8Array.from(atob(s), (c) => c.charCodeAt(0)).buffer);
const cacheGet = (k) => { try { const v = localStorage.getItem(CACHE_PREFIX + k); return v ? fromB64(v) : null; } catch (e) { return null; } };
const cacheSet = (k, v) => { try { localStorage.setItem(CACHE_PREFIX + k, toB64(v)); } catch (e) {} };
const cachePrune = (live) => {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(CACHE_PREFIX) && !live.has(k.slice(CACHE_PREFIX.length)))
      .forEach((k) => localStorage.removeItem(k));
  } catch (e) {}
};

export const semanticReady = () => !!vectors;

/**
 * Loads the model (in a worker) and indexes the knowledge base.
 * onProgress({ phase: 'model'|'index'|'ready', pct, cached, encoded })
 */
export function loadSemantic(onProgress = () => {}) {
  onModelProgress = onProgress;
  if (loading) return loading;
  loading = (async () => {
    if (!worker) startWorker();
    await call({ type: 'init', model: MODEL });

    const keys = KB.map((d) => hash(`${MODEL}|${d.title}. ${d.text}`));
    const out = keys.map(cacheGet);
    const missing = out.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
    const cached = KB.length - missing.length;
    onProgress({ phase: 'index', pct: 0, cached, encoded: 0 });
    const BATCH = 8;
    for (let i = 0; i < missing.length; i += BATCH) {
      const idx = missing.slice(i, i + BATCH);
      const vecs = await embedMany(idx.map((j) => `${KB[j].title}. ${KB[j].text}`));
      idx.forEach((j, n) => { out[j] = vecs[n]; cacheSet(keys[j], vecs[n]); });
      onProgress({ phase: 'index', pct: Math.min(1, (i + BATCH) / missing.length), cached, encoded: Math.min(missing.length, i + BATCH) });
    }
    cachePrune(new Set(keys));
    vectors = out;
    const info = { cached, encoded: missing.length, dim: out[0].length };
    onProgress({ phase: 'ready', pct: 1, ...info });
    return info;
  })().catch((err) => { loading = null; throw err; });
  return loading;
}

const dot = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };

/**
 * Returns top-k passages. In hybrid mode the final score blends normalized BM25 with cosine similarity.
 */
export async function search(q, { k = 3, semantic = semanticReady() } = {}) {
  const t0 = performance.now();
  const lex = bm25(q);
  const maxLex = Math.max(...lex.map((r) => r.score), 1e-9);
  let results;
  if (semantic && vectors) {
    const [qv] = await embedMany([q]);
    results = lex.map((r, i) => {
      const cos = dot(qv, vectors[i]);
      const kw = r.score / maxLex;
      return { ...r, cos, kw, final: 0.7 * Math.max(cos, 0) + 0.3 * kw };
    });
  } else {
    results = lex.map((r) => ({ ...r, kw: r.score / maxLex, final: r.score / maxLex }));
  }
  results.sort((a, b) => b.final - a.final);
  const top = results.filter((r) => (semantic && vectors ? r.final > 0.18 : r.score > 0)).slice(0, k);
  return { results: top, ms: performance.now() - t0, mode: semantic && vectors ? 'hybrid' : 'keyword', total: KB.length };
}

export const KB_SIZE = KB.length;
