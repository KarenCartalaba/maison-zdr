# Maison ZDR — Project Documentation

## Architecture Overview

Full-stack event registration system with Express 5 backend and Next.js 16 frontend.

```
maison-zdr/
├── backend/          Express 5 API server
│   ├── src/
│   │   ├── config/       Environment variables
│   │   ├── controllers/  Request handlers (class-based, flat files)
│   │   ├── lib/          Shared utilities (prisma, jwt, redis, cloudinary, email)
│   │   ├── middlewares/  Auth, RBAC, schema validation
│   │   ├── repositories/ Database queries
│   │   ├── routes/       Express routers
│   │   ├── schema/       Zod validation schemas
│   │   ├── services/     Business logic (async functions)
│   │   └── utils/        Password hashing, helpers
│   ├── prisma/           Schema + migrations
│   └── scripts/          Build helpers (patch-prisma.mjs)
├── frontend/         Next.js 16 app
│   ├── app/              Route groups: (visitor), (auth), (authenticated), (verified), admin
│   ├── components/       UI components (Shadcn/base-ui)
│   ├── context/          React context (AuthContext)
│   ├── lib/              API fetchers (serverFetch, serverFetchCached, serverFetchAuth)
│   ├── services/         Axios-based API services
│   └── types/            TypeScript interfaces
└── docs/             This documentation
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Backend | Express 5, TypeScript, tsdown |
| Frontend | Next.js 16, React 19, Tailwind 4 |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 7.10.0 |
| Cache | Redis (Upstash) |
| Auth | JWT (httpOnly cookies), Google OAuth |
| File Upload | Cloudinary |
| Email | Nodemailer (Gmail SMTP) |
| UI | Shadcn UI (base-ui based) |
| Validation | Zod 4 |

## Documentation

| File | Topic |
|------|-------|
| [DATABASE.md](DATABASE.md) | PostgreSQL (Neon) + Prisma setup |
| [REDIS.md](REDIS.md) | Redis (Upstash) caching |
| [CLOUDINARY.md](CLOUDINARY.md) | Image uploads |
| [GOOGLE-AUTH.md](GOOGLE-AUTH.md) | Google OAuth login |
| [AUTH.md](AUTH.md) | JWT authentication flow |
| [EMAIL.md](EMAIL.md) | Nodemailer email service |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Render deployment guide |

## Scripts

```bash
# Backend
npm run dev          # Start dev server (tsx watch)
npm run build        # Build with tsdown
npm run db:generate  # Regenerate Prisma client + ESM patch
npm run db:migrate   # Run Prisma migration

# Frontend
npm run dev          # Start Next.js dev server
npm run build        # Production build
```
