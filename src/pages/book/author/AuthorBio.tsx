import type { CatalogueAuthor } from '@/entities/book/types';
import { Fold } from '@/shared/ui/Fold';
import { BookSection } from '../BookSection';
import { SourceCredit } from '../SourceCredit';

// The first lines about a writer, at the top of their page under a
// heading as every part of it has, folded after a few, and where they're
// from
export function AuthorBio({ author }: { author: CatalogueAuthor }) {
  return (
    <BookSection title='About'>
      <div className='max-w-2xl'>
        <div lang={author.bioLanguage}>
          <Fold
            lines={5}
            className='whitespace-pre-line font-serif text-base leading-relaxed text-ink-soft'
          >
            {author.bio}
          </Fold>
        </div>
        {author.wikipedia && (
          <SourceCredit
            source='Wikipedia'
            href={author.wikipedia}
            className='mt-2'
          />
        )}
      </div>
    </BookSection>
  );
}
