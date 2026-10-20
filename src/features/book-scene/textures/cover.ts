import type { DemoBook } from '@/entities/book/demo';
import {
  COVER_W,
  SANS,
  SERIF,
  makeCanvas,
  toTexture,
  wrapLines,
  type Rand,
} from './canvas';
import { weather } from './wear';

// Height over width. Books take their proportions from the cover art, so nothing gets cropped.
export function coverAspect(image: HTMLImageElement | null) {
  return image ? image.height / image.width : 1.5;
}

export type BindingOptions = { paperback: boolean };

// Draws an image like `object-fit: cover`
function drawCover(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource & { width: number; height: number },
  w: number,
  h: number,
) {
  const scale = Math.max(w / image.width, h / image.height);
  const dw = image.width * scale;
  const dh = image.height * scale;
  ctx.drawImage(image, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

function drawTypographicCover(
  ctx: CanvasRenderingContext2D,
  book: DemoBook,
  w: number,
  h: number,
) {
  ctx.fillStyle = book.color;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = book.ink;
  ctx.textAlign = 'center';
  ctx.font =
    book.type === 'sans' ? `800 64px ${SANS}` : `italic 600 64px ${SERIF}`;
  const lines = wrapLines(
    ctx,
    book.type === 'sans' ? book.title.toUpperCase() : book.title,
    w - 120,
  );
  lines.forEach((line, i) => ctx.fillText(line, w / 2, h * 0.38 + i * 72));

  ctx.font = `26px ${book.type === 'sans' ? SANS : SERIF}`;
  ctx.globalAlpha = 0.8;
  ctx.fillText(book.author.toUpperCase(), w / 2, h * 0.86);
  ctx.globalAlpha = 1;
}

export function createFrontCover(
  book: DemoBook,
  image: HTMLImageElement | null,
  rand: Rand,
  { paperback }: BindingOptions,
) {
  const h = Math.round(COVER_W * coverAspect(image));
  const [canvas, ctx] = makeCanvas(COVER_W, h);
  if (image) drawCover(ctx, image, COVER_W, h);
  else drawTypographicCover(ctx, book, COVER_W, h);

  weather(ctx, COVER_W, h, rand, book.wear, {
    crease: paperback ? 'left' : undefined,
  });
  return toTexture(canvas);
}

// Simplified EAN-style barcode; reads as a barcode, scans as nothing.
function drawBarcode(
  ctx: CanvasRenderingContext2D,
  isbn: string,
  x: number,
  y: number,
  rand: Rand,
) {
  const panelW = 196;
  const panelH = 118;
  ctx.fillStyle = '#fbf8f1';
  ctx.fillRect(x, y, panelW, panelH);

  ctx.fillStyle = '#16140f';
  ctx.font = `13px ${SANS}`;
  ctx.textAlign = 'left';
  ctx.fillText(
    `ISBN ${isbn.replace(/^(\d{3})(\d)(\d{3})(\d{5})(\d)$/, '$1-$2-$3-$4-$5')}`,
    x + 14,
    y + 22,
  );

  let bx = x + 16;
  const end = x + panelW - 16;
  const top = y + 30;
  const guard = (at: number) => {
    ctx.fillRect(at, top, 2, 70);
    ctx.fillRect(at + 4, top, 2, 70);
  };
  guard(bx);
  bx += 9;
  while (bx < end - 10) {
    const bar = 1 + Math.floor(rand() * 3);
    ctx.fillRect(bx, top, bar, 60);
    bx += bar + 1 + Math.floor(rand() * 3);
    if (Math.abs(bx - (x + panelW / 2)) < 2) guard(bx);
  }
  guard(end - 6);

  ctx.font = `14px ${SANS}`;
  ctx.letterSpacing = '3px';
  ctx.fillText(isbn, x + 16, y + panelH - 4);
  ctx.letterSpacing = '0px';
}

export function createBackCover(
  book: DemoBook,
  image: HTMLImageElement | null,
  rand: Rand,
  { paperback }: BindingOptions,
) {
  const w = COVER_W;
  const h = Math.round(COVER_W * coverAspect(image));
  const [canvas, ctx] = makeCanvas(w, h);

  ctx.fillStyle = book.color;
  ctx.fillRect(0, 0, w, h);

  // A soft haze of the front's colours, the way a back cover echoes its front
  if (image) {
    const [tiny, tinyCtx] = makeCanvas(10, 15);
    drawCover(tinyCtx, image, 10, 15);
    ctx.globalAlpha = 0.28;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(tiny, 0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.fillStyle = book.color;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
  }

  const font = book.type === 'sans' ? SANS : SERIF;
  const margin = 70;
  ctx.fillStyle = book.ink;
  ctx.textAlign = 'left';

  ctx.font = `600 17px ${SANS}`;
  ctx.letterSpacing = '5px';
  ctx.globalAlpha = 0.75;
  ctx.fillText(book.genre.toUpperCase(), margin, 104);
  ctx.globalAlpha = 1;
  ctx.letterSpacing = '0px';

  ctx.font =
    book.type === 'sans' ? `800 56px ${SANS}` : `italic 600 58px ${SERIF}`;
  const titleLines = wrapLines(
    ctx,
    book.type === 'sans' ? book.title.toUpperCase() : book.title,
    w - margin * 2,
  );
  titleLines.forEach((line, i) => ctx.fillText(line, margin, 176 + i * 62));
  let y = 176 + titleLines.length * 62;

  ctx.font = `27px ${font}`;
  ctx.fillText(book.author, margin, y + 2);
  y += 84;

  ctx.font = `32px ${SERIF}`;
  for (const line of wrapLines(ctx, book.blurb, w - margin * 2)) {
    ctx.fillText(line, margin, y);
    y += 46;
  }

  ctx.globalAlpha = 0.5;
  ctx.fillRect(margin, y + 12, 80, 2);
  ctx.globalAlpha = 1;

  // Imprint mark
  const markY = h - 96;
  ctx.strokeStyle = book.ink;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(margin + 22, markY, 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = `italic 600 26px ${SERIF}`;
  ctx.textAlign = 'center';
  ctx.fillText('a', margin + 22, markY + 8);
  ctx.textAlign = 'left';
  ctx.font = `14px ${SANS}`;
  ctx.fillText(book.price, margin, markY + 58);

  drawBarcode(ctx, book.isbn, w - margin - 196, h - 70 - 118, rand);

  weather(ctx, w, h, rand, book.wear, {
    crease: paperback ? 'right' : undefined,
  });
  return toTexture(canvas);
}
