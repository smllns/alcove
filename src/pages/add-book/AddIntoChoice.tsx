import { ChoiceCapsule } from '@/shared/ui/ChoiceCapsule';

// Over the search: whether the book goes into the library, or only into a
// list (`list`, its name), not having it yet
export function AddIntoChoice({
  list,
  only,
  onChange,
}: {
  list: string;
  only: boolean;
  onChange: (only: boolean) => void;
}) {
  return (
    <ChoiceCapsule
      label='Add it to'
      words
      options={[
        { value: 'library', label: 'My library' },
        { value: 'list', label: `Only ${list}` },
      ]}
      current={only ? 'list' : 'library'}
      onChange={(to) => onChange(to === 'list')}
      className='mb-6 w-fit'
    />
  );
}
