# Deployment — Render

## Provider

**Render**: https://render.com

- Free tier available (with limitations)
- Automatic deploys from GitHub
- Environment variables for secrets

## Backend Deployment

### Build Settings

- **Build Command**: `npm install && npm run build && npm run db:generate`
- **Start Command**: `npm run start` (runs `node dist/server.mjs`)
- **Environment**: Node

### Required Environment Variables

```
NODE_ENV=production
PORT=8000
DATABASE_URL=postgresql://...
REDIS_URL=rediss://...
JWT_SECRET=your-secret
FRONTEND_URL=https://your-frontend.onrender.com
BACKEND_URL=https://your-backend.onrender.com
GOOGLE_CLIENT_ID=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_SECRET_KEY=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
SMTP_FROM=...
```

### Prisma on Render

After deploy, run the migration:

```bash
npx prisma migrate deploy
```

Or add to build command:

```bash
npm install && npm run build && npx prisma migrate deploy && npm run db:generate
```

## Frontend Deployment

### Build Settings

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start` (Next.js production server)

### Required Environment Variables

```
NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com
NEXT_PUBLIC_APP_NAME=Maison Zone De Rassemblement
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

## Post-Deployment Checklist

1. Update `FRONTEND_URL` and `BACKEND_URL` in backend env
2. Update `NEXT_PUBLIC_BACKEND_URL` in frontend env
3. Update Google Cloud Console redirect URIs with production domain
4. Update CORS origin in backend
5. Run Prisma migrations on production database
6. Test all auth flows (signup, login, Google OAuth)
7. Test image uploads (Cloudinary)
8. Test email delivery (SMTP)

## CORS Configuration

Backend allows requests from the frontend origin:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL, // https://your-frontend.onrender.com
  credentials: true,
}));
```

## Trust Proxy

`trust proxy` is enabled (`app.set("trust proxy", 1)`) so `express-rate-limit` reads the real client IP from `X-Forwarded-For` headers set by Render's reverse proxy.

## Database Migrations

Neon database is serverless — migrations run via CLI:

```bash
npx prisma migrate deploy
```

This applies all pending migrations without creating new ones (safe for production).

## Known Limitations (Free Tier)

- Services spin down after 15 min of inactivity
- First request after spin-down takes ~30s
- 750 hours/month runtime limit
- No custom domains on free tier
- **SMTP ports blocked** — Free tier blocks outbound ports 25, 465, 587. SMTP email (see `src/lib/nodemailer.ts`) requires a paid instance or a platform without port blocking
