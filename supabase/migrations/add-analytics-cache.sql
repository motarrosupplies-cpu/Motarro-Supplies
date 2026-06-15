-- Create analytics_cache table for storing GA4 data with TTL
CREATE TABLE IF NOT EXISTS analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on cache_key for fast lookups
CREATE INDEX IF NOT EXISTS idx_analytics_cache_key ON analytics_cache(cache_key);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_analytics_cache_expires ON analytics_cache(expires_at);

-- Enable RLS
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated admin users can read/write
CREATE POLICY "Admin users can manage analytics cache"
  ON analytics_cache
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        SELECT email FROM auth.users WHERE email LIKE '%@apparely.co.za'
      )
    )
  );

-- Function to automatically clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_analytics_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM analytics_cache
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-analytics-cache', '0 * * * *', 'SELECT cleanup_expired_analytics_cache()');

