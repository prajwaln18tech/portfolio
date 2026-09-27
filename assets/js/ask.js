// "Ask my résumé" — UI for the hybrid retrieval engine in search.js.
import { search, loadSemantic, semanticReady, tokenize, KB_SIZE } from './search.js';

const PREF = 'semantic-pref';

export function initAsk({ root, toast }) {
  const form = root.querySelector('.ask-form');
  const input = root.querySelector('#ask-q');
  const results = root.querySelector('.ask-results');
  const toggle = root.querySelector('#sem-toggle');
  const note = root.querySelector('.mode-note');
  const bar = root.querySelector('.ask-progress');
  const barFill = bar.querySelector('span');
  const steps = root.querySelectorAll('.how-step');
  let semantic = false;
  let lastQ = '';

  const setNote = (html) => { note.innerHTML = html; };
  const keywordNote = () => setNote('Keyword · <b>BM25</b> · instant');

  const highlight = (text, hits) => {
    const frag = document.createDocumentFragment();
    const set = new Set(hits);
    text.split(/(\s+|[.,;:()—–/])/).forEach((part) => {
      const t = tokenize(part);
      if (t.length === 1 && set.has(t[0])) { const m = document.createElement('mark'); m.textContent = part; frag.append(m); }
      else frag.append(part);
    });
    return frag;
  };

  const render = ({ results: rs, ms, mode, total }, q) => {
    results.textContent = '';
    const meta = document.createElement('p');
    meta.className = 'ask-meta mono';
    meta.textContent = rs.length
      ? `${mode} retrieval · top ${rs.length} of ${total} passages · ${ms.toFixed(1)} ms`
      : `No confident match for “${q}”. Try different words${semantic ? '' : ' — or switch on semantic mode'}.`;
    results.append(meta);
    rs.forEach((r, i) => {
      const card = document.createElement('article');
      card.className = 'ask-hit' + (i === 0 ? ' best' : '');
      card.style.setProperty('--i', i);
      const head = document.createElement('header');
      const tag = document.createElement('span');
      tag.className = 'ask-tag mono';
      tag.textContent = i === 0 ? `best match · ${r.doc.section}` : r.doc.section;
      const h = document.createElement('h3');
      h.textContent = r.doc.title;
      head.append(tag, h);
      const p = document.createElement('p');
      p.append(highlight(r.doc.text, r.hits));
      const foot = document.createElement('footer');
      const meter = document.createElement('span');
      meter.className = 'meter';
      meter.innerHTML = '<i></i>';
      meter.firstChild.style.width = `${Math.round(Math.min(1, r.final) * 100)}%`;
      const score = document.createElement('span');
      score.className = 'mono score';
      score.textContent = r.cos !== undefined
        ? `score ${r.final.toFixed(2)} · cos ${r.cos.toFixed(2)} · bm25 ${r.kw.toFixed(2)}`
        : `bm25 ${r.kw.toFixed(2)}`;
      const go = document.createElement('a');
      go.href = { stack: '#skills' }[r.doc.section] || `#${r.doc.section}`;
      go.className = 'ask-go';
      go.textContent = 'View section →';
      foot.append(meter, score, go);
      card.append(head, p, foot);
      results.append(card);
    });
  };

  const pulseSteps = () => {
    steps.forEach((s, i) => { s.classList.remove('lit'); void s.offsetWidth; s.style.setProperty('--i', i); s.classList.add('lit'); });
  };

  const ask = async (q) => {
    q = q.trim();
    if (!q) return;
    lastQ = q;
    pulseSteps();
    const res = await search(q, { k: 3, semantic });
    render(res, q);
  };

  form.addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); });
  root.querySelectorAll('.suggest button').forEach((b) => b.addEventListener('click', () => { input.value = b.textContent; ask(b.textContent); }));

  const enable = async () => {
    toggle.disabled = true;
    bar.hidden = false;
    try {
      const info = await loadSemantic((p) => {
        barFill.style.transform = `scaleX(${p.pct})`;
        if (p.phase === 'model') setNote(`Downloading <b>all-MiniLM-L6-v2</b> · ${Math.round(p.pct * 100)}%${p.mb ? ` of ${p.mb.toFixed(0)} MB` : ''} · one-time`);
        if (p.phase === 'index') setNote(`Indexing ${KB_SIZE} passages · ${p.cached} from cache · ${p.encoded} encoded`);
      });
      semantic = true;
      toggle.setAttribute('aria-checked', 'true');
      root.classList.add('is-semantic');
      setNote(`Hybrid · <b>MiniLM</b> ${info.dim}-d + BM25 · ${info.cached}/${KB_SIZE} vectors from cache`);
      try { localStorage.setItem(PREF, '1'); } catch (e) {}
      if (lastQ) ask(lastQ);
    } catch (err) {
      console.warn(err);
      keywordNote();
      toast('Couldn’t load the model — staying in keyword mode');
    } finally {
      toggle.disabled = false;
      bar.hidden = true;
    }
  };

  toggle.addEventListener('click', () => {
    if (semantic) {
      semantic = false;
      toggle.setAttribute('aria-checked', 'false');
      root.classList.remove('is-semantic');
      keywordNote();
      try { localStorage.removeItem(PREF); } catch (e) {}
      if (lastQ) ask(lastQ);
    } else if (semanticReady()) {
      semantic = true;
      toggle.setAttribute('aria-checked', 'true');
      root.classList.add('is-semantic');
      setNote('Hybrid · <b>MiniLM</b> + BM25');
      try { localStorage.setItem(PREF, '1'); } catch (e) {}
      if (lastQ) ask(lastQ);
    } else enable();
  });

  keywordNote();

  // Returning visitors who opted in before get semantic mode restored (model is in the browser cache).
  let pref = null;
  try { pref = localStorage.getItem(PREF); } catch (e) {}
  if (pref) {
    new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); enable(); } }, { rootMargin: '400px' }).observe(root);
  }

  return { ask, focus: () => { root.scrollIntoView({ behavior: 'smooth', block: 'center' }); input.focus({ preventScroll: true }); } };
}
