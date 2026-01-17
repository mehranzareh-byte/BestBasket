/**
 * IP-based geolocation utilities
 * Uses free IP geolocation APIs
 */

export interface LocationData {
  country: string
  countryCode: string
  city: string
  latitude: number
  longitude: number
  currency: string
  currencySymbol: string
  timezone: string
}

/**
 * Get user location based on IP address
 * Uses ipapi.co (free tier: 1000 requests/day)
 * Alternative: ip-api.com (free tier: 45 requests/minute)
 */
export async function getLocationFromIP(): Promise<LocationData | null> {
  try {
    // Using ipapi.co - free tier, no API key needed
    const response = await fetch('https://ipapi.co/json/')
    
    if (!response.ok) {
      throw new Error('Failed to fetch location')
    }
    
    const data = await response.json()
    
    return {
      country: data.country_name || 'United States',
      countryCode: data.country_code || 'US',
      city: data.city || 'New York',
      latitude: data.latitude || 40.7128,
      longitude: data.longitude || -74.0060,
      currency: data.currency || 'USD',
      currencySymbol: getCurrencySymbol(data.currency || 'USD'),
      timezone: data.timezone || 'America/New_York',
    }
  } catch (error) {
    console.error('Error fetching location from IP:', error)
    
    // Fallback: Try alternative service
    try {
      const fallbackResponse = await fetch('http://ip-api.com/json/')
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json()
        return {
          country: fallbackData.country || 'United States',
          countryCode: fallbackData.countryCode || 'US',
          city: fallbackData.city || 'New York',
          latitude: fallbackData.lat || 40.7128,
          longitude: fallbackData.lon || -74.0060,
          currency: getCurrencyFromCountry(fallbackData.countryCode || 'US'),
          currencySymbol: getCurrencySymbol(getCurrencyFromCountry(fallbackData.countryCode || 'US')),
          timezone: fallbackData.timezone || 'America/New_York',
        }
      }
    } catch (fallbackError) {
      console.error('Fallback geolocation also failed:', fallbackError)
    }
    
    // Default fallback
    return {
      country: 'United States',
      countryCode: 'US',
      city: 'New York',
      latitude: 40.7128,
      longitude: -74.0060,
      currency: 'USD',
      currencySymbol: '$',
      timezone: 'America/New_York',
    }
  }
}

/**
 * Get currency symbol for a currency code
 */
function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
    BRL: 'R$',
    MXN: '$',
    ZAR: 'R',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    PLN: 'zł',
    TRY: '₺',
    RUB: '₽',
    KRW: '₩',
    SGD: 'S$',
    HKD: 'HK$',
    NZD: 'NZ$',
  }
  return symbols[currency] || currency
}

/**
 * Get currency code from country code
 */
function getCurrencyFromCountry(countryCode: string): string {
  const countryToCurrency: Record<string, string> = {
    US: 'USD',
    GB: 'GBP',
    CA: 'CAD',
    AU: 'AUD',
    DE: 'EUR',
    FR: 'EUR',
    IT: 'EUR',
    ES: 'EUR',
    NL: 'EUR',
    BE: 'EUR',
    AT: 'EUR',
    PT: 'EUR',
    IE: 'EUR',
    FI: 'EUR',
    GR: 'EUR',
    JP: 'JPY',
    CN: 'CNY',
    IN: 'INR',
    BR: 'BRL',
    MX: 'MXN',
    ZA: 'ZAR',
    SE: 'SEK',
    NO: 'NOK',
    DK: 'DKK',
    PL: 'PLN',
    TR: 'TRY',
    RU: 'RUB',
    KR: 'KRW',
    SG: 'SGD',
    HK: 'HKD',
    NZ: 'NZD',
    CH: 'CHF',
  }
  return countryToCurrency[countryCode] || 'USD'
}
