export type AuthMode = 'login' | 'register';

// Everything that changes between log in and sign up. The title only swaps
// its first word: "Open / Start" + "your library".
export const authCopy = {
  login: {
    eyebrow: 'Welcome back',
    titleVerb: 'Open',
    lead: 'Your shelves are just where you left them.',
    submit: 'Log in',
    switchPrompt: 'New to alcove?',
    switchLink: 'Start a library',
    headerSwitch: 'Sign up',
    switchTo: '/register',
  },
  register: {
    eyebrow: 'A library of your own',
    titleVerb: 'Start',
    lead: 'Keep track of every book you own, lend and love.',
    submit: 'Create my library',
    switchPrompt: 'Already have an account?',
    switchLink: 'Log in',
    headerSwitch: 'Log in',
    switchTo: '/login',
  },
} satisfies Record<AuthMode, Record<string, string>>;
