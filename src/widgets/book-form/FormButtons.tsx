import { ArrowLeft, ArrowRight } from 'lucide-react';
import { softSwitchFromTop } from '@/shared/lib/softSwitch';
import { Button } from '@/shared/ui/Button';
import type { Step } from './StepHeading';

// The buttons under the form. Adding: on to the copy, then add it (or back
// to the book). Changing a book: save, cancel, or over to the other step
// from down here too, not just the top.
export function FormButtons({
  step,
  onStep,
  editing,
  saving,
  onBack,
}: {
  step: Step;
  onStep: (step: Step) => void;
  editing: boolean;
  saving: boolean;
  onBack: () => void;
}) {
  if (editing)
    return (
      <div className='flex flex-wrap items-center gap-3'>
        <Button type='submit' loading={saving}>
          Save changes
        </Button>
        <Button variant='pill' onClick={onBack}>
          Cancel
        </Button>
        <Button
          variant='pill'
          onClick={() =>
            softSwitchFromTop(() => onStep(step === 'book' ? 'copy' : 'book'))
          }
          className='sm:ml-auto'
        >
          {step === 'book' ? (
            <>
              Your copy
              <ArrowRight size={15} />
            </>
          ) : (
            <>
              <ArrowLeft size={15} />
              The book
            </>
          )}
        </Button>
      </div>
    );

  return (
    <div className='flex flex-wrap items-center gap-3'>
      {step === 'book' ? (
        <>
          {/* Submitting this step moves on to the next */}
          <Button type='submit' arrow>
            Next: your copy
          </Button>
          <Button variant='pill' onClick={onBack}>
            Choose another book
          </Button>
        </>
      ) : (
        <>
          <Button type='submit' arrow loading={saving}>
            Add to library
          </Button>
          <Button variant='pill' onClick={() => onStep('book')}>
            <ArrowLeft size={15} />
            The book
          </Button>
        </>
      )}
    </div>
  );
}
