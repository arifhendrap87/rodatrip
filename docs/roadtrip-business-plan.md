# 🚗 RoadTrip Indonesia — Business Plan

**Model:** Content → Commerce Platform untuk Roadtripper Indonesia
**Fase:** MVP — Bootstrapped
**Estimasi Waktu:** 3 bulan ke live

---

## 1. Konsep Bisnis

Platform aggregator POI + info kondisi jalan + e-commerce aksesori roadtrip.
Satu tempat untuk **plan → prepare → go**.

| Tahap | Aktivitas User | Monetisasi |
|---|---|---|
| **Plan** | Cari rute, lihat POI, lihat info jalan | Listing UMKM, Affiliate |
| **Prepare** | Baca rekomendasi + beli aksesori | E-commerce |
| **Go** | Trip, share pengalaman | Sosial proof → repeat purchase |

---

## 2. Target Persona

- Usia 20–40, punya SIM, punya motor/mobil
- Suka weekend trip / long weekend roadtrip
- Tinggal di kota besar (Jabodetabek, Bandung, Surabaya, Medan, Makassar)
- Masalah utama:
  - **"SPBU di jalur ini di mana aja?"**
  - **"Jalannya bagus nggak?"**
  - **"Apa aja yang perlu dibawa?"**

### Market Sizing

| Metrik | Angka |
|---|---|
| Pengguna internet Indonesia | 221 juta |
| Roadtrip min. 1x/tahun | ~66 juta (30%) |
| SAM (18-40, urban, punya SIM) | 10 juta |
| SOM target tahun 1 | 50.000 MAU (0,5%) |

---

## 3. Data Scraping — Sumber & Metode

### 3.1 POI (Point of Interest)

| Sumber | Data | Metode | Biaya | Frekuensi |
|---|---|---|---|---|
| **Google Maps** | SPBU, bengkel, kuliner, hotel, rating, jam buka, koordinat | Playwright scraping (headless browser) | $0 (proxy aja) | Harian |
| **Instagram** | Spot foto, hidden gem, cafe (caption + location) | Scrape hashtag: `#roadtripindonesia`, `#jalansore`, `#spotfoto` | $0 | Harian |
| **TikTok** | Review rute, rekomendasi kuliner | Scrape trending hashtag | $0 | Harian |

### 3.2 Kondisi Jalan

| Sumber | Data | Metode | Biaya | Frekuensi |
|---|---|---|---|---|
| **Twitter/X** | "jalan rusak", "banjir", "longsor", "kecelakaan" per lokasi | Scrape keyword + geo-filter | $0 | Real-time (15 menit) |
| **Portal Berita Daerah** | Berita perbaikan jalan, bencana, jalur alternatif | RSS + scrape judul | $0 | 2x/hari |
| **Facebook Groups** | Report dari komunitas touring | Scrape post via Graph API / scraping | $0 | Harian |

### 3.3 BBM & Tol

| Sumber | Data | Metode | Biaya | Frekuensi |
|---|---|---|---|---|
| **MyPertamina** | Harga BBM per SPBU | Scrape website + app | $0 | Mingguan |
| **JTTS / Tol Trans Jawa** | Tarif tol per gerbang | Scrape website resmi | $0 | Perubahan |

### 3.4 Event & Festival

| Sumber | Data | Metode | Biaya | Frekuensi |
|---|---|---|---|---|
| **Instagram** | Event/festival daerah | Scrape hashtag `#festival` + lokasi | $0 | Harian |
| **Tiket.com / Loket** | Event mendatang | Scrape listing | $0 | Harian |

### 3.5 Metode Scraping Google Maps (Detail)

**Pendekatan MVP (Bulan 1-3): Scrape Manual — Gratis**

```
1. Playwright + headless Chrome buka maps.google.com
2. Search query: "SPBU di Jawa Barat"
3. Scroll infinite feed sampai semua hasil termuat
4. Extract dari setiap card POI:
   - Nama       → .fontHeadlineSmall
   - Rating     → .fontBodyMedium span[aria-hidden]
   - Alamat     → attribute data-location / URL
   - Koordinat  → dari URL detail
5. Simpan ke database
```

**Strategi Proxy:**
- Mulai 5 proxy residential (BrightData ~$5-10/bln)
- Delay random 2-5 detik antar request
- Rotate User-Agent

**Scale-up (Bulan 4+): Hybrid**
- Scrape manual untuk list POI baru
- Places API ($17-32/1000 req) untuk **update** data existing (jam buka, review baru)

**Perbandingan Biaya:**

