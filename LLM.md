# release-smartlink (Dropmark) — agent notes

Dropmark is a single-release smart link: one page with a big cover and a button
to every streaming service, and an artist admin to edit the release + links and
see click counts. A real Hanzo app forked from `hanzo-starter` —
Vite + React 19 + `@hanzo/gui` (UI) + `@hanzo/iam` (auth) + `@hanzo/base` (data).
Keep it REAL — every surface builds and runs, no fabricated UI or metrics.

## One way, decomplected

- **Providers** (`src/providers.tsx`) mount in the canonical order every Hanzo
  surface ships: `GuiProvider` → `IamProvider` → `BaseProvider`. `BaseProvider`
  gets a `BaseClient` carrying the IAM access token; it is rebuilt when the token
  changes (`src/lib/base.ts` `baseAs`). That single seam is what makes every
  `useQuery`/`useMutation` org-scoped to the signed-in artist.
- **Env is one place** (`src/env.ts`), read from `import.meta.env.VITE_*`. The
  IAM client id is `import.meta.env.VITE_IAM_CLIENT_ID` (fallback `hanzo-app`).
- **UI is one system** — `@hanzo/gui` primitives only (no second kit, no
  Tailwind). `src/lib/catalog.ts` is the pure domain (row shapes + streaming
  brand chips + cover palettes); `src/views/` holds the surfaces.

## Views

- `views/smartlink.tsx` — the fan-facing page (presentational): color-bled
  backdrop, centered square cover (real `cover_url` or a generated vinyl), and a
  stack of streaming buttons. Shared by the public landing and the live preview.
- `views/signed-out.tsx` — public landing: the smart link for a **demo** release
  (honest showcase) + an "Artist sign in" PKCE affordance.
- `views/home.tsx` — signed-in shell: live preview beside the editor.
- `views/admin.tsx` — the editor: edit the `release`, add/edit/delete `links`,
  see per-link click counts.
- `views/chip.tsx` — the brand mark shared by buttons and the editor.

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (it is the
  Tamagui line): (1) alias `react-native` → `react-native-web`, (2) `define`
  `process.env.TAMAGUI_TARGET` / `NODE_ENV` / `__DEV__`, (3) `dedupe`
  react/react-dom/react-native-web. No Tamagui compiler, no `one`, no Expo.
- **`@hanzo/gui` props are Tamagui LONGHAND**: `alignItems`/`justifyContent`/
  `backgroundColor`/`padding`/`borderRadius`/`textAlign`/`alignSelf` — NOT the
  `items`/`justify`/`bg`/`p`/`rounded`/`text`/`self` shorthands. Shorthands pass
  at runtime but FAIL `tsc`. `Button` uses `onPress`; `Input` uses
  `value`/`onChangeText`.
- **Absolute fills need a positioned parent.** A `fullscreen`/absolute
  `LinearGradient` or ring only fills its box if that box is `position="relative"`
  (see `Cover` and the SmartLink root) — otherwise it escapes to the viewport.
- **`LinearGradient`** imports from `@hanzo/gui/linear-gradient` (subpath), not
  the package root.
- **PKCE storage is `localStorage`** (not sessionStorage) so the verifier/state
  survive the round-trip to hanzo.id.
- **`schema.sql` is the data contract.** It is the `databaseSchema` DDL the
  deploy translates into Base collections (`provisionBaseFromDDL`). Keep it in
  lockstep with `views/admin.tsx` + `views/smartlink.tsx` (`release`, `links`).

## Deploy contract (Hanzo Cloud)

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app` from
  object storage (the `*.hanzo.app` published-sites edge). No server process.
- On publish, `schema.sql` → `provisionBaseFromDDL` creates the collections
  (org-scoped, IAM-native: rule `@request.auth.org_id = org`). Runtime read/write
  is browser → `VITE_HANZO_BASE_URL` with the IAM token.
- **IAM redirect registration** is the one external requirement: the IAM client
  (`VITE_IAM_CLIENT_ID`, default `hanzo-app`) must allow this origin's
  `/auth/callback`. Production provisions a per-app `release-smartlink` client
  (or a `https://*.hanzo.app/auth/callback` wildcard on the shared client).

## Proven

`tsc --noEmit` clean · `vite build` → `dist/` · the public landing renders under
headless Chromium with zero console errors and no horizontal overflow (cover +
title + streaming buttons), and `login()` starts a real PKCE S256 redirect to
hanzo.id.

## Build

CI (`.github/workflows/ci.yml`) runs `npm ci && npm run typecheck && npm run
build` — build-verification only, NEVER a container image (Hanzo Cloud owns
deploys; do not build images locally).
