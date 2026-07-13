import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface Crumb {
  label: string
  href?: string
}

export function Breadcrumb({ items, light }: { items: Crumb[]; light?: boolean }) {
  const c = light
    ? "text-white/70 hover:text-white"
    : "text-muted-foreground hover:text-foreground"
  const active = light ? "text-white font-medium" : "text-foreground font-medium"

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: item.href ? `${process.env.NEXT_PUBLIC_APP_URL || "https://rodatrip.vercel.app"}${item.href}` : undefined,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-4">
        {items.map((item, i) => (
          <span key={i} className={`flex items-center gap-1.5 ${i === items.length - 1 ? active : c}`}>
            {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            {item.href ? (
              <Link href={item.href} className={light ? "text-white/70 hover:text-white transition-colors" : "text-muted-foreground hover:text-foreground transition-colors"}>
                {item.label}
              </Link>
            ) : (
              <span className={`truncate max-w-[200px] ${light ? "text-white" : "text-foreground"}`}>{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  )
}
