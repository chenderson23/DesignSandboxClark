# PhoenixDemo

A Next.js 14 (App Router) sandbox app for learning and prototyping with the Allegion **Phoenix design system** (`@Allegion/phoenix-react`). Used to experiment with enterprise UI patterns, test component configurations, and build small end-to-end features before applying the same patterns elsewhere.

**Stack:** Next.js 14 · TypeScript · SCSS · `@Allegion/phoenix-react` · Auth0 (`@auth0/nextjs-auth0` v4)

## Running the app

```bash
npm install
npm run dev   # http://localhost:3000
```

## What's in here

| Route | Status |
|---|---|
| `/` | Home dashboard — static stat cards (`PhxCard`) |
| `/users` | Users list — currently a plain HTML table (candidate for a `PhxDataTable` rebuild) |
| `/users/[id]` | User detail card |
| `/credentials` | API key management — the most complete example page: `PhxDataTable`, `PhxModal`, `PhxChipGroup`, `PhxSnackbar`, `PhxTextField`, `PhxSelect` |

See [`CLAUDE.md`](./CLAUDE.md) for full project conventions, the component list, and theming details.

## Theming

Uses the Phoenix **Overtur light** theme. Tokens are applied once in `src/app/globals.scss` and consumed everywhere else via `var(--phoenix-*)` custom properties — no hardcoded colors.

## Why this repo exists

This is a personal learning sandbox for getting hands-on with git/GitHub workflow and the Phoenix component library, as part of a 90-day design-team enablement plan. It's not a production app.
