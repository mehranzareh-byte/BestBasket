import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/stores - Get stores near a location
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const radius = parseFloat(searchParams.get('radius') || '5') // km

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    // Query stores within radius (rough calculation)
    // 1 degree ≈ 111 km, so radius/111 gives degrees
    const latDelta = radius / 111
    const lngDelta = radius / (111 * Math.cos(lat * Math.PI / 180))

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .gte('latitude', lat - latDelta)
      .lte('latitude', lat + latDelta)
      .gte('longitude', lng - lngDelta)
      .lte('longitude', lng + lngDelta)
      .order('price_score', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ stores: data || [] }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stores' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/stores - Create or update a store
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      osmId,
      name,
      address,
      latitude,
      longitude,
      phone,
      website,
      openingHours,
      shopType,
      city,
      countryCode,
      currency,
    } = body

    if (!name || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Name, latitude, and longitude are required' },
        { status: 400 }
      )
    }

    // Check if store exists by OSM ID
    let storeId: string | null = null
    
    if (osmId) {
      const { data: existing } = await supabase
        .from('stores')
        .select('id')
        .eq('osm_id', osmId)
        .single()
      
      if (existing) {
        storeId = existing.id
      }
    }

    const storeData: any = {
      name,
      address,
      latitude,
      longitude,
      phone,
      website,
      opening_hours: openingHours ? JSON.parse(JSON.stringify(openingHours)) : null,
      shop_type: shopType,
      city,
      country_code: countryCode,
      currency: currency || 'USD',
      updated_at: new Date().toISOString(),
    }

    if (osmId) {
      storeData.osm_id = osmId
    }

    let result
    if (storeId) {
      // Update existing store
      const { data, error } = await supabase
        .from('stores')
        .update(storeData)
        .eq('id', storeId)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      result = data
    } else {
      // Create new store
      const { data, error } = await supabase
        .from('stores')
        .insert([storeData])
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      result = data
    }

    return NextResponse.json({ store: result }, { status: storeId ? 200 : 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to save store' },
      { status: 500 }
    )
  }
}
