# Golden Plaice Fish & Chips — Online Ordering

Own-brand takeaway ordering website for **Golden Plaice**, Longhedge, Salisbury. No third-party commission — customers order direct.

## Features

- **Homepage** — branding, opening times, delivery zones
- **Online ordering** — full menu from your printed menu, category browsing, basket
- **Collection or delivery** — UK postcode distance via [postcodes.io](https://postcodes.io), fees:
  - 0–1 mile: £1.00
  - 1–3 miles: £2.00
  - Over 3 miles: collection only
- **Checkout** — guest, sign in, or register
- **Payment** — cash on collection/delivery; card ready for Stripe
- **Modifiers** — burgers: sauce + salad; Pukka pies: no onion / no spicy / with sauce (multi-select)
- **Admin** (`/admin`) — orders, menu prices, delivery settings, opening hours

## Quick start (local review)

```bash
npm install
cp .env.example .env.local
# Edit .env.local — set ADMIN_PASSWORD and JWT_SECRET
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

- **Admin:** footer → Admin, or `/admin` (password from `ADMIN_PASSWORD`, default `goldenplaice2026` until you change it)
- **Orders** are stored in `data/store.json` locally

## Deploy to Vercel

1. Push this repo to GitHub: `https://github.com/marsnewbie/goldenplaice`
2. In [Vercel](https://vercel.com), import the repository
3. Add environment variables:
   - `JWT_SECRET` — long random string
   - `ADMIN_PASSWORD` — your staff password
4. Deploy

> **Note:** On Vercel’s serverless runtime, file writes to `data/store.json` do not persist between deployments. For production, connect **Vercel Postgres**, **Supabase**, or **Upstash** and migrate the store layer — or use Vercel Blob for `store.json`. For your first review, run locally with `npm run dev`.

## Stripe (card payments)

Card checkout is wired as a placeholder. When ready:

1. Create a [Stripe](https://stripe.com) account
2. Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Implement Checkout Session in `src/app/api/orders/route.ts`

## Shop details (default)

| | |
|---|---|
| Address | 2 Rhodes Moorhouse Way, Longhedge, Salisbury SP4 6SA |
| Phone | 01722 341 351 |

## Tech stack

- Next.js 15 (App Router)
- TypeScript, Tailwind CSS
- Zustand (basket, persisted in browser)
- UK postcode API + haversine distance
- JWT cookies for admin and customer sessions

## License

Private — Golden Plaice Fish & Chips.
