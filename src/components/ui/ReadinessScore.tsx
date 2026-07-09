"use client"

export function ReadinessScore({ checks }: { checks: { label: string; ok: boolean }[] }) {
  const total = checks.length
  const done = checks.filter((c) => c.ok).length
  const score = total > 0 ? Math.round((done / total) * 100) : 0
  const color = score >= 80 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500"
  const icon = score >= 80 ? "✅" : score >= 50 ? "⚠️" : "❌"

  return (
    <div className="rounded-xl border border-border/50 bg-white p-4 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-lg">{icon}</span>
          <div>
            <p className="text-sm font-semibold font-heading">Kesiapan Konten</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-28 h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
              </div>
              <span className="text-xs font-medium">{score}%</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs justify-end">
          {checks.map((c, i) => (
            <span key={i} className={c.ok ? "text-green-600" : "text-red-400"}>
              {c.ok ? "✅" : "❌"} {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
