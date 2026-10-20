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

// What "from" means for each way, where it means anything
export const sources: Record<string, { label: string; placeholder: string }> = {
  bought: { label: 'Where', placeholder: 'A little shop in Lisbon' },
  gift: { label: 'From', placeholder: 'Grandma, for my tenth birthday' },
  inherited: { label: 'From', placeholder: 'My grandfather’s shelves' },
  swapped: { label: 'With', placeholder: 'Anna, for her copy of Dune' },
};
