# alcove

A personal library app: every book you own, where it lives at home, what you
thought of it, and the readers you follow. React 19, TypeScript, Vite,
Tailwind CSS 4, TanStack Query, react-three-fiber for the 3D books, GSAP for
choreographed motion and View Transitions between pages. The API is Express 5
on Node with MongoDB.

```sh
cp server/.env.example server/.env   # once; then fill in MONGODB_URI
npm run dev        # site on :5173 and API on :3001 together
npm run build      # typecheck + build site (dist/) and API (server/dist/)
npm start          # production: one server for the API and the built site
npm run typecheck
npm run lint
npm run format
npm test           # the API, the client's logic, contrast and type sizes (vitest)
```

## What's in it

- **My books**: the shelf as a star chart (the "universe", writers' books
  joined in constellations), a grid of covers or a list; search, orders,
  sizes, a filter for books read but not owned.
- **Places**: each home drawn as a section through the house, its rooms,
  bookcases and shelves, with the books on them; or the same as plain cards.
  Books are moved between shelves by arranging them (long press, or
  Arrange), and found with "Show on the shelf" from a book's page.
- **Lists**: the reader's own lists (Want to read among them), other
  readers' public lists, lists kept from others, Open Library's lists and
  readers' lists there; books the catalogue doesn't have can be typed in.
- **Stats**: an almanac in chapters: the books stacked up against the house
  (or a block of flats), pages per month, start to finish, how books came,
  decades, lengths, publishers, writers; for all books, one home, or what was
  read in a year.
- **A book's page**: the reader's own copy (where it is, its state, notes,
  quotes, rating, review) kept apart from what's known about the book itself
  (about, author, series, lists it's in, what to read next, other readers'
  reviews with hearts, ratings from Open Library and alcove together).
- **A book not on your shelves** (`/library/works/:key`, from the search,
  read-next and the author's other books): the same page with only what the
  catalogue knows, a band across the cover's corner saying _Not added_ and
  _Add to my library_ under it. One you own leads to your copy, its band
  saying _In library_.
- **An author's page**: their life, a timeline of their books (the reader's
  own marked, with the stars they gave), quotes, and their books as other
  readers of alcove have them. A writer is one writer however their name is
  spelled or written (Wikidata's names for them, in every script).
- **A reader's page** (`/library/readers/:username`, the reader's own at
  `/library/profile`): photo, name, about, books · followers · following,
  top four favourite books (dragged into order), favourite writers, what
  they're reading, their year, lists, quotes and books in common. Each part
  is shown to everyone, followers or only them; a closed page asks to be
  followed (Request → Accept / Decline). The reader edits it in place.
- **Feed** (a drawer in the header): what those you follow did with their
  books since you followed them (added, started, finished, reviewed), as far
  as each lets followers see, what was done for you (a heart on your review,
  a follow, a request, with Accept / Decline there), and alcove's own news.
  A dot shows when something is new.
- **Header**: a search over everything (⌘K): your own books, every book in
  Open Library (opening Add a book on the one chosen), readers (@name) and
  authors; the feed, settings and Add a book (by search, ISBN or barcode
  scan). The tabs end with the reader's own circle, leading to their page.
- **Settings**: profile (edited on the reader's page), appearance (light,
  dark or the device's), places, library (import from Goodreads or
  StoryGraph, with undo; removing every book), sign-in, deleting the
  account; and for alcove's team, **News** (`/settings/news`: write, edit,
  take down).

Readers sign up with a **username** (`@name`, unique, what others will find
them by); a name to be called by is optional. `callName(user)`
(`entities/user/types.ts`) gives the name, or else the `@username`.

Where Open Library has nothing (a cover, a description, a book at all),
what readers of alcove gave it is used for everyone: alcove's own catalogue
(`server/src/catalogue`), a description or cover from another reader's copy.

## Structure

Code is grouped by what it's for, and imports only flow downward:
`app → pages → widgets → features → entities → shared`. A slice never
imports another slice of its own layer.

