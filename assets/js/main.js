// Entry point — wires the page together. Every feature is a small ES module; no framework, no build step.
import { PROFILE, SECTIONS } from './data.js';
import {
  initTheme, createToast, initScrollChrome, initReveal, initSpotlight, initCounters,
  initRotator, initStage, initLightbox, downloadVCard, onKonami,
} from './ui.js';
import { initField } from './field.js';
import { initTerminal } from './terminal.js';
import { initAsk } from './ask.js';
import { initPipeline } from './pipeline.js';
import { initClusters } from './clusters.js';
import { initPalette } from './palette.js';
import { initColophon } from './colophon.js';
import { initNarrator, CITATION } from './narrator.js';
import { confetti } from './confetti.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s) => document.querySelector(s);

const setTheme = initTheme();
const toast = createToast();
const goto = (hash) => $(hash).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
const celebrate = () => { confetti({ reduced }); toast('🎉 Let’s talk — ' + PROFILE.email); };
const vcard = () => { downloadVCard(PROFILE); toast('Contact card downloaded'); };

const copyEmail = async () => {
  try { await navigator.clipboard.writeText(PROFILE.email); toast('Email copied to clipboard'); }
  catch (e) { location.href = `mailto:${PROFILE.email}`; }
};
$('#copy-email').addEventListener('click', copyEmail);
$('#vcard').addEventListener('click', vcard);

initScrollChrome();
initReveal();
initSpotlight();
initCounters(reduced);
initRotator(reduced);
initStage(reduced);
initLightbox();
initField({ canvas: $('#field'), reduced });
initClusters({ root: $('#clusters'), reduced });
initColophon({ root: $('#colophon') });

const terminal = initTerminal({ el: $('#terminal'), reduced, actions: { goto, setTheme, celebrate } });
const ask = initAsk({ root: $('#ask'), toast });
const pipeline = initPipeline({ root: $('#price-sim'), reduced });
const narrator = initNarrator({ root: $('#narr') });

const copyCitation = async (kind) => {
  try { await navigator.clipboard.writeText(CITATION[kind]); toast(`${kind === 'bibtex' ? 'BibTeX' : 'APA'} citation copied`); }
  catch (e) { toast('Copy failed — select the text on ACM DL instead'); }
};
document.querySelectorAll('[data-cite]').forEach((b) => b.addEventListener('click', () => copyCitation(b.dataset.cite)));
const openTerminal = () => { goto('#top'); terminal.focus(); };

const open = (url) => () => window.open(url, '_blank', 'noopener');
const palette = initPalette({
  commands: [
    { g: 'Navigate', ic: '→', label: 'About', hint: 'g a', run: () => goto(SECTIONS.about) },
    { g: 'Navigate', ic: '→', label: 'Experience', hint: 'g e', run: () => goto(SECTIONS.experience) },
    { g: 'Navigate', ic: '→', label: 'Selected work', hint: 'g w', run: () => goto(SECTIONS.work) },
    { g: 'Navigate', ic: '→', label: 'Ask my résumé', hint: 'g q', k: 'resume search', run: () => goto(SECTIONS.ask) },
    { g: 'Navigate', ic: '→', label: 'Tech stack', hint: 'g s', k: 'skills', run: () => goto(SECTIONS.stack) },
    { g: 'Navigate', ic: '→', label: 'Education & awards', hint: 'g d', run: () => goto(SECTIONS.education) },
    { g: 'Navigate', ic: '→', label: 'Contact', hint: 'g c', run: () => goto(SECTIONS.contact) },
    { g: 'Navigate', ic: '→', label: 'Under the hood', hint: 'g u', k: 'performance colophon', run: () => goto(SECTIONS.colophon) },
    { g: 'Try it', ic: '?', label: 'Ask a question about Prajwal…', hint: '/', k: 'search resume', run: () => ask.focus() },
    { g: 'Try it', ic: '>', label: 'Open the terminal', hint: '`', k: 'shell cli', run: openTerminal },
    { g: 'Try it', ic: '▶', label: 'Simulate a Price Tool sync', k: 'pipeline demo', run: () => pipeline.run() },
    { g: 'Try it', ic: '♪', label: 'Hear the code narration demo', k: 'accessibility voice paper', run: () => narrator.play() },
    { g: 'Research', ic: '📄', label: 'Read the paper on ACM DL', hint: 'JCSC 2025', k: 'publication research acm', run: open(PROFILE.paper) },
    { g: 'Research', ic: '⎘', label: 'Copy BibTeX citation', k: 'publication cite', run: () => copyCitation('bibtex') },
    { g: 'Actions', ic: '@', label: 'Copy email address', hint: PROFILE.email, run: copyEmail },
    { g: 'Actions', ic: '↓', label: 'Open résumé (PDF)', k: 'resume cv', run: open(PROFILE.resume) },
    { g: 'Actions', ic: '⎘', label: 'Download contact card (vCard)', k: 'vcf', run: vcard },
    { g: 'Actions', ic: '◐', label: 'Toggle light / dark theme', hint: 't', run: () => setTheme() },
    { g: 'Actions', ic: '⌨', label: 'Keyboard shortcuts', hint: '?', run: () => palette.openKeys() },
    { g: 'Links', ic: '↗', label: 'GitHub', hint: 'prajwaln18tech', run: open(PROFILE.github) },
    { g: 'Links', ic: '↗', label: 'LinkedIn', run: open(PROFILE.linkedin) },
    { g: 'Links', ic: '↗', label: 'View this site’s source', k: 'code repo', run: open(PROFILE.repo) },
  ],
  shortcuts: {
    keys: { '/': () => ask.focus(), '`': openTerminal, t: () => setTheme() },
    goto: {
      a: () => goto(SECTIONS.about), e: () => goto(SECTIONS.experience), w: () => goto(SECTIONS.work),
      q: () => goto(SECTIONS.ask), s: () => goto(SECTIONS.stack), d: () => goto(SECTIONS.education),
      c: () => goto(SECTIONS.contact), u: () => goto(SECTIONS.colophon), h: () => goto('#top'),
    },
  },
});
$('#keys-open').addEventListener('click', () => palette.openKeys());

onKonami(celebrate);

// Mac shows ⌘, everyone else Ctrl.
if (!/Mac|iPhone|iPad/.test(navigator.userAgent)) document.querySelectorAll('kbd').forEach((k) => { if (k.textContent === '⌘K') k.textContent = 'Ctrl K'; });
$('#year').textContent = new Date().getFullYear();

// Offline support. Network-first, so updates always show up immediately when online.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
