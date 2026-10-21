import { Collapse } from '@/shared/ui/Collapse';

// Under something being written in place, which reads just as it will once
// kept: how to keep it, or not. Opens and folds away softly.
export function EditingHint({ show }: { show: boolean }) {
  return (
    <Collapse open={show}>
      <p className='mt-2 border-t border-line pt-2 text-xs text-faint'>
        Click anywhere else to keep it, or press Esc to leave it as it was.
      </p>
    </Collapse>
  );
}
