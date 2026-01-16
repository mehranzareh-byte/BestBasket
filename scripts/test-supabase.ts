// Quick test script to verify Supabase connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Checking Supabase configuration...\n')

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing')
  process.exit(1)
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')
  process.exit(1)
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL format looks incorrect')
  console.error('   Expected format: https://xxxxx.supabase.co')
  process.exit(1)
}

// Validate key format (Supabase keys are JWT tokens, start with eyJ)
if (!supabaseAnonKey.startsWith('eyJ')) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY format looks incorrect')
  console.error('   Supabase keys typically start with "eyJ"')
  process.exit(1)
}

console.log('✅ NEXT_PUBLIC_SUPABASE_URL format looks correct')
console.log('   URL:', supabaseUrl.substring(0, 30) + '...')
console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY format looks correct')
console.log('   Key starts with:', supabaseAnonKey.substring(0, 20) + '...\n')

// Test connection
console.log('🔌 Testing Supabase connection...')
const supabase = createClient(supabaseUrl, supabaseAnonKey)

supabase
  .from('stores')
  .select('count')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️  Connection works, but "stores" table might not exist yet')
        console.log('   Make sure you ran the SQL schema in Supabase SQL Editor\n')
      } else {
        console.error('❌ Connection error:', error.message)
        console.error('   Code:', error.code)
        process.exit(1)
      }
    } else {
      console.log('✅ Supabase connection successful!\n')
    }
  })
  .catch((err) => {
    console.error('❌ Connection failed:', err.message)
    process.exit(1)
  })
