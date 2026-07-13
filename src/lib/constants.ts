import type { NavLink } from "@/types"

export const SITE_NAME = "RodaTrip"
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://rodatrip.vercel.app"
export const SITE_TAGLINE = "Roadtrip. Aksesoris. Mobil."
export const SITE_DESCRIPTION = "Platform roadtrip, aksesoris mobil, dan marketplace kendaraan untuk roadtripper Indonesia."

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Beranda" },
  { href: "/spot-istimewa", label: "Spot Istimewa" },
  { href: "/roadtrip", label: "Roadtrip" },
  { href: "/blog", label: "Blog" },
]

export const FOOTER_LINKS_UTILITY: NavLink[] = [
  { href: "/about", label: "Tentang Kami" },
  { href: "/contact", label: "Kontak" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Kebijakan Privasi" },
  { href: "/terms", label: "Syarat & Ketentuan" },
]

export const FOOTER_LINKS_SPOTS: NavLink[] = [
  { href: "/spot-istimewa", label: "Spot Istimewa" },
  { href: "/roadtrip", label: "Panduan Roadtrip" },
  { href: "/blog", label: "Blog" },
]

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/rodatrip.id",
  tiktok: "https://tiktok.com/@rodatrip.id",
  twitter: "https://twitter.com/rodatrip_id",
}

export const POI_CATEGORIES = [
  { value: "spbu", label: "SPBU", icon: "⛽", color: "text-blue-400" },
  { value: "kuliner", label: "Kuliner", icon: "🍜", color: "text-orange-400" },
  { value: "bengkel", label: "Bengkel", icon: "🔧", color: "text-gray-400" },
  { value: "spot_foto", label: "Spot Foto", icon: "📸", color: "text-purple-400" },
  { value: "info_jalan", label: "Info Jalan", icon: "⚠️", color: "text-red-400" },
] as const

export const PRODUCT_CATEGORIES = [
  "Safety & Darurat",
  "Comfort",
  "Gadget & Mount",
  "Organizer",
  "Lifestyle & Merch",
  "Bundle Hemat",
] as const

export const VEHICLES = [
  { id: "mobil", label: "🚗 Mobil (10-12 km/L)", consumption: 11 },
  { id: "motor", label: "🏍️ Motor (40-50 km/L)", consumption: 45 },
  { id: "avanza", label: "🚙 Avanza/Xenia (13 km/L)", consumption: 13 },
  { id: "innova", label: "🚐 Innova (10 km/L)", consumption: 10 },
  { id: "pajero", label: "🚙 SUV/Pajero (9 km/L)", consumption: 9 },
  { id: "brio", label: "🚗 Brio/Ayla (15 km/L)", consumption: 15 },
] as const

export const FUEL_PRICE = 12500

export const POPULAR_ROUTES = [
  { label: "Jakarta → Yogyakarta", origin: "Jakarta", destination: "Yogyakarta" },
  { label: "Jakarta → Bandung", origin: "Jakarta", destination: "Bandung" },
  { label: "Bandung → Yogyakarta", origin: "Bandung", destination: "Yogyakarta" },
  { label: "Surabaya → Malang", origin: "Surabaya", destination: "Malang" },
  { label: "Jakarta → Surabaya", origin: "Jakarta", destination: "Surabaya" },
]

export const SPOT_CATEGORY_DISPLAY: Record<string, { emoji: string; label: string }> = {
  alam: { emoji: "⛰️", label: "Alam & Petualangan" },
  kuliner: { emoji: "🍜", label: "Kuliner" },
  budaya: { emoji: "🏛️", label: "Sejarah & Budaya" },
  foto: { emoji: "📸", label: "Spot Fotografi" },
  petualangan: { emoji: "🏞️", label: "Petualangan" },
  sejarah: { emoji: "🏛️", label: "Sejarah & Budaya" },
}
