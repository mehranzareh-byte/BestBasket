/**
 * Opening Hours Parser and Utilities
 * Parses OSM opening_hours format and checks if store is open
 */

export interface OpeningHours {
  day: number // 0 = Monday, 6 = Sunday
  openTime: string // HH:MM format
  closeTime: string // HH:MM format
  is24h: boolean
  isClosed: boolean
}

/**
 * Parse OSM opening_hours format
 * Example: "Mo-Fr 08:00-20:00; Sa 09:00-18:00; Su off"
 */
export function parseOpeningHours(osmHours: string): OpeningHours[] {
  const hours: OpeningHours[] = []
  
  if (!osmHours || osmHours.toLowerCase() === 'off' || osmHours.toLowerCase() === 'closed') {
    // Store is closed
    for (let i = 0; i < 7; i++) {
      hours.push({
        day: i,
        openTime: '',
        closeTime: '',
        is24h: false,
        isClosed: true,
      })
    }
    return hours
  }

  // Check for 24/7
  if (osmHours.toLowerCase().includes('24/7') || osmHours.toLowerCase().includes('24 hours')) {
    for (let i = 0; i < 7; i++) {
      hours.push({
        day: i,
        openTime: '00:00',
        closeTime: '23:59',
        is24h: true,
        isClosed: false,
      })
    }
    return hours
  }

  // Parse day ranges and times
  const parts = osmHours.split(';')
  
  for (let day = 0; day < 7; day++) {
    let found = false
    
    for (const part of parts) {
      const trimmed = part.trim()
      
      // Check if this day is covered
      if (isDayInRange(day, trimmed)) {
        const times = extractTimes(trimmed)
        if (times) {
          hours.push({
            day,
            openTime: times.open,
            closeTime: times.close,
            is24h: false,
            isClosed: false,
          })
          found = true
          break
        }
      }
    }
    
    if (!found) {
      hours.push({
        day,
        openTime: '',
        closeTime: '',
        is24h: false,
        isClosed: true,
      })
    }
  }
  
  return hours
}

function isDayInRange(day: number, part: string): boolean {
  const dayMap: Record<string, number> = {
    'mo': 0, 'tu': 1, 'we': 2, 'th': 3, 'fr': 4, 'sa': 5, 'su': 6,
  }
  
  const lower = part.toLowerCase()
  
  // Check for day abbreviations
  for (const [abbr, dayNum] of Object.entries(dayMap)) {
    if (lower.includes(abbr)) {
      // Check for ranges like "Mo-Fr"
      if (lower.includes('-')) {
        const range = lower.match(/(\w{2})-(\w{2})/)
        if (range) {
          const start = dayMap[range[1]]
          const end = dayMap[range[2]]
          if (day >= start && day <= end) return true
        }
      } else if (day === dayNum) {
        return true
      }
    }
  }
  
  return false
}

function extractTimes(part: string): { open: string; close: string } | null {
  // Look for time pattern like "08:00-20:00"
  const timeMatch = part.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/)
  if (timeMatch) {
    return {
      open: `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`,
      close: `${timeMatch[3].padStart(2, '0')}:${timeMatch[4]}`,
    }
  }
  return null
}

/**
 * Check if store is currently open
 */
export function isStoreOpenNow(openingHours: OpeningHours[]): { isOpen: boolean; nextOpen?: string; nextClose?: string } {
  const now = new Date()
  const currentDay = (now.getDay() + 6) % 7 // Convert to Monday=0 format
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  
  const todayHours = openingHours.find(h => h.day === currentDay)
  
  if (!todayHours || todayHours.isClosed) {
    // Find next open day
    for (let i = 1; i <= 7; i++) {
      const nextDay = (currentDay + i) % 7
      const nextDayHours = openingHours.find(h => h.day === nextDay)
      if (nextDayHours && !nextDayHours.isClosed) {
        return {
          isOpen: false,
          nextOpen: getNextOpenTime(nextDayHours, i),
          nextClose: nextDayHours.closeTime,
        }
      }
    }
    return { isOpen: false }
  }
  
  if (todayHours.is24h) {
    return { isOpen: true, nextClose: '23:59' }
  }
  
  const isOpen = currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime
  
  return {
    isOpen,
    nextOpen: isOpen ? undefined : todayHours.openTime,
    nextClose: todayHours.closeTime,
  }
}

function getNextOpenTime(hours: OpeningHours, daysAway: number): string {
  if (daysAway === 0) {
    return hours.openTime
  }
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  return `${dayNames[hours.day]} ${hours.openTime}`
}

/**
 * Get closing time for today
 */
export function getClosingTimeToday(openingHours: OpeningHours[]): string | null {
  const now = new Date()
  const currentDay = (now.getDay() + 6) % 7
  const todayHours = openingHours.find(h => h.day === currentDay)
  
  if (!todayHours || todayHours.isClosed) {
    return null
  }
  
  return todayHours.closeTime
}
