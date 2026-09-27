// Tiny dependency-free confetti burst for easter eggs.

export function confetti({ reduced } = {}) {
  if (reduced) return;
  const css = getComputedStyle(document.documentElement);
  const colors = ['--c1', '--c2', '--c3', '--c4'].map((v) => css.getPropertyValue(v).trim());
  const c = document.createElement('canvas');
  c.className = 'confetti';
  document.body.append(c);
  const ctx = c.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const pieces = Array.from({ length: 160 }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 120,
    y: innerHeight * 0.55,
    vx: (Math.random() - 0.5) * 16,
    vy: -8 - Math.random() * 12,
    w: 6 + Math.random() * 6, h: 8 + Math.random() * 8,
    r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
  const t0 = performance.now();
  const frame = (t) => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const life = (t - t0) / 1000;
    pieces.forEach((p) => {
      p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - life / 3);
      ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)));
      ctx.restore();
    });
    if (life < 3) requestAnimationFrame(frame); else c.remove();
  };
  requestAnimationFrame(frame);
}
