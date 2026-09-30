# Shahzad Brands

Premium garments e-commerce storefront with admin back office, POS, inventory, and invoicing.

## Stack

- **Next.js 16** (App Router), React 19, TypeScript
- **Tailwind CSS v4**, Lucide icons, react-hot-toast, Recharts
- **Prisma** + SQLite (dev)
- **Auth**: JWT session cookie `sb_session` (jose + bcrypt)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

   Set `AUTH_SECRET` to a long random string (32+ characters).

3. **Database**

   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

| Role     | Email                      | Password      |
|----------|----------------------------|---------------|
| Staff    | admin@shahzadbrands.com    | Admin@123     |
| Customer | ali.ahmed@example.com      | Customer@123  |

Staff sign-in: [/admin/login](http://localhost:3000/admin/login)

## Scripts

| Script          | Description              |
|-----------------|--------------------------|
| `npm run dev`   | Development server       |
| `npm run build` | Production build         |
| `db:generate`   | Prisma client generate   |
| `db:push`       | Push schema to SQLite    |
| `db:seed`       | Seed demo data           |

## Features

- **Store**: homepage, product catalog with filters, quick view, wishlist, cart, checkout (order + invoice + payment + stock deduction), customer accounts & saved addresses
- **Admin**: dashboard, products CRUD, orders, POS (invoice + payment + inventory), invoices with print/PDF, categories, customers, staff, inventory, coupons, expenses, returns, CSV reports, settings, notifications
- **Permissions**: role-based staff access loaded into JWT on login

## Project structure

- `prisma/schema.prisma` — data models
- `prisma/seed.ts` — demo seed data
- `src/app/(store)/` — public storefront routes
- `src/app/admin/` — staff admin UI
- `src/app/api/` — REST API routes
- `src/lib/` — db, auth, inventory, PDF, settings
