'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

interface Store {
  id: string
  name: string
  distance: number
  isOpen: boolean
  priceScore: number
  qualityScore: number
  totalScore: number
  estimatedTotal: number
  latitude?: number
  longitude?: number
  address?: string
}

interface MapViewProps {
  stores: Store[]
  userLocation: { lat: number; lng: number }
  currencySymbol: string
  onStoreClick?: (store: Store) => void
}

export default function MapView({ stores, userLocation, currencySymbol, onStoreClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const [mapsLoaded, setMapsLoaded] = useState(false)

  // Check if Google Maps script is loaded
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        setMapsLoaded(true)
        return true
      }
      return false
    }

    if (checkGoogleMaps()) {
      return
    }

    // Poll for Google Maps to load
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval)
      }
    }, 100)

    // Cleanup
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined' || !mapsLoaded) return

    // Check if Google Maps is loaded
    if (!window.google || !window.google.maps) {
      return
    }

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: userLocation.lat, lng: userLocation.lng },
      zoom: 12,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    })

    mapInstanceRef.current = map

    // Add user location marker
    new window.google.maps.Marker({
      position: { lat: userLocation.lat, lng: userLocation.lng },
      map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      title: 'Your Location',
      zIndex: 1000,
    })

    // Clear previous markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Add store markers
    stores.forEach((store, index) => {
      // Use provided coordinates or calculate from distance
      const lat = store.latitude || userLocation.lat + (Math.random() - 0.5) * 0.1
      const lng = store.longitude || userLocation.lng + (Math.random() - 0.5) * 0.1

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map,
        title: store.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: index === 0 ? 10 : 8, // Make best match larger
          fillColor: index === 0 ? '#10b981' : '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        label: {
          text: (index + 1).toString(),
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 'bold',
        },
      })

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${store.name}</h3>
            <p style="margin: 4px 0; font-size: 14px; color: #666;">
              ${store.address || `${store.distance} km away`}
            </p>
            <p style="margin: 4px 0; font-size: 14px;">
              <strong>Score:</strong> ${store.totalScore}/100
            </p>
            <p style="margin: 4px 0; font-size: 14px;">
              <strong>Est. Total:</strong> ${currencySymbol}${store.estimatedTotal.toFixed(2)}
            </p>
            <p style="margin: 4px 0; font-size: 12px; color: ${store.isOpen ? '#10b981' : '#ef4444'};">
              ${store.isOpen ? '● OPEN' : '● CLOSED'}
            </p>
          </div>
        `,
      })

      marker.addListener('click', () => {
        infoWindow.open(map, marker)
        if (onStoreClick) {
          onStoreClick(store)
        }
      })

      markersRef.current.push(marker)
    })

    // Fit bounds to show all markers
    if (stores.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      bounds.extend({ lat: userLocation.lat, lng: userLocation.lng })
      stores.forEach(store => {
        const lat = store.latitude || userLocation.lat + (Math.random() - 0.5) * 0.1
        const lng = store.longitude || userLocation.lng + (Math.random() - 0.5) * 0.1
        bounds.extend({ lat, lng })
      })
      map.fitBounds(bounds)
    }
  }, [stores, userLocation, currencySymbol, onStoreClick, mapsLoaded])

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden border border-gray-200">
      <div ref={mapRef} className="w-full h-full" />
      {!mapsLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center p-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
            <p className="text-gray-600 mb-2">Loading map...</p>
            <p className="text-sm text-gray-500">
              {typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && 
                'Google Maps API key not configured. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to see the map.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

