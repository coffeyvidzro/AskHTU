# AskHTU

AskHTU is an AI-powered study companion for Ho Technical University students. Students will ask questions about authorized course handbooks and receive answers grounded in specific pages of the original PDFs.

## Stack

Next.js 16, React 19, Bun, Better Auth, Prisma 7, PostgreSQL, Tailwind CSS, and shadcn. Future work adds Upstash QStash/Vector for ingestion and handbook-scoped retrieval, OpenAI for answers, and PDF citations.

## Local development

1. Install Bun and a running PostgreSQL database.
2. Run `bun install --frozen-lockfile`.
3. Copy `.env.example` to `.env.local` and configure `DATABASE_URL`, `BETTER_AUTH_URL`, and a securely generated `BETTER_AUTH_SECRET`.
4. Run `bun run db:push` and `bun run db:generate`.
5. Start the app with `bun run dev`.

Do not commit secrets or database credentials.

## Database schema management

The application does **not** use a `prisma/migrations` directory. For now, apply Prisma schema changes directly to the development database using `bun run db:push` and regenerate the client with `bun run db:generate`. Review the impact of schema changes before applying them to databases with existing data. `db push` does not provide migration history, so a reviewed deployment strategy will be needed before production.

## Role security

AskHTU has two roles: `STUDENT` and `ADMIN`.

New accounts always receive the `STUDENT` role, assigned server-side. The Better Auth API cannot set `role` through sign-up or profile updates. The `ADMIN` role must be provisioned by trusted operations, not a public endpoint. Protected administrator pages recheck the persisted role.

## Data model

- `Course`: catalog entry with unique course code.
- `Handbook`: versioned PDF record, processing status, original storage key, and page metadata, uploaded by an admin.
- `Conversation`: student-scoped chat tied to one handbook version.
- `Message`: user or assistant text, with optional structured source citations.
- Better Auth `User`, `Session`, `Account`, and `Verification`: authentication storage.

PDF uploading, background ingestion, vector search, and AI chat are intentionally **not enabled** by this foundation PR. No course or handbook data is seeded or fabricated.

## Checks

```bash
bun run lint
bun run typecheck
bunx prisma validate
```
