-- Updated BestBasket Database Schema with Enhanced Store Tracking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stores (Enhanced)
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  osm_id TEXT UNIQUE, -- OpenStreetMap ID
  name TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone TEXT,
  website TEXT,
  opening_hours JSONB, -- Store opening hours in OSM format
  shop_type TEXT, -- supermarket, grocery, convenience, etc.
  price_score DECIMAL(5, 2) DEFAULT 50.0, -- Calculated from price data
  quality_score DECIMAL(5, 2) DEFAULT 50.0, -- From user reviews/ratings
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0.0,
  currency TEXT DEFAULT 'USD', -- Store's currency
  country_code TEXT, -- ISO country code
  city TEXT,
  last_price_update TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store Opening Hours (Detailed)
CREATE TABLE IF NOT EXISTS public.store_opening_hours (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Monday, 6=Sunday
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false,
  is_24h BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, day_of_week)
);

-- Product Prices (Per Store, Per Product)
CREATE TABLE IF NOT EXISTS public.product_prices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_category TEXT, -- e.g., 'dairy', 'produce', 'meat'
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  unit TEXT, -- 'kg', 'piece', 'liter', etc.
  date_recorded DATE NOT NULL,
  source TEXT NOT NULL, -- 'bill_scan', 'manual', 'api', 'user_submission'
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  bill_id UUID REFERENCES public.bills(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, product_name, date_recorded, source)
);

-- Store Price History (Aggregated)
CREATE TABLE IF NOT EXISTS public.store_price_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  average_price_per_item DECIMAL(10, 2),
  total_products_tracked INTEGER DEFAULT 0,
  price_trend TEXT, -- 'increasing', 'decreasing', 'stable'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, date)
);

-- Store Reviews and Ratings
CREATE TABLE IF NOT EXISTS public.store_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  price_rating INTEGER CHECK (price_rating >= 1 AND price_rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store Recommendations Cache (for performance)
CREATE TABLE IF NOT EXISTS public.store_recommendations_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_location_lat DECIMAL(10, 8) NOT NULL,
  user_location_lng DECIMAL(11, 8) NOT NULL,
  grocery_list_hash TEXT NOT NULL, -- Hash of grocery list items
  preferences JSONB NOT NULL, -- User preferences
  recommended_stores JSONB NOT NULL, -- Cached recommendations
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_location_lat, user_location_lng, grocery_list_hash)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stores_location ON public.stores(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_stores_osm_id ON public.stores(osm_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_store_id ON public.product_prices(store_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_product_name ON public.product_prices(product_name);
CREATE INDEX IF NOT EXISTS idx_product_prices_date ON public.product_prices(date_recorded);
CREATE INDEX IF NOT EXISTS idx_store_opening_hours_store_id ON public.store_opening_hours(store_id);
CREATE INDEX IF NOT EXISTS idx_store_reviews_store_id ON public.store_reviews(store_id);
CREATE INDEX IF NOT EXISTS idx_store_price_history_store_id ON public.store_price_history(store_id);
CREATE INDEX IF NOT EXISTS idx_store_recommendations_cache_location ON public.store_recommendations_cache(user_location_lat, user_location_lng);

-- Functions to update store scores
CREATE OR REPLACE FUNCTION update_store_price_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.stores
  SET price_score = (
    SELECT 
      CASE 
        WHEN AVG(price) > 0 THEN
          100 - LEAST(50, (AVG(price) - (SELECT AVG(price) FROM public.product_prices WHERE product_name = NEW.product_name)) / (SELECT AVG(price) FROM public.product_prices WHERE product_name = NEW.product_name) * 100)
        ELSE 50
      END
    FROM public.product_prices
    WHERE store_id = NEW.store_id
    AND date_recorded >= CURRENT_DATE - INTERVAL '30 days'
  ),
  last_price_update = NOW(),
  updated_at = NOW()
  WHERE id = NEW.store_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_price_score_trigger
AFTER INSERT OR UPDATE ON public.product_prices
FOR EACH ROW
EXECUTE FUNCTION update_store_price_score();

-- Function to update quality score from reviews
CREATE OR REPLACE FUNCTION update_store_quality_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.stores
  SET 
    quality_score = (
      SELECT AVG(quality_rating::DECIMAL) * 20
      FROM public.store_reviews
      WHERE store_id = NEW.store_id
    ),
    average_rating = (
      SELECT AVG(rating::DECIMAL)
      FROM public.store_reviews
      WHERE store_id = NEW.store_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.store_reviews
      WHERE store_id = NEW.store_id
    ),
    updated_at = NOW()
  WHERE id = NEW.store_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quality_score_trigger
AFTER INSERT OR UPDATE ON public.store_reviews
FOR EACH ROW
EXECUTE FUNCTION update_store_quality_score();

-- Row Level Security
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_reviews ENABLE ROW LEVEL SECURITY;

-- Public read access for stores
CREATE POLICY "Anyone can view stores" ON public.stores
  FOR SELECT USING (true);

-- Public read access for product prices (for recommendations)
CREATE POLICY "Anyone can view product prices" ON public.product_prices
  FOR SELECT USING (true);

-- Users can insert their own price data
CREATE POLICY "Users can insert own product prices" ON public.product_prices
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Public read access for reviews
CREATE POLICY "Anyone can view store reviews" ON public.store_reviews
  FOR SELECT USING (true);

-- Users can insert their own reviews
CREATE POLICY "Users can insert own reviews" ON public.store_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
