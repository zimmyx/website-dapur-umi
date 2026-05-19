// ─── Public Site Settings (Shared Types + Helpers) ────────────────────────────
// Safe to import from both server and client components.

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactAddress: string;
  socialInstagram: string;
  socialFacebook: string;
  socialTiktok: string;
}

export const defaultSettings: SiteSettings = {
  siteName: "Dapur Umi",
  siteTagline: "Dari Dapur, Sampai Ke Hati",
  siteDescription:
    "Luxury homemade bakery crafting premium handcrafted desserts with love.",
  contactEmail: "hello@dapurumi.com",
  contactPhone: "+60 12-345 6789",
  contactWhatsapp: "+60123456789",
  contactAddress:
    "No. 12, Jalan Manis, Taman Indah,\n47301 Petaling Jaya, Selangor",
  socialInstagram: "https://instagram.com/dapurumi",
  socialFacebook: "https://facebook.com/dapurumi",
  socialTiktok: "https://tiktok.com/@dapurumi",
};

export function whatsappLink(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  if (!cleanPhone) return "#";
  const base = `https://wa.me/${cleanPhone}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
