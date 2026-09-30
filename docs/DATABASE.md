# Database setup (Shahzad Brands)

This app uses **Prisma**. It is **not MongoDB** — use **SQLite** locally or **PostgreSQL** online.

## Local (already configured)

```bash
npm run db:setup
```

Uses `DATABASE_URL="file:./dev.db"` in `.env`.

## Online — Neon (free, recommended for Vercel)

1. Sign up at [https://neon.tech](https://neon.tech)
2. Create a project → copy **connection string** (PostgreSQL)
3. In `.env` (or Vercel **Environment Variables**):

   ```env
   DATABASE_URL="postgresql://....?sslmode=require"
   ```

4. Deploy / run:

   ```bash
   npm run db:setup
   ```

The script `scripts/sync-schema-provider.mjs` switches Prisma to `postgresql` automatically when the URL starts with `postgres`.

## Docker PostgreSQL (optional)

```bash
npm run db:up
```

Set in `.env`:

```env
DATABASE_URL="postgresql://shahzad:shahzad_dev_pass@localhost:5432/shahzad_brands?schema=public"
```

Then `npm run db:setup`.

## Vercel env vars

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | Neon PostgreSQL URL |
| `AUTH_SECRET` | long random string |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

Build command: `npm run vercel-build` (or default `next build` after setting **Build Command** in Vercel project settings).
