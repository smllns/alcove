import { useImperativeHandle, useLayoutEffect, useRef, type Ref } from 'react';
import { gsap } from 'gsap';
import { prefersReducedMotion } from '@/shared/lib/motion';
import { WAVE_AMP, WAVE_PERIOD, wavePath } from './wave';

// Covers inside the letters, in SVG units
const COVER_W = 660;
const COVER_H = 1000;

export type WordmarkFillHandle = {
  // 0 is empty, 1 is full to the brim
  setLevel: (level: number) => void;
  // Covers settle into solid ink: the wordmark the page opens with
  settle: () => gsap.core.Timeline;
  // Lifts and fades the word away
  leave: () => gsap.core.Timeline;
};

type WordmarkFillProps = {
  word: string;
  covers: string[];
  ref?: Ref<WordmarkFillHandle>;
};

// A huge hairline wordmark that fills up like liquid, with book covers
// drifting through the letters.
export function WordmarkFill({ word, covers, ref }: WordmarkFillProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const outlineRef = useRef<SVGTextElement>(null);
  const stripRef = useRef<SVGGElement>(null);
  const waveRef = useRef<SVGPathElement>(null);
  const inkRef = useRef<SVGRectElement>(null);
  // Maps a fill level to the wave's y; known once the word has been measured
  const levelToY = useRef<(level: number) => number>(() => 0);

  // Doubled so the strip can loop without a seam
  const strip = [...covers, ...covers];

  useLayoutEffect(() => {
    const svg = svgRef.current;
    const outline = outlineRef.current;
    const stripEl = stripRef.current;
    const wave = waveRef.current;
    const ink = inkRef.current;
    if (!svg || !outline || !stripEl || !wave || !ink) return;

    // Fit the drawing to the word as the browser actually set it
    const box = outline.getBBox();
    const pad = box.height * 0.08;
    const frame = {
      x: box.x - pad,
      y: box.y - pad,
      width: box.width + pad * 2,
      height: box.height + pad * 2,
    };
    svg.setAttribute(
      'viewBox',
      `${frame.x} ${frame.y} ${frame.width} ${frame.height}`,
    );
    for (const [key, value] of Object.entries(frame))
      ink.setAttribute(key, String(value));

    // From just below the letters to just above them
    levelToY.current = (level) =>
      box.y + box.height + WAVE_AMP - (box.height + WAVE_AMP * 3) * level;

    const coverScale = (box.height * 1.1) / COVER_H;
    const loopWidth = covers.length * COVER_W * coverScale;

    const ctx = gsap.context(() => {
      gsap.set(stripEl, {
        x: box.x,
        y: box.y - box.height * 0.05,
        scale: coverScale,
        transformOrigin: '0 0',
      });
      gsap.set(wave, { y: levelToY.current(0) });
      gsap.from(outline, { opacity: 0, duration: 1.6, ease: 'power2.out' });

      if (!prefersReducedMotion) {
        // Covers drift through the letters; the surface keeps rolling
        gsap.to(stripEl, {
          x: box.x - loopWidth,
          duration: 28,
          ease: 'none',
          repeat: -1,
        });
        gsap.to(wave, {
          x: -WAVE_PERIOD,
          duration: 1.8,
          ease: 'none',
          repeat: -1,
        });
      }
    }, svg);

    return () => ctx.revert();
  }, [covers.length]);

  useImperativeHandle(ref, () => ({
    setLevel: (level) =>
      gsap.set(waveRef.current, { y: levelToY.current(level) }),
    settle: () =>
      gsap
        .timeline()
        .to(inkRef.current, { opacity: 1, duration: 0.7, ease: 'power2.inOut' })
        .to(outlineRef.current, { opacity: 0, duration: 0.5 }, '<'),
    leave: () =>
      gsap.timeline().to(svgRef.current, {
        y: -40,
        opacity: 0,
        scale: 0.96,
        duration: 0.8,
        ease: 'power3.in',
      }),
  }));

  const text = {
    x: 0,
    y: 0,
    fontSize: 200,
    className: 'font-serif tracking-[-0.075em]',
  };

  return (
    <svg
      ref={svgRef}
      viewBox='0 -170 560 220'
      className='w-[88vw] max-w-275 overflow-visible'
      aria-hidden
    >
      <defs>
        <clipPath id='wordmark-letters'>
          <text {...text}>{word}</text>
        </clipPath>
        <clipPath id='wordmark-level'>
          <path ref={waveRef} d={wavePath} />
        </clipPath>
      </defs>

      {/* The empty word, drawn in a hairline */}
      <text
        ref={outlineRef}
        {...text}
        fill='none'
        strokeOpacity='0.32'
        strokeWidth='1'
        vectorEffect='non-scaling-stroke'
        style={{ stroke: 'var(--ink)' }}
      >
        {word}
      </text>

      {/* Covers rising inside the letters, then ink over them at the end */}
      <g clipPath='url(#wordmark-letters)'>
        <g clipPath='url(#wordmark-level)'>
          <g ref={stripRef}>
            {strip.map((cover, i) => (
              <image
                key={`${cover}-${i}`}
                href={cover}
                x={i * COVER_W}
                width={COVER_W}
                height={COVER_H}
                preserveAspectRatio='xMidYMid slice'
              />
            ))}
          </g>
        </g>
        <rect ref={inkRef} opacity='0' style={{ fill: 'var(--ink)' }} />
      </g>
    </svg>
  );
}
