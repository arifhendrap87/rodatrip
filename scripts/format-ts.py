#!/usr/bin/env python3
"""
format-ts.py — Generate spots.ts-compatible entries from enriched data + manual overrides.

Usage:
  python3 format-ts.py
  python3 format-ts.py --clipboard (macOS: copy to clipboard)
"""

import json
import sys

ENRICHED_PATH = "enriched-spots.json"

TODAY = "2026-05-27"

# Default tags per category
CATEGORY_TAGS: dict[str, list[str]] = {
    "alam": ["alam", "wisata", "foto"],
    "kuliner": ["kuliner", "makan", "travel"],
    "budaya": ["budaya", "sejarah", "tradisi"],
    "foto": ["foto", "instagramable", "spot-foto"],
    "petualangan": ["petualangan", "trekking", "outdoor"],
    "sejarah": ["sejarah", "budaya", "museum"],
}

# Country-wide common facilities
COMMON_FACILITIES = ["Parkir", "Toilet", "Mushola", "Warung"]

# ─── Manual Overrides ────────────────────────────────────────────────────────

MANUAL: dict[str, dict] = {
    "Gunung Tangkuban Perahu": {
        "description": "Gunung berapi aktif dengan kawah besar yang bisa diakses langsung dari parkir. Pemandangan kawah yang mengeluarkan asap belerang, ditambah hutan pinus di sekelilingnya.",
        "whySpecial": "Salah satu gunung berapi paling mudah diakses di Indonesia — cukup jalan 100 meter dari parkir untuk sampai ke bibir kawah. Legenda Sangkuriang yang melegenda.",
        "rating": 4.6,
        "tips": "Cuaca bisa berubah cepat — bawa jaket. Aroma belerang cukup kuat, siapkan masker. Bawa kamera untuk kawah dari berbagai angle.",
        "bestTime": "Pagi (07:00-11:00)",
        "openingHours": "07:00 - 17:00 WIB",
        "estimatedTime": "2-3 jam",
        "ticketPrice": "Rp 50.000 (weekday) / Rp 75.000 (weekend) + asuransi Rp 5.000",
        "roadAccess": "Mobil & Motor — aspal mulus, parkir luas di bibir kawah",
        "facilities": ["Parkir", "Toilet", "Mushola", "Warung", "Sewa Jaket", "Spot Foto"],
        "distanceFromCity": "30 km dari Bandung (1 jam) — arah Lembang",
        "tags": ["gunung", "kawah", "bandung", "legenda"],
    },
    "Gedung Sate Bandung": {
        "description": "Gedung bersejarah ikonik di pusat Bandung dengan arsitektur kolonial khas Hindia Belanda. Kini menjadi kantor Gubernur Jawa Barat dengan taman yang asri.",
        "whySpecial": "Ikon arsitektur Jawa Barat. Tusuk sate (ornamen atap yang mirip tusuk sate) — 6 tusuk melambangkan 6 juta gulden biaya pembangunan tahun 1920.",
        "rating": 4.7,
        "tips": "Akses terbatas ke dalam gedung (hari kerja). Taman depan bagus buat foto. Malam hari lampu taman menyala — suasana romantis. Parkir basement tersedia.",
        "bestTime": "Pagi (08:00-11:00) / Malam (18:00-21:00)",
        "openingHours": "Area taman: 06:00 - 22:00 WIB (gedung: jam kerja)",
        "estimatedTime": "1-2 jam",
        "ticketPrice": "Gratis (area taman) — parkir bayar",
        "roadAccess": "Mobil & Motor — jalan protokol di pusat Bandung",
        "facilities": ["Parkir", "Toilet", "Taman", "Spot Foto", "Mushola"],
        "distanceFromCity": "Pusat Bandung — 2 km dari Stasiun Bandung",
        "tags": ["bandung", "sejarah", "arsitektur", "foto"],
    },
    "Alun-Alun Bandung": {
        "description": "Alun-alun kota Bandung yang ikonik dengan taman rumput sintetis, lampu hias, dan suasana santai. Pusat keramaian kota setiap akhir pekan.",
        "whySpecial": "Lokasi nongkrong favorit warga Bandung. Rumput sintetis yang bersih — duduk santai sambil lihat keramaian kota. Air mancur menari di malam hari.",
        "rating": 4.3,
        "tips": "Parkir di dalam masjid atau gedung parkiran. Sabtu-Malam Minggu paling ramai. Jangan parkir sembarangan — banyak tukang parkir liar. Bawa tikar kecil.",
        "bestTime": "Sore - Malam (16:00-21:00)",
        "openingHours": "24 jam (air mancur: 18:00-22:00 WIB)",
        "estimatedTime": "1-2 jam",
        "ticketPrice": "Gratis",
        "roadAccess": "Mobil & Motor — di pusat Kota Bandung, macet di jam sibuk",
        "facilities": ["Parkir", "Masjid Raya", "Spot Duduk", "Warung"],
        "distanceFromCity": "Pusat Bandung — 1 km dari Stasiun Bandung",
        "tags": ["bandung", "alun-alun", "nongkrong", "pusat-kota"],
    },
    "Orchid Forest Cikole": {
        "description": "Taman anggrek terbesar di Indonesia dengan ribuan spesies anggrek. Jembatan gantung, canopy walk, dan taman bunga yang Instagramable di kawasan hutan pinus Lembang.",
        "whySpecial": "Koleksi anggrek terlengkap di Indonesia — 10.000 anggrek dari 100 spesies. Canopy walk di ketinggian dengan view hutan pinus dari atas. Spot foto tak terbatas.",
        "rating": 4.4,
        "tips": "Datang pagi hari untuk hindari keramaian. Bawa kamera wide-angle. Ada jembatan gantung yang cukup panjang. Cuaca Lembang dingin — bawa jaket.",
        "bestTime": "Pagi (08:00-12:00)",
        "openingHours": "08:00 - 17:00 WIB",
        "estimatedTime": "2-3 jam",
        "ticketPrice": "Rp 35.000 (weekday) / Rp 50.000 (weekend)",
        "roadAccess": "Mobil & Motor — akses bagus di kawasan Lembang",
        "facilities": ["Parkir", "Toilet", "Mushola", "Kafe", "Canopy Walk", "Gardu Pandang"],
        "distanceFromCity": "20 km dari Bandung (45 menit) — arah Lembang",
        "tags": ["anggrek", "alam", "foto", "lembang"],
    },
    "Farmhouse Lembang": {
        "description": "Kawasan wisata bertema Eropa dengan bangunan ala Belanda, taman bunga, dan spot foto yang sangat Instagramable. Cocok untuk keluarga dan foto prewedding.",
        "whySpecial": "Spot foto ala Eropa tanpa perlu ke luar negeri. Taman bunga dengan latar pegunungan, kostum ala koboy, dan susu murni segar langsung dari peternakan.",
        "rating": 4.2,
        "tips": "Datang weekday untuk hindari antrean panjang. Sewa kostum ala koboy/Belanda untuk foto. Bawa camilan untuk anak-anak. Parkir luas tapi bayar.",
        "bestTime": "Pagi (08:00-12:00)",
        "openingHours": "08:00 - 20:00 WIB",
        "estimatedTime": "2-3 jam",
        "ticketPrice": "Rp 30.000 (weekday) / Rp 45.000 (weekend)",
        "roadAccess": "Mobil & Motor — akses bagus di Lembang",
        "facilities": ["Parkir", "Toilet", "Mushola", "Kafe", "Taman", "Spot Foto", "Sewa Kostum"],
        "distanceFromCity": "18 km dari Bandung (40 menit) — arah Lembang",
        "tags": ["lembang", "foto", "keluarga", "taman"],
    },
    "Kawah Rengganis": {
        "description": "Kawah vulkanik tersembunyi di Ciwidey dengan kolam air panas alami. Pemandangan pegunungan hijau dan hutan pinus yang masih alami dan jarang pengunjung.",
        "whySpecial": "Alternatif Kawah Putih yang lebih sepi — bisa menikmati keindahan kawah tanpa keramaian. Kolam air panas alami yang bisa langsung dipakai berendam.",
        "rating": 4.3,
        "tips": "Akses jalan cukup terjal — siapkan fisik. Bawa baju ganti untuk berendam. Tiket terbatas, datang pagi. Cuaca dingin — bawa jaket tebal.",
        "bestTime": "Pagi (07:00-11:00)",
        "openingHours": "07:00 - 16:00 WIB",
        "estimatedTime": "3-4 jam",
        "ticketPrice": "Rp 25.000 (termasuk kolam rendam)",
        "roadAccess": "Mobil & Motor — jalan desa, agak rusak di beberapa titik",
        "facilities": ["Parkir", "Toilet", "Mushola", "Kolam Air Panas", "Warung"],
        "distanceFromCity": "55 km dari Bandung (1,5 jam) — arah Ciwidey",
        "tags": ["kawah", "air-panas", "ciwidey", "tersembunyi"],
    },
    "Taman Safari Bogor": {
        "description": "Taman satwa interaktif terbesar di Indonesia dengan konsep safari drive-thru. Lebih dari 2.500 hewan dari 200 spesies, taman bermain, dan hotel unik.",
        "whySpecial": "Satu-satunya tempat di Indonesia dekat Jakarta yang bisa lihat hewan dari mobil langsung. Bayi harimau, jerapah, dan safari malam — pengalaman seru untuk keluarga.",
        "rating": 4.7,
        "tips": "Beli tiket online H-1 untuk harga lebih murah. Bawa wortel/buah untuk kasih makan hewan (dijual juga di lokasi). Weekday jauh lebih sepi.",
        "bestTime": "Pagi (08:00-12:00)",
        "openingHours": "08:30 - 17:00 WIB (weekend: 08:00 - 17:00 WIB)",
        "estimatedTime": "4-6 jam — bisa full day",
        "ticketPrice": "Rp 250.000 (weekday) / Rp 350.000 (weekend) — termasuk safari",
        "roadAccess": "Mobil pribadi wajib untuk safari drive-thru — motor tidak disarankan",
        "facilities": ["Parkir", "Toilet", "Mushola", "Restoran", "Hotel", "Taman Bermain"],
        "distanceFromCity": "80 km dari Jakarta (2 jam) / 20 km dari Bogor (40 menit)",
        "tags": ["hewan", "safari", "keluarga", "bogor"],
    },
    "Curug Cigamea": {
        "description": "Air terjun tersembunyi di kawasan Gunung Salak dengan ketinggian sekitar 40 meter. Trekking singkat melewati hutan tropis dan sungai kecil.",
        "whySpecial": "Air terjun yang masih alami dan sepi pengunjung — cocok untuk yang mau menikmati alam tanpa keramaian. Kolam alami di bawah air terjun untuk berenang.",
        "rating": 4.2,
        "tips": "Sepatu anti-slip wajib — trek basah dan licin. Bawa baju ganti. Cuaca di gunung cepat berubah. Bawa bekal sendiri karena tidak ada warung di lokasi.",
        "bestTime": "Pagi (07:00-11:00) — hindari sore karena kabut",
        "openingHours": "06:00 - 16:00 WIB",
        "estimatedTime": "2-3 jam (termasuk trekking)",
        "ticketPrice": "Rp 15.000",
        "roadAccess": "Motor recommended — akses jalan kampung, mobil terbatas",
        "facilities": ["Parkir", "Toilet Sederhana"],
        "distanceFromCity": "60 km dari Bogor (1,5 jam) — arah Cigudeg",
        "tags": ["air-terjun", "trekking", "alam", "tersembunyi"],
    },
    "Telaga Warna Puncak": {
        "description": "Danau alami di kawasan Puncak dengan fenomena air yang bisa berubah warna — hijau, biru, hingga kuning tergantung cuaca dan kandungan mineral.",
        "whySpecial": "Fenomena langka danau berubah warna yang masih misterius. Pemandangan pegunungan hijau di sekeliling — salah satu spot foto favorit di jalur Puncak.",
        "rating": 4.3,
        "tips": "Akses dari Puncak Pass — 15 menit jalan kaki. Cuaca paling cerah pagi hari. Weekend sangat ramai. Bawa jaket — suhu Puncak 15-20°C.",
        "bestTime": "Pagi (07:00-10:00)",
        "openingHours": "06:00 - 17:00 WIB",
        "estimatedTime": "1-2 jam",
        "ticketPrice": "Rp 25.000 (weekday) / Rp 35.000 (weekend)",
        "roadAccess": "Mobil & Motor — di kawasan Puncak, akses bagus tapi macet weekend",
        "facilities": ["Parkir", "Toilet", "Mushola", "Warung", "Spot Foto"],
        "distanceFromCity": "90 km dari Jakarta (2 jam) / 30 km dari Bogor (1 jam)",
        "tags": ["danau", "puncak", "foto", "alam"],
    },
    "Sate Maranggi Cianjur": {
        "description": "Sate kambing muda khas Cianjur yang terkenal se-Jawa Barat. Daging empuk, bumbu kecap manis dengan potongan tomat dan cabai, disajikan dengan ketupat.",
        "whySpecial": "Salah satu kuliner legendaris Jawa Barat yang sudah terkenal sejak 1950-an. Potongan daging kambing muda yang besar dengan bumbu yang meresap sempurna.",
        "rating": 4.8,
        "tips": "Paling enak dimakan hangat langsung dari panggangan. Sate Maranggi asli ada di daerah Cianjur, bukan di Bandung. Level pedas bisa request. Bawa tisu basah.",
        "bestTime": "Siang - Sore (11:00-17:00)",
        "openingHours": "09:00 - 18:00 WIB",
        "estimatedTime": "45 menit - 1 jam",
        "ticketPrice": "Rp 35.000 - 60.000 per porsi (10 tusuk)",
        "roadAccess": "Mobil & Motor — di pinggir jalan raya Cianjur-Bandung",
        "facilities": ["Parkir", "Mushola", "Leschan"],
        "distanceFromCity": "Pusat Cianjur — 80 km dari Bandung (2 jam)",
        "tags": ["sate", "kuliner", "cianjur", "legend"],
    },
    "Cipanas Hot Spring": {
        "description": "Pemandian air panas alami di kaki Gunung Gede Pangrango. Air belerang hangat (38-42°C) yang dipercaya baik untuk kesehatan kulit dan relaksasi otot.",
        "whySpecial": "Air panas alami dengan pemandangan gunung — berendam sambil lihat hutan tropis. Suhu air pas untuk merilekskan badan setelah perjalanan jauh.",
        "rating": 4.2,
        "tips": "Bawa handuk dan baju ganti sendiri. Weekday lebih sepi. Jangan berendam terlalu lama (max 20-30 menit). Minum air putih cukup setelah berendam.",
        "bestTime": "Pagi (07:00-11:00)",
        "openingHours": "07:00 - 17:00 WIB",
        "estimatedTime": "2-3 jam",
        "ticketPrice": "Rp 30.000 - 50.000 (tergantung kolam)",
        "roadAccess": "Mobil & Motor — akses bagus dari jalur Puncak-Cianjur",
        "facilities": ["Parkir", "Toilet", "Mushola", "Kolam Air Panas", "Kantin"],
        "distanceFromCity": "100 km dari Jakarta (2,5 jam) / 25 km dari Cianjur (40 menit)",
        "tags": ["air-panas", "relaksasi", "puncak", "cianjur"],
    },
    "Gunung Gede Pangrango": {
        "description": "Taman nasional dengan dua gunung berapi — Gunung Gede (2.958 mdpl) dan Pangrango (3.019 mdpl). Hutan tropis lebat, savana, dan edelweiss di puncak.",
        "whySpecial": "Salah satu taman nasional paling populer di Indonesia. Trekking 2 hari 1 malam dengan pemandangan yang beragam — dari hutan tropis ke savana subalpin.",
        "rating": 4.7,
        "tips": "Izin pendakian booking online minimal H-7. Bawa sleeping bag dan matras. Trek cukup berat — siapkan fisik sebulan sebelumnya. Sewa guide di basecamp.",
        "bestTime": "April - Oktober (musim kemarau)",
        "openingHours": "24 jam (izin pendakian: 08:00 - 16:00 WIB)",
        "estimatedTime": "2 hari 1 malam",
        "ticketPrice": "Rp 50.000 (pendakian) + guide Rp 250.000/hari",
        "roadAccess": "Mobil & Motor — aspal mulus sampai basecamp Cibodas",
        "facilities": ["Basecamp", "Parkir", "Toilet", "Mushola", "Homestay", "Warung"],
        "distanceFromCity": "100 km dari Jakarta (2,5 jam) / 15 km dari Cipanas (30 menit)",
        "tags": ["gunung", "trekking", "taman-nasional", "petualangan"],
    },
    "Cipanas Garut": {
        "description": "Kawasan wisata air panas alami di kaki Gunung Papandayan. Beberapa kolam dengan suhu berbeda, pemandian air belerang, dan pemandangan pegunungan yang indah.",
        "whySpecial": "Air panas dengan kandungan belerang tinggi yang dipercaya menyembuhkan berbagai penyakit kulit. Suasana pegunungan yang tenang dan sejuk.",
        "rating": 4.1,
        "tips": "Bawa baju ganti dan handuk. Hindari perhiasan — belerang bisa menghitamkan perak. Jangan langsung mandi air dingin setelah berendam di air panas.",
        "bestTime": "Pagi (07:00-11:00)",
        "openingHours": "07:00 - 17:00 WIB",
        "estimatedTime": "2-3 jam",
        "ticketPrice": "Rp 25.000 - 50.000",
        "roadAccess": "Mobil & Motor — akses bagus, 15 menit dari pusat Garut",
        "facilities": ["Parkir", "Toilet", "Mushola", "Kolam Air Panas", "Warung", "Penginapan"],
        "distanceFromCity": "Pusat Garut (15 menit) — 80 km dari Bandung (2 jam)",
        "tags": ["air-panas", "garut", "relaksasi", "pegunungan"],
    },
    "Green Canyon Cijulang": {
        "description": "Sungai dengan tebing-tebing batu kapur hijau yang menjulang. Menyusuri sungai dengan perahu motor melewati stalaktit, stalagmit, dan hutan tropis di tepi sungai.",
        "whySpecial": "Amazon-nya Indonesia! Tebing hijau lumut yang spektakuler, air sungai jernih, dan suasana mistis. Bisa berenang di gua-gua kecil — adventure class.",
        "rating": 4.7,
        "tips": "Baju renang wajib — pasti basah kena percikan air. Bawa dry bag untuk hp/kamera. Dari Pangandaran 45 menit. Sewa perahu motor (Rp 150-300k per boat).",
        "bestTime": "Pagi - Siang (08:00-14:00)",
        "openingHours": "07:00 - 16:00 WIB",
        "estimatedTime": "3-4 jam",
        "ticketPrice": "Rp 25.000 + sewa perahu Rp 150.000 - 300.000 (max 6 orang)",
        "roadAccess": "Mobil & Motor — aspal mulus dari Pangandaran",
        "facilities": ["Parkir", "Toilet", "Mushola", "Sewa Perahu", "Warung", "Penginapan"],
        "distanceFromCity": "30 km dari Pangandaran (45 menit) — 250 km dari Bandung (5 jam)",
        "tags": ["sungai", "petualangan", "pangandaran", "gowa"],
    },
    "Pantai Ujung Genteng": {
        "description": "Pantai selatan yang masih alami di Sukabumi. Pasir putih, ombak besar untuk surfing, hutan penyu, dan pemandangan sunset yang luar biasa tanpa keramaian.",
        "whySpecial": "Salah satu pantai paling sepi di Jawa Barat — bisa menikmati pantai pribadi. Spot konservasi penyu hijau (musim April-Oktober). Ombak kelas dunia untuk surfing.",
        "rating": 4.5,
        "tips": "Akses agak jauh dan jalan terakhir cukup rusak — siapkan fisik supir. Bawa bensin cadangan karena minim SPBU. Bawa belanja sendiri dari kota.",
        "bestTime": "Pagi - Sore",
        "openingHours": "24 jam",
        "estimatedTime": "Full day — bisa overnight",
        "ticketPrice": "Rp 15.000 (motor) / Rp 30.000 (mobil)",
        "roadAccess": "Mobil — jalan aspal 80% bagus, 20% terakhir rusak. Motor lebih mudah.",
        "facilities": ["Parkir", "Toilet", "Mushola", "Homestay", "Warung", "Konservasi Penyu"],
        "distanceFromCity": "140 km dari Bogor (4 jam) — 60 km dari Sukabumi (2 jam)",
        "tags": ["pantai", "surfing", "penyu", "tersembunyi"],
    },
    "Geopark Ciletuh": {
        "description": "Geopark UNESCO Global dengan tebing-tebing purba, air terjun bertingkat, dan pemandangan teluk yang spektakuler. Salah satu geosite terpenting di Indonesia.",
        "whySpecial": "Geopark pertama di Jawa Barat yang diakui UNESCO. Tebing purba berusia 100 juta tahun, air terjun bertingkat, dan pantai dengan pasir putih.",
        "rating": 4.5,
        "tips": "Akses jalan cukup menantang — siapkan fisik. Sewa motor lebih recommended. Bawa bekal. Minimal 2 hari untuk eksplorasi semua spot.",
        "bestTime": "Pagi - Sore",
        "openingHours": "24 jam (kantor info: 08:00-16:00 WIB)",
        "estimatedTime": "2-3 hari",
        "ticketPrice": "Gratis (tiket kawasan Rp 15.000)",
        "roadAccess": "Motor recommended — jalan berkelok dan menanjak, beberapa titik rusak",
        "facilities": ["Parkir", "Toilet", "Homestay", "Warung", "Info Center"],
        "distanceFromCity": "140 km dari Bogor (4 jam) — 50 km dari Sukabumi (1,5 jam)",
        "tags": ["geopark", "unesco", "petualangan", "sukabumi"],
    },
    "Pantai Santolo": {
        "description": "",
        "whySpecial": "",
        "rating": 4.4,
        "tips": "Ombak cukup besar — hati-hati berenang. Bawa payung dan tikar. Akhir pekan ramai pengunjung lokal. Coba ikan bakar di warung tepi pantai.",
        "bestTime": "Pagi - Sore",
        "openingHours": "24 jam",
        "estimatedTime": "2-3 jam",
        "ticketPrice": "Rp 10.000 (motor) / Rp 25.000 (mobil)",
        "roadAccess": "Mobil & Motor — aspal mulus dari pusat Garut",
        "facilities": ["Parkir", "Toilet", "Mushola", "Warung", "Ikan Bakar", "Spot Foto"],
        "distanceFromCity": "35 km dari Garut (1 jam) — 100 km dari Bandung (3 jam)",
        "tags": ["pantai", "garut", "ikan-bakar", "keluarga"],
    },
    "Curug Cimahi": {
        "description": "",
        "whySpecial": "",
        "rating": 4.5,
        "tags": ["air-terjun", "curug", "bandung", "trekking"],
    },
    "Tebing Keraton": {
        "description": "",
        "whySpecial": "",
        "rating": 4.4,
        "tags": ["tebing", "sunrise", "foto", "bandung"],
    },
    "Museum Geologi Bandung": {
        "description": "",
        "whySpecial": "",
        "rating": 4.6,
        "tags": ["museum", "geologi", "sejarah", "bandung"],
    },
    "Situ Patenggang": {
        "description": "",
        "whySpecial": "",
        "rating": 4.5,
        "tags": ["danau", "ciwidey", "foto", "perahu"],
    },
    "Kebun Raya Bogor": {
        "description": "",
        "whySpecial": "",
        "rating": 4.7,
        "tags": ["kebun-raya", "bogor", "botani", "sejarah"],
    },
    "Gunung Pancar": {
        "description": "",
        "whySpecial": "",
        "rating": 4.2,
        "tags": ["gunung", "camping", "trekking", "bogor"],
    },
    "Pantai Batu Karas": {
        "description": "",
        "whySpecial": "",
        "rating": 4.5,
        "tags": ["pantai", "surfing", "pangandaran", "sunset"],
    },
    "Gunung Papandayan": {
        "description": "",
        "whySpecial": "",
        "rating": 4.6,
        "tags": ["gunung", "kawah", "trekking", "garut"],
    },
}

