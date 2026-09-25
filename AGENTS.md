# AGENTS.md

Guidance for AI coding agents working in this repository. Read this first, then consult version-matched docs for the tools below before writing code.

> **Rules of engagement** — never `git commit`, `git push`, `pnpm build`, run migrations, or take any other irreversible/destructive action unless the user explicitly asks. Always confirm before doing any of those, even when the change looks "ready". This applies to the repo as a whole, not just the file you're editing.
>
> **NEVER start, stop, or restart a server or long-running process.** This is absolute and applies even for verification: no `pnpm dev`, no `next dev`/`next start`, no `nohup`, no `setsid`, no background jobs, no killing the user's processes. The user is the developer; they run the server. If something needs a live app, ask the user to start it.
>
> **Browser automation** — never launch a fresh browser or a new browser context per check, and never loop open/close. If you must inspect the running app, reuse the one already-open Playwright session and its tabs; otherwise ask the user to verify UI changes themselves.
>
> **Git workflow** — never `git rebase`, ever, on any branch. Work happens on feature branches created from `main` and merged back into `main`. To bring a branch up to date with the latest `main`, **merge** `main` into the branch (`git merge origin/main`) — do not rebase.

## Project

An internal app for running a small bike shop, built as a single Next.js app:

- **Services** — the shop's catalog of work (e.g. "Changing brakes") with prices, categories and pictures.
- **Tickets** — intake checklist for a customer's bike; work is ticked off and converted into a receipt.
- **Calendar** — reserve time for a customer/bike in a month view; the ticket dialog plus date/time, and saving creates the linked work ticket.
- **Receipts** — created from a ticket (or directly) with per-item and overall discounts, marked paid/cancelled, printed or downloaded as a PDF.
- **Customers** — customers with multiple bikes and their full ticket/receipt history.
- **Users** — accounts and roles for the people running the shop.

There is no public storefront, no cart/checkout and no payment provider. Receipts are internal documents, not fiscalised invoices.

## Stack (all newer than typical training data — verify behavior)

| Layer | Choice                                            | Notes                                              |
| ----- | ------------------------------------------------- | -------------------------------------------------- |
| App   | Next.js 16 (App Router, fullstack) + TypeScript   | Turbopack default, async request APIs              |
| UI    | Tailwind v4 + shadcn/ui (Base UI, "Nova" preset)  | `render` prop, NOT `asChild`                       |
| Data  | PostgreSQL + Prisma 7 (`prisma-client` generator) | Client generated to `generated/prisma`, pg adapter |
| Auth  | Auth.js (NextAuth v5)                             | Google + Resend magic-link, JWT sessions           |
| Files | MinIO (S3-compatible) via `@aws-sdk/client-s3`    | product pictures                                   |
| i18n  | next-intl (English + Slovenian)                   | cookie-negotiated locale                           |

## Commands

```bash
pnpm dev            # next dev (localhost:10001, bound to 0.0.0.0)
pnpm build          # production build
pnpm lint           # eslint (there is NO `next lint`)
pnpm typecheck      # tsc --noEmit
pnpm format         # prettier --write . (do this before committing)
pnpm format:check   # prettier --check . (CI / pre-push)
pnpm db:migrate     # prisma migrate dev
pnpm db:seed        # prisma db seed (categories + demo services + test users + receipts)
docker compose up   # postgres + minio
```

Setup: copy `.env.example` → `.env`. Auth uses email/password for seeded users; Google and Resend magic-link are optional. Pictures need the MinIO env vars from `.env.example`.

**The user runs the dev server. Never start one.** Do not run `pnpm dev`, `next dev`, `next start`, or any background process (`nohup`, `setsid`, `&`) — not even briefly for a smoke test. Never stop or restart the user's server either. If the app must be running for verification, ask the user to start it and test against `https://localhost:10001`.

## Deployment (production)

Full runbook: [`docs/deploy.md`](docs/deploy.md).

- Production runs on `server-asus` (`server@192.168.0.10`, LAN/WireGuard only). **Never edit files on the server directly** — changes go through git.
- App: https://bicikl-kocevar.com behind a Cloudflare Tunnel; pictures at `files.bicikl-kocevar.com` (MinIO, presigned uploads).
- Deploy = push `main`, then run `scripts/deploy.sh` on the server or `scripts/deploy-remote.sh` from a dev machine. There is no CI/CD — the server is not publicly reachable, so deploys are pull-based.
- Server checkout: `/home/server/Projects/bike-shop`; secrets live in its `.env` (gitignored) and `~/.secrets/`. Backup/restore steps and the MinIO-images gotcha are in the runbook.

## Structure & conventions (the rules this repo follows)

```
app/                    # routes only
  (app)/                #   authenticated app (dashboard, calendar, tickets, products, receipts, customers, users, settings)
  signin/               #   sign-in page
  api/                  #   ONLY auth/[...nextauth], files/[...key] and receipts/[id]/pdf
components/             # ui/ = shadcn primitives; otherwise only shared components
hooks/                  # shared, cross-feature hooks (e.g. use-presigned-upload)
queries/                # ALL reads — Prisma lives here (products, tickets, receipts, customers, ...)
lib/                    # framework-free infra (db, auth, storage, money, pdf)
prisma/                 # schema + migrations + seed
proxy.ts                # middleware (renamed from middleware.ts in Next 16)
```

