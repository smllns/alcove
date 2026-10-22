import { useId, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { labelClass } from './fieldStyles';
import { halves } from '@/shared/lib/halves';
import { RemoveAction } from './HoverAction';
import { RatingFigure } from './Rating';
import { Stars } from './Stars';

type StarRatingProps = {
  label: string;
  // 0.5 to 5 in halves; 0 for none
  value: number;
  onChange: (value: number) => void;
};

const STARS = 5;

// Five stars, each taken by the half, as on Letterboxd. Hovering shows what
// a click would give; clicking the same rating again clears it. Arrow keys
// move half a star at a time.
export function StarRating({ label, value, onChange }: StarRatingProps) {
  const labelId = useId();
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;

  // The rating under the pointer: the left half of a star is half of it
  const at = (e: MouseEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const halfStars = Math.ceil(
      ((e.clientX - box.left) / box.width) * STARS * 2,
    );
    return Math.min(Math.max(halfStars, 1), STARS * 2) / 2;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const step = {
      ArrowRight: 0.5,
      ArrowUp: 0.5,
      ArrowLeft: -0.5,
      ArrowDown: -0.5,
    }[e.key];
    const next =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? STARS
          : step === undefined
            ? null
            : Math.min(Math.max(value + step, 0), STARS);
    if (next === null) return;
    e.preventDefault();
    // Show the keyed rating, not whatever the pointer last hovered
    setHover(null);
    onChange(next);
  };

  return (
    <div className='flex flex-col gap-3'>
      <span id={labelId} className={labelClass}>
        {label}
      </span>
      <div className='group flex items-center gap-3'>
        <div
          role='slider'
          tabIndex={0}
          aria-labelledby={labelId}
          aria-valuemin={0}
          aria-valuemax={STARS}
          aria-valuenow={value}
          aria-valuetext={
            value ? `${value} out of ${STARS} stars` : 'Not rated'
          }
          onPointerMove={(e) => setHover(at(e))}
          onPointerLeave={() => setHover(null)}
          onClick={(e) => {
            const picked = at(e);
            onChange(picked === value ? 0 : picked);
          }}
          onKeyDown={onKeyDown}
          className='flex cursor-pointer rounded-md outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink'
        >
          <Stars value={shown} />
        </div>
        {value > 0 && (
          <>
            <RatingFigure>{halves(value)}</RatingFigure>
            <RemoveAction label='Clear rating' onClick={() => onChange(0)} />
          </>
        )}
      </div>
    </div>
  );
}
