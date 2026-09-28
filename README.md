# Prajwal Narayanaswamy — Portfolio

**Live:** https://prajwalnarayanaswamy.com

Personal site of Prajwal Narayanaswamy, a software engineer working on AI/LLM features, full-stack web apps and cloud platforms.

It is hand-built with semantic HTML, modern CSS and native ES modules. There is no framework, bundler or build step.

## What's inside

| Feature | How it works |
| --- | --- |
| **Interactive terminal** | A small shell with history, tab completion and commands like `help`, `projects`, `papers` and `ask …` (`assets/js/terminal.js`). |
| **Ask my résumé** | Hybrid retrieval over résumé passages. Keyword mode is BM25 with stemming and synonyms. Semantic mode runs `all-MiniLM-L6-v2` in the browser via Transformers.js in a Web Worker, and caches passage vectors by content hash so only edited text is re-embedded (`search.js`, `embed-worker.js`). |
| **Code narration demo** | The structure-first, two-voice technique from the paper below, played with the Web Speech API. It falls back to captions when audio is off (`narrator.js`). |
| **Pipeline simulator** | An illustrative run of the Price Tool pipeline: 429 rate limits, exponential back-off and a Selenium fallback (`pipeline.js`). |
| **Command palette** | Press <kbd>⌘K</kbd> / <kbd>Ctrl K</kbd>. Press <kbd>?</kbd> for keyboard shortcuts (`palette.js`). |
| **Live performance panel** | Load time, LCP, CLS, page weight and request count for the current visit, read from the Performance APIs (`colophon.js`). |
| **Offline & installable** | A network-first service worker (`sw.js`) and a web app manifest. |
| **Accessible** | Skip link, visible focus, ARIA live regions, full keyboard control and reduced-motion support. |

## Publication

P. Narayanaswamy, A. Attarwala, P. Viotti, J. Raigoza, E. Lindoo. **AI-Assisted Contextual Code Narration for the Visually Impaired.** *Journal of Computing Sciences in Colleges* 41(4), 77–89, September 2025. [ACM Digital Library](https://dl.acm.org/doi/abs/10.5555/3787712.3787735) · [Source code (GitLab)](https://gitlab.com/prajwalnec053/ai-assisted_contextual_code_narration_project)

## Run locally

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173. The ES modules and the service worker need to be served over HTTP, not opened as a file.

## Deploy

Vercel is connected to this repository, and every push to `main` redeploys the site. `vercel.json` sets the security headers and cache rules. No build settings are needed: use the **Other** framework preset and leave the build command empty.

## Structure

```
index.html              single page
assets/css/style.css    all styles (light/dark themes, print stylesheet)
assets/js/              one ES module per feature; main.js wires them together
assets/og.png           social preview image
images/                 portrait cutout, avatar, photos
sw.js                   service worker
vercel.json             headers and caching
```
