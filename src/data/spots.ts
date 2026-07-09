import type { SpotCategory } from "@/types"

export const SPOT_CATEGORIES: Record<SpotCategory, { icon: string; label: string; gradient: string; color: string }> = {
  alam: { icon: "⛰️", label: "Alam & Petualangan", gradient: "from-emerald-500/20 to-green-500/10", color: "text-emerald-600" },
  kuliner: { icon: "🍜", label: "Kuliner", gradient: "from-orange-500/20 to-yellow-500/10", color: "text-orange-600" },
  budaya: { icon: "🏛️", label: "Sejarah & Budaya", gradient: "from-amber-500/20 to-orange-500/10", color: "text-amber-600" },
  foto: { icon: "📸", label: "Spot Fotografi", gradient: "from-purple-500/20 to-pink-500/10", color: "text-purple-600" },
  petualangan: { icon: "🏞️", label: "Petualangan", gradient: "from-blue-500/20 to-cyan-500/10", color: "text-blue-600" },
  sejarah: { icon: "🏛️", label: "Sejarah & Budaya", gradient: "from-amber-500/20 to-orange-500/10", color: "text-amber-600" },
}

// Data spots dapat diisi melalui CMS Admin > Spots
// atau melalui seeding dengan Gemini JSON
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const spots: any[] = []
