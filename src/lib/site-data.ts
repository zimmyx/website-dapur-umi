// ─── Public Site Data Loader (Server) ─────────────────────────────────────────
// Server-only: fetches public-facing data from Supabase using the SSR client.
// All queries respect RLS (only published/active rows are returned).

import { createClient } from "@/lib/supabase/server";
import type {
  Category,
  Product,
  GalleryItem,
  Testimonial,
  Setting,
  Faq,
} from "@/types";
import { defaultSettings, type SiteSettings } from "@/lib/site-settings";

export interface SiteData {
  categories: Category[];
  products: Product[];
  gallery: GalleryItem[];
  testimonials: Testimonial[];
  faqs: Faq[];
  settings: SiteSettings;
}

function settingsFromRows(rows: Setting[] | null): SiteSettings {
  if (!rows || rows.length === 0) return defaultSettings;
  const map = new Map<string, string>();
  for (const row of rows) {
    if (row.value !== null && row.value !== undefined && row.value !== "") {
      map.set(row.key, row.value);
    }
  }

  return {
    siteName: map.get("site_name") ?? defaultSettings.siteName,
    siteTagline: map.get("site_tagline") ?? defaultSettings.siteTagline,
    siteDescription:
      map.get("site_description") ?? defaultSettings.siteDescription,
    contactEmail: map.get("contact_email") ?? defaultSettings.contactEmail,
    contactPhone: map.get("contact_phone") ?? defaultSettings.contactPhone,
    contactWhatsapp:
      map.get("contact_whatsapp") ?? defaultSettings.contactWhatsapp,
    contactAddress:
      map.get("contact_address") ?? defaultSettings.contactAddress,
    socialInstagram:
      map.get("social_instagram") ?? defaultSettings.socialInstagram,
    socialFacebook:
      map.get("social_facebook") ?? defaultSettings.socialFacebook,
    socialTiktok: map.get("social_tiktok") ?? defaultSettings.socialTiktok,
  };
}

export async function loadSiteData(): Promise<SiteData> {
  try {
    const supabase = await createClient();

    const [
      categoriesRes,
      productsRes,
      galleryRes,
      testimonialsRes,
      faqsRes,
      settingsRes,
    ] = await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("products")
        .select("*")
        .eq("is_available", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("gallery")
        .select("*")
        .order("sort_order", { ascending: true })
        .limit(12),
      supabase
        .from("testimonials")
        .select("*")
        .eq("is_approved", true)
        .order("sort_order", { ascending: true })
        .limit(12),
      supabase
        .from("faqs")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase.from("settings").select("*"),
    ]);

    return {
      categories: (categoriesRes.data as Category[] | null) ?? [],
      products: (productsRes.data as Product[] | null) ?? [],
      gallery: (galleryRes.data as GalleryItem[] | null) ?? [],
      testimonials: (testimonialsRes.data as Testimonial[] | null) ?? [],
      faqs: (faqsRes.data as Faq[] | null) ?? [],
      settings: settingsFromRows(settingsRes.data as Setting[] | null),
    };
  } catch {
    // If Supabase is unreachable (e.g., during initial setup), return empty
    // and let sections fall back to placeholder content.
    return {
      categories: [],
      products: [],
      gallery: [],
      testimonials: [],
      faqs: [],
      settings: defaultSettings,
    };
  }
}
