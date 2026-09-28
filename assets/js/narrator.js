// Accessible Code Narrator demo — real recordings from the tool.
// The audio is the tool's own output from its 2025 run on a C++ binary search: for every line, Rachel
// (ElevenLabs) reads the code verbatim, then Andy (ElevenLabs) explains it in context. Both scripts were
// written by GPT from the project's prompts (narrate_backend.py, male_narrate.py); stitch_audio.py plays
// them as line N (Rachel) → line N (Andy) → line N+1 …, which is exactly the order used here.
// Captions are Whisper transcripts of the recordings, proofread against the code.
import { PROGRAM } from './narration.js';

const AUDIO = 'assets/audio/narrator/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (t) => t.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// Minimal C++ highlighter: enough for the demo program.
const KW = /\b(int|void|return|if|else|while|for|using|namespace|include)\b/g;
function highlight(code) {
  if (/^\s*\/\//.test(code)) return `<span class="cm">${esc(code)}</span>`;
  if (/^\s*#/.test(code)) return `<span class="pp">${esc(code)}</span>`;
  const parts = code.split(/("[^"]*")/);
  return parts.map((part, i) => {
    if (i % 2) return `<span class="str">${esc(part)}</span>`;
    return esc(part)
      .replace(KW, '<span class="kw">$1</span>')
      .replace(/\b(cout|cin|endl|std)\b/g, '<span class="at">$1</span>')
      .replace(/\b([A-Za-z_]\w*)(?=\()/g, (m, name) => (/^(if|while|for|sizeof)$/.test(name) ? m : `<span class="fn">${name}</span>`))
      .replace(/\b(\d+)\b/g, '<span class="num">$1</span>');
  }).join('');
}

export function initNarrator({ root }) {
  const list = root.querySelector('.narr-code');
  const play = root.querySelector('.narr-play');
  const soundBtn = root.querySelector('.narr-sound');
  const who = root.querySelector('.narr-who');
  const text = root.querySelector('.narr-text');
  const prog = root.querySelector('.narr-prog i');
  const { lines } = PROGRAM;
  const audio = new Audio();
  audio.preload = 'auto';
  let muted = false;
  let run = 0;          // bumped to cancel an in-flight playback
  let resumeAt = 0;

  // Render the program. Each line is a button: tap to start narrating from there.
  lines.forEach((l, i) => {
    const li = document.createElement('li');
    li.style.setProperty('--d', l.d);
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.setAttribute('aria-label', `Play from line ${i + 1}: ${l.code.trim() || 'blank line'}`);
    li.innerHTML = (l.d ? '<span class="ind"></span>' : '') + (highlight(l.code.trim()) || '&nbsp;');
    li.addEventListener('click', () => start(i));
    li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start(i); } });
    list.append(li);
  });
  const items = [...list.children];

  const setSound = (on) => {
    muted = !on;
    audio.muted = muted;
    soundBtn.setAttribute('aria-pressed', String(on));
    soundBtn.textContent = on ? '🔊 Sound on' : '🔇 Captions only';
  };
  soundBtn.addEventListener('click', () => setSound(muted));

  const focusLine = (i) => {
    // Measure against the list itself (offsetTop depends on which ancestor is positioned, which varies by layout).
    const li = items[i].getBoundingClientRect(), box = list.getBoundingClientRect();
    list.scrollTo({ top: list.scrollTop + (li.top - box.top) - box.height / 2 + li.height / 2, behavior: 'smooth' });
  };

  const show = (i, voice) => {
    root.dataset.voice = voice ? (voice === 'r' ? 'code' : 'ctx') : '';
    items.forEach((li, j) => {
      li.classList.toggle('speaking', voice === 'r' && j === i);
      li.classList.toggle('scope', voice === 'a' && j === i);
    });
    if (!voice) return;
    const l = lines[i];
    who.textContent = voice === 'r' ? `Rachel · reads line ${i + 1}` : `Andy · explains line ${i + 1}`;
    text.textContent = voice === 'r' ? `Line ${i + 1}: ${l.code.trim() || '(blank line)'}` : l.andy;
    text.classList.toggle('is-code', voice === 'r');
    focusLine(i);
  };

  // Play one recording; resolves when it ends. Falls back to timed captions if audio can't play.
  const clip = (i, voice, id) => new Promise((resolve) => {
    const secs = lines[i][voice === 'r' ? 'rs' : 'as'];
    let done = false;
    const finish = () => { if (done) return; done = true; audio.onended = audio.onerror = audio.ontimeupdate = null; resolve(); };
    const timed = () => {
      const t0 = performance.now();
      const tick = () => {
        if (done || id !== run) return finish();
        const p = (performance.now() - t0) / (secs * 1000);
        prog.style.transform = `scaleX(${Math.min(p, 1)})`;
        p >= 1 ? finish() : requestAnimationFrame(tick);
      };
      tick();
    };
    audio.src = `${AUDIO}${voice}${String(i + 1).padStart(2, '0')}.m4a`;
    audio.onended = finish;
    audio.onerror = () => { audio.onerror = null; timed(); };
    audio.ontimeupdate = () => { if (audio.duration) prog.style.transform = `scaleX(${audio.currentTime / audio.duration})`; };
    audio.play().catch(() => timed());
  });

  const stop = () => {
    run++;
    audio.pause();
    root.classList.remove('playing');
    prog.style.transform = 'scaleX(0)';
    play.textContent = resumeAt > 0 && resumeAt < lines.length ? `▶ Resume from line ${resumeAt + 1}` : '▶ Play the narration';
  };

  const start = async (from = resumeAt) => {
    const id = ++run;
    audio.pause();
    root.classList.add('playing');
    play.textContent = '■ Stop';
    for (let i = from >= lines.length ? 0 : from; i < lines.length; i++) {
      resumeAt = i;
      for (const voice of ['r', 'a']) {
        if (id !== run) return;
        show(i, voice);
        await clip(i, voice, id);
        if (id !== run) return;
        await sleep(voice === 'r' ? 250 : 450);
      }
    }
    if (id !== run) return;
    resumeAt = 0;
    stop();
    show(-1, null);
    who.textContent = 'Done';
    text.textContent = 'That was the tool’s real output, line by line. Tap any line to hear it again.';
  };

  play.addEventListener('click', () => (root.classList.contains('playing') ? stop() : start()));

  // Don't keep talking after the visitor scrolls away.
  new IntersectionObserver((es) => { if (!es[0].isIntersecting && root.classList.contains('playing')) stop(); }).observe(root);

  return { play: () => { root.scrollIntoView({ behavior: 'smooth', block: 'center' }); if (!root.classList.contains('playing')) start(); } };
}

export const CITATION = {
  bibtex: `@article{narayanaswamy2025narration,
  author    = {Narayanaswamy, Prajwal and Attarwala, Abbas and Viotti, Paul and Raigoza, Jaime and Lindoo, Ed},
  title     = {AI-Assisted Contextual Code Narration for the Visually Impaired},
  journal   = {Journal of Computing Sciences in Colleges},
  volume    = {41},
  number    = {4},
  pages     = {77--89},
  year      = {2025},
  month     = sep,
  publisher = {Consortium for Computing Sciences in Colleges},
  issn      = {1937-4771},
  url       = {https://dl.acm.org/doi/abs/10.5555/3787712.3787735}
}`,
  apa: 'Narayanaswamy, P., Attarwala, A., Viotti, P., Raigoza, J., & Lindoo, E. (2025). AI-assisted contextual code narration for the visually impaired. Journal of Computing Sciences in Colleges, 41(4), 77–89. https://dl.acm.org/doi/abs/10.5555/3787712.3787735',
};
