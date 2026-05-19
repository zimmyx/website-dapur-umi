-- ═══════════════════════════════════════════════════════════════════════════════
-- DAPUR UMI — Supabase Database Schema
-- Advanced PostgreSQL schema for the luxury bakery platform
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Categories Table ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  product_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Products Table ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  discounted_price DECIMAL(10,2) CHECK (discounted_price >= 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_best_seller BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  preparation_time INTEGER,
  ingredients TEXT[] DEFAULT '{}',
  allergens TEXT[] DEFAULT '{}',
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Gallery Table ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Testimonials Table ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT,
  avatar_url TEXT,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Settings Table ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
  "group" TEXT NOT NULL DEFAULT 'general',
  label TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Admins Table ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('super_admin', 'admin', 'editor')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Activity Logs Table ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Uploads Table ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size > 0),
  mime_type TEXT NOT NULL,
  bucket TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  uploaded_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Featured Sections Table ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS featured_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  cta_text TEXT,
  cta_link TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(is_best_seller) WHERE is_best_seller = true;
CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

CREATE INDEX IF NOT EXISTS idx_gallery_featured ON gallery(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_gallery_sort ON gallery(sort_order);

CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured) WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_group ON settings("group");

CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

CREATE INDEX IF NOT EXISTS idx_activity_logs_admin ON activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_uploads_bucket ON uploads(bucket);
CREATE INDEX IF NOT EXISTS idx_uploads_created ON uploads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_featured_sections_key ON featured_sections(section_key);

-- ═══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS — Auto-update updated_at
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_updated_at
  BEFORE UPDATE ON gallery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_featured_sections_updated_at
  BEFORE UPDATE ON featured_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- TRIGGER — Auto-update category product_count
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_category_product_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE categories SET product_count = (
      SELECT COUNT(*) FROM products WHERE category_id = NEW.category_id
    ) WHERE id = NEW.category_id;
  END IF;

  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    IF OLD.category_id IS NOT NULL THEN
      UPDATE categories SET product_count = (
        SELECT COUNT(*) FROM products WHERE category_id = OLD.category_id
      ) WHERE id = OLD.category_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION update_category_product_count();

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_sections ENABLE ROW LEVEL SECURITY;

-- Public read policies (for website visitors)
CREATE POLICY "Public can read available products" ON products
  FOR SELECT USING (is_available = true);

CREATE POLICY "Public can read active categories" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read gallery" ON gallery
  FOR SELECT USING (true);

CREATE POLICY "Public can read approved testimonials" ON testimonials
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Public can read active featured sections" ON featured_sections
  FOR SELECT USING (is_active = true);

-- Admin full access policies
CREATE POLICY "Admins have full access to products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admins have full access to categories" ON categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admins have full access to gallery" ON gallery
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admins have full access to testimonials" ON testimonials
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admins have full access to settings" ON settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admins can read own profile" ON admins
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins have full access to admins" ON admins
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND role = 'super_admin' AND is_active = true)
  );

CREATE POLICY "Admins have full access to activity_logs" ON activity_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admins have full access to uploads" ON uploads
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admins have full access to featured_sections" ON featured_sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND is_active = true)
  );

-- ═══════════════════════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Run these in Supabase Dashboard > Storage or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gallery-images', 'gallery-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('hero-images', 'hero-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('testimonial-images', 'testimonial-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('branding-assets', 'branding-assets', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('cms-assets', 'cms-assets', true);

-- Storage policies (public read, admin write)
-- CREATE POLICY "Public can read all buckets" ON storage.objects
--   FOR SELECT USING (bucket_id IN ('product-images', 'gallery-images', 'hero-images', 'testimonial-images', 'branding-assets', 'cms-assets'));

-- CREATE POLICY "Admins can upload to all buckets" ON storage.objects
--   FOR INSERT WITH CHECK (
--     EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND is_active = true)
--   );

-- CREATE POLICY "Admins can delete from all buckets" ON storage.objects
--   FOR DELETE USING (
--     EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND is_active = true)
--   );

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════════════════════════════════════════

-- Insert default categories
INSERT INTO categories (name, name_en, slug, description, icon, sort_order, is_active) VALUES
  ('Kek & Cake', 'Cakes', 'kek', 'Kek premium buatan tangan dengan cita rasa istimewa', '🎂', 1, true),
  ('Pastri & Tart', 'Pastries & Tarts', 'pastri', 'Pastri rangup dan tart berkrim yang memikat selera', '🥐', 2, true),
  ('Biskut & Cookies', 'Cookies', 'cookies', 'Biskut artisan dengan pelbagai perisa unik', '🍪', 3, true),
  ('Roti & Bread', 'Breads', 'roti', 'Roti segar dipanggang setiap hari dengan penuh kasih', '🍞', 4, true),
  ('Kuih Tradisional', 'Traditional Kuih', 'kuih', 'Kuih warisan Melayu yang dimasak dengan penuh tradisi', '🧁', 5, true),
  ('Minuman', 'Beverages', 'minuman', 'Minuman istimewa untuk melengkapi setiap hidangan', '☕', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert default settings
INSERT INTO settings (key, value, type, "group", label, description) VALUES
  ('site_name', 'Dapur Umi', 'string', 'general', 'Site Name', 'The name of the website'),
  ('site_tagline', 'Dari Dapur, Sampai Ke Hati', 'string', 'general', 'Tagline', 'Site tagline'),
  ('site_description', 'Luxury homemade bakery crafting premium handcrafted desserts with love.', 'string', 'general', 'Description', 'Site meta description'),
  ('contact_phone', '+60123456789', 'string', 'contact', 'Phone', 'Contact phone number'),
  ('contact_email', 'hello@dapurumi.com', 'string', 'contact', 'Email', 'Contact email'),
  ('contact_whatsapp', '+60123456789', 'string', 'contact', 'WhatsApp', 'WhatsApp number'),
  ('social_instagram', 'https://instagram.com/dapurumi', 'string', 'social', 'Instagram', 'Instagram URL'),
  ('social_facebook', 'https://facebook.com/dapurumi', 'string', 'social', 'Facebook', 'Facebook URL'),
  ('social_tiktok', 'https://tiktok.com/@dapurumi', 'string', 'social', 'TikTok', 'TikTok URL'),
  ('delivery_fee', '10', 'number', 'business', 'Delivery Fee', 'Default delivery fee in RM'),
  ('free_delivery_min', '150', 'number', 'business', 'Free Delivery Minimum', 'Minimum order for free delivery'),
  ('min_order_days', '3', 'number', 'business', 'Minimum Order Days', 'Minimum days notice for custom orders')
ON CONFLICT (key) DO NOTHING;

-- Insert default featured sections
INSERT INTO featured_sections (section_key, title, subtitle, description, is_active, sort_order) VALUES
  ('hero', 'Dari Dapur, Sampai Ke Hati', 'Premium Handcrafted Bakery', 'Setiap ciptaan kami adalah ungkapan kasih sayang', true, 1),
  ('about', 'Kisah Kami', 'Dari Dapur Kecil, Lahir Impian Besar', 'Dapur Umi bermula dari sebuah dapur kecil di rumah', true, 2),
  ('products', 'Ciptaan Istimewa Kami', 'Menu Pilihan', 'Setiap hidangan dihasilkan dengan bahan premium', true, 3),
  ('gallery', 'Karya Seni Kami', 'Galeri', 'Setiap ciptaan adalah kanvas', true, 4),
  ('testimonials', 'Kata Mereka', 'Testimoni', 'Kepuasan pelanggan adalah kebanggaan kami', true, 5)
ON CONFLICT (section_key) DO NOTHING;
