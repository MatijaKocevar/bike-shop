# bike-shop

Internal app for running a small bike shop — services, receipts and users — built as a single fullstack Next.js app.

- **Services** — the shop's catalog of work (e.g. "Changing brakes") with prices, categories and pictures.
- **Tickets** — intake checklist for a customer's bike; work is ticked off and converted into a receipt.
- **Calendar** — reserve time for a customer/bike in a month view; the ticket dialog plus date/time, and saving creates the linked work ticket.
- **Receipts** — created from a ticket (or directly) with per-item and overall discounts, marked paid/cancelled, printed or downloaded as a PDF.
- **Customers** — customers with multiple bikes and their full ticket/receipt history.
- **Users** — accounts and roles for the people running the shop.

There is no public storefront, no cart/checkout and no payment provider integration. Receipts are internal documents.

## Stack

| Layer | Choice                                                           |
| ----- | ---------------------------------------------------------------- |
| App   | Next.js 16 (App Router, fullstack) + TypeScript                  |
| UI    | Tailwind v4 + shadcn/ui (Base UI)                                |
| Data  | PostgreSQL + Prisma 7 (pg adapter)                               |
| Auth  | Auth.js (NextAuth v5) — Google + Resend magic link, JWT sessions |
| Files | MinIO (S3-compatible) via `@aws-sdk/client-s3`                   |
| PDFs  | `@react-pdf/renderer` (server-side, fonts in `assets/fonts/`)    |
| i18n  | next-intl (English + Slovenian)                                  |

## Getting started

Prerequisites: Node.js, [pnpm](https://pnpm.io), Docker.

```bash
pnpm install
cp .env.example .env
docker compose up        # postgres + minio
pnpm db:migrate          # apply migrations
pnpm db:seed             # categories, demo services, test users + receipts
pnpm dev                 # https://localhost:10001
```

The app runs on `https://localhost:10001` (bound to `0.0.0.0`, self-signed dev certificate). Most features need auth; see `.env.example` for what each optional key enables.

### Optional services

- **Auth** — needs `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` (Google) and `AUTH_RESEND_KEY` (magic-link email). Email/password sign-in always works for seeded users.

### Test users

Seeded via `pnpm db:seed`:

| Email            | Role    | Password              |
| ---------------- | ------- | --------------------- |
| `admin@test.com` | `ADMIN` | `AUTH_ADMIN_PASSWORD` |
| `staff@test.com` | `STAFF` | `AUTH_ADMIN_PASSWORD` |

## Commands

```bash
pnpm dev              # next dev (localhost:10001)
pnpm build            # production build
pnpm lint             # eslint
pnpm typecheck        # tsc --noEmit
pnpm format           # prettier --write .
pnpm format:check     # prettier --check .
pnpm db:migrate       # prisma migrate dev
pnpm db:seed          # prisma db seed
```

## Project structure

```
app/                    # routes only
  (app)/                #   authenticated app (dashboard, calendar, tickets, products, receipts, customers, users, settings)
  signin/               #   sign-in page
  api/                  #   auth/[...nextauth], files/[...key] + receipts/[id]/pdf
components/             # ui/ = shadcn primitives; otherwise shared components
hooks/                  # shared, cross-feature hooks
queries/                # ALL reads — Prisma lives here
lib/                    # framework-free infra (db, auth, storage, money, pdf)
prisma/                 # schema + migrations + seed
proxy.ts                # middleware (renamed from middleware.ts in Next 16)
```

- Components are the entry point — read a feature by reading its component, which calls a named query (read) or a server action (write).
- Prisma is touched only by `queries/` and `lib/db.ts` (plus server-action files for writes).
- Reads live in `queries/*.ts`; writes are `"use server"` actions colocated in an `_actions/` folder inside the route that uses them.

## Notes

- **Prisma 7** — client is generated to `generated/prisma`; run `pnpm prisma generate` after schema changes. DB URL lives in `prisma7.config.ts`.
- **Next 16** — `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` are async; `middleware.ts` is now `proxy.ts`.
- **Money** is stored as Prisma `Decimal`; convert with `Number(...)` before passing to client components.
- **Receipts** are plain internal documents — no VAT/fiscalisation logic. PDFs are rendered with `@react-pdf/renderer`; keep the bundled fonts in `assets/fonts/` in sync with `outputFileTracingIncludes` in `next.config.ts`.
