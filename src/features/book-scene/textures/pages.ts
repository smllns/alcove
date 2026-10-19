import { makeCanvas, toTexture, type Rand } from './canvas';

// Stacked page edges. `along` is the texture axis that runs through the
// thickness of the block, so stripes always follow the pages.
export function createPageEdgeTexture(
  rand: Rand,
  along: 'u' | 'v',
  dust: number,
  wear: number,
) {
  const size = 256;
  const [canvas, ctx] = makeCanvas(size, size);

  for (let i = 0; i < size; i++) {
    const l = 82 + rand() * 9;
    ctx.fillStyle = `hsl(40, ${30 + rand() * 10}%, ${l}%)`;
    if (along === 'u') ctx.fillRect(i, 0, 1, size);
    else ctx.fillRect(0, i, size, 1);
  }

  // Edges near the covers are pressed darker
  const press =
    along === 'u'
      ? ctx.createLinearGradient(0, 0, size, 0)
      : ctx.createLinearGradient(0, 0, 0, size);
  press.addColorStop(0, 'rgba(110, 84, 50, 0.25)');
  press.addColorStop(0.1, 'rgba(110, 84, 50, 0)');
  press.addColorStop(0.9, 'rgba(110, 84, 50, 0)');
  press.addColorStop(1, 'rgba(110, 84, 50, 0.25)');
  ctx.fillStyle = press;
  ctx.fillRect(0, 0, size, size);

  // Dust settles on the top edge; thumbs darken the fore-edge
  if (dust > 0) {
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgba(150, 136, 112, ${dust})`;
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 500 * dust; i++) {
      ctx.fillStyle = `rgba(80, 66, 48, ${rand() * 0.25})`;
      ctx.fillRect(rand() * size, rand() * size, 1 + rand(), 1 + rand());
    }
  }
  if (wear > 0.4 && along === 'u') {
    const thumb = ctx.createRadialGradient(
      size / 2,
      size * 0.75,
      0,
      size / 2,
      size * 0.75,
      size * 0.45,
    );
    thumb.addColorStop(0, `rgba(110, 90, 62, ${wear * 0.22})`);
    thumb.addColorStop(1, 'rgba(110, 90, 62, 0)');
    ctx.fillStyle = thumb;
    ctx.fillRect(0, 0, size, size);
  }

  return toTexture(canvas);
}
