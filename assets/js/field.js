// Ambient particle field behind the page. Pauses when the tab is hidden; static when motion is reduced.

export function initField({ canvas, reduced }) {
  const ctx = canvas.getContext('2d');
  const root = document.documentElement;
  let W, H, pts = [], raf = 0, rgb = '';
  const mouse = { x: -9999, y: -9999 };

  const readColor = () => { rgb = getComputedStyle(root).getPropertyValue('--field').trim() || '165,148,255'; };
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(90, Math.floor((W * H) / 16000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      const dx = mouse.x - p.x, dy = mouse.y - p.y, dist = Math.hypot(dx, dy);
      if (dist < 180 && dist > 0) { p.vx += (dx / dist) * 0.012; p.vy += (dy / dist) * 0.012; }
      p.vx *= 0.99; p.vy *= 0.99;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    }
    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          ctx.strokeStyle = `rgba(${rgb},${(1 - d / 130) * 0.16})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      ctx.fillStyle = `rgba(${rgb},0.45)`;
      ctx.beginPath(); ctx.arc(a.x, a.y, 1.3, 0, Math.PI * 2); ctx.fill();
    }
  };
  const loop = () => { draw(); raf = requestAnimationFrame(loop); };

  readColor();
  resize();
  new MutationObserver(() => { readColor(); if (reduced) draw(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  addEventListener('resize', () => { resize(); if (reduced) draw(); });
  addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  if (reduced) { draw(); return; }
  loop();
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) loop();
  });
}
