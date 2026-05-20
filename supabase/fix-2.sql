-- ═══════════════════════════════════════════════════════════════════════════════
-- Dapur Umi — Fix #2: RLS WITH CHECK + FAQ table
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Run in Supabase SQL Editor:
--   https://supabase.com/dashboard/project/dswffvuhsauoagadntep/sql/new
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 1. Re-create admin policies WITH CHECK so INSERTs work ───────────────────

DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Admins manage products" ON public.products
  FOR ALL
  USING (public.is_active_admin(auth.uid()))
  WITH CHECK (public.is_active_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories" ON public.categories
  FOR ALL
  USING (public.is_active_admin(auth.uid()))
  WITH CHECK (public.is_active_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage gallery" ON public.gallery;
CREATE POLICY "Admins manage gallery" ON public.gallery
  FOR ALL
  USING (public.is_active_admin(auth.uid()))
  WITH CHECK (public.is_active_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage testimonials" ON public.testimonials;
CREATE POLICY "Admins manage testimonials" ON public.testimonials
  FOR ALL
  USING (public.is_active_admin(auth.uid()))
  WITH CHECK (public.is_active_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage settings" ON public.settings;
CREATE POLICY "Admins manage settings" ON public.settings
  FOR ALL
  USING (public.is_active_admin(auth.uid()))
  WITH CHECK (public.is_active_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage activity logs" ON public.activity_logs;
CREATE POLICY "Admins manage activity logs" ON public.activity_logs
  FOR ALL
  USING (public.is_active_admin(auth.uid()))
  WITH CHECK (public.is_active_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage uploads" ON public.uploads;
CREATE POLICY "Admins manage uploads" ON public.uploads
  FOR ALL
  USING (public.is_active_admin(auth.uid()))
  WITH CHECK (public.is_active_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage featured sections" ON public.featured_sections;
CREATE POLICY "Admins manage featured sections" ON public.featured_sections
  FOR ALL
  USING (public.is_active_admin(auth.uid()))
  WITH CHECK (public.is_active_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins manage admins" ON public.admins;
CREATE POLICY "Super admins manage admins" ON public.admins
  FOR ALL
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- ─── 2. Create FAQs table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faqs_active ON public.faqs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_faqs_sort ON public.faqs(sort_order);

DROP TRIGGER IF EXISTS update_faqs_updated_at ON public.faqs;
CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active faqs" ON public.faqs;
CREATE POLICY "Public can read active faqs" ON public.faqs
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins manage faqs" ON public.faqs;
CREATE POLICY "Admins manage faqs" ON public.faqs
  FOR ALL
  USING (public.is_active_admin(auth.uid()))
  WITH CHECK (public.is_active_admin(auth.uid()));

-- ─── 3. Seed initial FAQs ─────────────────────────────────────────────────────

INSERT INTO public.faqs (question, answer, sort_order, is_active) VALUES
  (
    'Bagaimanakah cara untuk membuat tempahan?',
    'Anda boleh membuat tempahan melalui WhatsApp kami atau terus melalui laman web ini. Kami memerlukan sekurang-kurangnya 3 hari notis untuk tempahan kek khas dan 1 hari untuk produk biasa.',
    1,
    true
  ),
  (
    'Adakah perkhidmatan penghantaran disediakan?',
    'Ya, kami menyediakan perkhidmatan penghantaran ke seluruh Lembah Klang. Caj penghantaran bermula dari RM10 bergantung kepada lokasi. Penghantaran percuma untuk pesanan melebihi RM150.',
    2,
    true
  ),
  (
    'Bolehkah saya menyesuaikan reka bentuk kek saya?',
    'Sudah tentu. Kami pakar dalam kek tersuai. Sila maklumkan tema, warna, dan perisa pilihan anda, dan kami akan mereka cipta sesuatu yang istimewa untuk anda.',
    3,
    true
  ),
  (
    'Apakah bahan-bahan yang digunakan?',
    'Kami hanya menggunakan bahan-bahan premium dan segar — mentega Anchor, coklat Belgium Callebaut, tepung organik, dan buah-buahan segar tempatan. Tiada bahan pengawet tiruan digunakan.',
    4,
    true
  ),
  (
    'Berapa lamakah tempoh kek boleh disimpan?',
    'Kek kami paling sedap dimakan dalam tempoh 3 hari. Sila simpan di dalam peti sejuk pada suhu 4°C. Keluarkan 30 minit sebelum dihidangkan untuk kualiti rasa yang optimum.',
    5,
    true
  ),
  (
    'Adakah pilihan untuk pelanggan yang mempunyai alahan makanan?',
    'Ya, kami menyediakan pilihan bebas gluten, bebas kacang, dan vegan. Sila maklumkan kepada kami tentang sebarang alahan semasa membuat tempahan.',
    6,
    true
  )
ON CONFLICT DO NOTHING;

-- ─── 4. Reload schema cache ───────────────────────────────────────────────────

NOTIFY pgrst, 'reload schema';

-- ─── 5. Verify ────────────────────────────────────────────────────────────────

SELECT
  (SELECT COUNT(*) FROM public.admins) AS admins,
  (SELECT COUNT(*) FROM public.faqs) AS faqs,
  (SELECT COUNT(*) FROM public.testimonials) AS testimonials;
