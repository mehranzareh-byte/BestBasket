import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BestBasket - Smart Grocery Shopping',
  description: 'Find the best supermarkets for your grocery list based on price, quality, and proximity',
  manifest: '/manifest.json',
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#0ea5e9',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        {googleMapsApiKey && (
          <script
            src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`}
            async
            defer
          />
        )}
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
