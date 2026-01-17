'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

// Import Leaflet CSS only on client
if (typeof window !== 'undefined') {
  require('leaflet/dist/leaflet.css')
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

// Fix for default marker icons in Leaflet with Next.js
const createIcon = (color: string, isBest: boolean = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${isBest ? '32px' : '28px'};
        height: ${isBest ? '32px' : '28px'};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${isBest ? '14px' : '12px'};
      ">
        ${isBest ? '★' : '📍'}
      </div>
    `,
    iconSize: [isBest ? 32 : 28, isBest ? 32 : 28],
    iconAnchor: [isBest ? 16 : 14, isBest ? 16 : 14],
  })
}

// Component to fit map bounds
function FitBounds({ stores, userLocation }: { stores: Store[]; userLocation: { lat: number; lng: number } }) {
  const map = useMap()

  useEffect(() => {
    if (stores.length === 0) return

    const bounds = L.latLngBounds([
      [userLocation.lat, userLocation.lng],
    ])

    stores.forEach(store => {
      const lat = store.latitude || userLocation.lat + (Math.random() - 0.5) * 0.1
      const lng = store.longitude || userLocation.lng + (Math.random() - 0.5) * 0.1
      bounds.extend([lat, lng])
    })

    map.fitBounds(bounds, { padding: [50, 50] })
  }, [stores, userLocation, map])

  return null
}

export default function MapView({ stores, userLocation, currencySymbol, onStoreClick }: MapViewProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={createIcon('#3b82f6', false)}
        >
          <Popup>
            <div className="p-2">
              <strong>Your Location</strong>
            </div>
          </Popup>
        </Marker>

        {/* Store markers */}
        {stores.map((store, index) => {
          const lat = store.latitude || userLocation.lat + (Math.random() - 0.5) * 0.1
          const lng = store.longitude || userLocation.lng + (Math.random() - 0.5) * 0.1
          const isBest = index === 0

          return (
            <Marker
              key={store.id}
              position={[lat, lng]}
              icon={createIcon(isBest ? '#10b981' : '#ef4444', isBest)}
              eventHandlers={{
                click: () => {
                  if (onStoreClick) {
                    onStoreClick(store)
                  }
                },
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-lg mb-2">{store.name}</h3>
                  {store.address && (
                    <p className="text-sm text-gray-600 mb-1">{store.address}</p>
                  )}
                  <p className="text-sm mb-1">
                    <strong>Distance:</strong> {store.distance} km
                  </p>
                  <p className="text-sm mb-1">
                    <strong>Score:</strong> {store.totalScore}/100
                  </p>
                  <p className="text-sm mb-1">
                    <strong>Est. Total:</strong> {currencySymbol}{store.estimatedTotal.toFixed(2)}
                  </p>
                  <p className={`text-xs mt-2 ${store.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                    {store.isOpen ? '● OPEN' : '● CLOSED'}
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        })}

        <FitBounds stores={stores} userLocation={userLocation} />
      </MapContainer>
    </div>
  )
}
