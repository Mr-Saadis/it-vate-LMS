-- ============================================================
-- IT-vate LMS — RLS Policy Fixes Migration
-- VULN-08: Fix conflicting SELECT policies on users table
-- Run this AFTER 001_initial_schema.sql
-- ============================================================

-- Drop the conflicting dual SELECT policies on users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Replace with a single unified SELECT policy that handles both cases.
-- Using auth.jwt() ->> 'role' for admin check instead of a self-referential
-- subquery on public.users to prevent privilege escalation via recursive RLS evaluation.
CREATE POLICY "Users can view profiles"
  ON public.users FOR SELECT
  USING (
    -- User can view their own profile
    auth.uid() = user_id
    OR
    -- Admin can view all profiles (role checked via JWT claim, not self-referential subquery)
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- Tighten UPDATE policy: users can only update their own non-role fields.
-- Prevents users from changing their own role to 'admin' via update.
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can update own non-privileged profile fields"
  ON public.users FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    -- Prevent self-role escalation: role must stay 'student' unless already admin
    AND (
      role = 'student'
      OR (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
    )
  );

-- ─── ADMIN-ONLY WRITE POLICIES ────────────────────────────────────────────────

-- Only admins can INSERT/UPDATE courses (not in original schema)
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- Only admins can manage levels
DROP POLICY IF EXISTS "Admins can manage levels" ON public.levels;
CREATE POLICY "Admins can manage levels"
  ON public.levels FOR ALL
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- Only admins can manage content items
DROP POLICY IF EXISTS "Admins can manage content" ON public.content_items;
CREATE POLICY "Admins can manage content"
  ON public.content_items FOR ALL
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- ─── STORAGE BUCKET POLICIES ──────────────────────────────────────────────────
-- Ensure payment-proofs bucket is private. Run in Supabase dashboard SQL editor:

-- Allow authenticated users to upload their own files only
-- INSERT: user can only upload to their own user_id subfolder
-- SELECT: only admins can read proofs (for verification panel)

-- Note: Storage RLS is configured in the Supabase Dashboard → Storage → Policies
-- The following is reference SQL for the storage schema (not executable here):

-- INSERT policy on storage.objects for bucket 'payment-proofs':
--   USING: auth.uid()::text = (storage.foldername(name))[1]

-- SELECT policy on storage.objects for bucket 'payment-proofs':
--   USING: (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
--   OR auth.uid()::text = (storage.foldername(name))[1]
