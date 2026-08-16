// Nearest-pharmacy helpers. Pure functions plus one fetch against OpenStreetMap's
// Overpass API, which needs no API key and no account.
//
// Privacy: the user's coordinates are used for this one query and to sort the
// results. They are never written to our database and never leave the device
// except as the bounding box of that Overpass request.

const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter'
const EARTH_RADIUS_M = 6371000

const toRad = (deg) => (deg * Math.PI) / 180

/** Great-circle distance in metres between two {lat, lon} points. */
export function distanceMeters(a, b) {
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

export function formatDistance(meters) {
  if (!Number.isFinite(meters)) return ''
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`
}

/** Rough walking time at 5 km/h, rounded up to the minute. */
export function walkingMinutes(meters) {
  return Math.max(1, Math.ceil(meters / 83.33))
}

export function buildOverpassQuery({ lat, lon }, radiusMeters) {
  // node + way + relation so we catch pharmacies mapped as buildings too.
  return `[out:json][timeout:20];
(
  node["amenity"="pharmacy"](around:${radiusMeters},${lat},${lon});
  way["amenity"="pharmacy"](around:${radiusMeters},${lat},${lon});
  relation["amenity"="pharmacy"](around:${radiusMeters},${lat},${lon});
);
out center tags;`
}

/**
 * Normalise Overpass elements into a sorted, de-duplicated list.
 * Ways and relations carry their coordinates on `center` rather than the root.
 */
export function parsePharmacies(elements, origin) {
  const seen = new Set()

  return (elements ?? [])
    .map((el) => {
      const lat = el.lat ?? el.center?.lat
      const lon = el.lon ?? el.center?.lon
      if (typeof lat !== 'number' || typeof lon !== 'number') return null

      const tags = el.tags ?? {}
      const street = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ')

      return {
        id: `${el.type}/${el.id}`,
        lat,
        lon,
        name: tags.name || tags['name:uz'] || tags['name:ru'] || null,
        address: street || tags['addr:full'] || null,
        phone: tags.phone || tags['contact:phone'] || null,
        openingHours: tags.opening_hours || null,
        // OSM marks round-the-clock pharmacies with opening_hours=24/7.
        isOpen24: tags.opening_hours === '24/7',
        distance: distanceMeters(origin, { lat, lon }),
      }
    })
    .filter((p) => {
      if (!p) return false
      // Overpass can return the same place as both a node and a way.
      const key = p.name ? `${p.name}|${p.lat.toFixed(4)}` : p.id
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => a.distance - b.distance)
}

/**
 * Widen the search until something turns up, so a rural user is not told
 * "no pharmacies" simply because the first radius was tight.
 */
export async function findNearbyPharmacies(origin, { signal } = {}) {
  const radii = [1500, 5000, 15000]

  for (const radius of radii) {
    const response = await fetch(OVERPASS_ENDPOINT, {
      method: 'POST',
      body: buildOverpassQuery(origin, radius),
      signal,
    })

    if (!response.ok) {
      throw new Error(`Overpass ${response.status}`)
    }

    const json = await response.json()
    const pharmacies = parsePharmacies(json.elements, origin)

    if (pharmacies.length > 0) {
      return { pharmacies: pharmacies.slice(0, 20), radius }
    }
  }

  return { pharmacies: [], radius: radii.at(-1) }
}

/** Opens the platform's own maps app rather than embedding a tracked map. */
export function directionsUrl(pharmacy) {
  return `https://www.openstreetmap.org/directions?to=${pharmacy.lat}%2C${pharmacy.lon}`
}

export function mapEmbedUrl(pharmacy) {
  const d = 0.004
  const bbox = [
    pharmacy.lon - d,
    pharmacy.lat - d / 2,
    pharmacy.lon + d,
    pharmacy.lat + d / 2,
  ].join('%2C')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${pharmacy.lat}%2C${pharmacy.lon}`
}
