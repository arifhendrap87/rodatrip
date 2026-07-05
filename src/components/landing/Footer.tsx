"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Logo } from "@/components/icons"
import {
  NAV_LINKS,
  SITE_NAME,
  SOCIAL_LINKS,
  FOOTER_LINKS_UTILITY,
  FOOTER_LINKS_SPOTS,
} from "@/lib/constants"

export function Footer() {
  const [siteName, setSiteName] = useState(SITE_NAME)
  const [social, setSocial] = useState(SOCIAL_LINKS)

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((json) => {
        const d = json.data || {}
        if (d.site_name) setSiteName(d.site_name)
        setSocial({
          instagram: d.instagram_url || SOCIAL_LINKS.instagram,
          tiktok: d.tiktok_url || SOCIAL_LINKS.tiktok,
          twitter: d.twitter_url || SOCIAL_LINKS.twitter,
        })
      })
      .catch(() => {})
  }, [])
  return (
    <footer className="bg-[#2C4A3E] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <Logo className="h-6 w-6 text-white/90 transition-transform duration-300 group-hover:scale-110" />
              <span className="font-bold font-heading text-white">{siteName}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-white/60 leading-relaxed">
              Platform POI, info jalan, dan perlengkapan roadtrip untuk roadtripper Indonesia.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold font-heading text-white/90">Navigasi</h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold font-heading text-white/90">Jelajahi</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS_SPOTS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold font-heading text-white/90">Info</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS_UTILITY.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 transition-colors hover:text-white">
                  Instagram
                </a>
              </li>
              <li>
                <a href={social.tiktok} target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 transition-colors hover:text-white">
                  TikTok
                </a>
              </li>
              <li>
                <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 transition-colors hover:text-white">
                  Twitter / X
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 relative pt-6 text-center text-sm text-white/40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
