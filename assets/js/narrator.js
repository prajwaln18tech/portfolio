// Structure-first, two-voice code narration: the technique from
// "AI-Assisted Contextual Code Narration for the Visually Impaired" (JCSC 41(4), 2025).
// A context voice explains structure before a code voice reads each line verbatim.
// The script is pre-written in the style the extension's LLM prompts produce; speech uses the
// browser's Web Speech API, with timed captions as a fallback when audio is off or unavailable.

const SCRIPT = [
  { v: 'ctx', scope: [1, 8], say: 'Function ship takes one parameter, build. Its body is a conditional nested three levels deep, followed by a return.' },
  { v: 'code', line: 1, say: 'def ship(build):', speak: 'def ship, build.' },
  { v: 'ctx', scope: [2, 7], say: 'Level one: continue only if the tests pass.' },
  { v: 'code', line: 2, say: 'if build.tests_pass:', speak: 'if build dot tests pass.' },
  { v: 'ctx', scope: [3, 7], say: 'Level two, inside it: check accessibility.' },
  { v: 'code', line: 3, say: 'if build.accessible:', speak: 'if build dot accessible.' },
  { v: 'ctx', scope: [4, 7], say: 'Level three, the innermost: if approved, deploy. Otherwise, request a review.' },
  { v: 'code', line: 4, say: 'if build.approved:', speak: 'if build dot approved.' },
  { v: 'code', line: 5, say: 'deploy(build)', speak: 'deploy, build.' },
  { v: 'code', line: 6, say: 'else:', speak: 'else.' },
  { v: 'code', line: 7, say: 'request_review(build)', speak: 'request review, build.' },
  { v: 'ctx', scope: [8, 8], say: 'Back at the function level, after all three conditions: return the build status.' },
  { v: 'code', line: 8, say: 'return build.status', speak: 'return build dot status.' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function initNarrator({ root }) {
  const lines = [...root.querySelectorAll('.narr-code li')];
  const play = root.querySelector('.narr-play');
  const soundBtn = root.querySelector('.narr-sound');
  const who = root.querySelector('.narr-who');
  const text = root.querySelector('.narr-text');
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  let sound = !!synth;
  let run = 0; // incremented to cancel an in-flight playback

  if (!synth) { soundBtn.hidden = true; }
  const setSound = (on) => {
    sound = on && !!synth;
    soundBtn.setAttribute('aria-pressed', String(sound));
    soundBtn.textContent = sound ? '🔊 Sound on' : '🔇 Captions only';
    if (!sound && synth) synth.cancel();
  };
  soundBtn.addEventListener('click', () => setSound(!sound));

  // Mirror the paper's pairing: one voice for code, a different one for context.
  const pickVoices = () => {
    // Skip macOS novelty voices so a fallback never picks "Bubbles" or "Bad News".
    const NOVELTY = /Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Junior|Ralph|Kathy|Grandma|Grandpa|Eddy|Flo|Reed|Rocko|Sandy|Shelley/;
    const all = synth ? synth.getVoices().filter((v) => /^en([-_]|$)/i.test(v.lang) && !NOVELTY.test(v.name)) : [];
    const find = (names) => all.find((v) => names.some((n) => v.name.includes(n)));
    const code = find(['Samantha', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Karen', 'Moira', 'Tessa']) || all[0] || null;
    const ctx = find(['Daniel', 'Google UK English Male', 'Microsoft Guy', 'Microsoft Davis', 'Rishi', 'Alex', 'Fred'])
      || all.find((v) => v !== code) || code;
    return { code, ctx };
  };

  const show = (step) => {
    root.dataset.voice = step ? step.v : '';
    lines.forEach((li, i) => {
      const n = i + 1;
      li.classList.toggle('speaking', !!step && step.line === n);
      li.classList.toggle('scope', !!step && !!step.scope && n >= step.scope[0] && n <= step.scope[1]);
    });
    if (!step) return;
    who.textContent = step.v === 'code' ? 'Code voice' : 'Context voice';
    text.textContent = step.say;
    text.classList.toggle('is-code', step.v === 'code');
  };

  const speak = (step, voices, id) => new Promise((resolve) => {
    const words = step.say.split(/\s+/).length;
    const quiet = Math.max(1300, words * 340);
    if (!sound) { sleep(quiet).then(resolve); return; }
    const u = new SpeechSynthesisUtterance(step.speak || step.say);
    const voice = voices[step.v];
    if (voice) u.voice = voice;
    // Pitch keeps the two roles distinct even if the device only has one voice.
    u.pitch = step.v === 'code' ? 1.15 : 0.85;
    u.rate = step.v === 'code' ? 0.98 : 1.03;
    let settled = false;
    const done = () => { if (!settled) { settled = true; clearTimeout(guard); resolve(); } };
    const guard = setTimeout(done, quiet + 5000); // some engines never fire onend
    u.onend = done;
    u.onerror = done;
    if (id === run) synth.speak(u); else done();
  });

  const stop = () => {
    run++;
    if (synth) synth.cancel();
    root.classList.remove('playing');
    play.textContent = '▶ Hear the narration';
    show(null);
  };

  const start = async () => {
    const id = ++run;
    root.classList.add('playing');
    play.textContent = '■ Stop';
    if (synth) synth.cancel();
    const voices = pickVoices();
    for (const step of SCRIPT) {
      if (id !== run) return;
      show(step);
      await speak(step, voices, id);
      if (id !== run) return;
      await sleep(step.v === 'ctx' ? 260 : 140);
    }
    if (id !== run) return;
    stop();
    who.textContent = 'Done';
    text.textContent = 'Structure first, then each line in context. Play it again, or read the paper.';
  };

  play.addEventListener('click', () => (root.classList.contains('playing') ? stop() : start()));
  if (synth) synth.getVoices(); // Chrome loads voices lazily; asking early warms the list

  // Don't keep talking after the visitor scrolls away.
  new IntersectionObserver((es) => { if (!es[0].isIntersecting && root.classList.contains('playing')) stop(); }, { threshold: 0 }).observe(root);

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
