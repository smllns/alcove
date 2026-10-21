import { copyConditions } from '@/entities/book/conditions';
import { useEditCopy } from '@/entities/book/queries';
import type { Book } from '@/entities/book/types';
import { placePath } from '@/entities/place/names';
import { usePlaces } from '@/entities/place/queries';
import { cn } from '@/shared/lib/cn';
import { FormError } from '@/shared/ui/FormError';
import { StepSlider } from '@/shared/ui/StepSlider';
import { outlineCardClass } from '@/shared/ui/surfaces';
import { BookSection } from './BookSection';
import { CopyStory } from './CopyStory';
import { copyStory } from './copyMoments';
import { PlaceTrail } from './PlaceTrail';

// This copy: where it lives, drawn as the way to it; what shape it's in, on
// a scale to set right here; and its story, the latest first
export function YourCopy({ book }: { book: Book }) {
  const homes = usePlaces().data?.homes ?? [];
  const { save, pending, error } = useEditCopy(book);
  const copy = pending ?? book.copy;
  const path = copy?.place ? placePath(homes, copy.place) : [];
  const moments = copyStory(book.copy);
  const where = path.length > 0 || Boolean(copy?.location);

  return (
    <BookSection title='Your copy'>
      <div className='flex flex-col gap-8'>
        {/* Where it is and what shape it's in, on one card, a rule
            between them */}
        <div
          className={cn(
            'flex flex-col gap-5 p-5 sm:px-6 sm:py-6',
            outlineCardClass,
          )}
        >
          {where && (
            <div className='min-w-0'>
              {path.length > 0 ? (
                <PlaceTrail path={path} />
              ) : (
                <p className='font-serif text-[17px] text-ink'>
                  {copy?.location}
                </p>
              )}
            </div>
          )}
          <div className={cn(where && 'border-t border-line/60 pt-5')}>
            <StepSlider
              inline
              label='Condition'
              steps={copyConditions}
              value={copy?.condition ?? ''}
              onChange={(condition) =>
                save({ condition: condition || undefined })
              }
              clearable
            />
            <FormError message={error} small className='mt-2' />
          </div>
        </div>
        {moments.length > 0 && <CopyStory moments={moments} />}
      </div>
    </BookSection>
  );
}
