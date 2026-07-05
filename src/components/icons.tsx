import type { SVGProps } from "react"

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="1" y="1" width="38" height="38" rx="10" fill="#2C4A3E" />
      <circle cx="26" cy="12" r="6" fill="#D95D39" />
      <path d="M2 34 C2 34, 12 10, 20 7 C28 10, 38 34, 38 34 Z" fill="white" />
      <path d="M12 15 C14 11, 20 10, 22 12 C20 14, 16 16, 12 15 Z" fill="rgba(255,255,255,0.65)" />
      <rect x="5" y="30" width="30" height="3" rx="1.5" fill="#D95D39" />
    </svg>
  )
}

export function CompassIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2 L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 19 L12 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 12 L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19 12 L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 8 L16 12 L8 16 L12 12 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export function MapPinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="9" r="2.5" fill="currentColor" />
    </svg>
  )
}

export function RouteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="19" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 5 L19 19" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d="M7 7 L12 9 L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ShoppingBagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3 6h18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="m8 12 3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="m12 5 7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
