import * as THREE from 'three';
import { makeCanvas, toTexture, type Rand } from './canvas';
import { getGrainCanvas } from './grain';

// Ageing drawn over a printed surface: warmth, grime, grain, rubbed edges and
// corners, an optional fold crease.
type WearOptions = {
  // Paperbacks crease where the cover folds at the spine
  crease?: 'left' | 'right';
};

export function weather(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  rand: Rand,
  wear: number,
  { crease }: WearOptions = {},
) {
  ctx.save();

  // Paper warms with age and inks lose a little of their punch
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = `rgba(255, 242, 220, ${0.15 + wear * 0.3})`;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = `rgba(236, 226, 206, ${0.02 + wear * 0.05})`;
  ctx.fillRect(0, 0, w, h);

  // Grime gathers toward the edges, where hands hold the book
  const grime = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.3,
    w / 2,
    h / 2,
    Math.hypot(w, h) * 0.56,
  );
  grime.addColorStop(0, 'rgba(96, 74, 44, 0)');
  grime.addColorStop(1, `rgba(96, 74, 44, ${0.05 + wear * 0.15})`);
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = grime;
  ctx.fillRect(0, 0, w, h);

  // Print and paper grain
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.35 + wear * 0.2;
  ctx.fillStyle = ctx.createPattern(getGrainCanvas(), 'repeat')!;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;

  // Rubbed edges: the ink wears off and pale card shows through
  ctx.globalCompositeOperation = 'source-over';
  const flecks = Math.round((w + h) * (0.25 + wear * 1.4));
  for (let i = 0; i < flecks; i++) {
    const side = Math.floor(rand() * 4);
    const along = rand();
    const depth = rand() ** 3 * (3 + wear * 12);
    const size = (0.5 + rand() * 2) * (0.6 + wear);
    const x = side === 0 ? depth : side === 1 ? w - depth : along * w;
    const y = side === 2 ? depth : side === 3 ? h - depth : along * h;
    ctx.fillStyle = `rgba(247, 240, 226, ${0.2 + rand() * 0.55})`;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y,
      size,
      size * (0.5 + rand()),
      rand() * Math.PI,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Corners take the most damage
  for (const [cx, cy] of [
    [0, 0],
    [w, 0],
    [0, h],
    [w, h],
  ]) {
    const r = 8 + wear * 34 * (0.6 + rand() * 0.8);
    const corner = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    corner.addColorStop(0, `rgba(246, 239, 224, ${0.25 + wear * 0.5})`);
    corner.addColorStop(1, 'rgba(246, 239, 224, 0)');
    ctx.fillStyle = corner;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  if (crease) {
    const x = crease === 'left' ? w * 0.04 : w * 0.96;
    const lineAt = (offset: number, style: string, width: number) => {
      ctx.strokeStyle = style;
      ctx.lineWidth = width;
      ctx.beginPath();
      for (let y = 0; y <= h; y += 24) {
        const jx = x + offset + (rand() - 0.5) * 1.5;
        if (y === 0) ctx.moveTo(jx, y);
        else ctx.lineTo(jx, y);
      }
      ctx.stroke();
    };
    lineAt(0, `rgba(255, 250, 240, ${0.25 + wear * 0.35})`, 2);
    lineAt(crease === 'left' ? 3 : -3, 'rgba(40, 28, 16, 0.12)', 2);
  }

  ctx.restore();
}

// Roughness: worn edges and scuffs go dull, the printed face keeps its sheen.
export function createSurfaceMap(rand: Rand, base: number, wear: number) {
  const w = 256;
  const h = 384;
  const [canvas, ctx] = makeCanvas(w, h);
  const level = (v: number) =>
    `rgb(0, ${Math.round(THREE.MathUtils.clamp(v, 0, 1) * 255)}, 0)`;

  ctx.fillStyle = level(base);
  ctx.fillRect(0, 0, w, h);

  // Uneven lamination: broad soft patches of slightly different sheen
  for (let i = 0; i < 14; i++) {
    const r = 30 + rand() * 90;
    const x = rand() * w;
    const y = rand() * h;
    const patch = ctx.createRadialGradient(x, y, 0, x, y, r);
    patch.addColorStop(0, level(base + (rand() - 0.4) * 0.18));
    patch.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = patch;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  ctx.strokeStyle = level(base + 0.3);
  for (let i = 0; i < 4 + wear * 14; i++) {
    ctx.lineWidth = 0.5 + rand();
    const x = rand() * w;
    const y = rand() * h;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rand() - 0.5) * 80, y + (rand() - 0.5) * 80);
    ctx.stroke();
  }

  ctx.fillStyle = level(base + 0.35 + wear * 0.2);
  for (let i = 0; i < 200 + wear * 600; i++) {
    const side = Math.floor(rand() * 4);
    const along = rand();
    const depth = rand() ** 3 * (2 + wear * 6);
    const x = side === 0 ? depth : side === 1 ? w - depth : along * w;
    const y = side === 2 ? depth : side === 3 ? h - depth : along * h;
    ctx.fillRect(x, y, 1 + rand() * 2, 1 + rand() * 2);
  }

  return toTexture(canvas, false);
}
