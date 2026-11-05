import { Upload } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { FormError } from '@/shared/ui/FormError';
import { labelClass } from '@/shared/ui/fieldStyles';
import { outlineCardClass } from '@/shared/ui/surfaces';

// Where each site keeps the export of a library
const how = [
  {
    site: 'Goodreads',
    steps: 'My Books → Import and export → Export library, then download it.',
  },
  {
    site: 'StoryGraph',
    steps:
      'Your profile → Manage account → Export StoryGraph library, then download it from the email.',
  },
];

// The first step: how to get the file from either site, and a place to
// drop it or choose it; what's in it handed on as text (`onText`), or why
// it couldn't be (`error`)
export function ChooseExport({
  onText,
  error,
}: {
  onText: (text: string) => void;
  error?: string;
}) {
  const [over, setOver] = useState(false);
  const read = (file?: File) => void file?.text().then(onText);
  return (
    <div className='flex flex-col gap-8'>
      <div className='grid gap-4 sm:grid-cols-2'>
        {how.map(({ site, steps }) => (
          <div key={site} className={cn(outlineCardClass, 'p-5')}>
            <p className={labelClass}>From {site}</p>
            <p className='mt-2 text-sm leading-relaxed text-ink-soft'>
              {steps}
            </p>
          </div>
        ))}
      </div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          read(e.dataTransfer.files[0]);
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center transition-colors duration-500 ease-soft hover:border-ink has-focus-visible:border-ink',
          over ? 'border-ink bg-ink/5' : 'border-line',
        )}
      >
        <Upload size={20} className='text-faint' />
        <span className='font-serif text-xl text-ink'>Choose your export</span>
        <span className='text-sm text-muted'>
          The .csv file, or drop it here
        </span>
        <input
          type='file'
          accept='.csv,text/csv'
          className='sr-only'
          onChange={(e) => read(e.target.files?.[0])}
        />
      </label>
      <FormError message={error ?? null} />
    </div>
  );
}
