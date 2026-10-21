import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { cn } from '@/shared/lib/cn';
import { labelClass } from './fieldStyles';

type Step<T extends string> = { value: T; label: string; tone: string };

// A scale of named steps along a line (how worn a copy is, say), one
// chosen: a knob in its colour sits on it, and is dragged, clicked or
// arrowed from step to step. A drag settles where it's let go, so the
// change is made once. `clearable`: picking the chosen one again leaves
// none chosen.
export function StepSlider<T extends string>({
  label,
  steps,
  value,
  onChange,
  clearable = false,
  inline = false,
}: {
  label: string;
  steps: Step<T>[];
  value: T | '';
  onChange: (value: T | '') => void;
  clearable?: boolean;
  // The label beside the scale, as a detail shown; else above it, as a
  // field's
  inline?: boolean;
}) {
  const labelId = useId();
  const track = useRef<HTMLDivElement>(null);
  // Where the knob is while it's being dragged
  const [dragging, setDragging] = useState<number | null>(null);
  const moved = useRef(false);
  const chosen = steps.findIndex((s) => s.value === value);
  const at = dragging ?? chosen;
  const tone = at >= 0 ? steps[at].tone : 'var(--line)';
  // The middle of each step's quarter, as a share of the width
  const left = (i: number) => `${((i + 0.5) / steps.length) * 100}%`;

  const stepAt = (clientX: number) => {
    const box = track.current!.getBoundingClientRect();
    const i = Math.floor(((clientX - box.left) / box.width) * steps.length);
    return Math.min(Math.max(i, 0), steps.length - 1);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    moved.current = false;
    setDragging(stepAt(e.clientX));
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging === null) return;
    const i = stepAt(e.clientX);
    if (i !== dragging) {
      moved.current = true;
      setDragging(i);
    }
  };
  const onPointerUp = () => {
    if (dragging === null) return;
    const i = dragging;
    setDragging(null);
    // A click on the chosen one, without dragging, may clear it
    if (i === chosen) {
      if (clearable && !moved.current) onChange('');
      return;
    }
    onChange(steps[i].value);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[
      e.key
    ];
    if (step === undefined) return;
    e.preventDefault();
    const from = chosen < 0 ? (step > 0 ? -1 : steps.length) : chosen;
    const i = Math.min(Math.max(from + step, 0), steps.length - 1);
    if (i !== chosen) onChange(steps[i].value);
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        // Beside it: the label on the left, the scale in the middle of the
        // room left
        inline && 'sm:flex-row sm:items-center sm:gap-8',
      )}
    >
      <span
        id={labelId}
        className={cn(
          'shrink-0',
          inline ? 'font-serif text-[17px] leading-none text-ink' : labelClass,
        )}
      >
        {label}
      </span>
      <div
        ref={track}
        role='slider'
        tabIndex={0}
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={steps.length - 1}
        aria-valuenow={chosen < 0 ? undefined : chosen}
        aria-valuetext={chosen < 0 ? 'Not set' : steps[chosen].label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setDragging(null)}
        onKeyDown={onKeyDown}
        style={{ '--tone': tone } as CSSProperties}
        className={cn(
          'relative mx-auto grid w-full max-w-md cursor-pointer touch-none select-none grid-cols-4 rounded-md py-1 outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink',
          dragging !== null && 'cursor-grabbing',
        )}
      >
        {/* The line the steps sit on */}
        <span
          aria-hidden
          className='absolute top-2.5 h-px bg-line'
          style={{ left: left(0), right: left(0) }}
        />
        {steps.map((s, i) => (
          <span
            key={s.value}
            className='relative flex flex-col items-center gap-2 text-center'
          >
            <span
              aria-hidden
              className='size-2.75 rounded-full border-2 border-line bg-surface'
            />
            <span
              className={cn(
                'font-serif text-[14px] leading-tight transition-colors duration-300 ease-soft',
                i === at ? 'text-ink' : 'text-faint',
              )}
            >
              {s.label}
            </span>
          </span>
        ))}
        {/* The knob, gliding from step to step */}
        {at >= 0 && (
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute top-0.75 size-3.75 -translate-x-1/2 rounded-full bg-(--tone) shadow-[0_0_0_4px_color-mix(in_oklab,var(--tone)_20%,transparent),0_2px_4px_rgb(0_0_0/0.2)] transition-[left,background-color] duration-300 ease-soft',
              dragging !== null && 'scale-110',
            )}
            style={{ left: left(at) }}
          />
        )}
      </div>
    </div>
  );
}
