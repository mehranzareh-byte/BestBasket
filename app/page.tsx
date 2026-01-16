'use client'

import { useState } from 'react'
import GroceryList from '@/components/GroceryList'
import StoreRecommendations from '@/components/StoreRecommendations'
import BillScanner from '@/components/BillScanner'
import FeedbackSystem from '@/components/FeedbackSystem'
import Navigation from '@/components/Navigation'

export default function Home() {
  const [groceryList, setGroceryList] = useState<Array<{id: string, name: string, quantity: string}>>([])
  const [activeTab, setActiveTab] = useState<'list' | 'stores' | 'scanner' | 'feedback'>('list')

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {activeTab === 'list' && (
          <GroceryList 
            groceryList={groceryList} 
            setGroceryList={setGroceryList}
          />
        )}
        
        {activeTab === 'stores' && (
          <StoreRecommendations groceryList={groceryList} />
        )}
        
        {activeTab === 'scanner' && (
          <BillScanner />
        )}
        
        {activeTab === 'feedback' && (
          <FeedbackSystem />
        )}
      </div>
    </main>
  )
}
