import { ChoiceCapsule } from '@/shared/ui/ChoiceCapsule';

// The years to choose between, the latest last
const YEARS = 5;

// The year a chapter shows, over its drawing: the latest few to choose
// from (`years`, the latest first), nothing when there's only the one
export function YearSwitch({
  years,
  year,
  onChange,
}: {
  years: number[];
  year: number;
  onChange: (year: number) => void;
}) {
  if (years.length < 2) return null;
  return (
    <ChoiceCapsule
      label='Year'
      words
      className='mt-6 w-fit'
      current={String(year)}
      onChange={(next) => onChange(Number(next))}
      options={years
        .slice(0, YEARS)
        .reverse()
        .map((each) => ({ value: String(each), label: String(each) }))}
    />
  );
}
