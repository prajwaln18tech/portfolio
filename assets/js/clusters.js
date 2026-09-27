// Review Tool visual — points drift from noise into topic clusters, like embeddings grouped by KMeans.
// Hovering a point shows an illustrative review from that cluster.

const NS = 'http://www.w3.org/2000/svg';

const CLUSTERS = [
  { x: 105, y: 95, c: 'var(--c1)', label: 'performance', reviews: [
    ['en', 'Stutters on Series S since the last patch'], ['es', 'Rendimiento excelente en Steam Deck'],
    ['en', 'Load times doubled after the update'], ['de', 'Läuft flüssig auf meiner alten GTX 1060'] ] },
  { x: 290, y: 90, c: 'var(--c2)', label: 'pricing', reviews: [
    ['pt-BR', 'Preço justo para o Brasil'], ['en', 'Too expensive in my region'],
    ['en', 'Worth it for 100+ hours'], ['tr', 'İndirimi bekleyin'] ] },
  { x: 120, y: 232, c: 'var(--c3)', label: 'gameplay', reviews: [
    ['en', 'Campaign is incredible'], ['fr', 'Le multijoueur est addictif'],
    ['en', 'AI feels too passive on hard'], ['ja', '戦略性が高くて面白い'] ] },
  { x: 295, y: 228, c: 'var(--c4)', label: 'bugs', reviews: [
    ['de', 'Stürzt beim Start ab'], ['en', 'Save file corrupted twice'],
    ['en', 'Desync in 4v4 matches'], ['ko', '업적이 해제되지 않아요'] ] },
];

export function initClusters({ root, reduced }) {
  const svg = root.querySelector('svg');
  const tip = root.querySelector('.cl-tip');
  const btn = root.querySelector('.cl-rerun');
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

  const deco = [];
  const dots = [];
  CLUSTERS.forEach((k, ci) => {
    const hull = document.createElementNS(NS, 'circle');
    hull.setAttribute('cx', k.x); hull.setAttribute('cy', k.y); hull.setAttribute('r', 54);
    hull.setAttribute('class', 'hull'); hull.style.stroke = k.c;
    const label = document.createElementNS(NS, 'text');
    label.setAttribute('x', k.x); label.setAttribute('y', k.y - 62); label.setAttribute('text-anchor', 'middle');
    label.textContent = k.label;
    svg.append(hull, label);
    deco.push(hull, label);
    for (let i = 0; i < 26; i++) {
      const d = document.createElementNS(NS, 'circle');
      d.setAttribute('r', (2.2 + rnd() * 1.8).toFixed(2));
      d.style.fill = k.c;
      d.style.opacity = (0.45 + rnd() * 0.5).toFixed(2);
      d.dataset.c = ci;
      d.dataset.tx = k.x + gauss() * 18;
      d.dataset.ty = k.y + gauss() * 15;
      svg.append(d);
      dots.push(d);
    }
  });

  const scatter = (instant) => {
    root.classList.remove('settled');
    dots.forEach((d) => {
      d.style.transition = instant ? 'none' : 'transform .6s cubic-bezier(.2,.7,.1,1)';
      d.style.transform = `translate(${20 + Math.random() * 360}px, ${20 + Math.random() * 260}px)`;
    });
  };
  const settle = () => {
    root.classList.add('settled');
    dots.forEach((d) => {
      d.style.transition = `transform 1.6s cubic-bezier(.2,.7,.1,1) ${(Math.random() * 0.5).toFixed(2)}s`;
      d.style.transform = `translate(${d.dataset.tx}px, ${d.dataset.ty}px)`;
    });
  };

  scatter(true);
  if (reduced) settle();
  else new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); requestAnimationFrame(settle); } }, { threshold: 0.4 }).observe(svg);

  btn.addEventListener('click', () => {
    scatter(false);
    setTimeout(settle, reduced ? 0 : 650);
  });

  // Tooltip
  svg.addEventListener('pointerover', (e) => {
    const d = e.target.closest('circle[data-c]');
    if (!d || !root.classList.contains('settled')) return;
    const k = CLUSTERS[d.dataset.c];
    const [lang, text] = k.reviews[Math.floor(Math.random() * k.reviews.length)];
    tip.innerHTML = '';
    const head = document.createElement('span');
    head.className = 'mono';
    head.textContent = `${k.label} · ${lang}`;
    head.style.color = k.c;
    const body = document.createElement('span');
    body.textContent = `“${text}”`;
    tip.append(head, body);
    const r = root.getBoundingClientRect();
    const dr = d.getBoundingClientRect();
    tip.style.left = `${dr.left - r.left + dr.width / 2}px`;
    tip.style.top = `${dr.top - r.top}px`;
    tip.classList.add('show');
    root.dataset.focus = d.dataset.c;
  });
  svg.addEventListener('pointerleave', () => { tip.classList.remove('show'); delete root.dataset.focus; });
}
