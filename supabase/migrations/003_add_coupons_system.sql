-- ─── COUPONS TABLE ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coupons (
  coupon_id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code                  TEXT NOT NULL UNIQUE,
  discount_percentage   NUMERIC(5,2) NOT NULL,
  
  usage_limit           INTEGER, -- NULL means unlimited
  used_count            INTEGER NOT NULL DEFAULT 0,
  
  applicable_course_id  UUID REFERENCES public.courses(course_id) ON DELETE CASCADE,
  applicable_track_type TEXT CHECK (applicable_track_type IN ('Expert', 'Progressive', 'Fast', 'Premium')),
  
  valid_from            TIMESTAMPTZ DEFAULT now(),
  valid_until           TIMESTAMPTZ,
  is_active             BOOLEAN NOT NULL DEFAULT true,
  
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- RLS for Coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins have full access to coupons"
  ON public.coupons
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.user_id = auth.uid() AND users.role = 'admin'
    )
  );

-- Anyone can read active coupons (to validate during checkout)
CREATE POLICY "Anyone can view active coupons"
  ON public.coupons
  FOR SELECT
  USING (is_active = true);


-- ─── UPDATE PAYMENTS TABLE ──────────────────────────────────────────────────
ALTER TABLE public.payments
ADD COLUMN coupon_id UUID REFERENCES public.coupons(coupon_id) ON DELETE SET NULL;