```
src/
  app/            App shell: providers, routes, the box each page scrolls in,
                  WritersKnown (which writers are one, for every page)
  pages/          One folder per screen; page-only components live here
    landing/        Start page: hero, 3D books, preloader
    auth/           Log in and sign up
    welcome/        First steps after signing up: setting up places
    library/        The library's sections, one page for all of them
      views/          Grid, list, search, orders
      universe/       The star chart of books
      places/         Homes and rooms: drawing/, house/, room/, shelf/, cards/
      lists/          Lists: own, shared, saved, Open Library's
      stats/          The almanac and its drawings
      reader/         A reader's page, the reader's own included
    book/           A book's page, editing it; author/ is the author's page
    add-book/       Search the catalogue, pick an edition and cover, add
    import-books/   Bringing books over from Goodreads or StoryGraph
    news/           Writing alcove's news (its team only)
    settings/       Account settings (index on the left, groups on sheets)
    not-found/
  widgets/        Larger blocks that several pages share
    library-header/ Header (search, feed, settings, add), the section tabs
    book-form/      The steps of adding or editing a book
    book-cards/     A writer's or a year's books on hover or in a drawer,
                    spans from start to finish
    book-grid/      Grids of covers, the reader's or the catalogue's
    book-order/     How a shelf or a list is ordered
    book-search/    Finding a book among one's own or the catalogue's
    list-pile/      A list drawn as a pile of books
  features/       Self-contained pieces of UI with behaviour of their own
    auth/           Who's signed in, route guards, saving a change to them
    edit-profile/   Editing the reader's page in place: photo, privacy
    places/         Editing homes, rooms, bookcases and shelves; picking one
    move-books/     Moving books between shelves
    lists/          A book's lists
    open-book/      Opening a book with its cover flying to the page
    import-books/   Reading Goodreads and StoryGraph exports, undoing one
    scan-isbn/      The camera reading a barcode
    remove-book/
    book-scene/     3D floating books: model, motion, lighting, canvas textures
  entities/       Domain types, API calls, query hooks and small UI
    book/  list/  place/  user/  reader/  news/
  shared/         No knowledge of books or pages
    api/            fetch wrapper and ApiError
    config/         paths.ts: every address in the app, in one place
    theme/          Light/dark theme: provider, toggle, circular reveal
    ui/             The building blocks (below)
    lib/            Helpers: motion, page scrolling, gestures, forms…
  styles/         Global CSS, theme tokens, transitions, the sky, the rooms;
                  contrast.test.ts and sizes.test.ts
```

Import across folders with the `@/` alias (`@/shared/ui/ButtonLink`); use
relative imports inside a folder. Modules with an `index.ts` (`shared/theme`,
`features/*`, `widgets/*`) are imported through it. Files stay small, around
200 lines at most, split by what each part does; a `.tsx` file exports only
components.

## Tests

`npm test` runs them all once (`npm run test:watch` keeps them running):

- **The API** (`server/test`): each file starts the real Express app on a
  free port and talks to it as the browser does, against a MongoDB made in
  memory for the run (`mongodb-memory-server`, started in
  `server/test/globalSetup.ts`). No real database, photo storage, rate limit
  or outside site is touched: Open Library, Wikidata and the rest are
  answered by stubs (`server/test/sites.ts`). `signUp()` in
  `server/test/api.ts` gives a fresh reader and their cookie.
- **The client's plain logic** (`src/**/*.test.ts`): searching your books,
  stats, writers' names, reading spans, imports, ISBNs, plurals, dates.
- **Accessibility** (`src/styles`): every colour pair the app sets text in
  passes WCAG AA contrast in both themes, and no text is set below 12px.

The MongoDB binary is fetched on the first run, not on install
(`config.mongodbMemoryServer` in `package.json`), so deploys stay quick.

Both the client and the server are type-checked in `strict` mode.

## Deploying (Vercel)

