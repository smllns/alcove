import { ArrowLeftRight } from 'lucide-react';
import { ChoiceToggle } from '@/shared/ui/ChoiceToggle';
import type { Arranging } from './arranging';

// Over the books it arranges: arranging them, or done with it; a book held
// on turns it on too
export function ArrangeButton({ arranging }: { arranging: Arranging }) {
  return (
    <ChoiceToggle
      on={arranging.on}
      onChange={arranging.turn}
      icon={<ArrowLeftRight size={14} />}
      label={arranging.on ? 'Done' : 'Arrange'}
    />
  );
}
