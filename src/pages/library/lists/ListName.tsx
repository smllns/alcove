import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { useMediaQuery } from '@/shared/lib/useMediaQuery';
import { InlineEditor } from '@/shared/ui/InlineEditor';

// A list's name as its page's title, and while the list's being changed
// (`editing`), the box to change it in, a soft field fading in under it:
// the cursor in it at once with a mouse (on a phone, a tap away, so the
// keyboard doesn't come up as books are picked). Kept as it's left or on
// Enter (`onRename`); Escape puts it back as it was. Told whether to take
// the cursor (`focus`), it does as it's told. The field's room is
// there all along, so nothing round it moves as it comes and goes.
export function ListName({
  name,
  editing,
  focus,
  onRename,
}: {
  name: string;
  editing: boolean;
  focus?: boolean;
  onRename: (name: string) => void;
}) {
  const pointing = useMediaQuery('(pointer: fine)');
  // Put back as it was: a fresh box with the name in
  const [fresh, setFresh] = useState(0);
  return (
    <span
      className={cn(
        '-mx-3 -mb-2 -mt-3 block rounded-2xl px-3 pb-2 pt-3 transition-colors duration-500 ease-soft',
        editing ? 'bg-ink/5' : 'bg-transparent',
      )}
    >
      {editing ? (
        <InlineEditor
          key={fresh}
          initial={name}
          label='The list’s name'
          placeholder='Its name'
          singleLine
          focus={focus ?? pointing}
          // As the title is, with room under the line for letters that
          // reach below it
          className='-mb-[0.15em] min-h-0 pb-[0.15em]'
          onDone={(text) =>
            text === null ? setFresh((n) => n + 1) : onRename(text)
          }
        />
      ) : (
        name
      )}
    </span>
  );
}
