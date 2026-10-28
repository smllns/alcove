# alcove

A personal library app: every book you own, where it lives at home, what you
thought of it. React 19, TypeScript, Vite, Tailwind CSS 4, TanStack Query,
react-three-fiber for the 3D books, GSAP for choreographed motion and View
Transitions between pages. The API is Express 5 on Node with MongoDB.

```sh
cp server/.env.example server/.env   # once; then fill in MONGODB_URI
npm run dev        # site on :5173 and API on :3001 together
npm run build      # typecheck + build site (dist/) and API (server/dist/)
npm start          # production: one server for the API and the built site
npm run typecheck
npm run lint
npm run format
npm test           # the API and the client's logic (vitest)
```

## What's in it

- **My books**: the shelf as a star chart (the "universe"), a grid of covers
  or a list; search, orders, sizes.
- **Places**: each home drawn as a section through the house, its rooms,
  bookcases and shelves, with the books on them; or the same as plain cards.
  Books are moved between shelves by arranging them (long press, or
  Arrange), and found with "Show on the shelf" from a book's page.
- **A book's page**: the reader's own copy (where it is, its state, notes,
  quotes, rating) kept apart from what's known about the book itself (about,
  author, lists it's in, what to read next), so a page for a book you don't
  own can reuse the second half.
- **Lists** and **Stats**: placeholders for now (`pages/library/plans.ts`).
- **Header**: a search over everything (⌘K): your own books, every book in
  Open Library (opening Add a book on the one chosen), readers (@name) and
  authors (leading to their books); the feed (a drawer; placeholder),
  settings and Add a book. The tabs end with the
  reader's own circle, leading to their profile (placeholder).
- **Settings**: profile (username, name), appearance (light or dark),
  places, sign-in, deleting the account. The theme toggle is in the header
  only for guests.

Readers sign up with a **username** (`@name`, unique, what others will find
them by); a name to be called by is optional and added in settings.
`callName(user)` (`entities/user/types.ts`) gives the name, or else the
`@username`.

## Structure

Code is grouped by what it's for, and imports only flow downward:
`app → pages → widgets → features → entities → shared`. A slice never
imports another slice of its own layer.

```
src/
  app/            App shell: providers, routes, the box each page scrolls in
  pages/          One folder per screen; page-only components live here
    landing/        Start page: hero, 3D books, preloader
    auth/           Log in and sign up
    welcome/        First steps after signing up: setting up places
    library/        The library's sections, one page for all of them
      views/          Grid, list, search, orders
      universe/       The star chart of books
      places/         Homes and rooms: drawing/, house/, room/, shelf/, cards/
    book/           A book's page and editing it
    add-book/       Search the catalogue, pick an edition and cover, add
    settings/       Account settings (index on the left, groups on sheets)
    not-found/
  widgets/        Larger blocks that several pages share
    library-header/ Header (search, feed, settings, add), the section tabs
    book-form/      The steps of adding or editing a book
  features/       Self-contained pieces of UI with behaviour of their own
    auth/           Who's signed in, route guards, leaving for home
    places/         Editing homes, rooms, bookcases and shelves; picking one
    lists/          A book's lists
    remove-book/
    book-scene/     3D floating books: model, motion, lighting, canvas textures
  entities/       Domain types, API calls and query hooks
    book/  user/  place/  list/
  shared/         No knowledge of books or pages
    api/            fetch wrapper and ApiError
    config/         paths.ts: every address in the app, in one place
    theme/          Light/dark theme: provider, toggle, circular reveal
    ui/             The building blocks (below)
    lib/            Helpers: motion, page scrolling, page transitions, forms…
  styles/         Global CSS, theme tokens, transitions, the sky, the rooms
```

Import across folders with the `@/` alias (`@/shared/ui/ButtonLink`); use
relative imports inside a folder. Modules with an `index.ts` (`shared/theme`,
`features/*`, `widgets/*`) are imported through it. Files stay small, around
200 lines at most, split by what each part does.

## Tests

`npm test` runs them all once (`npm run test:watch` keeps them running):

- **The API** (`server/test`): each file starts the real Express app on a
  free port and talks to it as the browser does, against a MongoDB made in
  memory for the run (`mongodb-memory-server`, started in
  `server/test/globalSetup.ts`). No real database, photo storage or rate
  limit is touched. `signUp()` in `server/test/api.ts` gives a fresh reader
  and their cookie.
- **The client's plain logic** (`src/**/*.test.ts`): searching your books,
  what a reader is called, keeping results while typing, plurals.

The MongoDB binary is fetched on the first run, not on install
(`config.mongodbMemoryServer` in `package.json`), so deploys stay quick.

Both the client and the server are type-checked in `strict` mode.

## Deploying (Vercel)

