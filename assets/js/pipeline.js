// Price Tool pipeline simulator — an illustrative, time-compressed run that shows how the real system
// behaves: concurrent store fetches, 429 rate limits with exponential back-off, and a Selenium fallback.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function initPipeline({ root, reduced }) {
  const pipe = root.querySelector('.pipeline');
  const btn = root.querySelector('.sim-run');
  const log = root.querySelector('.sim-log');
  const node = (id) => pipe.querySelector(`[data-node="${id}"]`);
  let running = false;
  let clock = 0;
  const SPEED = 0.45; // real ms per simulated ms

  const state = (id, s) => {
    const n = node(id);
    n.classList.remove('run', 'ok', 'warn');
    if (s) n.classList.add(s);
  };
  const write = (src, msg, cls = '') => {
    const li = document.createElement('li');
    li.className = cls;
    const t = document.createElement('span');
    t.className = 't';
    t.textContent = `+${(clock / 1000).toFixed(2)}s`;
    const s = document.createElement('span');
    s.className = 'src';
    s.textContent = src;
    const m = document.createElement('span');
    m.textContent = msg;
    li.append(t, s, m);
    log.append(li);
    log.scrollTop = log.scrollHeight;
  };
  const wait = async (simMs) => { clock += simMs; await sleep(simMs * SPEED); };

  const run = async () => {
    if (running) return;
    running = true;
    clock = 0;
    btn.disabled = true;
    btn.textContent = 'Running…';
    log.textContent = '';
    pipe.classList.add('running');
    pipe.querySelectorAll('[data-node]').forEach((n) => n.classList.remove('run', 'ok', 'warn'));

    const job = 4000 + Math.floor(Math.random() * 900);
    const fallback = pick(['ar-AE', 'tr-TR', 'pl-PL', 'zh-HK', 'es-CL']);
    const retries = 1 + Math.round(Math.random());
    const flagged = 5 + Math.floor(Math.random() * 7);
    const today = new Date().toLocaleDateString('en-CA'); // local YYYY-MM-DD

    state('queue', 'run');
    write('queue', `job #${job} queued · 3 stores · 92 markets · 47 currencies`);
    await wait(250);

    state('xbox', 'run'); state('steam', 'run'); state('psn', 'run');
    write('xbox', 'GET displaycatalog · batch 1/3');
    write('steam', 'GET appdetails?cc=… (rate limit 200/5min)');
    write('psn', 'parsing 68 locales concurrently · 8 workers');
    await wait(700);

    write('xbox', '200 OK · catalog batches complete ✓', 'ok');
    state('xbox', 'ok');
    await wait(250);

    for (let i = 0; i < retries; i++) {
      write('steam', '429 Too Many Requests', 'warn');
      state('steam', 'warn');
      const backoff = 2 ** i;
      write('queue', `steam → exponential back-off ${backoff.toFixed(1)}s (2^${i} + jitter)`, 'dim');
      await wait(backoff * 1000);
      state('steam', 'run');
      write('steam', `retry ${i + 1}…`);
      await wait(300);
    }
    write('psn', `${fallback}: markup changed → Selenium fallback`, 'warn');
    state('psn', 'warn');
    await wait(500);
    write('steam', '200 OK · prices fetched ✓', 'ok');
    state('steam', 'ok');
    await wait(400);
    write('psn', `${fallback}: recovered via headless browser ✓`, 'ok');
    write('psn', '68/68 locales parsed ✓', 'ok');
    state('psn', 'ok');
    state('queue', 'ok');
    await wait(300);

    state('normalize', 'run');
    write('norm', '47 currencies → USD · VAT/GST stripped');
    await wait(500);
    state('normalize', 'ok');
    state('benchmark', 'run');
    write('bench', `vs US baseline · ${flagged} markets priced > +15% flagged`);
    await wait(450);
    state('benchmark', 'ok');
    state('report', 'run');
    write('report', `price_report_${today}.xlsx written`);
    await wait(350);
    state('report', 'ok');
    write('done', `✓ sync complete in ${(clock / 1000).toFixed(1)}s · 0 failed jobs`, 'ok done');

    pipe.classList.remove('running');
    btn.disabled = false;
    btn.textContent = '↻ Run again';
    running = false;
  };

  btn.addEventListener('click', run);
  return { run: () => { root.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); run(); } };
}
