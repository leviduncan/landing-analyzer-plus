-- Create risk_snapshots table for the new risk snapshot tool
CREATE TABLE public.risk_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  overall_risk TEXT NOT NULL DEFAULT 'moderate',
  strengths JSONB DEFAULT '[]'::jsonb,
  risk_breakdown JSONB DEFAULT '{}'::jsonb,
  issues JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  raw_signals JSONB DEFAULT '{}'::jsonb,
  email TEXT,
  pdf_generated BOOLEAN DEFAULT false,
  user_id UUID
);

-- Enable Row Level Security
ALTER TABLE public.risk_snapshots ENABLE ROW LEVEL SECURITY;

-- Public insert (no auth required for first use)
CREATE POLICY "Anyone can create snapshots"
ON public.risk_snapshots
FOR INSERT
WITH CHECK (true);

-- Public read by id (for sharing report links)
CREATE POLICY "Anyone can view snapshots"
ON public.risk_snapshots
FOR SELECT
USING (true);

-- Public update for email capture
CREATE POLICY "Anyone can update snapshots"
ON public.risk_snapshots
FOR UPDATE
USING (true);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.risk_snapshots;