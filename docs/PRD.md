# Product Requirement Document (PRD) — RoadTrip Indonesia

**Versi:** 1.1 (Revised)
**Status:** Draft untuk Review
**Tanggal:** 26 Mei 2026

---

## Daftar Isi

1. [Product Overview](#1-product-overview)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Personas](#4-user-personas)
5. [Scope: MVP vs V2](#5-scope-mvp-vs-v2)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [UI/UX Requirements](#8-uiux-requirements)
9. [Data Model](#9-data-model)
10. [API Design](#10-api-design)
11. [Milestones & Timeline](#11-milestones--timeline)
12. [Open Questions](#12-open-questions)
13. [Tech Stack](#13-tech-stack)
14. [Budget Breakdown](#14-budget-breakdown)

---

## 1. Product Overview

| Item | Detail |
|---|---|
| **Nama Produk** | RoadTrip Indonesia |
| **Tagline** | Plan → Prepare → Go |
| **Deskripsi** | Platform aggregator POI + info kondisi jalan + e-commerce aksesori roadtrip untuk roadtripper Indonesia |
| **Target Platform** | Web (mobile-first responsive) |
| **Fase** | MVP — 12 minggu |
| **Model Bisnis** | Listing UMKM, Affiliate, Premium User, E-commerce (margin 30-60%) |
| **Infra Budget** | ~$50-100/bln (VPS, proxy, Supabase, domain) |

---

## 2. Problem Statement

| Masalah | Dampak |
|---|---|
| Info SPBU, bengkel, kuliner tersebar | Waktu riset lama, frustrasi |
| Kondisi jalan tidak real-time | Perjalanan terganggu |
| Estimasi biaya harus hitung manual | Tidak praktis |
| Aksesori roadtrip beli terpisah | Friction belanja |
| Tidak ada komunitas terpercaya | Keputusan berdasarkan asumsi |

---

## 3. Goals & Success Metrics

### Business Goals (Tahun 1)

| Metrik | Target |
|---|---|
| MAU | 50.000 |
| Waitlist pre-launch | 1.000 email |
| Listing UMKM aktif | 100 |
| Repeat purchase e-commerce | 20% |
| Revenue bulan ke-12 | Rp 48-105jt |

### Product Success Metrics (MVP)

| Metrik | Target | Alat Ukur |
|---|---|---|
| Page Load Time (FCP) | < 1.5s | Lighthouse |
| Lighthouse Performance | > 90 | Lighthouse |
| Map Interaction Rate | > 50% user klik POI | GA4/PostHog |
| Waitlist Conversion | > 5% visitor | Supabase count |
| Mobile Usability | Score > 90 | Lighthouse |

---

## 4. User Personas

| Persona | Profil | Pain Point |
|---|---|---|
| **Budi (Primary)** | 27th, karyawan Jakarta, mobil Avanza, weekend trip 1-2x/bln | "Bingung nyari SPBU di jalur aman" |
| **Sari (Secondary)** | 23th, freelance Bandung, motor matic, hunting spot foto | "Mau spot foto baru belum ramai" |
| **Pak Rudi (UMKM)** | 45th, pemilik bengkel jalur Bandung-Jakarta | "Jangkauan pelanggan masih lokal" |

---

## 5. Scope: MVP vs V2

### ✅ MVP (Minggu 1-12)

| Fitur | Prioritas |
|---|---|
| Landing page + waitlist | P0 |
| Peta interaktif (Leaflet) | P0 |
| POI markers (mock data) | P0 |
| Filter POI per kategori | P0 |
| Search rute + polyline | P0 |
| Info kondisi jalan (mock) | P1 |
| Estimasi biaya BBM + tol | P1 |
| User auth (email/Google) | P1 |
| Save & share rute | P1 |
| Produk listing + kategori | P1 |
| Cart → WhatsApp order | P1 |
| Listing UMKM (form + page) | P2 |

### ❌ V2 (Post-MVP)

- Scraping engine Google Maps real
- Kondisi jalan real-time dari Twitter
- User report crowdsource
- Community features (review, foto)
- Mobile app (React Native)
- Midtrans payment integration
- Dashboard UMKM
- AI rekomendasi rute

---

## 6. Functional Requirements

### FR-01: Landing Page & Waitlist

| ID | Requirement |
|---|---|
| FR-01.1 | Hero: headline, subtext, ilustrasi peta, form email |
| FR-01.2 | Form validasi email + simpan ke Supabase `waitlist` |
| FR-01.3 | Success state: "Terima kasih, kami akan kabari!" + animasi |
| FR-01.4 | Value props: 3 cards (Plan, Prepare, Go) + icon |
| FR-01.5 | Features grid: 4 fitur (POI, Info Jalan, Estimasi, Rekomendasi) |
| FR-01.6 | How it works: 3 step horizontal |
| FR-01.7 | Navbar sticky glass effect + mobile sheet menu |
| FR-01.8 | Footer: logo, links, sosial, copyright |
| FR-01.9 | Mobile-responsive semua section |

### FR-02: Map Page

| ID | Requirement |
|---|---|
| FR-02.1 | Full-page peta: react-leaflet + OpenStreetMap tiles |
| FR-02.2 | Sidebar kiri collapsible (Sheet di mobile) |
| FR-02.3 | Search: "Kota Asal → Tujuan" + autocomplete |
| FR-02.4 | Polyline rute setelah search |
| FR-02.5 | POI markers dengan icon per kategori: ⛽ 🍜 🔧 📸 ⚠️ |
| FR-02.6 | Klik marker → popup: nama, rating, alamat, jarak |
| FR-02.7 | Filter checkbox multi-kategori |
| FR-02.8 | POI list scrollable + searchable + klik → zoom |
| FR-02.9 | Estimasi biaya: BBM + Tol + Makan |
| FR-02.10 | Save rute (login required) |

### FR-03: Produk Page

| ID | Requirement |
|---|---|
| FR-03.1 | Kategori tabs: Safety, Comfort, Gadget, Organizer, Lifestyle, Bundle |
| FR-03.2 | Grid produk: Card (gambar, nama, harga, rating, badge) |
| FR-03.3 | Filter: kategori, harga, sort |
| FR-03.4 | Detail produk: modal/dialog |
| FR-03.5 | "Tambah ke Keranjang" → WhatsApp order (MVP) |
| FR-03.6 | Rekomendasi produk per rute |

### FR-04: Rute Detail Page

| ID | Requirement |
|---|---|
| FR-04.1 | URL: `/rute/[slug]` |
| FR-04.2 | Peta + polyline + POI markers |
| FR-04.3 | Info: jarak, waktu, biaya total |
| FR-04.4 | List POI terurut posisi di rute |
| FR-04.5 | Rekomendasi aksesori rute |
| FR-04.6 | Share: copy link |

### FR-05: User Auth

| ID | Requirement |
|---|---|
| FR-05.1 | Register/login: email+password atau Google OAuth |
| FR-05.2 | Backend: Supabase Auth |
| FR-05.3 | Protected: save rute, cart, profile |
| FR-05.4 | Profile: saved routes, order history |

### FR-06: E-commerce (WhatsApp Order MVP)

| ID | Requirement |
|---|---|
| FR-06.1 | Cart sheet: list produk, qty, subtotal |
| FR-06.2 | Checkout: "Order via WhatsApp" button |
| FR-06.3 | Generate pre-filled WA message: nama produk, qty, alamat |
| FR-06.4 | Order confirmation: "Terima kasih, kami akan konfirmasi via WA" |

### FR-07: Listing UMKM

| ID | Requirement |
|---|---|
| FR-07.1 | Form: nama, kategori, alamat, koordinat, deskripsi, foto, kontak |
| FR-07.2 | Halaman UMKM: grid card + map markers |

---

## 7. Non-Functional Requirements

| Kategori | Requirement | Target |
|---|---|---|
| **Performance** | FCP | < 1.5s |
| | Lighthouse Performance | > 90 |
| | Map interaction latency | < 100ms |
| **Mobile** | Responsive breakpoints | 320px — 1920px |
| | Touch target min | 44px |
| **SEO** | Meta tags per page | Ya |
| | Open Graph | Ya |
| | Semantic HTML | Ya |
| **A11y** | WCAG 2.1 AA | Target |
| | Keyboard navigable | Ya |
| | Screen reader friendly | Ya |
| **Reliability** | Error boundary per section | Ya |
| | Fallback map tiles | CartoDB backup |
| **Security** | Input sanitization | Ya |
| | Rate limiting API | Ya |
| **Browser** | Chrome, Firefox, Safari, Edge (2 versi terakhir) | Ya |

### Error States

| Scenario | UI State |
|---|---|
| Peta gagal load | "Peta tidak dapat dimuat. [Coba Lagi]" + ilustrasi |
| POI empty | "Tidak ada POI di area ini" + saran filter |
| API error | Toast + retry button |
| Network offline | Banner "Anda offline" + cached fallback |
| Search no result | "Rute tidak ditemukan" + saran kota populer |

---

## 8. UI/UX Requirements

### Design System

| Element | Specification |
|---|---|
| **Colors** | Primary: `#FF6B35` (oranye), Background: `#0A0A0A` / `#FAFAFA`, Muted: `#71717A` |
| **Typography** | Font: Inter |
| **Spacing** | Tailwind default scale |
| **Radius** | 0.5rem (8px) |
| **Animations** | Fade-in on scroll, hover scale |

### Component Inventory (shadcn/ui)

| Component | Use Case |
|---|---|
| Button | CTA, form submit |
| Input | Search, email |
| Card | POI, produk, value props |
| Badge | Kategori, status |
| Sheet | Sidebar, cart, mobile menu |
| Dialog | Detail POI/produk |
| Tabs | Kategori produk |
| Command | Search autocomplete |

### Responsive Breakpoints

| Device | Layout |
|---|---|
| Mobile (<768px) | Single column, sidebar overlay |
| Tablet (768-1024px) | Sidebar semi-collapsible |
| Desktop (>1024px) | Sidebar fixed 320px |

---

## 9. Data Model

```sql
-- Waitlist
create table waitlist (
  id        uuid primary key default gen_random_uuid(),
  email     text not null unique,
  created_at timestamp default now()
);
create index idx_waitlist_email on waitlist(email);

-- Profiles (via Supabase Auth)
create table profiles (
  id        uuid primary key references auth.users,
  name      text,
  avatar_url text,
  created_at timestamp default now()
);

-- POI
create table poi (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null,
  latitude    numeric not null,
  longitude   numeric not null,
  rating      numeric(2,1),
  address     text,
  image_url   text,
  description text,
  created_at  timestamp default now()
);
create index idx_poi_category on poi(category);
create index idx_poi_location on poi(latitude, longitude);

-- Products
create table products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null,
  price       integer not null,
  image_url   text,
  description text,
  rating      numeric(2,1),
  margin_pct  integer,
  created_at  timestamp default now()
);
create index idx_products_category on products(category);

-- Routes
create table routes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique,
  origin      text not null,
  destination text not null,
  distance_km numeric,
  polyline    jsonb,
  created_at  timestamp default now()
);
create index idx_routes_slug on routes(slug);

-- Saved Routes
create table saved_routes (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid references profiles,
  route_id  uuid references routes,
  created_at timestamp default now()
);

-- Orders (WhatsApp tracking)
create table orders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles,
  status      text default 'pending',
  total       integer,
  items       jsonb,
  wa_message_id text,
  created_at  timestamp default now()
);
```

---

## 10. API Design

### REST Endpoints

| Method | Endpoint | Rate Limit | Deskripsi |
|---|---|---|---|
| `POST` | `/api/waitlist` | 3/IP/jam | Submit email waitlist |
| `GET` | `/api/poi` | 100/IP/jam | Get POI by category+location |
| `GET` | `/api/routes` | 50/IP/jam | Search routes |
| `GET` | `/api/routes/[slug]` | 50/IP/jam | Route detail |
| `GET` | `/api/products` | 100/IP/jam | List produk |
| `POST` | `/api/orders` | 10/IP/jam | Create WA order |

### Analytics Events (GA4/PostHog)

| Event | Trigger | Properti |
|---|---|---|
| `waitlist_submit` | Form submit | email (hashed), source |
| `map_view` | Map page load | route_id |
| `poi_click` | Klik marker | poi_id, category |
| `search_route` | Search submit | origin, destination |
| `filter_apply` | Filter change | categories[] |
| `product_view` | Produk page | category |
| `add_to_cart` | Tambah cart | product_id, price |
| `wa_order_click` | Order via WA | product_ids[], total |

---

## 11. Milestones & Timeline (12 Minggu)

| Minggu | Fase | Deliverables |
|---|---|---|
| **1-2** | Foundation | Next.js setup, shadcn/ui, Supabase schema, Landing page live |
| **3-4** | Map Core | react-leaflet, mock POI (30 titik), filter, sidebar |
| **5-6** | User Feature | Supabase Auth, save/share rute, route detail page |
| **7-8** | E-commerce MVP | Produk listing, cart sheet, WhatsApp order |
| **9-10** | Monetisasi | UMKM listing form, premium visual |
| **11-12** | Polish + Launch | SEO, analytics, error states, deploy, post komunitas |

---

## 12. Open Questions (Keputusan Dibuat)

| Pertanyaan | Keputusan |
|---|---|
| Preview image Hero | SVG ilustrasi peta abstract |
| Dark/Light mode | Dark-only MVP (toggle di V2) |
| Bahasa | Indonesia saja (EN di V2) |
| Cart persistence | LocalStorage (anonim) |
| Payment | WhatsApp order MVP (Midtrans di V2) |
| Domain | Vercel subdomain dulu |
| Logo | SVG sementara (compass + teks) |

---

## 13. Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Peta | react-leaflet + Leaflet |
| Map Tiles | OpenStreetMap (fallback: CartoDB) |
| Database | Supabase (PostgreSQL + PostGIS) |
| Auth | Supabase Auth |
| Hosting | Vercel |
| Analytics | GA4 atau PostHog (open source) |
| Monitoring | Sentry (free tier) |

---

## 14. Budget Breakdown (Bulanan)

| Item | Biaya (USD) | Biaya (IDR) |
|---|---|---|
| Vercel (free tier) | $0 | Rp 0 |
| Supabase (free → Pro) | $0 → $25 | Rp 0 → 400rb |
| Domain | $15/thn | Rp 25rb/bln |
| Proxy (BrightData) | $10-30 | Rp 160-480rb |
| Monitoring (Sentry) | $0 | Rp 0 |
| **Total** | **$25-55** | **Rp 400rb-900rb/bln** |

---

> **Catatan:** Dokumen ini adalah living document. Update sesuai perkembangan.

**Dibuat:** 26 Mei 2026