| Skala | Places API | Scrape Manual |
|---|---|---|
| 100 POI/hari | $5/hari | ~$0 |
| 1.000 POI/hari | $50/hari | ~$0,05 |
| 10.000 POI/hari | $500/hari | ~$0,50 |
| 1 bulan full Jawa | $15.000 | ~$15 |

---

## 4. Arsitektur Teknis

```
┌─────────────────────────────┐
│   Scheduler (cron / Celery) │
│   tiap X jam trigger scrape │
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│   Scraper Engine            │
│   - Playwright / Scrapy     │   ← Python
│   - Rotate proxy + UA       │
│   - Error handling + retry  │
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│   Data Pipeline             │
│   - Transform & normalize   │
│   - Deduplication (by name  │
│     + coordinate)           │
│   - Geolocation tagging     │
│     (PostGIS point)         │
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│   Database                  │
│   - PostgreSQL + PostGIS    │
│   - Redis (cache real-time) │
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│   API Layer                 │
│   - FastAPI (Python)        │
│     atau Next.js API        │
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│   Frontend                  │
│   - Next.js + Tailwind     │
│   - Peta: Leaflet/MapLibre │
│   - Mobile-first responsive│
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│   E-commerce                │
│   - Toko terintegrasi      │
│   - Midtrans (payment)     │
│   - Dropship / stok sendiri│
└─────────────────────────────┘
```

### Tech Stack Rekomendasi

| Layer | Tool | Budget/bln |
|---|---|---|
| Scraping | Playwright + BrightData proxy | $10-30 |
| DB | Supabase (Postgres + PostGIS) | $25 |
| Backend | FastAPI (Python) / Next.js API | Gratis |
| Frontend | Next.js + Tailwind + Leaflet | Gratis |
| Cache | Upstash Redis (free tier) | $0 |
| Hosting | VPS DigitalOcean $12 atau Vercel + Railway | $12-24 |
| Payment | Midtrans (fee per transaksi) | ~2-3% |
| Monitoring | Sentry (free) + Better Uptime (free) | $0 |

**Total: ~$50-100/bln**

---

## 5. User Journey

### Skenario: Budi, 27, roadtrip Jakarta-Jogja 3 hari

```
Buka website
  │
  ▼
HOME: Input "Jakarta → Jogja, 3 hari"
  │
  ▼
MAP PAGE: Rute otomatis via jalur selatan
  │ ⏺ POI muncul sepanjang jalan:
  │   • SPBU Pertamina Km 45 (Rp 12.500/L)
  │   • Bengkel terdekat (⭐4.2)
  │   • Sate Maranggi Cianjur (⭐4.5)
  │   • Spot foto Telaga Warna
  │   • ⚠️ Info: Km 80 ada perbaikan jalan
  │
  ▼
Bisa filter: "SPBU + bengkel + makan aja"
  │ Bisa lihat estimasi biaya:
  │   • BBM: Rp 450.000
  │   • Tol: Rp 300.000
  │   • Makan: ~Rp 200.000
  │
  ▼
Rekomendasi aksesori untuk rute ini:
  │   □ Tire Inflator Portable — Rp 150.000
  │   □ Phone Mount Magnet — Rp 85.000
  │   □ Cooler Bag 20L — Rp 120.000
  │   □ Roadtrip Sticker Pack — Rp 35.000
  │   ──────────────────────────────
  │     Bundle Hemat: Rp 320.000 (hemat 18%)
  │
  ▼
Beli → Midtrans (BCA/GoPay/QRIS)
  │
  ▼
Trip! Upload foto → testimoni → diskon next purchase
```

### Pain Points yang Diselesaikan

| Masalah User | Solusi |
|---|---|
| "SPBU di jalur ini di mana?" | Otomatis muncul di peta |
| "Jalannya bagus nggak?" | Scraping kondisi jalan real-time |
| "Budget perlu berapa?" | Estimasi BBM + tol + makan otomatis |
| "Apa yg perlu dibawa?" | Rekomendasi produk per rute |
| "Beli di mana?" | Langsung di platform |

---

## 6. Produk E-commerce (Kategorisasi & Margin)

| Kategori | Contoh Produk | Harga Jual | Margin |
|---|---|---|---|
| **Safety & Darurat** | Tire inflator, segitiga, P3K, jumper cable, fire extinguisher | Rp 50-300rb | 30-50% |
| **Comfort** | Car pillow, sleeping bag, cooler bag, folding table, camping chair | Rp 50-500rb | 40-60% |
| **Gadget & Mount** | Phone mount, dashcam, power inverter, power station | Rp 50-2jt | 20-35% |
| **Organizer** | Trunk organizer, seat gap filler, roof box, cargo net | Rp 50-1jt | 40-60% |
| **Lifestyle & Merch** | Stiker roadtrip, mug, tumbler, kaos limited, lampu ambient | Rp 20-150rb | 50-100% |
| **Maintenance** | Wiper, cairan pembersih, air freshener, tire cleaner | Rp 20-100rb | 30-50% |
| **Bundle Hemat** | "Roadtrip Starter Pack" (inflator + mount + P3K + tumbler) | Rp 320rb | 50-70% |

