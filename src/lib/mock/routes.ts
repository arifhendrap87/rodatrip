import type { Route } from "@/types"

export const mockRoutes: Route[] = [
  {
    id: "route-1",
    name: "Jakarta → Yogyakarta via Jalur Selatan",
    slug: "jakarta-jogja-selatan",
    origin: "Jakarta",
    destination: "Yogyakarta",
    distance_km: 568,
    polyline: [
      [-6.2146, 106.8451], // Jakarta
      [-6.3948, 107.0344], // Cianjur
      [-6.7341, 108.5557], // Cirebon
      [-6.9435, 107.8407], // Sumedang
      [-7.0421, 107.8965], // Nagreg
      [-7.2104, 108.2449], // Tasikmalaya
      [-7.4213, 109.2348], // Purwokerto
      [-7.5630, 110.8233], // Solo
      [-7.8005, 110.3648], // Yogyakarta
    ],
    poi_ids: [
      "spbu-1", "spbu-2", "spbu-3", "spbu-4", "spbu-5",
      "kuliner-1", "kuliner-2", "kuliner-3", "kuliner-4", "kuliner-5",
      "bengkel-1", "bengkel-2", "bengkel-3",
      "spot-1", "spot-2", "spot-3", "spot-4", "spot-5",
      "info-1", "info-2", "info-3",
    ],
  },
  {
    id: "route-2",
    name: "Bandung → Jakarta via Tol Purbaleunyi",
    slug: "bandung-jakarta-tol",
    origin: "Bandung",
    destination: "Jakarta",
    distance_km: 150,
    polyline: [
      [-6.9175, 107.6191], // Bandung
      [-6.8221, 107.5945], // Padalarang
      [-6.6852, 107.5340], // Purwakarta
      [-6.4185, 107.4597], // Cikampek
      [-6.2345, 107.1089], // Karawang
      [-6.2146, 106.8451], // Jakarta
    ],
    poi_ids: ["spbu-2", "kuliner-1", "bengkel-1", "spot-2", "info-1"],
  },
  {
    id: "route-3",
    name: "Surabaya → Malang",
    slug: "surabaya-malang",
    origin: "Surabaya",
    destination: "Malang",
    distance_km: 90,
    polyline: [
      [-7.2504, 112.7688], // Surabaya
      [-7.5011, 112.5090], // Sidoarjo
      [-7.6323, 112.3191], // Porong
      [-7.8194, 112.0890], // Batu
      [-7.9763, 112.6348], // Malang
    ],
    poi_ids: ["kuliner-3", "spot-4", "bengkel-2"],
  },
]
