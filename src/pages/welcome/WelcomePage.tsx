import { cn } from '@/shared/lib/cn';
import { pageWidthClass } from '@/shared/ui/surfaces';
import { usePlaces } from '@/entities/place/queries';
import { useAuth } from '@/features/auth';
import { PlacesEditor, PlacesExample } from '@/features/places';
import { useTransitionNavigate } from '@/shared/lib/useTransitionNavigate';
import { Button } from '@/shared/ui/Button';
import { Eyebrow, PageTitle } from '@/shared/ui/PageHeading';
import { SiteHeader } from '@/shared/ui/SiteHeader';
import { Loading } from '@/shared/ui/Loading';
import { paths } from '@/shared/config/paths';

const steps = [
  {
    title: 'Start with a home',
    text: 'A flat, a house, your parents’ place. It’s the only part you need.',
  },
  {
    title: 'Go as deep as you like',
    text: 'Add rooms, then bookcases, then shelves, if you want to find a book in seconds.',
  },
  {
    title: 'Change it any time',
    text: 'Rename, add or remove places in Settings, or right while adding a book.',
  },
];

// Right after signing up: name the places books are kept, so they can be
// sorted onto the right shelves from the first one added. Skippable, since
// it all lives in settings too.
export function WelcomePage() {
  const { user } = useAuth();
  const places = usePlaces();
  const navigate = useTransitionNavigate();
  const toLibrary = () => navigate(paths.library, 'forward', { replace: true });

  return (
    <main className='bg-paper min-h-screen text-ink'>
      <SiteHeader home={paths.library} />

      <div className={cn('pb-24 pt-4 sm:pt-8', pageWidthClass)}>
        <Eyebrow rise={0}>Welcome, {user?.name}</Eyebrow>
        <PageTitle rise={80} className='mt-3 sm:mt-4'>
          Where do your books live?
        </PageTitle>
        {/* Bigger and darker than a usual lead: this is what the page is for */}
        <p
          className='mt-5 max-w-3xl animate-rise text-lg leading-8 text-ink-soft sm:text-xl sm:leading-9'
          style={{ animationDelay: '160ms' }}
        >
          Tell us where your books are kept, and we’ll sort your library the
          same way. You’ll always know which shelf a book is on.
        </p>

        {/* One column on phones; on a laptop the steps, the example and the
            editor sit side by side, so it all fits without scrolling */}
        <div className='mt-10 grid items-start gap-10 lg:grid-cols-2 lg:gap-x-12 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,19rem)_minmax(0,1.15fr)] xl:gap-x-14'>
          <ol
            className='grid animate-rise gap-6 sm:grid-cols-3 lg:grid-cols-1'
            style={{ animationDelay: '200ms' }}
          >
            {steps.map((step, i) => (
              <li key={step.title} className='flex gap-4'>
                <span className='grid size-8 shrink-0 place-items-center rounded-full border border-line font-serif text-base text-ink-soft'>
                  {i + 1}
                </span>
                <div>
                  <p className='font-serif text-xl leading-8 tracking-[-0.01em] text-ink'>
                    {step.title}
                  </p>
                  <p className='mt-1 text-base leading-7 text-ink-soft'>
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <PlacesExample
            className='animate-rise lg:col-start-1 lg:row-start-2 xl:col-start-2 xl:row-start-1'
            style={{ animationDelay: '280ms' }}
          />

          <div
            className='animate-rise lg:col-start-2 lg:row-span-2 lg:row-start-1 xl:col-start-3 xl:row-span-1'
            style={{ animationDelay: '320ms' }}
          >
            {places.isPending ? (
              <Loading />
            ) : (
              <PlacesEditor
                homes={places.data?.homes ?? []}
                counts={places.data?.counts ?? {}}
                startBlank
                submitLabel='Save and open my library'
                onSaved={toLibrary}
                secondary={
                  <Button variant='pill' onClick={toLibrary}>
                    Set up later
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
