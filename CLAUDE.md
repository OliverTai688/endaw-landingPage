# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ENDAW landing page — a music education platform built with Next.js 16 (App Router), TypeScript, and PostgreSQL/Prisma. Supports two content types: workshops and music lessons, with an admin CMS panel.

## Commands

```bash
pnpm install          # Install dependencies (runs prisma generate via postinstall)
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Production build (prisma generate && next build)
pnpm lint             # ESLint
pnpm start            # Start production server
```

**Database:**
```bash
npx prisma generate   # Regenerate Prisma client after schema changes
npx prisma migrate dev # Create/apply migrations in development
npx prisma db push    # Push schema to DB without migration (prototyping)
```

No test framework is configured.

## Architecture

The codebase follows **Clean Architecture** with a repository pattern:

- **`src/domain/models/`** — Domain entities (Content)
- **`src/application/use-cases/`** — Business logic (ContentUseCases)
- **`src/infrastructure/repositories/`** — Data access implementations behind `IContentRepository` interface
- **`src/infrastructure/RepositoryFactory.ts`** — Selects repository at runtime: client-side always uses `WebContentRepository` (API calls); server-side uses `PrismaContentRepository` if DB is available, falls back to `InMemoryContentRepository`

### Key Layers

**API routes** (`src/app/api/`): RESTful CRUD at `/api/content` (GET/POST/PUT/PATCH/DELETE). File upload at `/api/upload`. Write operations require cookie-based auth.

**Auth**: Simple cookie-based (`internal_access=true`, 24h expiry). Login at `/internal-access`, protects `/admin` routes. Auth helper in `src/lib/auth-server.ts`.

**Middleware** (`src/middleware.ts`): Rate limiting (Upstash Redis, 5 req/10min) and CSRF protection on `/contact`.

**Contact form** (`src/app/contact/action.ts`): Server Action with multi-layer spam protection — honeypot field, Shannon entropy check, keyword blacklist, daily quota (100/day). Sends email via Nodemailer/Gmail SMTP.

**State management**: React Context via `ContentProvider` — manages content service instance, DB connection status, and content refresh.

## Styling

Tailwind CSS v4 with Shadcn UI (New York style). Black & white theme with gold accent (`#D4AF37`). Path alias: `@/*` → `src/*`.

## Environment Variables

```
DATABASE_URL                      # PostgreSQL connection string
NEXT_PUBLIC_DATABASE_URL          # Client-side DB availability check
UPSTASH_REDIS_KV_REST_API_URL    # Rate limiting
UPSTASH_REDIS_KV_REST_API_TOKEN  # Rate limiting
GMAIL_USER                        # Contact form sender
GMAIL_APP_PASSWORD                # Gmail app-specific password
CONTACT_RECEIVER_EMAIL            # Contact form recipient
```

## Database Schema

PostgreSQL via Prisma. Three models: `Content` (base with type/status enums), `Workshop` (1:1 with Content), `MusicMetadata` (1:1 with Content). Schema at `prisma/schema.prisma`. Content types: `WORKSHOP | MUSIC`. Publish statuses: `DRAFT | PUBLISHED | ARCHIVED`.
