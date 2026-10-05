# MediaFlows Frontend

Next.js 16 (App Router) + React 19 + Tailwind 4 web app for the MediaFlows DAM platform. Deployed to AWS Amplify Hosting.

> Top-level project README is at [`../../README.md`](../../README.md).

## Local development

```bash
pnpm install
pnpm dev
# http://localhost:3000
```

Local dev requires environment variables. Use `.env.production.example` as the template:

```bash
cp .env.production.example .env.local
# edit .env.local with your Cognito pool ID, secrets, etc.
```

`.env.local` is gitignored. Production values are injected via Amplify Hosting environment variables (and SSM) at deploy time — they are not committed to the repo.

## Scripts

- `pnpm dev` — Next dev server
- `pnpm build` — production build
- `pnpm start` — start production server
- `pnpm lint` — ESLint
- `pnpm test:e2e` — Playwright e2e (defaults to `http://localhost:3000`)
- `pnpm test:e2e:ui` — Playwright UI mode
- `pnpm test:e2e:headed` — Playwright headed mode

## Source layout

- `src/app/` — Next App Router routes (segmented by `(app)` and `(auth)`)
- `src/components/` — React components, organized by domain (admin, assets, catalog, …)
- `src/hooks/` — custom hooks
- `src/lib/` — non-React utilities, API clients
- `src/providers/` — React context providers
- `src/types/` — shared TypeScript types
- `e2e/` — Playwright test specs
- `public/` — static assets

## Deployment

AWS Amplify Hosting builds and serves the frontend (at `https://web.<domain>/`). The Amplify app is created by `make deploy` (see [`../../infra/README.md`](../../infra/README.md)) and builds the `main` branch with [`amplify.yml`](amplify.yml) whenever it changes. There is no CI workflow.
