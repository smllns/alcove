import { useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';

// Text being written in place, looking just as it will once it's written
// (a note on its sticky, a quote in its italics): a box that grows with
// it. Clicking away keeps it, ⌘/Ctrl-Enter too; Escape leaves it as it
// was (null). It takes the cursor at once, without jumping the page to
// it: whatever opened it moves the page, if it needs to, smoothly.
export function InlineEditor({
  initial,
  label,
  placeholder,
  className,
  onDone,
}: {
  initial: string;
  label: string;
  placeholder: string;
  // The text's own look
  className: string;
  onDone: (text: string | null) => void;
}) {
  const [text, setText] = useState(initial);
  const box = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    box.current?.focus({ preventScroll: true });
  }, []);
  return (
    <textarea
      ref={box}
      value={text}
      aria-label={label}
      placeholder={placeholder}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => onDone(text)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onDone(null);
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onDone(text);
      }}
      onFocus={(e) => {
        const end = e.currentTarget.value.length;
        e.currentTarget.setSelectionRange(end, end);
      }}
      className={cn(
        'field-sizing-content block min-h-12 w-full resize-none bg-transparent outline-none placeholder:opacity-45',
        className,
      )}
    />
  );
}
