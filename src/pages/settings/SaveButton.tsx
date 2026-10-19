import { Button } from '@/shared/ui/Button';
import { Typewriter } from '@/shared/ui/Typewriter';

type SaveButtonProps = {
  status: 'idle' | 'saving' | 'saved';
  label?: string;
  disabled?: boolean;
};

// Submit button that types "Saved" for a moment after a successful save
export function SaveButton({
  status,
  label = 'Save',
  disabled,
}: SaveButtonProps) {
  return (
    <Button
      type='submit'
      variant='secondary'
      loading={status === 'saving'}
      disabled={disabled}
      className='self-start'
    >
      <Typewriter text={status === 'saved' ? 'Saved' : label} />
    </Button>
  );
}
