// How a username is asked for, wherever it is (signing up, settings): as
// typed, no capitals or corrections forced on it, an @ to start from
export const usernameField = {
  label: 'Username',
  autoComplete: 'username',
  autoCapitalize: 'none',
  spellCheck: false,
  placeholder: '@',
  hint: 'How other readers find you. Letters, numbers and _.',
} as const;
