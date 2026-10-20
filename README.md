# alcove

A personal library app. React 19, TypeScript, Vite, Tailwind CSS 4,
react-three-fiber for the 3D books, GSAP for motion. The API is Express 5 on
Node with MongoDB.

```sh
cp server/.env.example server/.env   # once; then fill in MONGODB_URI
npm run dev        # site on :5173 and API on :3001 together
npm run build      # typecheck + build site (dist/) and API (server/dist/)
npm start          # production: one server for the API and the built site
npm run typecheck
npm run lint
npm run format
```

## Structure

Code is grouped by what it's for, and imports only flow downward:
`app → pages → features → entities → shared`.

```
src/
  app/            App shell: providers and routes
  pages/          One folder per screen; page-only components live here
    landing/        Start page: hero, footer, intro animation
      preloader/      Wordmark that fills with covers, then lifts away
    auth/           Log in and sign up
    library/        The reader's books as a grid of covers
    add-book/       Search the catalogue, pick an edition and cover, add
    settings/       Account settings
  features/       Self-contained pieces of UI that more than one page could use
    auth/           Who's signed in, route guards
    book-scene/     3D floating books: model, motion, lighting, canvas textures
  entities/       Domain types and data access
    book/           Library books: types, API, query hooks, <BookCover>;
                    plus the landing page's demo books
    user/           User type and auth API calls
  shared/         No knowledge of books or pages
    api/            fetch wrapper and ApiError
    theme/          Light/dark theme: provider, toggle, persistence
    ui/             Logo, SiteHeader, Button(Link), TextField, PasswordField…
    lib/            Small helpers (cn, motion preferences)
  styles/         Global CSS and theme tokens
```

Import across folders with the `@/` alias (`@/shared/ui/ButtonLink`); use
relative imports inside a folder. Modules with an `index.ts` (`shared/theme`,
`features/book-scene`) should be imported through it.

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
  account/        Change name, email, password; delete the account
  books/          A reader's books: list (paged), add, read, delete
  lookup/         Open Library search and editions, cached in Mongo
  uploads/        Cover photos in Vercel Blob
  lib/            Password hashing, error responses
```

API, all under `/api`:

| Method | Path                          | Body                               | Returns                                   |
| ------ | ----------------------------- | ---------------------------------- | ----------------------------------------- |
| GET    | `/health`                     |                                    | `{ ok }` if Mongo is up                   |
| POST   | `/auth/register`              | `{ name, email, password }`        | `{ user }` + cookie                       |
| POST   | `/auth/login`                 | `{ email, password }`              | `{ user }` + cookie                       |
| POST   | `/auth/logout`                |                                    | 204, cookie cleared                       |
| GET    | `/auth/me`                    |                                    | `{ user }` or 401                         |
| PATCH  | `/account/name`               | `{ name }`                         | `{ user }`                                |
| PATCH  | `/account/email`              | `{ email, password }`              | `{ user }`                                |
| PATCH  | `/account/password`           | `{ currentPassword, newPassword }` | 204; other devices signed out             |
| GET    | `/books?after=`               |                                    | `{ books, nextCursor, total }`, 48 a page |
| POST   | `/books`                      | title, authors, isbn, cover…       | `{ book }`                                |
| GET    | `/books/:id`                  |                                    | `{ book }`                                |
| DELETE | `/books/:id`                  |                                    | 204                                       |
| GET    | `/lookup/search?q=`           | title, author or ISBN              | `{ results, isbnEdition }`                |
| GET    | `/lookup/works/:key/editions` |                                    | `{ editions }`, best first                |
| GET    | `/uploads/status`             |                                    | `{ enabled }`                             |
| POST   | `/uploads/cover`              | `{ image }` (data URL)             | `{ url }`                                 |
| DELETE | `/account`                    | `{ password }`                     | 204, account and sessions gone            |

Errors look like `{ error: { code, message, fields? } }`; `fields` maps form
fields to messages.

Sessions are random tokens in an httpOnly, SameSite=Lax cookie (Secure in
production), kept for 30 days and extended while in use. Mongo stores only a
SHA-256 of each token and expires old ones itself. Passwords are hashed with
scrypt. Writes must be JSON, which together with SameSite blocks cross-site form
posts, and login/register allow 20 tries per 15 minutes per IP.

In development Vite proxies `/api` to the API, so the browser sees one origin.

On the client, `shared/api/http.ts` wraps fetch, `entities/user/api.ts` has the
calls, and `features/auth` holds `AuthProvider`, `useAuth()` and the route
guards (`RequireAuth`, `GuestOnly`) used in `app/router.tsx`.

## Theme

Colours are CSS variables in `src/styles/theme.css`, with a light palette on
`:root` and a dark one on `:root[data-theme='dark']`. They're mapped to Tailwind
colours, so components use `text-ink`, `bg-surface/80`, `border-line` and never
hard-code hex values. Other helpers there: `bg-paper` (page backdrop) and
`text-glow` (keeps text readable over busy art).

An inline script in `index.html` picks the theme before first paint (saved
choice, else the system setting). `ThemeProvider` takes over from there;
`useTheme()` gives `{ theme, toggleTheme }`, and `<ThemeToggle />` is already in
`SiteHeader`.

## Building blocks

Reach for these before writing new markup or logic:

- **Page top**: `<BackLink to=… />`, then `<Eyebrow>`, `<PageTitle>`, `<Lead>`
  from `shared/ui/PageHeading`. Each takes `rise={ms}` for the fade-up entrance.
- **Buttons**: `<Button>` and `<ButtonLink>` with `variant` `primary`,
  `secondary`, `pill` or `danger`; `iconButtonClass()` for a round icon link.
- **Forms**: `useForm(initial, submit)` from `shared/lib/useForm` gives field
  props, server errors per field, a general error and a short "saved" state.
  Fields: `TextField`, `PasswordField`, `Collapse` to reveal extra ones,
  `FormError`.
- **Moving between pages**: `TransitionLink` / `ButtonLink` / `useTransitionNavigate`
  animate it (`forward`, or `back` for the curtain home). To end a session and
  go home, use `useLeaveForHome()` from `features/auth`.
- **Text that changes in place**: `<Typewriter text=… />`.

## Adding a page

Create `src/pages/<name>/<Name>Page.tsx`, add it to `src/app/router.tsx`
(inside `RequireAuth` if it needs a signed-in reader), start it with
`<SiteHeader>` so the logo and theme toggle match, and build it from
`shared/ui`. Anything another
page will need too goes to `shared/` or `features/`, not into the page folder.
