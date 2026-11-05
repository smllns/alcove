import type { OurEdition } from '@/entities/book/ourEdition';
import { labelClass } from '@/shared/ui/fieldStyles';
import { SearchResult } from './SearchResult';

// Under what Open Library found, printings alcove knows and it doesn't
// (added by readers before): each to pick, opening the form with all
// that's printed in it filled in
export function OurResults({
  editions,
  onPick,
}: {
  editions: OurEdition[];
  onPick: (edition: OurEdition) => void;
}) {
  if (!editions.length) return null;
  return (
    <div className='mt-6'>
      <p className={labelClass}>Known to alcove</p>
      <ul className='mt-2'>
        {editions.map((edition) => (
          <li key={edition.isbn}>
            <SearchResult
              work={{
                workKey: `isbn-${edition.isbn}`,
                title: edition.title,
                authors: edition.authors,
                coverUrl: edition.coverUrl,
                firstPublishYear:
                  edition.firstPublishedYear ?? edition.publishedYear,
                editionCount: 1,
              }}
              onPick={() => onPick(edition)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
