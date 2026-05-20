-- ═══════════════════════════════════════════════════════════════════════════════
-- Dapur Umi — Final Setup SQL (run once in Supabase SQL Editor)
--
-- This handles:
--   1. Insert admin profile for the auth user already created
--   2. Storage policies (public read, admin write)
--   3. Force PostgREST schema cache reload
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 1. Insert admin profile ──────────────────────────────────────────────────
-- The auth user was created by the setup script. Link it to the admins table.

INSERT INTO public.admins (user_id, email, name, role, is_active)
VALUES (
  'c226080c-b0d7-4c2f-b416-b16bc7fd7032',
  'admin@dapurumi.com',
  'Admin',
  'super_admin',
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- Make sure user_id is unique (for ON CONFLICT to work in future runs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'admins_user_id_unique'
  ) THEN
    ALTER TABLE public.admins ADD CONSTRAINT admins_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- ─── 2. Storage policies ──────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Public read all buckets" ON storage.objects;
CREATE POLICY "Public read all buckets" ON storage.objects
  FOR SELECT USING (bucket_id IN (
    'product-images', 'gallery-images', 'hero-images',
    'testimonial-images', 'branding-assets', 'cms-assets'
  ));

DROP POLICY IF EXISTS "Admins can upload" ON storage.objects;
CREATE POLICY "Admins can upload" ON storage.objects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can update" ON storage.objects;
CREATE POLICY "Admins can update" ON storage.objects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can delete" ON storage.objects;
CREATE POLICY "Admins can delete" ON storage.objects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- ─── 3. Force PostgREST schema cache reload ───────────────────────────────────

NOTIFY pgrst, 'reload schema';

-- ─── 4. Verify ────────────────────────────────────────────────────────────────

SELECT
  (SELECT COUNT(*) FROM public.admins) AS admin_count,
  (SELECT COUNT(*) FROM public.categories) AS category_count,
  (SELECT COUNT(*) FROM public.settings) AS setting_count;
