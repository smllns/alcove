import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Collapse } from '@/shared/ui/Collapse';
import { Fold } from '@/shared/ui/Fold';
import { InlineEditor } from '@/shared/ui/InlineEditor';
import { editBoxClass } from './ListName';

// What's said about a list as it's set under its name, folded if it's long
const aboutClass =
  'whitespace-pre-line font-serif text-[1.0625rem] leading-relaxed text-ink/85';

// What's said about a list, under its name: nothing at all when nothing
// is. The reader's own, while it's being changed (`editing`), a soft box
// to say it in, or to empty, the room for it opening smoothly when there
// was nothing to say before; kept as it's left (`onChange`), Escape
// putting it back as it was. Never taking the cursor of itself.
export function ListAbout({
  text = '',
  editing = false,
  onChange,
}: {
  text?: string;
  editing?: boolean;
  onChange?: (text: string) => void;
}) {
  // Put back as it was: a fresh box with the words in
  const [fresh, setFresh] = useState(0);
  const changing = editing && onChange !== undefined;
  return (
    <Collapse open={changing || text !== ''}>
      <div className='pt-4'>
        {changing ? (
          <div className={cn('bg-ink/5 py-2', editBoxClass)}>
            <InlineEditor
              key={fresh}
              initial={text}
              label='What the list is about'
              placeholder='A line about it, if you like'
              focus={false}
              className={cn(aboutClass, 'min-h-0')}
              onDone={(typed) =>
                typed === null
                  ? setFresh((n) => n + 1)
                  : typed.trim() !== text && onChange(typed.trim())
              }
            />
          </div>
        ) : (
          <Fold lines={4} className={aboutClass}>
            {text}
          </Fold>
        )}
      </div>
    </Collapse>
  );
}
