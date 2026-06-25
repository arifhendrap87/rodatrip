import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function WaitlistThanksPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-heading">Kamu Terdaftar! 🎉</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Terima kasih sudah mendaftar ke waitlist RodaTrip. Kami akan memberi kabar begitu platform siap digunakan.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Sambil menunggu, yuk jelajahi spot-spot istimewa yang sudah kami kurasi.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/spot-istimewa">
            <Button size="lg" className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-primary via-[hsl(340_85%_55%)] to-accent text-primary-foreground shadow-lg shadow-primary/30">
              Jelajahi Spot Istimewa
            </Button>
          </Link>
          <Link href="/map">
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-xl">
              Cari Rute
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
