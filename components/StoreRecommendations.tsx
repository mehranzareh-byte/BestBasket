'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, Clock, DollarSign, Star, TrendingUp, Map, List, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { getLocationFromIP, type LocationData } from '@/lib/geolocation'
import { findNearbyStores, type RealStore } from '@/lib/store-search'
import { parseOpeningHours, isStoreOpenNow, getClosingTimeToday } from '@/lib/opening-hours'
import dynamic from 'next/dynamic'

// Dynamically import MapView to avoid SSR issues
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
})

interface GroceryItem {
  id: string
  name: string
  quantity: string
}

interface Store {
  id: string
  name: string
  distance: number
  isOpen: boolean
  priceScore: number
  qualityScore: number
  totalScore: number
  estimatedTotal: number
  closingTime?: string
  latitude?: number
  longitude?: number
  address?: string
}

interface StoreRecommendationsProps {
  groceryList: GroceryItem[]
}

export default function StoreRecommendations({ groceryList }: StoreRecommendationsProps) {
  const [stores, setStores] = useState<Store[]>([])
  const [realStores, setRealStores] = useState<RealStore[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingRealStores, setLoadingRealStores] = useState(false)
  const [useRealStores, setUseRealStores] = useState(true) // Toggle between real and mock
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [preferences, setPreferences] = useState({
    priceWeight: 40,
    qualityWeight: 30,
    distanceWeight: 30,
  })

  // Get location from IP on mount
  useEffect(() => {
    const fetchLocation = async () => {
      const location = await getLocationFromIP()
      if (location) {
        setLocationData(location)
        setUserLocation({
          lat: location.latitude,
          lng: location.longitude,
        })
      }
    }
    fetchLocation()

    // Also try to get precise location from browser
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting precise location:', error)
          // Will use IP-based location as fallback
        }
      )
    }
  }, [])

  // Fetch real stores from OpenStreetMap and save to database
  const fetchRealStores = useCallback(async () => {
    if (!userLocation) return

    setLoadingRealStores(true)
    try {
      const stores = await findNearbyStores(userLocation.lat, userLocation.lng, 10000) // 10km radius for more stores
      
      // Save stores to database
      for (const store of stores) {
        try {
          await fetch('/api/stores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              osmId: store.osmId,
              name: store.name,
              address: store.address,
              latitude: store.latitude,
              longitude: store.longitude,
              phone: store.phone,
              website: store.website,
              openingHours: store.openingHours,
              shopType: store.shopType,
              city: store.city,
              countryCode: store.countryCode,
              currency: locationData?.currency || 'USD',
            }),
          })
        } catch (err) {
          // Silently fail - store might already exist
        }
      }
      
      setRealStores(stores)
    } catch (error) {
      console.error('Error fetching real stores:', error)
    } finally {
      setLoadingRealStores(false)
    }
  }, [userLocation, locationData])

  const calculateRecommendations = useCallback(async () => {
    if (groceryList.length === 0) {
      return
    }

    if (!userLocation) {
      return
    }

    setLoading(true)

    // If using real stores, convert them to Store format with real data
    if (useRealStores && realStores.length > 0) {
      // Fetch store data from database (price scores, quality scores, etc.)
      const storePromises = realStores.slice(0, 50).map(async (realStore) => {
        try {
          // Get store data from database
          const storeResponse = await fetch(`/api/stores?lat=${realStore.latitude}&lng=${realStore.longitude}&radius=0.1`)
          const storeData = await storeResponse.json()
          const dbStore = storeData.stores?.find((s: any) => s.osm_id === realStore.osmId)

          // Parse opening hours
          let isOpen = true
          let closingTime: string | undefined = undefined
          if (realStore.openingHours) {
            const hours = parseOpeningHours(realStore.openingHours)
            const openStatus = isStoreOpenNow(hours)
            isOpen = openStatus.isOpen
            closingTime = openStatus.nextClose || getClosingTimeToday(hours) || undefined
          }

          // Get prices for grocery list items
          let estimatedTotal = 0
          let priceScore = dbStore?.price_score || 50
          let qualityScore = dbStore?.quality_score || 50

          if (dbStore?.id && groceryList.length > 0) {
            try {
              // Use the calculate-total API endpoint
              const totalResponse = await fetch('/api/stores/calculate-total', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  storeId: dbStore.id,
                  items: groceryList.map(item => item.name),
                }),
              })
              
              if (totalResponse.ok) {
                const totalData = await totalResponse.json()
                estimatedTotal = totalData.total || 0
                
                // Update price score based on how many items were found
                if (totalData.itemsFound > 0) {
                  const foundRatio = totalData.itemsFound / totalData.itemsTotal
                  // Adjust price score based on data availability
                  priceScore = Math.min(100, priceScore + (foundRatio * 10))
                }
              }
            } catch (err) {
              // Fallback estimate
              estimatedTotal = groceryList.length * (priceScore / 10)
            }
          } else {
            // Fallback estimate
            estimatedTotal = groceryList.length * (priceScore / 10)
          }

          // Calculate distance score
          const distanceScore = Math.max(0, 100 - (realStore.distance || 0) * 10)

          // Calculate total score
          const totalScore =
            (priceScore * preferences.priceWeight) / 100 +
            (qualityScore * preferences.qualityWeight) / 100 +
            (distanceScore * preferences.distanceWeight) / 100

          return {
            id: realStore.id,
            name: realStore.name,
            distance: realStore.distance || 0,
            isOpen,
            priceScore: Math.round(priceScore),
            qualityScore: Math.round(qualityScore),
            totalScore: Math.round(totalScore),
            estimatedTotal: Math.round(estimatedTotal * 100) / 100,
            closingTime,
            latitude: realStore.latitude,
            longitude: realStore.longitude,
            address: realStore.address,
          }
        } catch (error) {
          console.error('Error processing store:', error)
          // Return basic store data
          const distanceScore = Math.max(0, 100 - (realStore.distance || 0) * 10)
          return {
            id: realStore.id,
            name: realStore.name,
            distance: realStore.distance || 0,
            isOpen: true,
            priceScore: 50,
            qualityScore: 50,
            totalScore: Math.round(distanceScore * preferences.distanceWeight / 100),
            estimatedTotal: groceryList.length * 5,
            closingTime: undefined,
            latitude: realStore.latitude,
            longitude: realStore.longitude,
            address: realStore.address,
          }
        }
      })

      const convertedStores = await Promise.all(storePromises)
      convertedStores.sort((a, b) => b.totalScore - a.totalScore)
      setStores(convertedStores)
      setLoading(false)
      return
    }

    // Fallback to mock stores if real stores not available
    setTimeout(() => {
      const baseLat = userLocation.lat
      const baseLng = userLocation.lng
      
      const mockStores: Store[] = [
        {
          id: '1',
          name: 'Fresh Market',
          distance: 1.2,
          isOpen: true,
          priceScore: 85,
          qualityScore: 90,
          totalScore: 87,
          estimatedTotal: 45.50,
          closingTime: '22:00',
          latitude: baseLat + 0.008,
          longitude: baseLng + 0.008,
          address: '123 Main Street',
        },
        {
          id: '2',
          name: 'Budget Grocers',
          distance: 2.5,
          isOpen: true,
          priceScore: 95,
          qualityScore: 70,
          totalScore: 88,
          estimatedTotal: 38.20,
          closingTime: '21:00',
          latitude: baseLat - 0.012,
          longitude: baseLng + 0.015,
          address: '456 Oak Avenue',
        },
        {
          id: '3',
          name: 'Premium Foods',
          distance: 0.8,
          isOpen: true,
          priceScore: 60,
          qualityScore: 95,
          totalScore: 75,
          estimatedTotal: 62.80,
          closingTime: '23:00',
          latitude: baseLat + 0.005,
          longitude: baseLng - 0.006,
          address: '789 Elm Street',
        },
        {
          id: '4',
          name: 'Neighborhood Market',
          distance: 1.8,
          isOpen: false,
          priceScore: 80,
          qualityScore: 75,
          totalScore: 78,
          estimatedTotal: 48.90,
          closingTime: '20:00',
          latitude: baseLat - 0.010,
          longitude: baseLng - 0.008,
          address: '321 Pine Road',
        },
      ]

      mockStores.sort((a, b) => b.totalScore - a.totalScore)
      setStores(mockStores)
      setLoading(false)
    }, 1500)
  }, [groceryList, userLocation, useRealStores, realStores, preferences])

  // Fetch real stores when location is available
  useEffect(() => {
    if (userLocation && useRealStores) {
      fetchRealStores()
    }
  }, [userLocation, useRealStores, fetchRealStores])

  // Calculate recommendations when stores or preferences change
  useEffect(() => {
    if (groceryList.length > 0 && userLocation) {
      calculateRecommendations()
    }
  }, [groceryList, userLocation, preferences, calculateRecommendations])

  const currencySymbol = locationData?.currencySymbol || '$'

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Store Recommendations</h2>
            {locationData && (
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {locationData.city}, {locationData.country}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {locationData.currency} ({currencySymbol})
                </span>
                {useRealStores && (
                  <span className="flex items-center gap-1 text-green-600">
                    <MapPin className="h-4 w-4" />
                    {realStores.length} real stores found
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setUseRealStores(!useRealStores)
                if (!useRealStores && userLocation) {
                  fetchRealStores()
                }
              }}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                useRealStores
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={loadingRealStores}
            >
              {loadingRealStores ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  {useRealStores ? 'Real Stores' : 'Mock Stores'}
                </>
              )}
            </button>
            {stores.length > 0 && (
              <>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    viewMode === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <List className="h-4 w-4" />
                  List
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    viewMode === 'map'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Map className="h-4 w-4" />
                  Map
                </button>
              </>
            )}
          </div>
        </div>
        
        {groceryList.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Add items to your grocery list to see store recommendations!</p>
          </div>
        ) : (
          <>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-3">Recommendation Preferences</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Price Priority: {preferences.priceWeight}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.priceWeight}
                    onChange={(e) => {
                      const price = parseInt(e.target.value)
                      const remaining = 100 - price
                      const quality = Math.round(remaining * (preferences.qualityWeight / (preferences.qualityWeight + preferences.distanceWeight)))
                      const distance = remaining - quality
                      setPreferences({ priceWeight: price, qualityWeight: quality, distanceWeight: distance })
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Quality Priority: {preferences.qualityWeight}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.qualityWeight}
                    onChange={(e) => {
                      const quality = parseInt(e.target.value)
                      const remaining = 100 - quality
                      const price = Math.round(remaining * (preferences.priceWeight / (preferences.priceWeight + preferences.distanceWeight)))
                      const distance = remaining - price
                      setPreferences({ priceWeight: price, qualityWeight: quality, distanceWeight: distance })
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Distance Priority: {preferences.distanceWeight}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.distanceWeight}
                    onChange={(e) => {
                      const distance = parseInt(e.target.value)
                      const remaining = 100 - distance
                      const price = Math.round(remaining * (preferences.priceWeight / (preferences.priceWeight + preferences.qualityWeight)))
                      const quality = remaining - price
                      setPreferences({ priceWeight: price, qualityWeight: quality, distanceWeight: distance })
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-gray-600">Finding the best stores for you...</p>
              </div>
            ) : stores.length > 0 ? (
              <>
                {viewMode === 'map' ? (
                  userLocation ? (
                    <div className="mb-6" style={{ height: '600px' }}>
                      <MapView
                        stores={stores}
                        userLocation={userLocation}
                        currencySymbol={currencySymbol}
                      />
                    </div>
                  ) : (
                    <div className="mb-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800">
                        ⚠️ Waiting for location... Please allow location access or wait for IP-based location detection.
                      </p>
                    </div>
                  )
                ) : null}

                <div className={viewMode === 'map' ? 'grid gap-4 md:grid-cols-2' : 'grid gap-4 md:grid-cols-2'}>
                  {stores.map((store, index) => (
                    <motion.div
                      key={store.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-6 rounded-lg border-2 ${
                        index === 0
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      {index === 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="h-5 w-5 text-primary-600" />
                          <span className="text-sm font-semibold text-primary-600">BEST MATCH</span>
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-800">{store.name}</h3>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          store.isOpen
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {store.isOpen ? 'OPEN' : 'CLOSED'}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {store.address && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{store.address}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{store.distance} km away</span>
                        </div>
                        {(store.latitude && store.longitude) && (
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <MapPin className="h-3 w-3" />
                            <span>📍 {store.latitude.toFixed(4)}, {store.longitude.toFixed(4)}</span>
                          </div>
                        )}
                        {store.isOpen && store.closingTime && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>Closes at {store.closingTime}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold">{currencySymbol}{store.estimatedTotal.toFixed(2)} estimated</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Price Score</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${store.priceScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold">{store.priceScore}</span>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Quality Score</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${store.qualityScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold">{store.qualityScore}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold text-lg">{store.totalScore}</span>
                          <span className="text-sm text-gray-500">/100</span>
                        </div>
                        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                          View Details
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
