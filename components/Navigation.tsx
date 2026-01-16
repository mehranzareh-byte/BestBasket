'use client'

import { ShoppingCart, Store, Scan, MessageSquare } from 'lucide-react'

interface NavigationProps {
  activeTab: 'list' | 'stores' | 'scanner' | 'feedback'
  setActiveTab: (tab: 'list' | 'stores' | 'scanner' | 'feedback') => void
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const tabs = [
    { id: 'list' as const, label: 'My List', icon: ShoppingCart },
    { id: 'stores' as const, label: 'Stores', icon: Store },
    { id: 'scanner' as const, label: 'Scan Bill', icon: Scan },
    { id: 'feedback' as const, label: 'Feedback', icon: MessageSquare },
  ]

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-8 w-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-800">BestBasket</h1>
          </div>
          
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
