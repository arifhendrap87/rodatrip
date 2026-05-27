import Link from "next/link"
import { Logo } from "@/components/icons"
import { NAV_LINKS, SITE_NAME, SOCIAL_LINKS } from "@/lib/constants"

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-gradient-to-b from-transparent to-muted/30 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 group">
              <Logo className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
              <span className="font-bold font-heading">{SITE_NAME}</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">
              Platform POI, info jalan, dan perlengkapan roadtrip untuk roadtripper Indonesia.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold font-heading">Navigasi</h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold font-heading">Ikuti Kami</h4>
            <ul className="space-y-2">
              <li>
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Instagram
                </a>
              </li>
              <li>
                <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  TikTok
                </a>
              </li>
              <li>
                <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Twitter / X
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 relative pt-6 text-center text-sm text-muted-foreground">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
