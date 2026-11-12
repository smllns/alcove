import type { News, NewsInput } from '@/entities/news/types';
import { useForm } from '@/shared/lib/useForm';
import { Button } from '@/shared/ui/Button';
import { FormError } from '@/shared/ui/FormError';
import { QuietButton } from '@/shared/ui/ListControls';
import { TextArea } from '@/shared/ui/TextArea';
import { TextField } from '@/shared/ui/TextField';

// A piece of alcove's news written, or one already out changed (`editing`):
// its headline, a few lines, and, if it has one, a way on (what it says,
// and where it goes: a page of alcove, /…, or the web, https://…). Saved
// by `save`; let go of (`onCancel`), when it's one being changed.
export function NewsForm({
  editing,
  save,
  onCancel,
}: {
  editing?: News;
  save: (input: NewsInput) => Promise<unknown>;
  onCancel?: () => void;
}) {
  const form = useForm(
    {
      title: editing?.title ?? '',
      body: editing?.body ?? '',
      label: editing?.link?.label ?? '',
      to: editing?.link?.to ?? '',
    },
    async ({ title, body, label, to }) =>
      save({
        title,
        body,
        ...(label.trim() && to.trim()
          ? { link: { label: label.trim(), to: to.trim() } }
          : {}),
      }),
    { clearOnSuccess: editing ? [] : ['title', 'body', 'label', 'to'] },
  );
  return (
    <form onSubmit={form.onSubmit} noValidate className='flex flex-col gap-5'>
      <TextField label='Headline' {...form.field('title')} />
      <TextArea label='What’s new' {...form.field('body')} />
      <div className='grid gap-5 sm:grid-cols-[1fr_1.4fr]'>
        <TextField
          label='Button'
          placeholder='Open Places'
          hint='Optional'
          {...form.field('label')}
          error={form.errors['link.label']}
        />
        <TextField
          label='Goes to'
          placeholder='/library/places or https://…'
          {...form.field('to')}
          error={form.errors['link.to']}
        />
      </div>
      <FormError message={form.formError} />
      <div className='flex items-center gap-4'>
        <Button type='submit' loading={form.status === 'saving'}>
          {editing ? 'Save' : 'Publish'}
        </Button>
        {onCancel && (
          <QuietButton onClick={onCancel} className='text-sm'>
            Cancel
          </QuietButton>
        )}
        {form.status === 'saved' && !editing && (
          <span className='text-sm text-muted'>Published to every feed.</span>
        )}
      </div>
    </form>
  );
}
