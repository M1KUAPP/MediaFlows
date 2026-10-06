# MediaFlows project guide

MediaFlows is a digital asset management platform on AWS: a Next.js web app, an ASP.NET Core API, .NET Lambda functions and the Terraform that provisions them. The [root README](/README.md) covers the product; this page covers what an agent needs to work in the repository.

Contents:

1.  [Workloads](#workloads)
1.  [Commands](#commands)
1.  [Conventions](#conventions)
1.  [Deploys](#deploys)
1.  [Plans and specs](#plans-and-specs)

## Workloads

- **`apps/web/`:** Next.js 16 (App Router), React 19 and Tailwind CSS 4, managed with pnpm. Routes live in `apps/web/src/app/`, grouped into `(app)` and `(auth)`. AWS Amplify Hosting builds it with `apps/web/amplify.yml`. See the [frontend README](/apps/web/README.md).
- **`apps/api/`:** the ASP.NET Core 8 API, deployed to Elastic Beanstalk.
  - `MediaFlows.Web` holds the controllers, SignalR hubs (`/hubs/notifications`, `/hubs/analytics`), background workers, middleware and the `.platform/` Elastic Beanstalk hooks.
  - `MediaFlows.Data` holds the EF Core `ApplicationDbContext` and its migrations, which the API applies on startup.
  - `MediaFlows.Shared` holds the DTOs, entities, enums, settings and service interfaces.
  - `tests/` holds every xUnit project, with Moq and FluentAssertions: `MediaFlows.Services.Tests`, `MediaFlows.Web.Tests`, `MediaFlows.Lambda.Tests` (for `apps/lambdas/`), and the shared `MediaFlows.Tests.Common`.
- **`apps/lambdas/`:** seven .NET 8 Lambda functions: `AnalyticsAggregator`, `ContentModerator`, `NotificationDispatcher`, `PostConfirmationGroupAssigner`, `SearchApi`, `ThumbnailGenerator` and `TrendingApi`. They reference `MediaFlows.Shared` in `apps/api/`, and `ContentModerator` and `SearchApi` also reference `MediaFlows.Data`. The [serverless module README](/infra/modules/serverless/README.md) lists their triggers.
- **`infra/`:** Terraform in two stacks: `bootstrap/` (local state) and the root stack (S3 state), built from the modules in `infra/modules/`. See the [infrastructure README](/infra/README.md).

`MediaFlows.slnx` ties the .NET projects together.

## Commands

Run these from the repository root unless noted.

- `bun install`: installs the repository tooling (editorconfig-checker, Prettier, Husky, commitlint, lint-staged) and the Git hooks.
- `bun run check`: editorconfig-checker, Prettier, the frontend typecheck, and `dotnet test MediaFlows.slnx` when `dotnet` is on `PATH`. It needs `pnpm install` in `apps/web/` first.
- `bun run lint`: editorconfig-checker over every tracked file, then Prettier's check. `bun run lint:fix` runs Prettier's write for the files Prettier owns.
- `pnpm dev`, `pnpm build`, `pnpm lint` and `pnpm test:e2e`, in `apps/web/`: the Next.js dev server, the production build, ESLint and the Playwright suite in `tests/` against `http://localhost:3000`.
- `dotnet run --project apps/api/MediaFlows.Web --launch-profile http`: the API on `http://localhost:5140`.
- `dotnet test MediaFlows.slnx`: every .NET test project.

`bun run check` leaves out ESLint, because the frontend has 22 existing ESLint errors, mostly React Compiler rules (`react-hooks/set-state-in-effect`, `refs`, `static-components`) whose fixes change component behavior. Run `pnpm lint` in `apps/web/` to see them.

## Conventions

- **Package managers:** bun for the root tooling, pnpm for `apps/web/`. Don't mix them: `apps/web/package-lock.json` is ignored.
- **Formatting:** Prettier formats every file type it supports, except under `apps/web/` and `infra/`, which `.prettierignore` leaves out. It doesn't format C#, which keeps 4-space indents.
- **Whitespace:** `.editorconfig` has one `[*]` section (UTF-8, LF, a final newline, space indents in multiples of 2, no trailing whitespace), and `editorconfig-checker` enforces it on every tracked file. `.editorconfig-checker.json` excludes only the `Makefile`, whose recipes need tabs; `lint` checks it in a second run with `-disable-indentation`. Number ordered Markdown lists as `1.  ` and indent the rest of each item 4 spaces.
- **Commits:** Conventional Commits, with headers of at most 50 characters, enforced by commitlint in the `commit-msg` hook. The `pre-commit` hook runs Prettier on staged files.
- **Secrets:** never commit them. The frontend reads `.env.local` (start from `apps/web/.env.production.example`) and loads its secrets from SSM at runtime. `infra/environments/*.tfvars` are tracked because they hold no secrets; `infra/bootstrap/terraform.tfvars` and `backend.hcl` stay ignored.

## Deploys

Deploys are manual, and the repository has no CI.

- `make deploy` runs the first-time deploy: the bootstrap stack, then the Route 53 zone, a pause while you update the registrar's name servers, then the main stack. It needs the `mediaflows` AWS CLI profile and a filled-in `infra/bootstrap/terraform.tfvars`.
- `make plan` and `make apply` handle later main-stack changes. `TF_ENV` picks the tfvars file and defaults to `prod`.
- `make help` lists every target, including `ns` and `destroy CONFIRM=nuke`.
- Amplify Hosting rebuilds the frontend from `main` once the stack exists. No script deploys the API or the Lambda code.

## Plans and specs

The superpowers skills write plans and specs to `docs/plans/`.
