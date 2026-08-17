-- ============================================================
-- IT-vate LMS — Add start_date and end_date to content_items
-- For batch/cohort tracking directly inside content items
-- ============================================================

ALTER TABLE public.content_items 
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;
