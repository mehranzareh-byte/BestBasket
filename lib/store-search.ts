/**
 * Real Store Search using OpenStreetMap Overpass API
 * Completely FREE - no API key, no credit card required
 */

export interface RealStore {
  id: string
  name: string
  latitude: number
  longitude: number
  address?: string
  shopType?: string
  distance?: number
}

/**
 * Find real supermarkets and grocery stores near a location
 * Uses OpenStreetMap Overpass API (free, no API key needed)
 */
export async function findNearbyStores(
  lat: number,
  lng: number,
  radius: number = 2000 // 2km radius
): Promise<RealStore[]> {
  // Overpass API query to find supermarkets and grocery stores
  const query = `
[out:json][timeout:25];
(
  node["shop"~"^(supermarket|grocery|convenience|mall)$"](around:${radius},${lat},${lng});
  way["shop"~"^(supermarket|grocery|convenience|mall)$"](around:${radius},${lat},${lng});
  relation["shop"~"^(supermarket|grocery|convenience|mall)$"](around:${radius},${lat},${lng});
);
out body;
>;
out skel qt;
`

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'text/plain',
      },
    })

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.elements || data.elements.length === 0) {
      return []
    }

    // Process the results
    const stores: RealStore[] = []
    const processedIds = new Set<string>()

    for (const element of data.elements) {
      // Skip if already processed
      if (processedIds.has(element.id.toString())) continue

      // Get coordinates
      let storeLat: number
      let storeLng: number

      if (element.type === 'node') {
        storeLat = element.lat
        storeLng = element.lon
      } else if (element.type === 'way' || element.type === 'relation') {
        // For ways/relations, use center point (approximate)
        if (element.center) {
          storeLat = element.center.lat
          storeLng = element.center.lon
        } else if (element.bounds) {
          // Calculate center from bounds
          storeLat = (element.bounds.minlat + element.bounds.maxlat) / 2
          storeLng = (element.bounds.minlon + element.bounds.maxlon) / 2
        } else {
          continue // Skip if no coordinates
        }
      } else {
        continue
      }

      // Get store name
      const name = element.tags?.name || element.tags?.['name:en'] || 'Unnamed Store'

      // Build address
      const addressParts = []
      if (element.tags?.['addr:street']) {
        addressParts.push(element.tags['addr:street'])
      }
      if (element.tags?.['addr:housenumber']) {
        addressParts.push(element.tags['addr:housenumber'])
      }
      if (element.tags?.['addr:city']) {
        addressParts.push(element.tags['addr:city'])
      }
      const address = addressParts.length > 0 ? addressParts.join(' ') : undefined

      // Calculate distance from user location
      const distance = calculateDistance(lat, lng, storeLat, storeLng)

      stores.push({
        id: element.id.toString(),
        name,
        latitude: storeLat,
        longitude: storeLng,
        address,
        shopType: element.tags?.shop || 'store',
        distance: Math.round(distance * 10) / 10, // Round to 1 decimal
      })

      processedIds.add(element.id.toString())
    }

    // Sort by distance
    stores.sort((a, b) => (a.distance || 0) - (b.distance || 0))

    return stores.slice(0, 20) // Return top 20 closest stores
  } catch (error) {
    console.error('Error fetching stores from Overpass API:', error)
    return []
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Geocode an address to coordinates using Nominatim (free, no API key)
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // Add delay to respect rate limits (1 request per second)
    await new Promise(resolve => setTimeout(resolve, 1100))

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'BestBasket App', // Required by Nominatim
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.length === 0) {
      return null
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    }
  } catch (error) {
    console.error('Error geocoding address:', error)
    return null
  }
}

/**
 * Reverse geocode coordinates to address using Nominatim
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1100))

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          'User-Agent': 'BestBasket App',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`)
    }

    const data = await response.json()
    return data.display_name || null
  } catch (error) {
    console.error('Error reverse geocoding:', error)
    return null
  }
}
