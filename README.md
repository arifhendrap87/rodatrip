# RodaTrip

Platform roadtrip Indonesia — temukan spot, rencanakan itinerary, dan bagikan pengalaman perjalananmu.

## Tech Stack

- **Framework:** Next.js 16 (Turbopack)
- **Database:** Supabase (PostgreSQL + PostGIS)
- **Auth:** Supabase Auth (Email/Password + Google OAuth)
- **AI:** DeepSeek API
- **Storage:** Supabase Storage + Cloudflare R2
- **Deployment:** Vercel
- **Map:** Leaflet + OpenStreetMap

## Features

- Landing page dengan map interaktif dan animasi rute
- CMS Blog dengan AI writer (DeepSeek)
- Content Generator untuk FB/IG/TikTok
- Manajemen Spot dan Roadtrip
- SEO optimization (JSON-LD, OG, sitemap, breadcrumb)
- Admin panel dengan AI Chat assistant

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
- `DEEPSEEK_API_KEY` — DeepSeek API key for AI features
- `NEXT_PUBLIC_APP_URL` — Application URL

## Deployment

Deployed on Vercel at [rodatrip.vercel.app](https://rodatrip.vercel.app).
