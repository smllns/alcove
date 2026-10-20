import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { labelClass } from '@/shared/ui/fieldStyles';

// A made-up set of places, to show how the levels fit together before the
// reader names their own
const example = [
  {
    name: 'Flat in Berlin',
    rooms: [
      {
        name: 'Living room',
        units: [
          { name: 'Tall bookcase', shelves: ['1', '2', '3'] },
          { name: 'Coffee table' },
        ],
      },
      { name: 'Bedroom', units: [{ name: 'Bedside table' }] },
    ],
  },
  { name: 'Cottage by the sea', rooms: [{ name: 'Sunroom', units: [] }] },
];

const Tag = ({ children }: { children: string }) => (
  <span className='mr-2 text-[10px] uppercase tracking-[0.2em] text-muted'>
    {children}
  </span>
);

const Branch = ({ children }: { children: ReactNode }) => (
  <div className='ml-1.5 border-l border-line pl-4'>{children}</div>
);

export function PlacesExample({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={style}
      className={cn(
        'rounded-2xl border border-line bg-surface/50 px-5 py-4 text-[15px] leading-7',
        className,
      )}
    >
      <p className={cn('mb-2', labelClass)}>For example</p>
      {example.map((home) => (
        <div key={home.name}>
          <p className='font-serif text-lg text-ink'>
            <Tag>Home</Tag>
            {home.name}
          </p>
          <Branch>
            {home.rooms.map((room) => (
              <div key={room.name}>
                <p className='text-ink-soft'>
                  <Tag>Room</Tag>
                  {room.name}
                </p>
                <Branch>
                  {room.units.map((unit) => (
                    <div key={unit.name}>
                      <p className='text-ink-soft'>
                        <Tag>Bookcase</Tag>
                        {unit.name}
                      </p>
                      {unit.shelves && (
                        <Branch>
                          <p className='text-ink-soft'>
                            <Tag>Shelves</Tag>
                            {unit.shelves.join(', ')}
                          </p>
                        </Branch>
                      )}
                    </div>
                  ))}
                </Branch>
              </div>
            ))}
          </Branch>
        </div>
      ))}
    </div>
  );
}