- **Components are the entry point.** Read a feature by reading its component, which calls a named query (read) or a server action (write). No repository/service layers beyond that.
- **Everything opens in a dialog, not a separate page.** List screens own create/edit/detail dialogs driven by URL search params (`?new=1`, `?id=`, and feature-specific modes like `?edit=1` or `?bike=`); `/x/[id]` routes only redirect back to the list dialog. The list stays mounted behind the dialog.
- **Pages fill the width** — no centered narrow containers (`mx-auto max-w-*`) on app pages; content spans the full area inside the layout padding. Dialogs are the only narrow/centered surfaces.
- **No page titles** — breadcrumbs already identify the page; don't repeat the page name (or a subtitle) as an `<h1>` at the top of a page.
- **Prisma is touched only by `queries/` and `lib/db.ts`** (and server-action files for writes). Never import `db` into a component.
- **Reads** live in `queries/*.ts`. **Writes** are server actions (`"use server"`) colocated in an `_actions/` folder inside the route folder that uses them — one file per action, named after the action (e.g. `products/_actions/save-product.ts`).
- **Route folders keep one file per concern and never mix kinds**: `_components/` (components only, one component per file), `_hooks/` (feature hooks), `_types/` (feature data types, one type per file), `_utils/` (helpers), `_actions/` (server actions), `_stores/` (client state, e.g. Zustand). No multi-component files; components with heavy logic move that logic into a hook.
- **Shared types live in a `*.types.ts` sibling of their owning module** (`lib/cart.types.ts`, `queries/products.types.ts`) — one `.types` file per module holding all its types, never declared inline in the module. Route `_types/` folders are only for genuinely feature-local shapes (e.g. action args); never redeclare a query/lib type there — import it instead.
- **Props are always a named type declared above the component** (`type SignInFormProps = {...}` right before the function), and the component destructures with that type — never inline. Pages and layouts follow the same rule for `params`/`searchParams`/`children`. This is the only type allowed to live in a component file; feature-local data types live in the route's `_types/` folder, shared ones in the owning module's `*.types.ts`.
- **Auth** is enforced globally in `proxy.ts` (everything except `/signin` and `api`); the `(app)` layout re-checks the session. Receipts record the signed-in user.

## Code style

Formatting is enforced by **Prettier** (`.prettierrc.json`: 4-space indent, width 100, double quotes, semicolons, trailing commas). Run `pnpm format` before committing; `pnpm format:check` in CI. Don't hand-format — let Prettier own it.

Treat code like prose: group statements that belong together into **blocks**, and separate blocks with **one blank line**. Don't run everything together, and never use two blank lines.

- **Never write comments.** Code must be self-explanatory through clear names and structure — describe what it does by doing it, not with prose. If you feel the need to explain, improve the naming or structure instead.

- **Imports are one contiguous block** — no blank lines between them. The only blank line is after the `"use client"` / `"use server"` directive, and after the last import (before the first declaration).
- **Types are imported with `import type` on their own line** — never inline `type` modifiers inside value imports: `import { loadModel } from "@/lib/model";` then `import type { LoadedModel, ModelFormat } from "@/lib/model.types";`.
- Blank line between top-level declarations (types, helpers, functions).
- Inside a function, blank lines between the major paragraphs: state/hook setup → the operation (setup → work → result) → the `return`.
- Blank line after guard clauses and early returns (`if (...) return;`), and before a block's final `return` — guards, work, and result are separate paragraphs.
- Statements that do one thing stay together with no blank lines (e.g. a group of `useState` calls, or a run of `data.append(...)` lines).
- `try {` / `} finally {` / `} catch {` stay tight to their content; blank lines go _inside_ the block between its paragraphs, not right after `{`.

```ts
"use client";

import { useState } from "react";
import { doThing } from "@/lib/thing";

type Args = { id: string };

export function useSomething() {
    const [pending, setPending] = useState(false);
    const [done, setDone] = useState(false);

    async function run(args: Args) {
        if (pending) return;

        setPending(true);

        try {
            const data = new FormData();

            data.append("id", args.id);

            await doThing(data);

            setDone(true);
        } finally {
            setPending(false);
        }
    }

    return { run, pending, done };
}
```

## Gotchas (do NOT regress these)

- **Next 16 async APIs**: `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` are all Promises — `await` them. Typed helpers `PageProps<'/route'>` and `LayoutProps<'/route'>` are global (no import). `middleware` is now `proxy.ts` (default export `proxy`, or `auth` wrapper).
- **Prisma 7**: client is generated to `generated/prisma` (gitignored) — run `pnpm prisma generate` after any schema change. Import from `@/generated/prisma/client` (server) / `@/generated/prisma/browser` (types only). Instantiate with the pg adapter (`lib/db.ts`). DB URL lives in `prisma7.config.ts`, not the schema. `Prisma.validator` is gone — use `satisfies`.
- **shadcn Base UI**: components use `render={<Element/>}` instead of Radix's `asChild`. For link-styled buttons, use `buttonVariants({...})` on a `<Link>` (do NOT use `<Button render={<Link/>}>` without `nativeButton={false}` — it assigns `role="button"` to anchors).
- **Money** is stored as Prisma `Decimal`; convert with `Number(...)` in queries before passing to client components. `round2`/`formatCurrency` live in `lib/money.ts`.
- **Receipts** are internal documents — no VAT/fiscalisation, no payment provider. Don't add payment logic without being asked.
- **Receipt PDFs** are rendered server-side with `@react-pdf/renderer` from `lib/pdf/`; fonts are bundled in `assets/fonts/` and wired through `outputFileTracingIncludes` in `next.config.ts`. Keep both in sync if you change paths.

## Next.js version note

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
