// Small page-level behaviours: theme, toast, reveal, spotlight, counters, nav state, rotator, timeline.

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const root = document.documentElement;

export function initTheme() {
  const set = (t) => {
    const next = t === 'light' || t === 'dark' ? t : root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    $('meta[name="theme-color"]').setAttribute('content', next === 'light' ? '#f6f5f1' : '#0a0b0e');
    return next;
  };
  $('#theme-toggle').addEventListener('click', () => set());
  return set;
}

export function createToast() {
  const el = $('#toast');
  let timer;
  return (msg) => {
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove('show'), 2400);
  };
}

export function initScrollChrome() {
  const bar = $('.progress span');
  const nav = $('#nav');
  const timeline = $('.timeline');
  let ticking = false;
  const update = () => {
    ticking = false;
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    nav.classList.toggle('scrolled', scrollY > 20);
    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
      timeline.style.setProperty('--fill', p.toFixed(3));
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();

  const links = $$('.nav-links a');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => {
        const on = a.getAttribute('href') === '#' + e.target.id;
        a.classList.toggle('active', on);
        on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section[id]').forEach((s) => spy.observe(s));
}

export function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 5) * 0.08}s`);
    obs.observe(el);
  });
}

export function initSpotlight() {
  $$('.spot').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

export function initCounters(reduced) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      obs.unobserve(e.target);
      if (reduced) return;
      const el = e.target;
      const end = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / 1400, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => obs.observe(el));
}

export function initRotator(reduced) {
  const rot = $('.rotator');
  const words = $$('.rotator .rw');
  if (!rot || !words.length) return;
  let i = 0;
  // The box tracks the visible word's width, so shorter words never leave a gap mid-sentence.
  const fit = () => { rot.style.width = `${words[i].getBoundingClientRect().width}px`; };
  fit();
  if (document.fonts) document.fonts.ready.then(fit);
  addEventListener('resize', fit);
  if (reduced || words.length < 2) return;

  const step = () => {
    const cur = words[i];
    i = (i + 1) % words.length;
    cur.classList.remove('on');
    cur.classList.add('out');
    setTimeout(() => cur.classList.remove('out'), 600);
    words[i].classList.add('on');
    fit();
  };
  let timer = setInterval(step, 2600);
  document.addEventListener('visibilitychange', () => {
    clearInterval(timer);
    if (!document.hidden) timer = setInterval(step, 2600);
  });
}

// Hero portrait: layers drift with the pointer at different depths for a subtle 3D feel.
export function initStage(reduced) {
  const stage = $('#stage');
  if (!stage || reduced || !matchMedia('(hover: hover)').matches) return;
  const layers = $$('[data-depth]', stage);
  const hero = stage.closest('section');
  let raf = 0;
  const move = (x, y) => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => layers.forEach((el) => {
      const d = +el.dataset.depth;
      el.style.setProperty('--px', `${(x * d).toFixed(1)}px`);
      el.style.setProperty('--py', `${(y * d).toFixed(1)}px`);
    }));
  };
  hero.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2)));
    const y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (innerHeight / 2)));
    move(x, y);
  });
  hero.addEventListener('pointerleave', () => move(0, 0));
}

export function initLightbox() {
  const lb = $('#lightbox');
  const trigger = $('#award-open');
  const open = () => { lb.hidden = false; $('.lb-close', lb).focus(); };
  const close = () => { lb.hidden = true; trigger.focus(); };
  trigger.addEventListener('click', open);
  lb.addEventListener('click', (e) => { if (e.target !== $('img', lb)) close(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) close(); });
}

export function downloadVCard(p) {
  const vcf = [
    'BEGIN:VCARD', 'VERSION:3.0',
    'N:Narayanaswamy;Prajwal;;;', `FN:${p.name}`, `TITLE:${p.role}`,
    `EMAIL;TYPE=INTERNET:${p.email}`, `URL:${p.linkedin}`, `URL:${p.github}`,
    'END:VCARD',
  ].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([vcf], { type: 'text/vcard' }));
  a.download = 'Prajwal_Narayanaswamy.vcf';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function onKonami(fn) {
  const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let pos = 0;
  addEventListener('keydown', (e) => {
    pos = e.key === seq[pos] ? pos + 1 : e.key === seq[0] ? 1 : 0;
    if (pos === seq.length) { pos = 0; fn(); }
  });
}
