import type { Spot } from "@/types"

const PROVINCE_ROUTES: Record<string, { from: string; duration: string }[]> = {
  "Jakarta": [
    { from: "Jakarta", duration: "30 menit" },
    { from: "Bandung", duration: "2,5 jam" },
  ],
  "Jawa Barat": [
    { from: "Jakarta", duration: "1-3 jam" },
    { from: "Bandung", duration: "1-2 jam" },
    { from: "Bogor", duration: "30-60 menit" },
  ],
  "Jawa Tengah": [
    { from: "Yogyakarta", duration: "1-2 jam" },
    { from: "Semarang", duration: "1-2 jam" },
    { from: "Solo", duration: "1 jam" },
  ],
  "DIY": [
    { from: "Yogyakarta", duration: "15-45 menit" },
    { from: "Semarang", duration: "2 jam" },
    { from: "Solo", duration: "1,5 jam" },
  ],
  "Jawa Timur": [
    { from: "Surabaya", duration: "1-3 jam" },
    { from: "Malang", duration: "1-2 jam" },
  ],
  "Bali": [
    { from: "Denpasar", duration: "30-60 menit" },
    { from: "Canggu", duration: "1-2 jam" },
    { from: "Kuta", duration: "45 menit" },
  ],
  "Nusa Tenggara Barat": [
    { from: "Mataram", duration: "1-2 jam" },
    { from: "Lombok Airport", duration: "30-60 menit" },
  ],
  "Nusa Tenggara Timur": [
    { from: "Labuan Bajo", duration: "1-3 jam" },
  ],
  "Sumatera Utara": [
    { from: "Medan", duration: "4 jam" },
  ],
  "Sumatera Barat": [
    { from: "Padang", duration: "3 jam" },
    { from: "Medan", duration: "10 jam" },
  ],
  "Sulawesi Utara": [
    { from: "Manado", duration: "30 menit" },
  ],
  "Sulawesi Selatan": [
    { from: "Makassar", duration: "6-7 jam" },
  ],
  "Kalimantan Timur": [
    { from: "Balikpapan", duration: "6 jam" },
    { from: "Tanjung Redeb", duration: "30-60 menit" },
  ],
}

export function getPopularRoutes(spot: Spot): { from: string; to: string; duration: string }[] {
  if (spot.popularRoutes && spot.popularRoutes.length > 0) {
    return spot.popularRoutes.map((r) => ({
      from: r.from,
      to: spot.name,
      duration: r.duration,
    }))
  }
  const province = spot.province
  for (const [key, routes] of Object.entries(PROVINCE_ROUTES)) {
    if (province.includes(key) || key.includes(province)) {
      return routes.map((r) => ({
        from: r.from,
        to: spot.name,
        duration: r.duration,
      }))
    }
  }
  return []
}
