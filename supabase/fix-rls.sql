-- ═══════════════════════════════════════════════════════════════════════════════
-- Fix RLS infinite recursion on admins table
--
-- Problem: existing policies on `admins` reference the `admins` table itself,
-- causing infinite recursion when a query checks the policy.
--
-- Solution:
--   - Use auth.uid() directly for self-read (not a subquery against admins)
--   - Drop the recursive super_admin policy and replace with a non-recursive
--     version that uses a SECURITY DEFINER function bypassing RLS.
-- ═══════════════════════════════════════════════════════════════════════════════

-- Drop existing recursive policies
DROP POLICY IF EXISTS "Admins can read own profile" ON public.admins;
DROP POLICY IF EXISTS "Super admins have full access to admins" ON public.admins;

-- Helper function: check if a given user is an active admin
-- SECURITY DEFINER means it runs with table owner privileges, bypassing RLS
CREATE OR REPLACE FUNCTION public.is_active_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE user_id = uid AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE user_id = uid AND is_active = true AND role = 'super_admin'
  );
$$;

-- New non-recursive policies for admins table
-- Self-read: just match user_id directly (no subquery)
CREATE POLICY "Admins read own profile" ON public.admins
  FOR SELECT USING (user_id = auth.uid());

-- Super admin full access via SECURITY DEFINER function
CREATE POLICY "Super admins manage admins" ON public.admins
  FOR ALL USING (public.is_super_admin(auth.uid()));

-- Replace all the other tables' admin policies to use the function too,
-- so they're consistent and faster (no nested subqueries on every row).

-- Products
DROP POLICY IF EXISTS "Admins have full access to products" ON public.products;
CREATE POLICY "Admins manage products" ON public.products
  FOR ALL USING (public.is_active_admin(auth.uid()));

-- Categories
DROP POLICY IF EXISTS "Admins have full access to categories" ON public.categories;
CREATE POLICY "Admins manage categories" ON public.categories
  FOR ALL USING (public.is_active_admin(auth.uid()));

-- Gallery
DROP POLICY IF EXISTS "Admins have full access to gallery" ON public.gallery;
CREATE POLICY "Admins manage gallery" ON public.gallery
  FOR ALL USING (public.is_active_admin(auth.uid()));

-- Testimonials
DROP POLICY IF EXISTS "Admins have full access to testimonials" ON public.testimonials;
CREATE POLICY "Admins manage testimonials" ON public.testimonials
  FOR ALL USING (public.is_active_admin(auth.uid()));

-- Settings
DROP POLICY IF EXISTS "Admins have full access to settings" ON public.settings;
CREATE POLICY "Admins manage settings" ON public.settings
  FOR ALL USING (public.is_active_admin(auth.uid()));
-- Public must also read settings for the public site to display contact info
DROP POLICY IF EXISTS "Public can read settings" ON public.settings;
CREATE POLICY "Public can read settings" ON public.settings
  FOR SELECT USING (true);

-- Activity logs
DROP POLICY IF EXISTS "Admins have full access to activity_logs" ON public.activity_logs;
CREATE POLICY "Admins manage activity logs" ON public.activity_logs
  FOR ALL USING (public.is_active_admin(auth.uid()));

-- Uploads
DROP POLICY IF EXISTS "Admins have full access to uploads" ON public.uploads;
CREATE POLICY "Admins manage uploads" ON public.uploads
  FOR ALL USING (public.is_active_admin(auth.uid()));

-- Featured sections
DROP POLICY IF EXISTS "Admins have full access to featured_sections" ON public.featured_sections;
CREATE POLICY "Admins manage featured sections" ON public.featured_sections
  FOR ALL USING (public.is_active_admin(auth.uid()));

-- Replace storage policies too for consistency
DROP POLICY IF EXISTS "Admins can upload" ON storage.objects;
CREATE POLICY "Admins can upload" ON storage.objects
  FOR INSERT WITH CHECK (public.is_active_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update" ON storage.objects;
CREATE POLICY "Admins can update" ON storage.objects
  FOR UPDATE USING (public.is_active_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete" ON storage.objects;
CREATE POLICY "Admins can delete" ON storage.objects
  FOR DELETE USING (public.is_active_admin(auth.uid()));

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';

-- Verify
SELECT
  (SELECT COUNT(*) FROM public.admins) AS admin_count,
  (SELECT COUNT(*) FROM public.categories) AS category_count,
  (SELECT COUNT(*) FROM public.settings) AS setting_count;
