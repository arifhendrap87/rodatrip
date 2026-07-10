function parseWkbHex(hex: string): { lat: number; lng: number } | null {
  if (hex.length < 42) return null
  const bytes: number[] = []
  for (let i = 0; i < hex.length; i += 2) {
    const b = parseInt(hex.substring(i, i + 2), 16)
    if (isNaN(b)) return null
    bytes.push(b)
  }
  const isLe = bytes[0] === 1
  if (bytes[0] !== 0 && bytes[0] !== 1) return null

  const readU32 = (off: number) =>
    isLe
      ? bytes[off] | (bytes[off + 1] << 8) | (bytes[off + 2] << 16) | (bytes[off + 3] << 24)
      : (bytes[off] << 24) | (bytes[off + 1] << 16) | (bytes[off + 2] << 8) | bytes[off + 3]

  const type = readU32(1)
  const hasSrid = (type & 0x20000000) !== 0
  const geomType = type & 0x00FFFFFF
  if (geomType !== 1) return null

  let off = 5
  if (hasSrid) off += 4

  if (bytes.length < off + 16) return null

  const readDouble = (start: number) => {
    const buf = new ArrayBuffer(8)
    const view = new DataView(buf)
    for (let i = 0; i < 8; i++) view.setUint8(i, bytes[start + i])
    return view.getFloat64(0, isLe)
  }

  const lng = readDouble(off)
  const lat = readDouble(off + 8)
  if (lat === 0 && lng === 0) return null
  return { lat, lng }
}

export function parseLocation(loc: unknown): { lat: number; lng: number } | null {
  if (!loc) return null
  // GeoJSON: { type: "Point", coordinates: [lng, lat] }
  if (typeof loc === "object" && "coordinates" in (loc as Record<string, unknown>)) {
    const coords = (loc as Record<string, unknown>).coordinates as number[] | undefined
    if (coords && coords.length >= 2 && coords[0] !== 0 && coords[1] !== 0)
      return { lat: coords[1], lng: coords[0] }
  }
  // WKT string: "POINT(lng lat)"
  if (typeof loc === "string") {
    const m = loc.match(/POINT\(([\d.-]+)\s+([\d.-]+)\)/)
    if (m) {
      const lng = parseFloat(m[1]); const lat = parseFloat(m[2])
      if (lat !== 0 && lng !== 0) return { lat, lng }
    }
    // EWKB hex (PostGIS default binary format)
    if (/^[0-9A-Fa-f]{42,}$/i.test(loc)) {
      const wkb = parseWkbHex(loc.toUpperCase())
      if (wkb) return wkb
    }
  }
  // jsonb: { "lat": ..., "lng": ... }
  if (typeof loc === "object" && "lat" in (loc as Record<string, unknown>)) {
    const l = loc as Record<string, unknown>
    if (typeof l.lat === "number" && typeof l.lng === "number" && l.lat !== 0 && l.lng !== 0)
      return { lat: l.lat, lng: l.lng }
  }
  return null
}
