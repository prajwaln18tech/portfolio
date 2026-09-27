// Interactive terminal: scripted intro, then a real prompt with history, tab-completion and commands.
import { PROFILE, SECTIONS, SKILLS, JOBS, PROJECTS, PUBLICATIONS } from './data.js';
import { CITATION } from './narrator.js';
import { search } from './search.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function initTerminal({ el, actions }) {
  const out = el.querySelector('.term-out');
  const form = el.querySelector('.term-form');
  const input = el.querySelector('.term-input');
  const scroller = el.querySelector('.term-body');
  const history = [];
  let hIndex = 0;
  let introDone = false;
  let skipIntro = false;
  let wantFocus = false;

  /* ---------- output helpers ---------- */
  const span = (cls, txt) => { const s = document.createElement('span'); if (cls) s.className = cls; s.textContent = txt; return s; };
  const line = (...parts) => {
    const div = document.createElement('div');
    parts.forEach((p) => div.append(typeof p === 'string' ? p : p));
    out.append(div);
    scroller.scrollTop = scroller.scrollHeight;
    return div;
  };
  const print = (txt, cls = '') => txt.split('\n').forEach((l) => line(span(cls, l || ' ')));
  const echo = (cmd) => line(span('p', '$ '), span('c', cmd));
  const link = (href, txt, ext = true) => {
    const a = document.createElement('a');
    a.href = href; a.textContent = txt; a.className = 'tl';
    if (ext) { a.target = '_blank'; a.rel = 'noopener'; }
    return a;
  };
  const table = (rows, pad = 14) => rows.forEach(([k, v, cls]) => line(span('k', k.padEnd(pad)), span(cls || '', v)));

  /* ---------- commands ---------- */
  const files = {
    'about.md': () => print('# Prajwal Narayanaswamy\nSoftware engineer — cloud-native web apps, GenAI/LLM features,\nand data pipelines. Python · FastAPI · React · TypeScript · Azure.'),
    'contact.txt': () => cmds.contact.run(),
    'skills.json': () => print(JSON.stringify(SKILLS, null, 2), 'dim'),
    'resume.pdf': () => print('cat: resume.pdf: binary file — try `resume` instead', 'err'),
    'paper.bib': () => print(CITATION.bibtex, 'dim'),
  };

  const cmds = {
    help: {
      desc: 'list available commands',
      run() {
        print('Available commands:', 'dim');
        Object.entries(cmds).filter(([, c]) => !c.hidden).forEach(([n, c]) => line(span('ok', n.padEnd(12)), span('dim', c.desc)));
        print('\nTips: ↑/↓ history · Tab to complete · Ctrl+L to clear', 'dim');
      },
    },
    whoami: { desc: 'who is this?', run: () => print(`${PROFILE.name} — ${PROFILE.role}`, 'c') },
    about: { desc: 'short bio', run: () => files['about.md']() },
    experience: {
      desc: 'work history',
      run() {
        JOBS.forEach((j) => { line(span('p', j.when.padEnd(22)), span('c', `${j.title} @ ${j.org}`)); line(span('', ' '.repeat(22)), span('dim', j.note)); });
      },
    },
    projects: {
      desc: 'selected projects',
      run() { PROJECTS.forEach((p) => { line(span('ok', '▸ '), span('c', p.name)); line(span('dim', `  ${p.what}`)); line(span('k', `  ${p.stack}`)); }); },
    },
    skills: {
      desc: 'tech stack [category]',
      args: () => Object.keys(SKILLS),
      run([cat]) {
        if (cat && !SKILLS[cat]) return print(`skills: unknown category "${cat}". Try: ${Object.keys(SKILLS).join(', ')}`, 'err');
        Object.entries(SKILLS).filter(([k]) => !cat || k === cat).forEach(([k, v]) => line(span('k', k.padEnd(12)), span('c', v.join(' · '))));
      },
    },
    education: {
      desc: 'degrees & certifications',
      run() {
        table([['2023–2025', 'MS Computer Science — Cal State Chico', 'c'], ['2017–2021', 'BE Electronics & Communication — VTU', 'c']]);
        print('\ncerts: Google Cybersecurity · Python Data Structures (UMich) · IT Project Mgmt', 'dim');
      },
    },
    papers: {
      desc: 'peer-reviewed publications',
      run() {
        PUBLICATIONS.forEach((p) => {
          line(span('ok', '📄 '), span('c', p.title));
          print(`   ${p.authors}`, 'dim');
          print(`   ${p.venue}`, 'k');
          line(span('', '   '), link(p.url, 'read on ACM Digital Library'), span('dim', '  ·  try `cat paper.bib`'));
        });
      },
    },
    awards: {
      desc: 'recognition',
      run() {
        print('🏆 3rd Prize — NASA Ames Space Settlement Design Contest', 'c');
        print('🚀 Student Achievement Award — ISDC 2014', 'c');
        print('💡 Semifinalist — DST & Texas Instruments Innovation Challenge 2019', 'c');
      },
    },
    contact: {
      desc: 'how to reach me',
      run() {
        line(span('k', 'email'.padEnd(10)), link(`mailto:${PROFILE.email}`, PROFILE.email, false));
        line(span('k', 'linkedin'.padEnd(10)), link(PROFILE.linkedin, 'in/prajwal-narayanaswamy'));
        line(span('k', 'github'.padEnd(10)), link(PROFILE.github, 'prajwaln18tech'));
      },
    },
    resume: { desc: 'open résumé PDF', run() { print('opening résumé…', 'dim'); window.open(PROFILE.resume, '_blank', 'noopener'); } },
    ask: {
      desc: 'ask my résumé a question',
      async run(args) {
        const q = args.join(' ').trim();
        if (!q) return print('usage: ask <question>   e.g. ask has he used kubernetes?', 'dim');
        const { results, ms, mode } = await search(q, { k: 2 });
        if (!results.length) return print('no matching passages — try rephrasing, or `help`', 'err');
        print(`${mode} retrieval · ${ms.toFixed(1)} ms`, 'dim');
        results.forEach((r) => { line(span('ok', '▸ '), span('c', r.doc.title)); print(`  ${r.doc.text}`, 'dim'); });
        line(span('dim', 'more in '), link(SECTIONS.ask, 'the Ask section', false));
      },
    },
    goto: {
      desc: 'scroll to a section',
      args: () => Object.keys(SECTIONS),
      run([s]) {
        if (!SECTIONS[s]) return print(`usage: goto <${Object.keys(SECTIONS).join('|')}>`, 'dim');
        actions.goto(SECTIONS[s]);
        print(`→ ${s}`, 'dim');
      },
    },
    theme: {
      desc: 'switch theme [light|dark]',
      args: () => ['light', 'dark'],
      run([t]) { const next = actions.setTheme(t); print(`theme set to ${next}`, 'dim'); },
    },
    neofetch: {
      desc: 'system info',
      run() {
        const art = ['  ██████╗ ███╗   ██╗', '  ██╔══██╗████╗  ██║', '  ██████╔╝██╔██╗ ██║', '  ██╔═══╝ ██║╚██╗██║', '  ██║     ██║ ╚████║', '  ╚═╝     ╚═╝  ╚═══╝'];
        const info = [
          ['', 'prajwal@portfolio'], ['', '─────────────────'], ['Role', 'Software Engineer'], ['Uptime', '2+ years in industry'],
          ['Stack', 'Python · FastAPI · React · TS'], ['Cloud', 'Azure · GCP · Docker · K8s'], ['AI', 'Azure OpenAI · RAG · embeddings'], ['Status', 'open to new roles'],
        ];
        const rows = Math.max(art.length, info.length);
        for (let i = 0; i < rows; i++) {
          const [k, v] = info[i] || ['', ''];
          line(span('p', (art[i] || '').padEnd(24)), span('ok', k ? k + ': ' : ''), span(k ? 'c' : 'ok', v));
        }
        const sw = line(span('', ' '.repeat(24)));
        ['--c1', '--c2', '--c3', '--c4', '--accent', '--text'].forEach((c) => { const b = span('swatch', '   '); b.style.background = `var(${c})`; sw.append(b); });
      },
    },
    ls: { desc: 'list files', run: () => line(span('ok', 'about.md  '), span('ok', 'contact.txt  '), span('ok', 'paper.bib  '), span('ok', 'skills.json  '), span('k', 'resume.pdf')) },
    cat: {
      desc: 'print a file',
      args: () => Object.keys(files),
      run([f]) { if (!f) return print('usage: cat <file>', 'dim'); if (!files[f]) return print(`cat: ${f}: No such file`, 'err'); files[f](); },
    },
    pwd: { desc: 'print working dir', hidden: true, run: () => print('/home/prajwal/portfolio') },
    date: { desc: 'current date', hidden: true, run: () => print(new Date().toString()) },
    echo: { desc: 'print text', hidden: true, run: (a) => print(a.join(' ')) },
    history: { desc: 'command history', run: () => history.forEach((h, i) => print(`${String(i + 1).padStart(4)}  ${h}`, 'dim')) },
    clear: { desc: 'clear the screen', run: () => { out.textContent = ''; } },
    sudo: {
      desc: 'try it', hidden: true,
      run(a) {
        if (a.join(' ') === 'hire-me' || a.join(' ') === 'hire me') {
          print('[sudo] password for recruiter: ********', 'dim');
          print('✓ permission granted. Excellent decision.', 'ok');
          line(span('dim', '→ '), link(`mailto:${PROFILE.email}?subject=Let%E2%80%99s%20talk`, 'open an email to Prajwal', false));
          actions.celebrate();
        } else print('usage: sudo hire-me', 'dim');
      },
    },
    rm: { desc: '', hidden: true, run: () => print('rm: nice try 🙂 this portfolio is protected by 216 tests', 'err') },
    exit: { desc: 'close the session', hidden: true, run: () => print('there is no escape — but you can scroll down ↓', 'dim') },
  };
  cmds.exp = { ...cmds.experience, hidden: true };
  cmds.cls = { ...cmds.clear, hidden: true };
  cmds.publications = { ...cmds.papers, hidden: true };
  cmds.research = { ...cmds.papers, hidden: true };

  const run = async (raw) => {
    const text = raw.trim();
    echo(text);
    if (!text) return;
    history.push(text);
    hIndex = history.length;
    const [name, ...args] = text.split(/\s+/);
    const cmd = cmds[name.toLowerCase()];
    if (!cmd) {
      print(`zsh: command not found: ${name}. Type \`help\` — or just ask a question with \`ask …\``, 'err');
      return;
    }
    try { await cmd.run(args); } catch (e) { print(`error: ${e.message}`, 'err'); }
    scroller.scrollTop = scroller.scrollHeight;
  };

  /* ---------- input handling ---------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = input.value;
    input.value = '';
    await run(v);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (hIndex > 0) { hIndex--; input.value = history[hIndex]; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (hIndex < history.length - 1) { hIndex++; input.value = history[hIndex]; } else { hIndex = history.length; input.value = ''; }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      complete();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      out.textContent = '';
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      echo(input.value + '^C');
      input.value = '';
    }
  });

  const complete = () => {
    const parts = input.value.split(/\s+/);
    if (parts.length <= 1) {
      const pre = parts[0].toLowerCase();
      const opts = Object.keys(cmds).filter((n) => !cmds[n].hidden && n.startsWith(pre));
      if (opts.length === 1) input.value = opts[0] + ' ';
      else if (opts.length > 1) { echo(input.value); print(opts.join('  '), 'dim'); }
      return;
    }
    const cmd = cmds[parts[0].toLowerCase()];
    if (!cmd || !cmd.args) return;
    const pre = parts[parts.length - 1];
    const opts = cmd.args().filter((a) => a.startsWith(pre));
    if (opts.length === 1) { parts[parts.length - 1] = opts[0]; input.value = parts.join(' '); }
    else if (opts.length > 1) { echo(input.value); print(opts.join('  '), 'dim'); }
  };

  el.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    if (window.getSelection().toString()) return;
    if (!introDone) { skipIntro = true; wantFocus = true; }
    else input.focus({ preventScroll: true });
  });

  /* ---------- scripted intro ---------- */
  const intro = [
    ['whoami'],
    ['cat stack.txt', () => print('python · fastapi · react 19 · typescript\nazure openai · rag · docker · kubernetes', 'c')],
    ['git log --oneline -3', () => {
      line(span('p', 'a3f9e12 '), span('c', 'feat: semantic search over 100K reviews'));
      line(span('p', '7b1c0d4 '), span('c', 'fix: fail-closed auth on every endpoint'));
      line(span('p', 'e52d8aa '), span('c', 'perf: 227K pair ops → 1 matrix op'));
    }],
  ];

  const finishIntro = () => {
    introDone = true;
    print('\nType `help` to explore — this terminal is live.', 'hint');
    form.hidden = false;
    if (wantFocus) input.focus({ preventScroll: true });
  };

  (async () => {
    form.hidden = true;
    for (const [cmd, render] of intro) {
      const row = line(span('p', '$ '));
      const c = span('c', '');
      row.append(c);
      if (skipIntro) c.textContent = cmd;
      else {
        const caret = span('caret', '');
        row.append(caret);
        for (const ch of cmd) {
          if (skipIntro) { c.textContent = cmd; break; }
          c.textContent += ch;
          await sleep(40 + Math.random() * 50);
        }
        if (!skipIntro) await sleep(220);
        caret.remove();
      }
      render ? render() : cmds[cmd].run([]);
      if (!skipIntro) await sleep(420);
    }
    finishIntro();
  })();

  return {
    focus() {
      if (introDone) input.focus({ preventScroll: true });
      else { skipIntro = true; wantFocus = true; }
    },
    run,
  };
}
