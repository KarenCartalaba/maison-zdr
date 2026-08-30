# Database — PostgreSQL (Neon) + Prisma

## Provider

**Neon** (serverless PostgreSQL): https://neon.tech

- Free tier available
- Connection pooling via `-pooler` endpoint
- SSL required (`sslmode=require`)

## Environment Variable

```env
DATABASE_URL=postgresql://neondb_owner:npg_xxx@ep-xxx-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

The `-pooler` suffix in the hostname enables connection pooling (required for serverless/edge).

## Prisma Setup

### Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

- Output goes to `src/generated/prisma/` (custom path, not default `node_modules`)
- Imported via relative path: `import { prisma } from "@/lib/prisma"`

### Client (`src/lib/prisma.ts`)

```typescript
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export { prisma };
```

Uses the `@prisma/adapter-pg` driver adapter for Neon compatibility.

### ESM Fix (`scripts/patch-prisma.mjs`)

Prisma 7 generates `.mjs` files that break with `"type": "module"` + tsdown. The patch script rewrites all `.mjs` imports to `.js` in the generated client. Runs automatically after `prisma generate` via the `db:generate` script.

```json
"db:generate": "prisma generate && node scripts/patch-prisma.mjs"
```

### Commands

```bash
npx prisma migrate dev --name <migration_name>   # Create migration
npm run db:generate                                # Regenerate client + patch
npx prisma db push                                 # Push schema without migration (prototyping)
npx prisma studio                                  # Open Prisma Studio
```

## Models

| Model | Purpose |
|-------|---------|
| `User` | Auth accounts (email/password or Google), profile data, roles |
| `Event` | Events with gallery, categories, capacity |
| `Registration` | User-event registrations with guest tracking |
| `Review` | User reviews with moderation (PENDING/APPROVED/REJECTED) |
| `Token` | Refresh tokens, email verification, password reset |
| `News` | News/updates articles |
| `ContactMessage` | Contact form submissions |

## Key Patterns

- UUIDs for all primary keys (`@default(uuid())`)
- `@map()` for snake_case column names
- `@@map()` for table names
- Composite indexes for query performance
- Cascade deletes on user-owned relations
- `String[]` arrays for gallery images and guest names
