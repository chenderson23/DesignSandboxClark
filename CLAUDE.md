# PhoenixDemo — Project Instructions

## Overview

A Next.js 14 (App Router) placeholder demo app built with the Allegion Phoenix design system (`@Allegion/phoenix-react`). Used to prototype and demo enterprise UI patterns for the Allegion platform.

**Stack:** Next.js 14 · TypeScript · SCSS · `@Allegion/phoenix-react` · Auth0 (`@auth0/nextjs-auth0` v4)

---

## Running the App

```bash
npm run dev   # http://localhost:3000
npm run build
```

---

## Project Structure

```
src/app/
  layout.tsx          # Root layout — do not edit unless adding global providers
  globals.scss        # Phoenix theme tokens (Overtur light) + component styles
  app.tsx             # App shell — edit this to add SideNav items
  providers.tsx       # Auth0Provider wrapper
  page.tsx            # Home / Dashboard
  auth/profile/
    route.ts          # Stub Auth0 profile endpoint (prevents 404 on mount)
  users/
    page.tsx          # Users list
    [id]/page.tsx     # User detail
```

---

## Adding a New Page

1. Create `src/app/<your-route>/page.tsx`:

```tsx
'use client';
export default function Page() {
  return <div>Your content here</div>;
}
```

2. Add it to `NAV_ITEMS` in `src/app/app.tsx`:

```ts
{ name: 'Your Page', path: '/your-route', icon: 'your_icon' }
```

Icons are Material Icons names — browse at https://fonts.google.com/icons.
Breadcrumb updates automatically from the URL — no extra config needed.

---

## Using Phoenix Components

Import from `@Allegion/phoenix-react`:

```tsx
import {
  PhxButton,
  PhxCard,
  PhxCardHeader,
  PhxCardContent,
  PhxDataTable,
} from '@Allegion/phoenix-react';
```

Reach for a Phoenix component before writing custom HTML. Key components available:
`PhxButton` · `PhxCard` · `PhxDataTable` · `PhxModal` · `PhxSideSheet` · `PhxSidenav` · `PhxTopNav` · `PhxBreadcrumb` · `PhxBadge` · `PhxChip` · `PhxTextField` · `PhxSelect` · `PhxSnackbar` · `PhxTabs`

---

## Theming

The app uses the **Overtur light theme** from `@Allegion/phoenix-react`. Tokens are applied in `globals.scss`:

```scss
@use '@allegion/phoenix-react/dist/tokens/themes/overtur/overtur-light' as tokens;
@use '@allegion/phoenix-react/dist/theming/theme';
:root { @include tokens.tokens(); }
```

Use `var(--phoenix-*)` CSS custom properties for any custom styles.

---

## Known Config Notes

- `next.config.mjs` sets `transpilePackages: ['@Allegion/phoenix-react']` — required because the package ships raw `.ts` interface files in dist.
- `sassOptions.includePaths: ['./node_modules']` — allows `@use '@allegion/...'` paths in SCSS.
- Auth0 `UserProvider` is v4 (`Auth0Provider`) — no `GET/POST` route handler needed.

---

## Active Work

| Brief | Status |
|---|---|
| [Credentials & API Keys Management](./credentials-page-brief.md) | v1 shipped — see iteration log in the brief |
