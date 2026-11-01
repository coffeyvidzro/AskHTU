# AskHTU

AskHTU is an AI-powered study companion for Ho Technical University students. Students will be able to ask questions about official course handbooks and receive answers grounded in the original PDF pages.

## Stack

- Next.js 16 and React 19
- Bun
- Better Auth
- Prisma 7 and PostgreSQL
- OpenAI
- Upstash Redis, QStash, and Vector
- UploadThing
- Resend

## Getting started

1. Install Bun 1.4.3 or a compatible release.
2. Install dependencies:

   ```sh
   bun install
   ```

3. Copy `.env.example` to `.env` and provide the required service credentials.
4. Generate the Prisma client and synchronize the development database:

   ```sh
   bun run db:generate
   bun run db:push
   ```

5. Start the development server:

   ```sh
   bun run dev
   ```

## Handbook ingestion

Administrators upload PDF handbooks through UploadThing. Upload completion publishes only the handbook and course identifiers to QStash; the worker loads the canonical file URL from PostgreSQL rather than trusting a URL supplied by the job payload.

The worker verifies the QStash signature, downloads the PDF from the trusted UploadThing file host, uses `pdf-parse` to extract selectable text page by page, creates overlapping page-scoped chunks, generates OpenAI `text-embedding-3-small` embeddings, and upserts them into Upstash Vector. Vector metadata includes the handbook ID, course ID, original PDF page number, chunk index, and text.

Handbooks move through `PENDING`, `PROCESSING`, `READY`, or `FAILED`. A handbook becomes active only after indexing completes. Chunk IDs are deterministic per handbook/page/chunk so retried jobs overwrite the same vector records instead of creating duplicates.

The Upstash Vector index must be configured for **1536 dimensions** to match `text-embedding-3-small`. Scanned/image-only PDFs are not OCR'd in this iteration; ingestion fails clearly when no selectable text is present.

## Environment

The `.env.example` file documents all required server credentials, including QStash signing keys and the UploadThing token. `NEXT_PUBLIC_BASE_URL` must be the externally reachable application URL used by QStash callbacks outside local development.

## Current implementation status

PDF text extraction, chunking, embedding, and vector indexing are implemented. Handbook-scoped retrieval, answer generation grounded in retrieved chunks, PDF citations in chat, and persistent conversation handling are separate follow-up work.
