import {
  loadDescriptionLabel,
  useCatalogueDescription,
} from '@/entities/book/catalogueQueries';
import { AddButton } from '@/shared/ui/ListControls';
import { TextArea } from '@/shared/ui/TextArea';
import type { DraftForm } from './BookForm';

// What the book is about, in a few lines. A book from the catalogue comes
// with the catalogue's description already filled in; one without it (an
// older book, say) can ask the catalogue for it.
export function AboutField({
  form,
  workKey,
}: {
  form: DraftForm;
  // The book in the catalogue, if it's there
  workKey?: string;
}) {
  const catalogue = useCatalogueDescription(workKey);
  const value = form.values.description;
  const fromCatalogue = Boolean(catalogue.known) && value === catalogue.known;
  const canAsk = catalogue.available && !value.trim();

  const ask = async () => {
    const description = await catalogue.load();
    if (description) form.setValue('description', description);
  };

  const hint = fromCatalogue
    ? 'From Open Library. Make it your own if you like.'
    : catalogue.missing
      ? 'Open Library doesn’t describe this one. Write a few lines yourself?'
      : catalogue.failed
        ? 'Open Library didn’t answer. Try again in a moment.'
        : undefined;

  return (
    <TextArea
      label='What it’s about'
      placeholder='The story in a few lines, ideally without spoilers.'
      hint={hint}
      action={
        canAsk && (
          <AddButton
            onClick={() => void (catalogue.loading || ask())}
            className='-my-1'
          >
            {loadDescriptionLabel(catalogue.loading)}
          </AddButton>
        )
      }
      {...form.field('description')}
    />
  );
}
