import { SANS, SERIF, makeCanvas, toTexture, type Rand } from './canvas';
import type { BindingOptions } from './cover';
import { weather } from './wear';
import type { Book } from '@/entities/book/types';

export function createSpineTexture(
  book: Book,
  aspect: number,
  rand: Rand,
  { paperback }: BindingOptions,
) {
  const height = 1024;
  const width = Math.max(96, Math.round(height * aspect));
  const [canvas, ctx] = makeCanvas(width, height);

  ctx.fillStyle = book.color;
  ctx.fillRect(0, 0, width, height);

  // A hardcover's spine curves; a paperback's only darkens at the folds
  const shade = ctx.createLinearGradient(0, 0, width, 0);
  if (paperback) {
    shade.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
    shade.addColorStop(0.08, 'rgba(0, 0, 0, 0)');
    shade.addColorStop(0.92, 'rgba(0, 0, 0, 0)');
    shade.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
  } else {
    shade.addColorStop(0, 'rgba(0, 0, 0, 0.26)');
    shade.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)');
    shade.addColorStop(1, 'rgba(0, 0, 0, 0.26)');
  }
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, width, height);

  // Reads top-to-bottom, like English spines: title, then author, then imprint
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(Math.PI / 2);
  ctx.textBaseline = 'middle';
  ctx.fillStyle = book.ink;

  const sans = book.type === 'sans';
  const title = sans ? book.title.toUpperCase() : book.title;
  const maxSize = width * 0.5;
  const fit = (
    text: string,
    weight: string,
    family: string,
    max: number,
    room: number,
  ) => {
    let size = max;
    do {
      ctx.font = `${weight} ${size}px ${family}`;
      size -= 1;
    } while (ctx.measureText(text).width > room && size > 12);
  };

  fit(book.author, '400', sans ? SANS : SERIF, maxSize * 0.62, height * 0.3);
  const authorWidth = ctx.measureText(book.author).width;
  const authorFont = ctx.font;

  fit(
    title,
    sans ? '800' : '600',
    sans ? SANS : SERIF,
    maxSize,
    height - 260 - authorWidth,
  );
  ctx.textAlign = 'left';
  ctx.fillText(title, -height / 2 + 70, 0);

  ctx.font = authorFont;
  ctx.textAlign = 'right';
  ctx.fillText(book.author, height / 2 - 130, 0);
  ctx.restore();

  // Imprint mark near the foot
  ctx.strokeStyle = book.ink;
  ctx.fillStyle = book.ink;
  ctx.lineWidth = 2;
  const markR = Math.min(width * 0.22, 16);
  ctx.beginPath();
  ctx.arc(width / 2, height - 70, markR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = `italic 600 ${markR * 1.2}px ${SERIF}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('a', width / 2, height - 72);

  weather(ctx, width, height, rand, book.wear);

  // Reading creases: pale streaks along a paperback spine that's been opened wide
  if (paperback) {
    const creases = Math.round(1 + book.wear * 9);
    for (let i = 0; i < creases; i++) {
      let x = width * (0.15 + rand() * 0.7);
      const start = rand() * height * 0.6;
      const length = 80 + rand() * height * 0.5;
      ctx.strokeStyle = `rgba(250, 244, 232, ${0.3 + rand() * 0.4})`;
      ctx.lineWidth = 1 + rand() * 2;
      ctx.beginPath();
      ctx.moveTo(x, start);
      for (let y = start; y < start + length; y += 16) {
        x += (rand() - 0.5) * 1.6;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  return toTexture(canvas);
}
