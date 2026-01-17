# 🆓 Free Location APIs - No Credit Card Required

## ✅ Completely Free Options (No Credit Card)

### 1. **OpenStreetMap Nominatim API** ⭐ RECOMMENDED
**What it does**: Geocoding (address → coordinates) and reverse geocoding (coordinates → address)

**Free Tier**:
- ✅ **No credit card required**
- ✅ **No API key needed**
- ✅ **1 request per second** (for free usage)
- ✅ **Unlimited requests** (if you respect rate limits)

**Usage**:
```javascript
// Geocoding: Address to coordinates
fetch('https://nominatim.openstreetmap.org/search?q=New+York&format=json&limit=1')
  .then(res => res.json())
  .then(data => {
    const lat = data[0].lat
    const lon = data[0].lon
  })

// Reverse Geocoding: Coordinates to address
fetch(`https://nominatim.openstreetmap.org/reverse?lat=40.7128&lon=-74.0060&format=json`)
  .then(res => res.json())
  .then(data => {
    const address = data.display_name
  })
```

**Rate Limits**: 
- 1 request per second (free tier)
- Add `User-Agent` header to avoid blocking

---

### 2. **Photon API** (Komoot)
**What it does**: Fast geocoding and search

**Free Tier**:
- ✅ **No credit card required**
- ✅ **No API key needed**
- ✅ **Public instance available**
- ⚠️ **Rate limits apply** (but generous)

**Usage**:
```javascript
fetch('https://photon.komoot.io/api/?q=supermarket&lat=40.7128&lon=-74.0060')
  .then(res => res.json())
  .then(data => {
    // Returns nearby places
  })
```

---

### 3. **IP Geolocation APIs** (Already Using!)
**What it does**: Get location from IP address

**Free Options**:
- ✅ **ipapi.co** - 1,000 requests/day free
- ✅ **ip-api.com** - 45 requests/minute free
- ✅ **No credit card required**

**You're already using this!** (in `lib/geolocation.ts`)

---

### 4. **Browser Geolocation API** (Already Using!)
**What it does**: Get user's precise location from browser

**Free Tier**:
- ✅ **100% free**
- ✅ **No API key**
- ✅ **No credit card**
- ✅ **Built into browsers**

**You're already using this!** (in `components/StoreRecommendations.tsx`)

---

## 🗺️ Map Display (Already Using!)

### **Leaflet + OpenStreetMap** ✅
- ✅ **100% free**
- ✅ **No API key needed**
- ✅ **No credit card required**
- ✅ **Unlimited usage**

**You're already using this!** (in `components/MapView.tsx`)

---

## 📍 Store Location APIs (Free Options)

### 1. **Overpass API** (OpenStreetMap)
**What it does**: Query OpenStreetMap for nearby stores/places

**Free Tier**:
- ✅ **No credit card required**
- ✅ **No API key needed**
- ⚠️ **Rate limits** (but generous for small apps)

**Usage**:
```javascript
// Find supermarkets near location
const query = `
[out:json][timeout:25];
(
  node["shop"="supermarket"](around:1000,40.7128,-74.0060);
  way["shop"="supermarket"](around:1000,40.7128,-74.0060);
);
out body;
>;
out skel qt;
`

fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  body: query
})
```

---

### 2. **Foursquare Places API** (Limited Free)
**Free Tier**:
- ✅ **No credit card** for basic tier
- ⚠️ **API key required** (but free to get)
- ⚠️ **Limited requests** (varies)

---

### 3. **Mapbox Geocoding** (Limited Free)
**Free Tier**:
- ⚠️ **Requires account** (but no credit card for free tier)
- ✅ **100,000 requests/month free**
- ⚠️ **API key required**

---

## 🎯 Recommended Setup for BestBasket

### Current Setup (Already Free!) ✅
1. ✅ **IP Geolocation** - ipapi.co (free)
2. ✅ **Browser Geolocation** - Built-in (free)
3. ✅ **Map Display** - Leaflet + OSM (free)

### Add These (Also Free!)
1. **Nominatim API** - For address geocoding
2. **Overpass API** - For finding real stores near location

---

## 💡 Implementation Example

### Add Real Store Search

```typescript
// lib/store-search.ts
export async function findNearbyStores(lat: number, lng: number, radius: number = 2000) {
  // Use Overpass API to find real supermarkets
  const query = `
[out:json][timeout:25];
(
  node["shop"="supermarket"](around:${radius},${lat},${lng});
  way["shop"="supermarket"](around:${radius},${lat},${lng});
);
out body;
>;
out skel qt;
`

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
    
    const data = await response.json()
    return data.elements.map((element: any) => ({
      id: element.id,
      name: element.tags?.name || 'Unknown Store',
      latitude: element.lat,
      longitude: element.lon,
      address: element.tags?.['addr:full'] || '',
    }))
  } catch (error) {
    console.error('Error fetching stores:', error)
    return []
  }
}
```

---

## ⚠️ Important Notes

### Rate Limits
- **Nominatim**: 1 request/second (add delays between requests)
- **Overpass**: Be respectful, don't spam
- **IP APIs**: Check their limits

### Best Practices
1. **Cache results** - Don't request same location multiple times
2. **Add delays** - Respect rate limits
3. **Use User-Agent** - Required for Nominatim
4. **Handle errors** - APIs can be slow or unavailable

---

## 🚀 Quick Start

Want me to integrate Nominatim or Overpass API into your app? I can:
1. Add real store search using Overpass API
2. Add address geocoding using Nominatim
3. Replace mock stores with real data

**All completely free, no credit card needed!** 🎉

---

## Summary

| Service | Credit Card? | API Key? | Free Tier |
|---------|--------------|----------|-----------|
| **Nominatim** | ❌ No | ❌ No | ✅ Unlimited (with rate limits) |
| **Photon** | ❌ No | ❌ No | ✅ Yes |
| **Overpass** | ❌ No | ❌ No | ✅ Yes |
| **Leaflet/OSM** | ❌ No | ❌ No | ✅ Unlimited |
| **Browser Geolocation** | ❌ No | ❌ No | ✅ Unlimited |
| **IP Geolocation** | ❌ No | ❌ No | ✅ Yes (limits apply) |

**All recommended options are FREE and require NO CREDIT CARD!** ✅
