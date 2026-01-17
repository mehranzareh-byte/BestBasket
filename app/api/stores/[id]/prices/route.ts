import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/stores/[id]/prices - Get prices for a store
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storeId = params.id
    const { searchParams } = new URL(request.url)
    const productName = searchParams.get('product')
    const limit = parseInt(searchParams.get('limit') || '100')

    let query = supabase
      .from('product_prices')
      .select('*')
      .eq('store_id', storeId)
      .order('date_recorded', { ascending: false })
      .limit(limit)

    if (productName) {
      query = query.ilike('product_name', `%${productName}%`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ prices: data || [] }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch prices' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/stores/[id]/prices - Add price data for a store
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storeId = params.id
    const body = await request.json()
    const {
      productName,
      productCategory,
      price,
      currency,
      unit,
      dateRecorded,
      source,
      billId,
    } = body

    if (!productName || !price) {
      return NextResponse.json(
        { error: 'Product name and price are required' },
        { status: 400 }
      )
    }

    const priceData: any = {
      store_id: storeId,
      product_name: productName,
      product_category: productCategory,
      price: parseFloat(price),
      currency: currency || 'USD',
      unit: unit || 'piece',
      date_recorded: dateRecorded || new Date().toISOString().split('T')[0],
      source: source || 'manual',
    }

    if (billId) {
      priceData.bill_id = billId
    }

    const { data, error } = await supabase
      .from('product_prices')
      .insert([priceData])
      .select()
      .single()

    if (error) {
      // If duplicate, update instead
      if (error.code === '23505') {
        const { data: updated, error: updateError } = await supabase
          .from('product_prices')
          .update(priceData)
          .eq('store_id', storeId)
          .eq('product_name', productName)
          .eq('date_recorded', priceData.date_recorded)
          .eq('source', priceData.source)
          .select()
          .single()

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 400 })
        }
        return NextResponse.json({ price: updated }, { status: 200 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ price: data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to save price' },
      { status: 500 }
    )
  }
}
