'use client'

import { useState, useCallback } from 'react'
import { Upload, CheckCircle } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import Tesseract from 'tesseract.js'

export default function BillScanner() {
  const [uploading, setUploading] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [progress, setProgress] = useState(0)

  const extractStoreName = (text: string): string => {
    // Simple extraction - look for common store name patterns
    const storePatterns = [
      /(?:store|market|grocer|supermarket|mart)[:\s]+([A-Z][A-Za-z\s]+)/i,
      /^([A-Z][A-Za-z\s&]+)\s*(?:receipt|invoice|bill)/i,
    ]
    
    for (const pattern of storePatterns) {
      const match = text.match(pattern)
      if (match) return match[1].trim()
    }
    
    return 'Unknown Store'
  }

  const extractDate = (text: string): string => {
    const datePattern = /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}/
    const match = text.match(datePattern)
    return match ? match[0] : 'Unknown Date'
  }

  const parseBillText = useCallback((text: string) => {
    // Simple parsing logic - in production, use more sophisticated NLP
    const lines = text.split('\n').filter(line => line.trim())
    const items: Array<{name: string, price: number, quantity?: number}> = []
    
    // Look for price patterns
    const pricePattern = /\$?(\d+\.\d{2})/
    
    lines.forEach((line, index) => {
      const priceMatch = line.match(pricePattern)
      if (priceMatch) {
        const price = parseFloat(priceMatch[1])
        // Assume the text before the price is the item name
        const itemName = line.substring(0, priceMatch.index).trim()
        if (itemName && price > 0 && price < 1000) {
          items.push({
            name: itemName,
            price: price,
          })
        }
      }
    })

    return {
      items,
      total: items.reduce((sum, item) => sum + item.price, 0),
      store: extractStoreName(text),
      date: extractDate(text),
    }
  }, [])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploading(true)
    setProgress(0)

    try {
      // Use Tesseract.js for OCR
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        },
      })

      // Parse the extracted text to find items and prices
      const parsedData = parseBillText(text)
      setExtractedData(parsedData)
      
      // In production, send this to your backend API
      // await fetch('/api/bills', { method: 'POST', body: JSON.stringify(parsedData) })
      
    } catch (error) {
      console.error('Error processing bill:', error)
      alert('Error processing bill. Please try again.')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }, [parseBillText])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Scan Your Receipt</h2>
        <p className="text-gray-600 mb-6">
          Upload a photo or PDF of your grocery receipt. We&apos;ll extract the items and prices
          to improve our recommendations for you and other users.
        </p>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div>
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">Processing... {progress}%</p>
            </div>
          ) : (
            <div>
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive ? 'Drop the file here' : 'Drag & drop your receipt here'}
              </p>
              <p className="text-sm text-gray-500">or click to select</p>
              <p className="text-xs text-gray-400 mt-2">Supports: JPG, PNG, PDF</p>
            </div>
          )}
        </div>

        {extractedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-800">Receipt Processed Successfully!</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Store: </span>
                <span className="text-gray-600">{extractedData.store}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Date: </span>
                <span className="text-gray-600">{extractedData.date}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total: </span>
                <span className="text-gray-600">${extractedData.total.toFixed(2)}</span>
              </div>
              
              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Items Found:</h4>
                <div className="space-y-2">
                  {extractedData.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between p-2 bg-white rounded">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="font-medium text-gray-900">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  // In production, save to database
                  alert('Receipt data saved! This will help improve our recommendations.')
                  setExtractedData(null)
                }}
                className="w-full mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Save Receipt Data
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
