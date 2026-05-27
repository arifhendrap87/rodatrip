import type { Metadata } from "next"
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants"

export const metadata: Metadata = {
  title: `Spot Istimewa — ${SITE_NAME}`,
  description: "Kumpulan tempat-tempat epik di Indonesia yang bikin roadtrip kamu nggak terlupakan. Dari hidden gems sampai ikon legendaris.",
  openGraph: {
    title: `Spot Istimewa — ${SITE_NAME}`,
    description: "Tempat-tempat wajib dikunjungi di Indonesia untuk roadtripper.",
  },
}

export default function SpotLayout({ children }: { children: React.ReactNode }) {
  return children
}