The site is static (Vite → `dist/`, served from Vercel's CDN). The API runs as
one serverless function, `api/index.ts`, which wraps the same Express app as
`server/src`; `vercel.json` sends `/api/*` to it and every other path to
`index.html`. The function connects to MongoDB on its first request and keeps
the connection while warm.

Project settings: framework preset **Vite**, defaults for everything else.
The function runs in São Paulo (`regions: ["gru1"]` in `vercel.json`), next
to the Atlas cluster (`sa-east-1`); keep the two together if either moves.
Environment variables: `MONGODB_URI` and `MONGODB_DB`. In MongoDB Atlas,
Network Access must allow `0.0.0.0/0`, since Vercel doesn't have fixed IPs.

Server code imports with `.js` extensions (`./app.js` for `app.ts`), the
standard for Node ESM, so it runs unchanged under tsx, plain Node and Vercel.

## Books and covers

Book details come from [Open Library](https://openlibrary.org): search finds
works, then the reader picks an edition (English, with a cover and ISBN, comes
first). Answers are cached in the `lookupCache` collection for days.

Photos people upload go to **Vercel Blob**. In Vercel: Storage → Create → Blob,
connect it to the project; that adds `BLOB_READ_WRITE_TOKEN`. Copy the same
token into `server/.env` for local uploads. Without it the upload button is
simply hidden. Photos are shrunk in the browser before they're sent.

Data on the client goes through TanStack Query (`entities/book/queries.ts`), so
pages show cached data instantly and refresh in the background.

## Server

```
server/src/
  index.ts        Connects to MongoDB, then listens
  app.ts          Express app: security headers, JSON-only writes, routes
  config.ts       Environment variables, validated at startup
  db.ts           Mongo client, collection types, indexes
  auth/           Register, log in, log out, current user; sessions
  account/        Change username, name, email, password; delete the account
  books/          A reader's books and their copies: list (paged), add, edit
  places/         The tree of homes, rooms, bookcases and shelves
  lists/          The reader's lists of books
  users/          Other readers, found by @username or name
  lookup/         Open Library, Wikipedia, Wikimedia and Wikiquote, cached
  uploads/        Cover photos in Vercel Blob
  lib/            Password hashing, rate limits, validation, error responses
```

API, all under `/api`:

| Method | Path                            | Body                               | Returns                                   |
| ------ | ------------------------------- | ---------------------------------- | ----------------------------------------- |
| GET    | `/health`                       |                                    | `{ ok }` if Mongo is up                   |
| POST   | `/auth/register`                | `{ username, email, password }`    | `{ user }` + cookie                       |
| POST   | `/auth/login`                   | `{ email, password }`              | `{ user }` + cookie                       |
| POST   | `/auth/logout`                  |                                    | 204, cookie cleared                       |
| GET    | `/auth/me`                      |                                    | `{ user }` or 401                         |
| PATCH  | `/account/username`             | `{ username }`                     | `{ user }`, or 409 if taken               |
| PATCH  | `/account/name`                 | `{ name }` (empty clears it)       | `{ user }`                                |
| PATCH  | `/account/email`                | `{ email, password }`              | `{ user }`                                |
| PATCH  | `/account/password`             | `{ currentPassword, newPassword }` | 204; other devices signed out             |
| DELETE | `/account`                      | `{ password }`                     | 204, account and everything in it gone    |
| GET    | `/books?after=`                 |                                    | `{ books, nextCursor, total }`, 48 a page |
| POST   | `/books`                        | the book and the reader's copy     | `{ book }`                                |
| GET    | `/books/by-writer?name=`        |                                    | `{ books }`                               |
| GET    | `/books/:id`                    |                                    | `{ book }`                                |
| PUT    | `/books/:id`                    | the book and the reader's copy     | `{ book }`                                |
| DELETE | `/books/:id`                    |                                    | 204                                       |
| GET    | `/places`                       |                                    | `{ homes, counts }`                       |
| PUT    | `/places`                       | `{ homes }` (the whole tree)       | `{ homes, counts, created }`              |
| GET    | `/lists`                        |                                    | every list, with counts                   |
| POST   | `/lists`                        | `{ name }`                         | `{ list }` and every list                 |
| PATCH  | `/lists/:id`                    | `{ name }`                         | every list                                |
| DELETE | `/lists/:id`                    |                                    | every list                                |
| GET    | `/lookup/search?q=`             | title, author or ISBN              | `{ results, isbnEdition }`                |
| GET    | `/lookup/authors?q=`            |                                    | `{ authors }`, writers by name            |
| GET    | `/lookup/works/:key/editions`   |                                    | `{ editions }`, best first                |
| GET    | `/lookup/works/:key`            |                                    | `{ description, genres }`                 |
| GET    | `/lookup/works/:key/ratings`    |                                    | `{ ratings }`                             |
| GET    | `/lookup/works/:key/author`     |                                    | `{ author }`                              |
| GET    | `/lookup/works/:key/lists`      |                                    | lists on Open Library it's in             |
| GET    | `/lookup/works/:key/similar`    |                                    | books to read next                        |
| GET    | `/lookup/quotes?title=&author=` |                                    | `{ quotes, source }` from Wikiquote       |
| GET    | `/users/search?q=`              | `@username` or name                | `{ readers }`                             |
| GET    | `/uploads/status`               |                                    | `{ enabled }`                             |
| POST   | `/uploads/cover`                | `{ image }` (data URL)             | `{ url }`                                 |
| POST   | `/uploads/cover/fetch`          | `{ url }`                          | the picture, for the browser to shrink    |
| POST   | `/uploads/cover/discard`        | `{ url }`                          | 204                                       |

Errors look like `{ error: { code, message, fields? } }`; `fields` maps form
fields to messages.

Sessions are random tokens in an httpOnly, SameSite=Lax cookie (Secure in
production), kept for 30 days and extended while in use. Mongo stores only a
SHA-256 of each token and expires old ones itself. Passwords are hashed with
scrypt. Writes must be JSON, which together with SameSite blocks cross-site form
posts, and login/register allow 20 tries per 15 minutes per IP.

In development Vite proxies `/api` to the API, so the browser sees one origin.

On the client, `shared/api/http.ts` wraps fetch, `entities/*/api.ts` have the
calls and `entities/*/queries.ts` the TanStack Query hooks, and
`features/auth` holds `AuthProvider`, `useAuth()` and the route guards
(`RequireAuth`, `GuestOnly`) used in `app/router.tsx`.

## Theme

Colours are CSS variables in `src/styles/theme.css`, with a light palette on
`:root` ("warm paper") and a dark one on `:root[data-theme='dark']`
("lamplight"). They're mapped to Tailwind colours, so components use
`text-ink`, `bg-surface/80`, `border-line` and never hard-code hex values.
Other helpers there: `bg-paper` (page backdrop), `text-glow` (readable over
busy art), `aged-paper`.

An inline script in `index.html` picks the theme before first paint (the
saved choice, else the device's). `ThemeProvider` takes over from there:
`useTheme()` gives `{ theme, choice, choose(choice, origin), toggleTheme }`,
where a choice is `light`, `dark` or `system` (following the device as it
changes). The new palette grows out of `origin` in a soft-edged circle
(`shared/theme/circularReveal.ts`). `data-palette='light' | 'dark'` puts one
palette on a single element whatever the page's, as the previews in settings
do.

## Motion

- **Between pages**: View Transitions (`shared/lib/pageTransition.ts`,
  `styles/transitions*.css`): `onward` turns the page under the pinned header
  and tabs, `swap` fades in place, `back` is the curtain home. Each page
  scrolls in a box of its own (`app/PageScroll`, `shared/lib/pageScroll.ts`),
  so a page turn never jumps.
- **Within a page**: GSAP (`shared/lib/gsap.ts`) for anything choreographed,
  like books moving between shelves (`places/shelf/useBookMoves.ts`).
- **Nothing jumps or blinks**: what comes and goes fades or folds
  (`Collapse`, `SmoothHeight`), and anything floating keeps its room.

## Building blocks

Reach for these (`src/shared/ui`) before writing new markup or logic:

- **Page top**: `<BackLink to=… returns />`, then `<Eyebrow>`, `<PageTitle>`,
  `<Lead>` from `PageHeading`. Each takes `rise={ms}` for the fade-up
  entrance. `InnerPage` is a whole page one step in from the library.
- **Surfaces** (`surfaces.ts`): `floatingClass` / `capsuleClass` for controls
  over the content, `raisedClass` for menus, `sheetClass` for big frosted
  sheets, `paperClass`, `outlineCardClass`, `pageWidthClass`.
- **Buttons**: `<Button>` and `<ButtonLink>` with `variant` `primary`,
  `secondary`, `pill` or `danger`; `IconButton`; `ChoiceCapsule`,
  `ChoiceToggle` and `choiceClass` for choices; `textLinkClass` for words
  in a line of text that lead somewhere.
- **Over the page**: `Modal` (built on `<dialog>`, moved with GSAP:
  `motion` `rise`, `sheet` or `slide`; from below on a phone, pulled back
  down by its top, `usePullDown`), `ConfirmDialog`, `Drawer`
  (slides in from the right, or the bottom on a phone), `Popover` and
  `PopoverSearch`, `Tooltip`.
- **Forms**: `useForm(initial, submit)` from `shared/lib/useForm` gives field
  props, server errors per field, a general error and a short "saved" state.
  Fields: `TextField`, `PasswordField`, `TextArea`, `Select`, `DateField`,
  `FormError`; `Collapse` to reveal extra ones.
- **Readers**: `Avatar`.
- **Moving between pages**: `TransitionLink` / `ButtonLink` /
  `useTransitionNavigate`; `useGoBack(fallback)` goes back the way the reader
  came. Addresses only from `shared/config/paths.ts`. To end a session and go
  home, `useLeaveForHome()` from `features/auth`.
- **Words**: `plural` / `counted` from `shared/lib/plural`; `<Typewriter>`
  for text that changes in place.

## Adding a page

Create `src/pages/<name>/<Name>Page.tsx`, add it to `src/app/router.tsx`
(inside `RequireAuth` if it needs a signed-in reader) with its address in
`shared/config/paths.ts`, start it with `InnerPage` or `LibraryHeader`, and
build it from `shared/ui`. Anything another page will need too goes down to
`widgets/`, `features/` or `shared/`, not into the page folder.