# ─── Default data per category ───────────────────────────────────────────────

CATEGORY_DEFAULTS: dict[str, dict] = {
    "alam": {
        "estimatedTime": "2-3 jam",
        "bestTime": "Pagi (07:00-11:00)",
        "openingHours": "07:00 - 17:00 WIB",
        "roadAccess": "Mobil & Motor — aspal mulus",
        "facilities": COMMON_FACILITIES + ["Spot Foto"],
    },
    "kuliner": {
        "estimatedTime": "45 menit - 1 jam",
        "bestTime": "Siang - Malam",
        "openingHours": "10:00 - 21:00 WIB",
        "roadAccess": "Mobil & Motor — di pinggir jalan raya",
        "facilities": ["Parkir", "Mushola", "Leschan"],
    },
    "foto": {
        "estimatedTime": "1-2 jam",
        "bestTime": "Pagi - Sore",
        "openingHours": "07:00 - 17:00 WIB",
        "roadAccess": "Mobil & Motor — akses bagus",
        "facilities": ["Parkir", "Spot Foto", "Toilet", "Warung"],
    },
    "petualangan": {
        "estimatedTime": "Full day",
        "bestTime": "Pagi (07:00-12:00)",
        "openingHours": "07:00 - 17:00 WIB",
        "roadAccess": "Mobil & Motor",
        "facilities": ["Parkir", "Toilet", "Mushola", "Basecamp"],
    },
    "sejarah": {
        "estimatedTime": "1-2 jam",
        "bestTime": "Pagi (08:00-11:00)",
        "openingHours": "08:00 - 16:00 WIB",
        "roadAccess": "Mobil & Motor — di pusat kota",
        "facilities": ["Parkir", "Toilet", "Mushola"],
    },
    "budaya": {
        "estimatedTime": "2-3 jam",
        "bestTime": "Pagi - Sore",
        "openingHours": "08:00 - 17:00 WIB",
        "roadAccess": "Mobil & Motor — akses bagus",
        "facilities": ["Parkir", "Toilet", "Mushola", "Pusat Oleh-oleh"],
    },
}


