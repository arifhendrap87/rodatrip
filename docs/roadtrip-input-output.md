---
# =========================================================================
# ⚙️ INPUT CMS (DASHBOARD ADMIN)
# Data makro wilayah dan data repeater per "STOP" destinasi
# =========================================================================

# 1. Informasi Umum Makro Jalur Kabupaten
title: "Road Trip Tasikmalaya: Menyusuri Jalur Pegunungan hingga Pantai Selatan"
itinerary_duration: "3 Hari 2 Malam"
total_distance: "± 140 km"
road_condition: "Variatif (Pegunungan menanjak di Utara, Jalur lurus cepat di Lintas Selatan)"
estimated_cost: "Bensin & Tol: ± Rp 400.000 - Rp 600.000 (Awal dari Jakarta)"
best_driving_time: "Pagi hari (Hindari melewati jalur pegunungan/tanjakan ekstrem saat malam hari)"
route_facilities:
  - "Banyak SPBU"
  - "Banyak Rest Area"
  - "Bengkel 24 Jam"
  - "Ramah EV Charger"
maps_embed_url: "https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!..."

# 2. DATA REPEATER DESTINASI (Input per STOP Wisata)
destinations_timeline:
  - stop_number: 1
    name: "Gunung Galunggung"
    category: "⛰️ Alam & Petualangan"
    visit_duration: "2 - 3 Jam"
    best_visit_hour: "06.00 - 09.00 WIB"
    ticket_price: "Rp 15.000 / orang"
    parking_fee: "Motor: Rp 5.000 | Mobil: Rp 15.000"
    additional_cost: "Ojek kawah (opsional): Rp 25.000 | Tiket Air Panas: Rp 10.000"
    physical_effort: "Sedang - Berat (Harus menaiki 620 anak tangga jika ingin ke bibir kawah jalan kaki)"
    spot_facilities:
      - "Toilet & Kamar Bilas"
      - "Warung Makanan"
      - "Penyewaan Tikar"
      - "Area Camping"
    spot_important_note: "Kendaraan matic harus ekstra hati-hati saat jalan turun. Gunakan engine brake dan istirahat di bawah jika piringan rem terlalu panas."
    description: "Pemberhentian pertama setelah Anda keluar dari jalur utama antarkota. Di sini petualangan dimulai dengan menikmati pemandangan kawah hijau yang megah. Anda bisa menantang diri menaiki 620 anak tangga legendaris atau menggunakan jasa ojek lokal lewat jalur alternatif langsung ke bibir kawah."
    slug_link: "/wisata/gunung-galunggung"

  - stop_number: 2
    name: "Tonjong Canyon"
    category: "🌲 Surga Tersembunyi (Hidden Gem)"
    visit_duration: "2 Jam"
    best_visit_hour: "10.00 - 14.00 WIB"
    ticket_price: "Rp 10.000 / orang"
    parking_fee: "Motor: Rp 2.000 | Mobil: Rp 5.000"
    additional_cost: "Sewa pelampung/Ban (opsional): Rp 10.000"
    physical_effort: "Ringan (Trekking santai menyusuri pinggir sungai batu)"
    spot_facilities:
      - "Gazebo"
      - "Warung Kecil"
      - "Toilet"
      - "Sewa Pelampung"
    spot_important_note: "Akses jalan masuk dari jalan raya utama sedikit mengecil, namun permukaan aspalnya masih aman untuk mobil keluarga sekelas LMPV."
    description: "Bergerak dari arah Galunggung menuju wilayah Cisayong. Tempat ini menyuguhkan replika 'Green Canyon' berupa tebing batu purba eksotis dengan aliran sungai berwarna hijau toska yang sangat tenang. Sangat pas untuk bermain air ringan atau berfoto santai sebelum melanjutkan rute ke selatan."
    slug_link: "/wisata/tonjong-canyon"

  - stop_number: 3
    name: "Pantai Karang Tawulan"
    category: "🌊 Wisata Bahari / Pantai"
    visit_duration: "3 Jam"
    best_visit_hour: "16.00 - 18.00 WIB (Mengejar Sunset)"
    ticket_price: "Rp 15.000 / orang"
    parking_fee: "Motor: Rp 3.000 | Mobil: Rp 10.000"
    additional_cost: "Spot foto/akses area tebing khusus: Rp 5.000"
    physical_effort: "Ringan (Berjalan santai di atas hamparan rumput hijau tebing pantai)"
    spot_facilities:
      - "Spot Foto Estetik"
      - "Area Parkir Luas"
      - "Mushola"
      - "Penginapan / Homestay"
    spot_important_note: "Ombak pantai selatan sangat besar dan di bawah tebing berupa batu karang tajam. Dilarang keras berenang ke tengah laut."
    description: "Menuju batas paling selatan Tasikmalaya via jalur Cikalong. Karang Tawulan menawarkan lanskap tebing karang yang menjorok ke laut, sekilas mirip dengan suasana Tanah Lot di Bali. Deburan ombak yang menghantam batu karang dan hamparan rumput hijau menjadikannya spot penutup hari pertama yang magis."
    slug_link: "/wisata/pantai-karang-tawulan"

# 3. Kolom Teks Tambahan Catatan Perjalanan umum
driving_safety_tips: "Selalu pastikan kondisi rem dan tekanan angin ban dalam keadaan prima sebelum memulai road trip di jalur Priangan Timur."
culinary_notes: "Coba Nasi TO (Tutug Oncom) Benhil di pusat kota untuk sarapan, dan mampir ke Sentra Anyaman Rajapolah saat arah pulang untuk berburu kerajinan lokal."
---

