import { useState } from 'react';
import { Search } from 'lucide-react';
import { useCatalogueSearch } from '@/entities/book/catalogueQueries';
import type { CatalogueEdition, CatalogueWork } from '@/entities/book/types';
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue';
import { RemoveButton } from '@/shared/ui/ListControls';
import { Spinner } from '@/shared/ui/Spinner';
import { SearchResult } from './SearchResult';
import { FormError } from '@/shared/ui/FormError';

type CatalogueSearchProps = {
  onPick: (work: CatalogueWork, isbnEdition?: CatalogueEdition) => void;
  onManual: () => void;
};

// Search as you type, by title, author or ISBN
export function CatalogueSearch({ onPick, onManual }: CatalogueSearchProps) {
  const [query, setQuery] = useState('');
  const settled = useDebouncedValue(query.trim(), 350);
  const search = useCatalogueSearch(settled);
  const results = search.data?.results ?? [];
  const searching =
    settled.length >= 2 && (search.isFetching || settled !== query.trim());

  return (
    <div>
      <label className='flex items-center gap-3 border-b border-line pb-3 transition-colors duration-500 ease-soft focus-within:border-ink'>
        <Search size={20} className='shrink-0 text-faint' />
        <input
          autoFocus
          type='search'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Title, author or ISBN'
          aria-label='Search for a book'
          className='min-w-0 flex-1 bg-transparent font-serif text-2xl tracking-[-0.02em] text-ink outline-none placeholder:text-faint sm:text-3xl'
        />
        {searching ? (
          <Spinner />
        ) : (
          query && (
            <RemoveButton onClick={() => setQuery('')} label='Clear search' />
          )
        )}
      </label>

      <div className='mt-6 min-h-40'>
        {search.isError ? (
          <FormError message={search.error.message} />
        ) : settled.length < 2 ? (
          <p className='text-sm text-muted'>
            Start typing and pick your book from the list.
          </p>
        ) : results.length === 0 && !searching ? (
          <p className='text-sm text-muted'>Nothing found for “{settled}”.</p>
        ) : (
          <ul
            className={
              searching ? 'opacity-60 transition-opacity' : 'transition-opacity'
            }
          >
            {results.map((work, i) => (
              <li key={work.workKey}>
                <SearchResult
                  work={work}
                  // An ISBN search's exact printing belongs to its top result
                  onPick={() =>
                    onPick(
                      work,
                      i === 0
                        ? (search.data?.isbnEdition ?? undefined)
                        : undefined,
                    )
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className='mt-8 text-sm text-muted'>
        Can’t find it?{' '}
        <button
          type='button'
          onClick={onManual}
          className='cursor-pointer text-ink underline-offset-4 hover:underline'
        >
          Add it by hand
        </button>
      </p>
    </div>
  );
}
