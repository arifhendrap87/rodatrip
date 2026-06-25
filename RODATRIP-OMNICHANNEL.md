# RodaTrip — Omnichannel Flow & Perintah AI

## 3 Pilar Bisnis
1. **Konten Roadtrip** — itinerary, spot, rute (via Gemini)
2. **Jual Aksesoris Mobil** — dropship Jakmall → jual di Tokopedia
3. **Jual Mobil Marketplace** — coming soon

## Flow Omnichannel (Pilar 2)

```
Jakmall (dropship source)
    │ Scrape via Chrome DevTools
    ▼
RodaTrip CMS (database produk)
    │ Push via Chrome DevTools
    ▼
Tokopedia (toko online)
```

## Database — Tabel Products

### Kolom Existing
| Kolom | Tipe | Untuk |
|-------|------|-------|
| `id` | uuid | Primary key |
| `slug` | text | URL friendly |
| `name` | text | Nama produk |
| `category` | text | Kategori |
| `price` | integer | Harga jual |
| `description` | text | Deskripsi |
| `image_url` | text | Gambar utama |
| `source` | text | Asal (Jakmall, dll) |
| `external_id` | text | SKU dari marketplace |
| `weight` | integer | Berat (gram) |
| `dimensions` | text | Dimensi |
| `tokopedia_url` | text | Link Tokopedia |

## Data yang Di-scrape dari Jakmall

Semua produk diakses via **Inventory List** setelah login mitra:
- **Login:** `https://www.jakmall.com/login`
- **Inventory List:** `https://www.jakmall.com/mitra/inventory-list`

Dari halaman detail produk Jakmall, scrape field berikut:

| Field di Jakmall | Field di CMS | Selector (perkiraan) |
|-----------------|--------------|---------------------|
| Nama produk | `name` | `.product-title` |
| Harga dropship | `price` | `.product-price` |
| Harga asli (coret) | — | `.original-price` |
| Gambar (semua) | `image_url` (yang pertama) | `.product-gallery img` |
| SKU | `external_id` | Tabel inventory / halaman detail |
| Berat | `weight` | `.product-weight` |
| Dimensi | `dimensions` | `.product-dimension` |
| Supplier | — | `.seller-name` |
| Link Jakmall | — | URL halaman |

## ✅ Perintah untuk AI (via Chrome DevTools)

### Perintah 1: Scrape Produk dari Jakmall
```
⚠️ Sebelum scrape: user HARUS login ke akun mitra Jakmall dulu.
   Halaman inventory hanya bisa diakses setelah login.

1. Buka https://www.jakmall.com/mitra/inventory-list (halaman inventory)
2. Pilih salah satu produk dari daftar → klik nama produk
3. Dari halaman detail produk, scrape data berikut:
   - Nama produk
   - Harga dropship (angka saja)
   - URL gambar utama
   - SKU
   - Berat (gram, angka saja)
   - Dimensi
   - Deskripsi
4. Tampilkan hasilnya ke user untuk dikonfirmasi
```

### Perintah 2: Input ke CMS RodaTrip
```
Buka /admin/products/new → isi form:
- Name ← nama hasil scrape
- Price ← harga dropship
- Sumber ← "Jakmall"
- External ID (SKU) ← SKU hasil scrape
- Weight (gram) ← berat hasil scrape
- Dimensions ← dimensi hasil scrape
- Tokopedia URL ← (kosong, diisi manual nanti)
- Description ← deskripsi hasil scrape
Klik Save.
```

### Perintah 3: Push ke Tokopedia (nanti)
```
Buka Tokopedia Seller → halaman tambah produk
Isi form dengan data yang sama dari CMS RodaTrip
(Catatan: kena captcha → minta user verify manual)
```

## Todo List
- [x] Migration DB (5 kolom omnichannel)
- [x] Zod validator update
- [x] TypeScript interface update
- [x] Admin form produk (new + edit)
- [ ] Scrape produk pertama dari Jakmall
- [ ] Input ke CMS RodaTrip
- [ ] Explore Tokopedia Seller form
- [ ] Push produk ke Tokopedia
