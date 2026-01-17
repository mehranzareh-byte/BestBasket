import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * POST /api/stores/calculate-total - Calculate total price for a grocery list at a store
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeId, items } = body

    if (!storeId || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Store ID and items array are required' },
        { status: 400 }
      )
    }

    let total = 0
    const itemPrices: Array<{ name: string; price: number; found: boolean }> = []

    // Get prices for each item
    for (const item of items) {
      const itemName = item.name || item
      
      // Search for prices (fuzzy match)
      const { data: prices, error } = await supabase
        .from('product_prices')
        .select('price, product_name')
        .eq('store_id', storeId)
        .ilike('product_name', `%${itemName}%`)
        .order('date_recorded', { ascending: false })
        .limit(1)

      if (prices && prices.length > 0) {
        const price = parseFloat(prices[0].price)
        total += price
        itemPrices.push({ name: itemName, price, found: true })
      } else {
        // Use average price for this product across all stores as fallback
        const { data: avgPrice } = await supabase
          .from('product_prices')
          .select('price')
          .ilike('product_name', `%${itemName}%`)
          .order('date_recorded', { ascending: false })
          .limit(10)

        if (avgPrice && avgPrice.length > 0) {
          const avg = avgPrice.reduce((sum, p) => sum + parseFloat(p.price), 0) / avgPrice.length
          total += avg
          itemPrices.push({ name: itemName, price: avg, found: false })
        } else {
          // No price data available
          itemPrices.push({ name: itemName, price: 0, found: false })
        }
      }
    }

    return NextResponse.json({
      total: Math.round(total * 100) / 100,
      itemPrices,
      itemsFound: itemPrices.filter(p => p.found).length,
      itemsTotal: items.length,
    }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to calculate total' },
      { status: 500 }
    )
  }
}
