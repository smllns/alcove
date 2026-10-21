import { formatLabel } from '@/entities/book/formats';
import { languageName } from '@/entities/book/languages';
import type { CatalogueEdition } from '@/entities/book/types';
import { Select } from '@/shared/ui/Select';

type EditionSelectProps = {
  editions: CatalogueEdition[];
  value?: string;
  // null: none of these, the reader will type the details in
  onChange: (edition: CatalogueEdition | null) => void;
};

const describe = (e: CatalogueEdition) =>
  [
    e.publisher ?? 'Unknown publisher',
    e.format && formatLabel(e.format),
    e.publishedYear,
    e.pages && `${e.pages} pages`,
    e.language && e.language !== 'eng' && languageName(e.language),
  ]
    .filter(Boolean)
    .join(' · ');

// None of these: the details are the reader's to type in
const NOT_LISTED = 'not-listed';
const notListed = 'Not listed — I’ll fill it in myself';

// Which printing is on the shelf. Picking one fills in its ISBN, publisher,
// year, page count and cover; "not listed" clears them for typing in.
export function EditionSelect({
  editions,
  value,
  onChange,
}: EditionSelectProps) {
  return (
    <Select
      label={`Edition · ${editions.length} found`}
      value={value ?? NOT_LISTED}
      options={[
        { value: NOT_LISTED, label: notListed, muted: true },
        ...editions.map((edition) => ({
          value: edition.editionKey,
          label: describe(edition),
        })),
      ]}
      onChange={(key) =>
        onChange(editions.find((ed) => ed.editionKey === key) ?? null)
      }
      placeholder={notListed}
    />
  );
}