def load_enriched(path: str) -> list[dict]:
    with open(path) as f:
        return json.load(f)


def get_manual(name: str) -> dict:
    """Get manual overrides for a spot, returns {} if none."""
    for key, data in MANUAL.items():
        if key.lower() == name.lower():
            return data
    return {}


def format_ticket_price(category: str) -> str:
    prices = {
        "alam": "Rp 25.000 - 50.000",
        "kuliner": "Rp 30.000 - 70.000 per porsi",
        "foto": "Rp 15.000 - 35.000",
        "petualangan": "Rp 50.000 - 100.000",
        "sejarah": "Gratis — Rp 25.000",
        "budaya": "Gratis — Rp 20.000",
    }
    return prices.get(category, "Rp 25.000")


def smart_truncate(text: str, max_len: int = 180) -> str:
    """Truncate at sentence boundary, never mid-word at max_len."""
    text = text.strip().split("\n")[0].strip()
    if len(text) <= max_len:
        return text
    # Try to break at sentence boundary before max_len
    for sep in [". ", "! ", "? "]:
        idx = text.rfind(sep, 0, max_len)
        if idx > 60:
            return text[: idx + 1]
    # Fall back to last space before max_len
    idx = text.rfind(" ", 0, max_len)
    if idx > 60:
        return text[:idx] + "."
    return text[:max_len].rstrip() + "."


