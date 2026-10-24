# AskHTU

AskHTU is an AI-powered study companion for Ho Technical University students. Students will ask questions about authorized course handbooks and receive answers grounded in specific pages of the original PDFs.

## Stack

Next.js 16, React 19, Bun, Better Auth, Prisma 7, PostgreSQL, Tailwind CSS, and shadcn. Future work adds Upstash QStash/Vector for ingestion and handbook-scoped retrieval, OpenAI for answers, and PDF citations.

## Local development

1. Install Bun and a running PostgreSQL database.
2. Run `bun install --frozen-lockfile`.
3. Copy `.env.example` to `.env.local` and configure `DATABASE_URL`, `BETTER_AUTH_URL`, and a securely generated `BETTER_AUTH_SECRET`.
4. Run `bunx prisma migrate deploy` and `bunx prisma generate`.
5. Start the app with `bun run dev`.

Do not commit secrets or database credentials. Apply migrations before serving authentication requests. For local schema changes, create a new Prisma migration with `bunx prisma migrate dev --name <name>`.

## Role security

New accounts always receive the `STUDENT` role, assigned server-side. The Better Auth API cannot set `role` through sign-up or profile updates. Admin and lecturer roles must be provisioned by trusted operations, not a public endpoint. Protected pages recheck the persisted role.

## Data model

- `Course`: catalog entry, with unique course code.
- `CourseLecturer`: lecturer assignment to a course.
- `Handbook`: immutable version identity, processing status, original storage key, and page metadata.
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

The committed initial migration targets PostgreSQL and must be applied to an empty database.
