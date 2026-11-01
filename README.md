# AskHTU

AskHTU is an AI-powered study companion for Ho Technical University students. The goal is to let students ask questions about authorized course handbooks and receive answers grounded in specific pages of the original PDFs.

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

## Environment

The `.env.example` file documents all required server credentials, including QStash signing keys and the UploadThing token. `NEXT_PUBLIC_BASE_URL` must be the externally reachable application URL used by QStash callbacks outside local development.

## Current implementation status

The application foundation includes authentication, database models, file upload setup, and a signed QStash endpoint. PDF extraction, vector indexing, handbook-grounded chat, source citations, and persistent conversation handling are not implemented yet. Uploaded handbooks must remain inactive until ingestion is complete.