### Strategi Inventory

| Fase | Model | Alasan |
|---|---|---|
| **Bulan 1-3** | Dropship dari supplier | Nol modal stok, validasi produk mana yang laku |
| **Bulan 4-6** | Stok kecil (20-50 unit/produk) untuk top 5 produk | Margin naik, shipping lebih cepat |
| **Bulan 7-12** | Stok penuh top 20 produk | Profit maksimal, brand experience |

### Supplier Options

| Supplier | Pro | Kontra |
|---|---|---|
| **1688 / Alibaba** | Harga murah, variasi banyak | Shipping 2-3 minggu |
| **Supplier lokal (Indonetwork, Jabodetabek)** | Cepat 1-2 hari, retur mudah | Margin lebih tipis |
| **Dropship dari Shopee/Tokopedia** | Tanpa modal stok | Margin terkecil |

---

## 7. Monetisasi & Financial Projection

### Revenue Streams

| Stream | Cara | Potensi |
|---|---|---|
| **Listing UMKM** | Rp 50-200rb/bln per listing | Rp 5-20jt/bln (100 listing) |
| **Affiliate Booking** | Komisi Traveloka/Booking.com | Rp 1-5jt/bln |
| **Premium User** | Rp 10rb/bln (export offline + notif real-time) | Rp 1-5jt/bln |
| **E-commerce** | Margin 30-60% per produk | **Rp 10-100jt+/bln** |

### Financial Projection — Tahun 1

| Bulan | Listing UMKM | Affiliate | E-commerce (margin) | Total |
|---|---|---|---|---|
| 1-3 | Rp 1-3jt | Rp 200-500rb | Rp 0-2jt | **Rp 1,2-5,5jt** |
| 4-6 | Rp 3-10jt | Rp 500rb-2jt | Rp 5-15jt | **Rp 8,5-27jt** |
| 7-9 | Rp 10-15jt | Rp 1-3jt | Rp 15-40jt | **Rp 26-58jt** |
| 10-12 | Rp 15-20jt | Rp 3-5jt | Rp 30-80jt | **Rp 48-105jt** |
| **Total** | **~Rp 120jt** | **~Rp 30jt** | **~Rp 150-400jt** | **~Rp 300-550jt/thn** |

### Biaya Operasional

| Item | Bulanan | Tahunan |
|---|---|---|
| VPS / hosting | $20 | $240 |
| Proxy scraping | $30 | $360 |
| Domain + email | $5 | $60 |
| Database (Supabase) | $25 | $300 |
| Marketing (jika ada) | $0-50 | $0-600 |
| **Total** | **$80-130** | **$960-1.560 (~Rp 15-25jt)** |

### Break-even

**Bulan ke-3 atau 4** — tergantung seberapa cepat listing UMKM dan e-commerce jalan.

---

## 8. Competitive Moat

| Moat | Penjelasan |
|---|---|
| **Data network effect** | Semakin banyak user → semakin banyak laporan kondisi jalan → makin akurat |
| **Scraping infrastructure** | Pipeline stabil multi-source → barrier tinggi untuk copycat |
| **Local knowledge** | POI spesifik Indonesia (warung pinggir jalan, bengkel langganan, jalur tikus) |
| **Content → Commerce** | Orang udah dapat value (rute) → natural beli aksesori |
| **Community trust** | Review sesama roadtripper lebih dipercaya daripada iklan |

### Kenapa Google Maps / Waze Tidak Akan Copy Ini?

| Platform | Alasan |
|---|---|
| **Google Maps** | Terlalu general, bukan khusus roadtrip, nggak jual aksesori |
| **Waze** | Fokus lalu lintas perkotaan, bukan antar kota |
| **Traveloka** | Fokus booking tiket + hotel, bukan konten roadtrip |

---

## 9. Growth Strategy (Organic, 0 Budget Iklan)

