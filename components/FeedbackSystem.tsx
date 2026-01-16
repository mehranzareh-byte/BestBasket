'use client'

import { useState } from 'react'
import { Send, ThumbsUp, ThumbsDown, Star, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface Feedback {
  id: string
  rating: number
  comment: string
  category: string
  timestamp: Date
  aiSuggestion?: string
}

export default function FeedbackSystem() {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [category, setCategory] = useState('general')
  const [submittedFeedbacks, setSubmittedFeedbacks] = useState<Feedback[]>([])
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please provide a rating')
      return
    }

    setLoading(true)

    // Simulate API call to analyze feedback with AI
    setTimeout(async () => {
      const newFeedback: Feedback = {
        id: Date.now().toString(),
        rating,
        comment,
        category,
        timestamp: new Date(),
      }

      // Simulate AI analysis
      const suggestion = await analyzeFeedbackWithAI(newFeedback)
      newFeedback.aiSuggestion = suggestion

      setSubmittedFeedbacks([newFeedback, ...submittedFeedbacks])
      
      // Update AI suggestions list
      if (suggestion) {
        setAiSuggestions([suggestion, ...aiSuggestions].slice(0, 5))
      }

      // Reset form
      setRating(0)
      setComment('')
      setCategory('general')
      setLoading(false)

      alert('Thank you for your feedback! We appreciate your input.')
    }, 1500)
  }

  const analyzeFeedbackWithAI = async (feedback: Feedback): Promise<string> => {
    // In production, this would call your AI/ML service
    // For now, we'll simulate with rule-based suggestions
    
    const suggestions: string[] = []
    
    if (feedback.rating <= 2) {
      if (feedback.comment.toLowerCase().includes('price') || feedback.comment.toLowerCase().includes('expensive')) {
        suggestions.push('Consider adding price comparison filters and budget alerts')
      }
      if (feedback.comment.toLowerCase().includes('quality') || feedback.comment.toLowerCase().includes('fresh')) {
        suggestions.push('Implement quality rating system based on user reviews')
      }
      if (feedback.comment.toLowerCase().includes('distance') || feedback.comment.toLowerCase().includes('far')) {
        suggestions.push('Add route optimization and delivery options')
      }
      if (feedback.comment.toLowerCase().includes('search') || feedback.comment.toLowerCase().includes('find')) {
        suggestions.push('Improve search functionality with autocomplete and filters')
      }
    }
    
    if (feedback.rating >= 4) {
      if (feedback.comment.toLowerCase().includes('love') || feedback.comment.toLowerCase().includes('great')) {
        suggestions.push('Consider adding social sharing features for favorite stores')
      }
    }

    // General suggestions based on category
    if (feedback.category === 'features') {
      suggestions.push('Prioritize feature requests in next sprint planning')
    } else if (feedback.category === 'ui') {
      suggestions.push('Schedule UX review session based on feedback')
    } else if (feedback.category === 'performance') {
      suggestions.push('Investigate performance bottlenecks and optimize')
    }

    return suggestions.length > 0 ? suggestions[0] : 'Review feedback for patterns and trends'
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-primary-600" />
          <h2 className="text-3xl font-bold text-gray-800">Feedback & AI Suggestions</h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Your feedback helps us improve BestBasket. Our AI analyzes your suggestions
          and provides automatic recommendations for app improvements.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How would you rate your experience?
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-lg transition-colors ${
                    star <= rating
                      ? 'bg-yellow-100 text-yellow-500'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <Star className={`h-6 w-6 ${star <= rating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="general">General Feedback</option>
              <option value="features">Feature Request</option>
              <option value="ui">User Interface</option>
              <option value="performance">Performance</option>
              <option value="bug">Bug Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Feedback
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you think... What can we improve? What features would you like to see?"
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Analyzing with AI...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Submit Feedback</span>
              </>
            )}
          </button>
        </div>
      </div>

      {aiSuggestions.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-800">AI-Generated Improvement Suggestions</h3>
          </div>
          <ul className="space-y-2">
            {aiSuggestions.map((suggestion, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 p-3 bg-white rounded-lg"
              >
                <span className="text-purple-600 mt-1">•</span>
                <span className="text-gray-700">{suggestion}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {submittedFeedbacks.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Your Recent Feedback</h3>
          <div className="space-y-4">
            {submittedFeedbacks.slice(0, 5).map((feedback) => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < feedback.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">{feedback.category}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {feedback.timestamp.toLocaleDateString()}
                  </span>
                </div>
                {feedback.comment && (
                  <p className="text-gray-700 mb-2">{feedback.comment}</p>
                )}
                {feedback.aiSuggestion && (
                  <div className="mt-2 p-2 bg-purple-50 rounded border-l-4 border-purple-500">
                    <p className="text-sm text-purple-700">
                      <span className="font-semibold">AI Suggestion: </span>
                      {feedback.aiSuggestion}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
