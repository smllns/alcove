import { useState, type ReactNode } from 'react';
import { updatePrivacy } from '@/entities/user/api';
import type { Audience, Privacy, User } from '@/entities/user/types';
import { useAuth } from '@/features/auth';
import { ChoiceCapsule } from '@/shared/ui/ChoiceCapsule';
import { FormError } from '@/shared/ui/FormError';
import { labelClass } from '@/shared/ui/fieldStyles';

const pageChoices: { value: Privacy['page']; label: string }[] = [
  { value: 'open', label: 'Open to everyone' },
  { value: 'ask', label: 'Ask to follow' },
];
const audienceChoices: { value: Audience; label: string }[] = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'followers', label: 'Followers' },
  { value: 'me', label: 'Only me' },
];

// Each part of the page with a say of its own, as it's put to the reader
const parts = [
  {
    key: 'books',
    label: 'Your books',
    about:
      'What’s on your shelves: recently added, favourite authors, all of them.',
  },
  {
    key: 'reading',
    label: 'Reading now',
    about: 'The books you’re reading, and since when.',
  },
  {
    key: 'stars',
    label: 'Your stars',
    about: 'The ratings you gave your books.',
  },
  {
    key: 'year',
    label: 'Your year in reading',
    about: 'How many books you’ve finished this year, and when.',
  },
  {
    key: 'quotes',
    label: 'Quotes',
    about: 'What you wrote down from your books.',
  },
] as const;

// Who may open the reader's page, and who sees each part of it, each
// changed with a tap and saved at once (shown chosen meanwhile). Lists keep
// their own say, on each list.
export function PageSettings({ user }: { user: User }) {
  const { replaceUser } = useAuth();
  const [pending, setPending] = useState<Partial<Privacy>>({});
  const [error, setError] = useState<string | null>(null);
  const shown = { ...user.privacy, ...pending };
  const change = async (next: Partial<Privacy>) => {
    setPending((was) => ({ ...was, ...next }));
    setError(null);
    try {
      replaceUser(await updatePrivacy(next));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That didn’t save.');
    }
    setPending((was) => {
      const left = { ...was };
      for (const key of Object.keys(next)) delete left[key as keyof Privacy];
      return left;
    });
  };

  return (
    <>
      <Row
        label='Your page'
        about='Anyone can see it, or only those you let follow you. Lists you make public show either way.'
      >
        <ChoiceCapsule
          label='Your page'
          words
          options={pageChoices}
          current={shown.page}
          onChange={(page) => void change({ page })}
        />
      </Row>
      {parts.map((part) => (
        <Row key={part.key} label={part.label} about={part.about}>
          <ChoiceCapsule
            label={part.label}
            words
            options={audienceChoices}
            current={shown[part.key]}
            onChange={(audience) => void change({ [part.key]: audience })}
          />
        </Row>
      ))}
      {error && <FormError message={error} className='px-5 pb-4 sm:px-6' />}
    </>
  );
}

// One of them in its row: what it is and what it covers, and its choices
// beside it (under it, on a phone)
function Row({
  label,
  about,
  children,
}: {
  label: string;
  about: string;
  children: ReactNode;
}) {
  return (
    <div className='flex flex-col gap-3 border-t border-line/70 px-5 py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6'>
      <div className='min-w-0'>
        <p className={labelClass}>{label}</p>
        <p className='mt-1 text-[0.8125rem] leading-relaxed text-muted'>
          {about}
        </p>
      </div>
      <div className='shrink-0'>{children}</div>
    </div>
  );
}
