'use client'

import { useState } from 'react'
import { Plus, Trash2, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface GroceryItem {
  id: string
  name: string
  quantity: string
}

interface GroceryListProps {
  groceryList: GroceryItem[]
  setGroceryList: (list: GroceryItem[]) => void
}

export default function GroceryList({ groceryList, setGroceryList }: GroceryListProps) {
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('')

  const addItem = () => {
    if (itemName.trim()) {
      const newItem: GroceryItem = {
        id: Date.now().toString(),
        name: itemName.trim(),
        quantity: quantity.trim() || '1',
      }
      setGroceryList([...groceryList, newItem])
      setItemName('')
      setQuantity('')
    }
  }

  const removeItem = (id: string) => {
    setGroceryList(groceryList.filter(item => item.id !== id))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addItem()
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">My Grocery List</h2>
        
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add item (e.g., Milk, Bread)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Qty"
            className="w-24 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={addItem}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add
          </button>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {groceryList.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Your grocery list is empty.</p>
                <p className="text-sm mt-2">Start adding items to find the best stores!</p>
              </div>
            ) : (
              groceryList.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <div>
                      <span className="font-medium text-gray-800">{item.name}</span>
                      {item.quantity && (
                        <span className="ml-2 text-sm text-gray-500">({item.quantity})</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {groceryList.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {groceryList.length} item{groceryList.length !== 1 ? 's' : ''} in your list
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