# =========================================================================

# 🖥️ OUTPUT HALAMAN DETAIL WEBSITE (FRONTEND RENDERING)

# Program frontend website Anda akan menerjemahkan data array di atas

# menjadi layout visual timeline yang informatif seperti di bawah ini:

# =========================================================================

## 🏎️ Urutan Destinasi (Timeline Itinerary Searah)

Berikut adalah panduan urutan rute perjalanan (_timeline_) dari titik singgah pertama hingga akhir agar perjalanan _road trip_ Anda searah dan efisien:

### 📍 STOP 1: Gunung Galunggung

- **Kategori:** ⛰️ Alam & Petualangan
- **Estimasi Waktu Wisata:** 2 - 3 Jam | **Waktu Terbaik:** 🌅 06.00 - 09.00 WIB

**💵 Info Tiket & Biaya:**

- **Tiket Masuk:** Rp 15.000 / orang
- **Tarif Parkir:** Motor: Rp 5.000 | Mobil: Rp 15.000
- **Biaya Tambahan:** Ojek kawah (Rp 25.000), Kolam Air Panas (Rp 10.000)

**🏃 Kondisi Fisik & Medan:**

- **Tingkat Kesulitan:** Sedang - Berat (Harus menaiki 620 anak tangga jika ingin ke bibir kawah berjalan kaki).

**⛺ Fasilitas di Lokasi:**
`Toilet & Kamar Bilas` `Warung Makanan` `Penyewaan Tikar` `Area Camping`

> ⚠️ **Catatan Penting Pengendara:**
> _Kendaraan matic harus ekstra hati-hati saat jalan turun. Gunakan engine brake dan istirahat di bawah jika piringan rem terlalu panas._

Pemberhentian pertama setelah Anda keluar dari jalur utama antarkota. Di sini petualangan dimulai dengan menikmati pemandangan kawah hijau yang megah. Anda bisa menantang diri menaiki 620 anak tangga legendaris atau menggunakan jasa ojek lokal lewat jalur alternatif langsung ke bibir kawah.

👉 **Baca ulasan lengkap tempat ini:** [Detail Wisata Gunung Galunggung](/wisata/gunung-galunggung)

---

### 📍 STOP 2: Tonjong Canyon

- **Kategori:** 🌲 Surga Tersembunyi (Hidden Gem)
- **Estimasi Waktu Wisata:** 2 Jam | **Waktu Terbaik:** ☀️ 10.00 - 14.00 WIB

**💵 Info Tiket & Biaya:**

- **Tiket Masuk:** Rp 10.000 / orang
- **Tarif Parkir:** Motor: Rp 2.000 | Mobil: Rp 5.000
- **Biaya Tambahan:** Sewa pelampung/Ban (Rp 10.000)

**🏃 Kondisi Fisik & Medan:**

- **Tingkat Kesulitan:** Ringan (Trekking santai menyusuri pinggir sungai batu).

**⛺ Fasilitas di Lokasi:**
`Gazebo` `Warung Kecil` `Toilet` `Sewa Pelampung`

> ⚠️ **Catatan Penting Pengendara:**
> _Akses jalan masuk dari jalan raya utama sedikit mengecil, namun permukaan aspalnya masih aman untuk mobil keluarga sekelas LMPV._

Bergerak dari arah Galunggung menuju wilayah Cisayong. Tempat ini menyuguhkan replika 'Green Canyon' berupa tebing batu purba eksotis dengan aliran sungai berwarna hijau toska yang sangat tenang. Sangat pas untuk bermain air ringan atau berfoto santai sebelum melanjutkan rute ke selatan.

👉 **Baca ulasan lengkap tempat ini:** [Detail Wisata Tonjong Canyon](/wisata/tonjong-canyon)

---

### 📍 STOP 3: Pantai Karang Tawulan

- **Kategori:** 🌊 Wisata Bahari / Pantai
- **Estimasi Waktu Wisata:** 3 Jam | **Waktu Terbaik:** 🌅 16.00 - 18.00 WIB (Mengejar Sunset)

**💵 Info Tiket & Biaya:**

- **Tiket Masuk:** Rp 15.000 / orang
- **Tarif Parkir:** Motor: Rp 3.000 | Mobil: Rp 10.000
- **Biaya Tambahan:** Spot foto/akses area tebing khusus (Rp 5.000)

**🏃 Kondisi Fisik & Medan:**

- **Tingkat Kesulitan:** Ringan (Berjalan santai di atas hamparan rumput hijau tebing pantai).

**⛺ Fasilitas di Lokasi:**
`Spot Foto Estetik` `Area Parkir Luas` `Mushola` `Penginapan / Homestay`

> ⚠️ **Catatan Penting Pengendara:**
> _Ombak pantai selatan sangat besar dan di bawah tebing berupa batu karang tajam. Dilarang keras berenang ke tengah laut._

Menuju batas paling selatan Tasikmalaya via jalur Cikalong. Karang Tawulan menawarkan lanskap tebing karang yang menjorok ke laut, sekilas mirip dengan suasana Tanah Lot di Bali. Deburan ombak yang menghantam batu karang dan hamparan rumput hijau menjadikannya spot penutup hari pertama yang magis.

👉 **Baca ulasan lengkap tempat ini:** [Detail Wisata Pantai Karang Tawulan](/wisata/pantai-karang-tawulan)
