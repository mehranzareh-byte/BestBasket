import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rating, comment, category } = body

    // In production, add authentication and AI analysis
    const aiSuggestion = await analyzeFeedback(comment, category, rating)

    const { data, error } = await supabase
      .from('feedback')
      .insert([
        {
          rating,
          comment,
          category,
          ai_suggestion: aiSuggestion,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { success: true, data: { ...data[0], ai_suggestion: aiSuggestion } },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to save feedback' },
      { status: 500 }
    )
  }
}

async function analyzeFeedback(
  comment: string,
  category: string,
  rating: number
): Promise<string> {
  // In production, integrate with OpenAI, Anthropic, or your ML model
  // For now, return a simple rule-based suggestion
  
  const lowerComment = comment.toLowerCase()
  
  if (rating <= 2) {
    if (lowerComment.includes('price') || lowerComment.includes('expensive')) {
      return 'Consider adding price comparison filters and budget alerts'
    }
    if (lowerComment.includes('quality') || lowerComment.includes('fresh')) {
      return 'Implement quality rating system based on user reviews'
    }
    if (lowerComment.includes('distance') || lowerComment.includes('far')) {
      return 'Add route optimization and delivery options'
    }
  }
  
  return 'Review feedback for patterns and trends'
}

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}