REGION_DISTANCE: dict[str, str] = {
    "Bandung": "30-50 km dari Bandung",
    "Bogor": "60-80 km dari Jakarta / 20-30 km dari Bogor",
    "Cianjur": "80-100 km dari Bandung / 25 km dari Cianjur",
    "Garut": "80 km dari Bandung (2 jam)",
    "Pangandaran": "250 km dari Bandung (5 jam)",
    "Sukabumi": "140 km dari Bogor (4 jam)",
}


def build_spot(s: dict, idx: int) -> str:
    name = s["name"]
    cat = s["category"]
    slug = s["slug"]
    region = s["region"]

    manual = get_manual(name)
    defaults = CATEGORY_DEFAULTS.get(cat, CATEGORY_DEFAULTS["alam"])

    # Description
    wiki_desc = s.get("wikipedia", {}).get("description", "")
    if wiki_desc and not manual.get("description"):
        desc = smart_truncate(wiki_desc, 200)
    elif manual.get("description"):
        desc = manual["description"]
    else:
        desc = "Destinasi wisata menarik di Jawa Barat yang wajib dikunjungi saat roadtrip."

    # whySpecial
    wiki_why = s.get("why_special", "")
    if wiki_why and not manual.get("whySpecial") and len(wiki_why) > 30:
        why = smart_truncate(wiki_why, 200)
    elif manual.get("whySpecial"):
        why = manual["whySpecial"]
    else:
        why = "Destinasi favorit di Jawa Barat dengan pesona yang unik dan pengalaman tak terlupakan."

    # Rating
    rating = manual.get("rating", 4.3)
    tips = manual.get("tips", "Datang di hari kerja untuk menghindari keramaian. Bawa kamera untuk mengabadikan momen. Cek jam buka sebelum berangkat.")
    tags = manual.get("tags", CATEGORY_TAGS.get(cat, ["wisata", "jawa-barat"]))

    best_time = manual.get("bestTime", defaults["bestTime"])
    opening_hours = manual.get("openingHours", defaults["openingHours"])
    estimated_time = manual.get("estimatedTime", defaults["estimatedTime"])
    ticket_price = manual.get("ticketPrice", format_ticket_price(cat))
    road_access = manual.get("roadAccess", defaults["roadAccess"])
    facilities = manual.get("facilities", defaults["facilities"])
    distance = manual.get("distanceFromCity", REGION_DISTANCE.get(region, "Jawa Barat"))

    return f"""  {{
    slug: "{slug}",
    name: "{name}",
    category: "{cat}",
    province: "Jawa Barat",
    region: "Jawa",
    location: {{ lat: {s['input_lat']}, lng: {s['input_lng']} }},
    description: "{desc}",
    whySpecial: "{why}",
    rating: {rating},
    imageUrl: "/images/spots/jabar-{idx:02d}.jpg",
    imageCredit: "Unsplash",
    tags: {json.dumps(tags)},
    addedAt: new Date("{TODAY}"),
    tips: "{tips}",
    bestTime: "{best_time}",
    openingHours: "{opening_hours}",
    estimatedTime: "{estimated_time}",
    ticketPrice: "{ticket_price}",
    roadAccess: "{road_access}",
    facilities: {json.dumps(facilities, ensure_ascii=False)},
    distanceFromCity: "{distance}",
    relatedProductIds: [],
  }}"""


def main():
    data = load_enriched(ENRICHED_PATH)

    for i, spot in enumerate(data, 1):
        entry = build_spot(spot, i)
        comma = "," if i < len(data) else ","
        print(f"{entry}{comma}")


if __name__ == "__main__":
    main()
