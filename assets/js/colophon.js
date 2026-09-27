// "Under the hood" — real measurements of this visit via the Performance APIs.

const THIRD_PARTY_ML = /huggingface|hf\.co|transformers|onnx|\.wasm/;

export function initColophon({ root }) {
  const set = (k, v) => { const el = root.querySelector(`[data-m="${k}"]`); if (el) el.textContent = v; };
  const kb = (b) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1048576).toFixed(1)} MB`);

  let lcp = 0, cls = 0;
  try {
    new PerformanceObserver((l) => { const e = l.getEntries(); lcp = e[e.length - 1].startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { l.getEntries().forEach((e) => { if (!e.hadRecentInput) cls += e.value; }); }).observe({ type: 'layout-shift', buffered: true });
  } catch (e) { /* not supported in this browser */ }

  const measure = () => {
    const nav = performance.getEntriesByType('navigation')[0];
    const res = performance.getEntriesByType('resource').filter((r) => !THIRD_PARTY_ML.test(r.name));
    const all = [nav, ...res].filter(Boolean);
    const size = (e) => e.transferSize || e.encodedBodySize || 0;
    const bytes = all.reduce((s, e) => s + size(e), 0);
    const js = res.filter((r) => r.name.startsWith(location.origin) && r.name.endsWith('.js'));
    const cached = all.length && all.every((e) => !e.transferSize);

    if (nav) {
      set('load', `${Math.round(nav.loadEventEnd || nav.domContentLoadedEventEnd)} ms`);
      set('ttfb', `${Math.round(nav.responseStart)} ms`);
    }
    set('weight', bytes ? kb(bytes) : '—');
    set('weight-note', cached ? 'served from cache' : 'compressed, over the wire');
    set('requests', String(all.length));
    set('js', `${kb(js.reduce((s, e) => s + (e.encodedBodySize || e.transferSize || 0), 0))} · ${js.length} modules`);
    set('lcp', lcp ? `${(lcp / 1000).toFixed(2)} s` : 'n/a');
    set('cls', lcp || cls ? cls.toFixed(3) : 'n/a');
    const sw = navigator.serviceWorker;
    set('sw', sw && sw.controller ? 'active — works offline' : sw ? 'installs on first visit' : 'unsupported');
  };

  if (document.readyState === 'complete') setTimeout(measure, 0);
  else addEventListener('load', () => setTimeout(measure, 0));
  new IntersectionObserver((es) => { if (es[0].isIntersecting) measure(); }).observe(root);
}
