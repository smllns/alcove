import type { CatalogueEdition } from '@/entities/book/types';
import { SelectField } from '@/shared/ui/SelectField';

type EditionSelectProps = {
  editions: CatalogueEdition[];
  value?: string;
  // null: none of these, the reader will type the details in
  onChange: (edition: CatalogueEdition | null) => void;
};

const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });
const languageName = (code: string) => {
  try {
    // Open Library uses three-letter MARC codes; most match ISO 639-2
    return languageNames.of(code) ?? code;
  } catch {
    return code;
  }
};

const describe = (e: CatalogueEdition) =>
  [
    e.publisher ?? 'Unknown publisher',
    e.publishedYear,
    e.pages && `${e.pages} pages`,
    e.language && e.language !== 'eng' && languageName(e.language),
  ]
    .filter(Boolean)
    .join(' · ');

// Which printing is on the shelf. Picking one fills in its ISBN, publisher,
// year, page count and cover; "not listed" clears them for typing in.
export function EditionSelect({
  editions,
  value,
  onChange,
}: EditionSelectProps) {
  return (
    <SelectField
      label={`Edition · ${editions.length} found`}
      value={value ?? ''}
      onChange={(e) =>
        onChange(
          editions.find((ed) => ed.editionKey === e.target.value) ?? null,
        )
      }
    >
      <option value=''>Not listed — I’ll fill it in myself</option>
      {editions.map((edition) => (
        <option key={edition.editionKey} value={edition.editionKey}>
          {describe(edition)}
        </option>
      ))}
    </SelectField>
  );
}
