# Fix Vercel `404 DEPLOYMENT_NOT_FOUND`

This error means **Vercel has no live deployment** at that URL (wrong link, deleted deploy, or build never succeeded).

## 1. Open the correct place

- Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
- Open your project (imported from **SHAHZAD-BRANDS**)
- Click **Visit** on the latest **Production** deployment (green check)
- Do **not** reuse old preview URLs from email/chat

## 2. Import settings (GitHub repo)

| Setting | Value |
|---------|--------|
| Repository | `maazmehar9850-boop/SHAHZAD-BRANDS` |
| Root Directory | **empty** (`.` — app is at repo root) |
| Framework | Next.js |
| Build Command | `npm run vercel-build` (or use `vercel.json`) |
| Output | default |

If Root Directory is set to `shahzad-brands` but your repo root **is** the app, builds fail → no deployment.

## 3. Environment variables (required before deploy)

In **Project → Settings → Environment Variables** (Production + Preview):

| Name | Value |
|------|--------|
| `DATABASE_URL` | Your Neon PostgreSQL URL (`postgresql://...?sslmode=require`) |
| `AUTH_SECRET` | Long random string (32+ characters) |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-PROJECT.vercel.app` (update after first deploy) |

Redeploy after adding variables.

## 4. Redeploy

**Deployments** tab → **Redeploy** on latest, or push a commit to `main`.

If build fails, open **Build Logs** and fix errors (often missing `DATABASE_URL`).

## 5. After success

- Store: `https://YOUR-PROJECT.vercel.app`
- Admin: `https://YOUR-PROJECT.vercel.app/admin/login`

Then set `NEXT_PUBLIC_APP_URL` to that URL and redeploy once.
