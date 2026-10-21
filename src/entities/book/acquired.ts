// The usual ways a book comes to someone, and what "from" means for each
// way where it means anything

export const ways = [
  { value: 'bought', label: 'Bought' },
  { value: 'gift', label: 'A gift' },
  { value: 'inherited', label: 'Inherited' },
  { value: 'found', label: 'Found it' },
  { value: 'swapped', label: 'Swapped' },
  { value: 'other', label: 'Other' },
];

// What "from" means for each way, where it means anything, and the word
// that joins it on in a sentence: "Bought at a little shop in Lisbon"
export const sources: Record<
  string,
  { label: string; placeholder: string; joiner: string }
> = {
  bought: {
    label: 'Where',
    placeholder: 'A little shop in Lisbon',
    joiner: 'at',
  },
  gift: {
    label: 'From',
    placeholder: 'Grandma, for my tenth birthday',
    joiner: 'from',
  },
  inherited: {
    label: 'From',
    placeholder: 'My grandfather’s shelves',
    joiner: 'from',
  },
  swapped: {
    label: 'With',
    placeholder: 'Anna, for her copy of Dune',
    joiner: 'with',
  },
};
