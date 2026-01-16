import { NextRequest, NextResponse } from 'next/server'

interface RecommendationRequest {
  items: Array<{ name: string; quantity: string }>
  location: { lat: number; lng: number }
  preferences: {
    priceWeight: number
    qualityWeight: number
    distanceWeight: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RecommendationRequest = await request.json()
    const { items, location, preferences } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Grocery list is required' },
        { status: 400 }
      )
    }

    // In production, this would:
    // 1. Query your database for stores near the location
    // 2. Use ML model to calculate price estimates for each store
    // 3. Calculate quality scores based on historical data
    // 4. Calculate distance scores
    // 5. Combine scores based on user preferences
    // 6. Return ranked recommendations

    // For now, return mock data
    const recommendations = await generateMockRecommendations(
      items,
      location,
      preferences
    )

    return NextResponse.json({ recommendations }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

async function generateMockRecommendations(
  items: Array<{ name: string; quantity: string }>,
  location: { lat: number; lng: number },
  preferences: { priceWeight: number; qualityWeight: number; distanceWeight: number }
) {
  // Mock stores - in production, fetch from database
  const mockStores = [
    {
      id: '1',
      name: 'Fresh Market',
      address: '123 Main St',
      latitude: location.lat + 0.01,
      longitude: location.lng + 0.01,
      basePriceScore: 85,
      baseQualityScore: 90,
    },
    {
      id: '2',
      name: 'Budget Grocers',
      address: '456 Oak Ave',
      latitude: location.lat + 0.02,
      longitude: location.lng + 0.02,
      basePriceScore: 95,
      baseQualityScore: 70,
    },
    {
      id: '3',
      name: 'Premium Foods',
      address: '789 Elm St',
      latitude: location.lat - 0.008,
      longitude: location.lng - 0.008,
      basePriceScore: 60,
      baseQualityScore: 95,
    },
  ]

  // Calculate distance and scores for each store
  const recommendations = mockStores.map((store) => {
    const distance = calculateDistance(
      location.lat,
      location.lng,
      store.latitude,
      store.longitude
    )

    const distanceScore = Math.max(0, 100 - distance * 10) // Closer = higher score

    // Calculate weighted total score
    const totalScore =
      (store.basePriceScore * preferences.priceWeight) / 100 +
      (store.baseQualityScore * preferences.qualityWeight) / 100 +
      (distanceScore * preferences.distanceWeight) / 100

    // Estimate total price (mock calculation)
    const estimatedTotal = items.length * (10 - (store.basePriceScore / 10))

    return {
      id: store.id,
      name: store.name,
      address: store.address,
      distance: Math.round(distance * 10) / 10,
      isOpen: true, // In production, check opening hours
      priceScore: store.basePriceScore,
      qualityScore: store.baseQualityScore,
      distanceScore: Math.round(distanceScore),
      totalScore: Math.round(totalScore),
      estimatedTotal: Math.round(estimatedTotal * 100) / 100,
      closingTime: '22:00',
    }
  })

  // Sort by total score
  recommendations.sort((a, b) => b.totalScore - a.totalScore)

  return recommendations
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Haversine formula to calculate distance in km
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