The site is static (Vite → `dist/`, served from Vercel's CDN). The API runs as
one serverless function, `api/index.ts`, which wraps the same Express app as
`server/src`; `vercel.json` sends `/api/*` to it and every other path to
`index.html`. The function connects to MongoDB on its first request (running
any data migrations not yet run) and keeps the connection while warm.

Project settings: framework preset **Vite**, defaults for everything else.
The function runs in São Paulo (`regions: ["gru1"]` in `vercel.json`), next
to the Atlas cluster (`sa-east-1`); keep the two together if either moves.
Environment variables: `MONGODB_URI`, `MONGODB_DB`, and optionally
`ADMIN_EMAILS` (who writes alcove's news, comma between) and
`OPENLIBRARY_CONTACT`. In MongoDB Atlas, Network Access must allow
`0.0.0.0/0`, since Vercel doesn't have fixed IPs.

Server code imports with `.js` extensions (`./app.js` for `app.ts`), the
standard for Node ESM, so it runs unchanged under tsx, plain Node and Vercel.

## Books and covers

Book details come from [Open Library](https://openlibrary.org): search finds
works, then the reader picks an edition (English, with a cover and ISBN, comes
first). Writers are looked up in Open Library, Wikidata, Wikipedia and
Wikiquote. Answers are cached in the `lookupCache` collection for days, and
requests to Open Library are paced (`lookup/throttle.ts`).

Photos people upload (covers, readers' photos) go to **Vercel Blob**. In
Vercel: Storage → Create → Blob, connect it to the project; that adds
`BLOB_READ_WRITE_TOKEN`. Copy the same token into `server/.env` for local
uploads. Without it the upload button is simply hidden. Photos are shrunk in
the browser before they're sent.

Data on the client goes through TanStack Query (`entities/*/queries.ts`), so
pages show cached data instantly and refresh in the background; changes are
patched into the cache at once and checked with the server after.

## Server

```
server/src/
  index.ts        Connects to MongoDB (openDb), then listens
  app.ts          Express app: security headers, JSON-only writes, routes
  config.ts       Environment variables, validated at startup
  db.ts           Mongo client, collections
  indexes.ts      Each collection's indexes, made as the server connects
  migrations.ts   One-time data changes, each run once and marked in `meta`
  models/         The documents kept: books, lists, places, follows,
                  activity, likes, news, the catalogue
  auth/           Register, log in, log out, current user; sessions
  account/        Username, name, about, photo, favourites, privacy, email,
                  password; deleting the account
  books/          A reader's books and their copies: list (paged), add, edit,
                  imports and undoing them
  catalogue/      alcove's own catalogue: books readers added that Open
                  Library doesn't have
  places/         The tree of homes, rooms, bookcases and shelves
  lists/          The reader's lists of books, public ones, saved ones
  users/          Other readers: their pages, privacy, follows, the feed,
                  reviews and hearts, books shared among readers
  news/           alcove's own news, written by its team
  lookup/         Open Library, Wikidata, Wikipedia, Wikimedia and
                  Wikiquote, cached (with ratings blended with alcove's,
                  writers' other names, lists)
  uploads/        Photos in Vercel Blob
  lib/            Password hashing, rate limits, validation, error responses
```

**Privacy** (`users/privacy.ts`): each part of a reader's page (books,
reading, year, stars, quotes…) is seen by everyone, followers or only them,
and a page is open or asks to be followed. `shown(privacy, standing)` says
what one looking sees; `strangersSee(part)` keeps hidden readers' books out
of what's shared (reviews, ratings, descriptions).

**Feed** (`users/feed.ts`): what readers do is kept as events in `activity`
(`users/activity.ts`, noted where books, follows and hearts change), and
each feed is put together when it's asked for, checking each event against
what its reader lets followers see.

API, all under `/api`. Everything but `/health` and `/auth` needs a
signed-in reader.

| Method | Path                                  | Body                                      | Returns                                         |
| ------ | ------------------------------------- | ----------------------------------------- | ----------------------------------------------- |
| GET    | `/health`                             |                                           | `{ ok }` if Mongo is up                         |
| POST   | `/auth/register`                      | `{ username, email, password }`           | `{ user }` + cookie                             |
| POST   | `/auth/login`                         | `{ email, password }`                     | `{ user }` + cookie                             |
| POST   | `/auth/logout`                        |                                           | 204, cookie cleared                             |
| GET    | `/auth/me`                            |                                           | `{ user }` or 401                               |
| PATCH  | `/account/username`                   | `{ username }`                            | `{ user }`, or 409 if taken                     |
| PATCH  | `/account/name`                       | `{ name }` (empty clears it)              | `{ user }`                                      |
| PATCH  | `/account/about`                      | `{ about }`                               | `{ user }`                                      |
| PATCH  | `/account/avatar`                     | `{ url }` (uploaded first; none removes)  | `{ user }`                                      |
| PATCH  | `/account/favourites`                 | `{ books: [id] }` (their own, up to 4)    | `{ user }`                                      |
| PATCH  | `/account/privacy`                    | `{ page?, books?, stars?, … }`            | `{ user }`; an opened page lets in all asking   |
| PATCH  | `/account/email`                      | `{ email, password }`                     | `{ user }`                                      |
| PATCH  | `/account/password`                   | `{ currentPassword, newPassword }`        | 204; other devices signed out                   |
| DELETE | `/account`                            | `{ password }`                            | 204, account and everything in it gone          |
| GET    | `/books?after=`                       |                                           | `{ books, nextCursor, total }`, 48 a page       |
| POST   | `/books`                              | the book and the reader's copy            | `{ book }`                                      |
| GET    | `/books/by-work/:key`                 |                                           | `{ bookId }`, or null                           |
| GET    | `/books/:id`                          |                                           | `{ book }`                                      |
| PUT    | `/books/:id`                          | the book and the reader's copy            | `{ book }`                                      |
| DELETE | `/books/:id`                          |                                           | 204                                             |
| DELETE | `/books`                              |                                           | `{ deleted }`: every book taken off             |
| POST   | `/books/import`                       | `{ books, importId }` (a batch)           | `{ added, skipped, failed, unfound }`           |
| GET    | `/books/imports/last`                 |                                           | `{ last }`: the latest import, if any           |
| DELETE | `/books/imports/:id`                  |                                           | `{ deleted, unlisted }`: the import undone      |
| GET    | `/places`                             |                                           | `{ homes, counts }`                             |
| PUT    | `/places`                             | `{ homes }` (the whole tree)              | `{ homes, counts, created }`                    |
| GET    | `/lists`                              |                                           | every list, with counts                         |
| POST   | `/lists`                              | `{ name, public? }` (public unless false) | `{ list }` and every list                       |
| PATCH  | `/lists/:id`                          | `{ name?, public?, … }`                   | every list                                      |
| DELETE | `/lists/:id`                          |                                           | every list                                      |
| PATCH  | `/lists/:id/works`                    | `{ add: [work], remove: [key] }`          | every list (catalogue books kept in it)         |
| POST   | `/lists/:id/typed`                    | a book typed in by hand                   | every list, and the book's key                  |
| PUT    | `/lists/typed/:key`                   | the book typed in, changed                | every list                                      |
| POST   | `/lists/want-to-read/import`          | `{ books, importId }`                     | how many went in                                |
| GET    | `/lists/shared?q=`                    |                                           | `{ lists }`: other readers' public ones         |
| GET    | `/lists/shared/:id`                   |                                           | `{ list }`: a public list and its books         |
| GET    | `/lists/saved`                        |                                           | `{ saved }`: other readers' lists kept          |
| PUT    | `/lists/saved`                        | `{ kind, ref, name, books, works }`       | `{ saved }`                                     |
| DELETE | `/lists/saved?kind=&ref=`             |                                           | `{ saved }`                                     |
| GET    | `/lookup/search?q=`                   | title, author or ISBN                     | `{ results, isbnEdition }`                      |
| GET    | `/lookup/authors?q=`                  |                                           | `{ authors }`, writers by name                  |
| GET    | `/lookup/works/:key/editions`         |                                           | `{ editions }`, best first                      |
| GET    | `/lookup/works/:key/summary`          |                                           | `{ work }`: title, authors, cover               |
| GET    | `/lookup/works/:key`                  |                                           | `{ description, genres, from?, readersCover? }` |
| GET    | `/lookup/works/:key/ratings`          |                                           | `{ ratings }`, Open Library's and alcove's      |
| GET    | `/lookup/works/:key/author`           |                                           | `{ author, moreNames }`                         |
| GET    | `/lookup/works/:key/lists`            |                                           | lists on Open Library it's in                   |
| GET    | `/lookup/works/:key/featured`         |                                           | the lists every reader sees it's in             |
| GET    | `/lookup/works/:key/similar`          |                                           | books to read next                              |
| GET    | `/lookup/writer?name=`                |                                           | `{ author, moreNames }`, by name alone          |
| GET    | `/lookup/writer/quotes?name=`         |                                           | `{ quotes, source }` from Wikiquote             |
| GET    | `/lookup/writers/same/mine`           |                                           | `{ groups }`: the reader's writers known as one |
| GET    | `/lookup/writers/same?names=`         | names, one to a line                      | `{ groups }`                                    |
| GET    | `/lookup/authors/:key/works`          |                                           | `{ works }`, the reader's own marked            |
| GET    | `/lookup/work-titles?titles=`         |                                           | `{ titles }` in every language                  |
| GET    | `/lookup/averages?works=`             |                                           | `{ averages }`, for ordering a list             |
| GET    | `/lookup/featured`                    |                                           | `{ lists }`: those every reader sees            |
| GET    | `/lookup/featured/:id`                |                                           | `{ list }`: one, with its books                 |
| GET    | `/lookup/lists?q=`                    |                                           | `{ lists }`: readers' lists on Open Library     |
| GET    | `/lookup/lists/:owner/:id/check`      |                                           | `{ books }`: 0 if it can't be shown             |
| GET    | `/lookup/lists/:owner/:id?page=`      |                                           | `{ list }`: 40 of its books, `books`, `more`    |
| GET    | `/lookup/quotes?title=&author=`       |                                           | `{ quotes, source }` from Wikiquote             |
| GET    | `/users/search?q=`                    | `@username` or name                       | `{ readers }`                                   |
| GET    | `/users/readers/:username`            |                                           | `{ reader }`: their page, as far as it's shown  |
| POST   | `/users/readers/:username/follow`     |                                           | `{ follow }`: `following` or `asked`            |
| DELETE | `/users/readers/:username/follow`     |                                           | `{ follow: 'none' }`                            |
| GET    | `/users/readers/:username/followers`  |                                           | `{ readers }` (also `/following`)               |
| GET    | `/users/asking`                       |                                           | `{ readers }` asking to follow                  |
| POST   | `/users/asking/:username`             | `{ yes }`                                 | 204: let in or turned away                      |
| GET    | `/users/books/:id`                    |                                           | `{ work }`: another reader's uncatalogued book  |
| GET    | `/users/books-by?name=`               |                                           | `{ works }`: a writer's books among readers     |
| GET    | `/users/reviews?work=&title=&author=` |                                           | `{ reviews }`, the most liked first             |
| POST   | `/users/reviews/:id/like`             |                                           | 204 (DELETE takes the heart back)               |
| GET    | `/users/reviews/:id/hearts`           |                                           | who liked the reader's own review               |
| GET    | `/users/feed`                         |                                           | `{ items, unread }`                             |
| POST   | `/users/feed/seen`                    |                                           | 204: nothing in the feed new any more           |
| GET    | `/news`                               |                                           | `{ news }`                                      |
| POST   | `/news`                               | `{ title, body, link? }` (team only)      | `{ news }`                                      |
| PUT    | `/news/:id`                           | `{ title, body, link? }` (team only)      | `{ news }`                                      |
| DELETE | `/news/:id`                           | (team only)                               | 204                                             |
| GET    | `/uploads/status`                     |                                           | `{ enabled }`                                   |
| POST   | `/uploads/cover`                      | `{ image }` (data URL)                    | `{ url }`                                       |
| POST   | `/uploads/cover/fetch`                | `{ url }`                                 | the picture, for the browser to shrink          |
| POST   | `/uploads/cover/discard`              | `{ url }`                                 | 204                                             |

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
`features/auth` holds `AuthProvider`, `useAuth()`, `useUserChange()` and the
route guards (`RequireAuth`, `GuestOnly`) used in `app/router.tsx`.

## Theme and accessibility

Colours are CSS variables in `src/styles/theme.css`, with a light palette on
`:root` ("warm paper") and a dark one on `:root[data-theme='dark']`
("lamplight"). They're mapped to Tailwind colours, so components use
`text-ink`, `bg-surface/80`, `border-line` and never hard-code hex values.
Other helpers there: `bg-paper` (page backdrop), `text-glow` (readable over
busy art), `aged-paper`.

- **Contrast**: text colours (`ink`, `ink-soft`, `muted`, `accent`, `danger`…)
  pass WCAG AA on the backgrounds they're used on, in both themes. Text is
  never made fainter with opacity; pick a softer token instead.
- **Sizes**: type is set in `rem`, so it follows the browser's text size, and
  nothing goes below 12px (`text-xs`). `sizes.test.ts` fails on any smaller
  `text-[…]`.
- **Motion**: `prefers-reduced-motion` stills transitions and animations
  across the app.
- What only shows as a picture (stars, a heart, a cover) has words for screen
  readers, and everything a pointer can do the keyboard can too (Alt+arrows
  to reorder).

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
  so a page turn never jumps. Between the library's tabs, Lists and Places
  turn like pages; My books and Stats drop a sheet while they load.
- **Within a page**: GSAP (`shared/lib/gsap.ts`) for anything choreographed,
  like books moving between shelves (`features/move-books/useBookMoves.ts`)
  or a cover flying to its book's page (`features/open-book`).
- **Nothing jumps or blinks**: what comes and goes fades or folds
  (`Collapse`, `SmoothHeight`, `Fold`), anything floating keeps its room, and
  nothing pulses or blinks to draw the eye.

## Building blocks

Reach for these (`src/shared/ui`, `src/shared/lib`) before writing new markup
or logic:

- **Page top**: `<BackLink to=… returns />`, then `<Eyebrow>`, `<PageTitle>`,
  `<Lead>` from `PageHeading`. Each takes `rise={ms}` for the fade-up
  entrance. `InnerPage` is a whole page one step in from the library;
  `TitledSection` and `ScaleHeading` head a part of one.
- **Surfaces** (`surfaces.ts`): `floatingClass` / `capsuleClass` for controls
  over the content, `raisedClass` for menus, `sheetClass` for big frosted
  sheets, `paperClass`, `outlineCardClass`, `pageWidthClass`.
- **Buttons**: `<Button>` and `<ButtonLink>` with `variant` `primary`,
  `secondary`, `pill`, `solidPill` or `danger`; `IconButton`; `MoreToggle`;
  `ChoiceCapsule` (`stretch` to fill its row), `ChoiceToggle` and
  `choiceClass` for choices; `textLinkClass` for words in a line of text
  that lead somewhere.
- **Over the page**: `Modal` (built on `<dialog>`, moved with GSAP:
  `motion` `rise`, `sheet` or `slide`; from below on a phone, pulled back
  down by its top, `usePullDown`), `ConfirmDialog`, `Drawer`
  (slides in from the right, or the bottom on a phone), `Popover` and
  `PopoverSearch`, `Tooltip`.
- **Forms**: `useForm(initial, submit)` from `shared/lib/useForm` gives field
  props, server errors per field, a general error and a short "saved" state.
  Fields: `TextField` (`leading` for a fixed start, like `@`),
  `PasswordField`, `TextArea` (`short` to start one line high), `Select`,
  `DateField`, `FormError`; `Collapse` to reveal extra ones. `errorText(err,
fallback)` turns a failure into words.
- **Readers and books**: `Avatar` (`sm`, `md`…), `Portrait`, `Stars`,
  `StarRating`; `BookCover`, `BookLine` and `ReadersRating` in
  `entities/book/ui`; `ReaderLine` in `entities/user/ui`.
- **Gestures and layout** (`shared/lib`): `useDragOrder` (reordering by
  drag, long press on touch, Alt+arrows, items sliding into place),
  `usePanZoom` (dragging and pinching, as the sky and the photo cropper do),
  `useMasonry`, `useMeasured`, `useLongPress`, `useSwipeAway`, `useTapAway`.
- **Moving between pages**: `TransitionLink` / `ButtonLink` /
  `useTransitionNavigate`; `useGoBack(fallback)` goes back the way the reader
  came. Addresses only from `shared/config/paths.ts`. To end a session and go
  home, `useLeaveForHome()` from `features/auth`.
- **Words**: `plural` / `counted` from `shared/lib/plural`; dates from
  `shared/lib/dates`; `<Typewriter>` for text that changes in place.
- **Writers**: `writerKey(name)` and `namesWriter` (`entities/book/writers.ts`)
  tell whether two names are one writer; a list worked out from them should
  depend on `useWritersKnown()`, so it's redrawn when alcove learns two names
  are the same person.

## Adding a page

Create `src/pages/<name>/<Name>Page.tsx`, add it to `src/app/router.tsx`
(inside `RequireAuth` if it needs a signed-in reader) with its address in
`shared/config/paths.ts`, start it with `InnerPage` or `LibraryHeader`, and
build it from `shared/ui`. Anything another page will need too goes down to
`widgets/`, `features/`, `entities/` or `shared/`, not into the page folder.