| Channel | Cara | Estimasi Traffic |
|---|---|---|
| **SEO** | Landing page per rute: "Jakarta-Jogja roadtrip itinerary 3 hari" | 500-2000 visitor/bln per artikel |
| **Instagram/TikTok** | Post cuplikan POI + info jalan + unboxing aksesori | Organik followers |
| **Komunitas WA/Telegram** | Grup roadtrip → share link rute | 100-500 klik per share |
| **Twitter** | Share info kondisi jalan real-time (otomatis dari scraping) | Viral potensial |
| **Facebook Groups** | Komunitas touring/mobil → share konten relevan | 50-200 klik per post |

### Viral Loop

```
User buat rute
  → share link ke WA grup
    → teman lihat + tertarik
      → teman buat rutenya sendiri
        → share lagi → loop
```

---

## 10. Risk Assessment & Mitigasi

| Risiko | Prob | Dampak | Mitigasi |
|---|---|---|---|
| Scraping diblokir | Medium | Tinggi | Pindah ke crowdsource + user submit |
| Stok e-commerce menumpuk | Medium | Sedang | Mulai dropship dulu |
| Kompetitor masuk | Rendah | Sedang | Fokus ke komunitas + niche lokal |
| No traffic | Medium | Tinggi | Validasi dengan landing page pre-launch |
| Supplier lemot | Tinggi | Rendah | Siapkan 3 supplier cadangan per produk |
| Cashflow e-commerce | Medium | Sedang | Pre-order dulu, baru beli stok |

### Exit Criteria

| Kondisi | Tindakan |
|---|---|
| 3 bulan: 0 MAU | Stop, pivot |
| 6 bulan: <1.000 MAU | Evaluasi growth strategy |
| 12 bulan: <5.000 MAU | Close project |
| Terima legal dari Google | Pivot ke crowdsource model |

---

## 11. Roadmap Eksekusi (12 Minggu)

### ✅ Minggu 1 — Foundation
- [ ] Registrasi domain (roadtripindonesia.com / roadtrip.id)
- [ ] Setup VPS / hosting
- [ ] Setup database (Postgres + PostGIS)
- [ ] Landing page statis dengan waitlist / email capture

### ✅ Minggu 2-3 — Scraping Engine
- [ ] Scraper Google Maps POI (Playwright + proxy)
- [ ] Scraper Twitter/X (kondisi jalan)
- [ ] Scraper MyPertamina (harga BBM)
- [ ] Data pipeline: transform + dedup + simpan ke DB

### ✅ Minggu 4-5 — Frontend Dasar
- [ ] Peta interaktif (Leaflet/MapLibre)
- [ ] Tampilkan POI dari database
- [ ] Filter POI (SPBU, bengkel, kuliner, hotel, spot foto)
- [ ] Search rute (input kota asal → tujuan)

### ✅ Minggu 6-7 — Fitur Tambahan
- [ ] Tampilkan info kondisi jalan di peta
- [ ] Estimasi biaya BBM + tol
- [ ] User register / login
- [ ] Save & share rute

### ✅ Minggu 8-9 — E-commerce
- [ ] Toko online sederhana
- [ ] Integrasi Midtrans (pembayaran)
- [ ] Landing page produk per kategori
- [ ] Rekomendasi produk per rute (manual dulu)

### ✅ Minggu 10-11 — Monetisasi & Polish
- [ ] Sistem listing UMKM
- [ ] Pasang affiliate link
- [ ] Premium subscription
- [ ] SEO optimization

### ✅ Minggu 12 — Launch
- [ ] Final testing
- [ ] Posting ke komunitas
- [ ] Go live publik

---

## 12. Kesimpulan

| Aspek | Skor | Catatan |
|---|---|---|
| Market size | 8/10 | Niche besar, belum terisi |
| Tech feasibility | 7/10 | Scraping perlu maintenance rutin |
| Monetization | 9/10 | E-commerce = revenue jelas |
| Moat | 7/10 | Scraping infra + content-commerce loop |
| Risk | 5/10 | Risiko utama scraping & traffic |

### Final Verdict: **GO**

**Modal awal:** ~$100/bln + waktu 3 bulan.
**Potensi tahun 1:** Rp 300-550 juta.
**Differentiator:** Content → Commerce loop yang nggak dimiliki kompetitor.

---

## 13. Referensi

| Platform | URL | Belajar dari |
|---|---|---|
| Roadtrippers | roadtrippers.com | Konsep POI + trip planner |
| iOverlander | ioverlander.com | Crowdsourced POI untuk overlanding |
| Waze | waze.com | Real-time condition reporting |
| PergiKuliner | pergikuliner.com | Listing bisnis + review model |
| Scenic | scenicapp.space | GPS + scenic route untuk roadtrip |

---

> **Dibuat:** 26 Mei 2026
> **Catatan:** Dokumen ini adalah living document. Update sesuai perkembangan.
