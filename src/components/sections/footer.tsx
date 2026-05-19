"use client";

import { motion } from "framer-motion";
import { Instagram, Facebook, Heart, ArrowUp } from "lucide-react";
import Link from "next/link";
import { siteConfig, navLinks } from "@/lib/constants";
import type { SiteSettings } from "@/lib/site-settings";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/animations";

export function Footer({ settings }: { settings?: SiteSettings }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const siteName = settings?.siteName || siteConfig.name;
  const tagline = settings?.siteTagline || siteConfig.tagline;
  const phone = settings?.contactPhone || siteConfig.phone;
  const email = settings?.contactEmail || siteConfig.email;
  const address = settings?.contactAddress || siteConfig.address;
  const instagramUrl = settings?.socialInstagram || siteConfig.links.instagram;
  const facebookUrl = settings?.socialFacebook || siteConfig.links.facebook;
  const tiktokUrl = settings?.socialTiktok || siteConfig.links.tiktok;

  return (
    <footer className="relative overflow-hidden bg-foreground text-white">
      {/* Decorative Top Border */}
      <div className="h-1 w-full bg-gradient-to-r from-camel via-rose to-camel" />

      {/* Main Footer Content */}
      <div className="container-luxury py-16 sm:py-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Brand Column */}
          <motion.div variants={staggerItem} className="lg:col-span-1">
            <Link href="#home" className="inline-block">
              <h3 className="font-display text-display-sm font-bold">
                {siteName.split(" ")[0]}{" "}
                <span className="text-rose">
                  {siteName.split(" ").slice(1).join(" ") || ""}
                </span>
              </h3>
            </Link>
            <p className="mt-4 max-w-xs text-body-sm leading-relaxed text-white/60">
              {tagline}. Setiap ciptaan kami adalah ungkapan kasih
              sayang yang dipanggang dengan penuh dedikasi.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              <motion.a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </motion.a>
              <motion.a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </motion.a>
              <motion.a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                aria-label="TikTok"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.88 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.11V9.4a6.33 6.33 0 00-.82-.05A6.34 6.34 0 003.15 15.7a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.05a8.27 8.27 0 004.76 1.5V7.1a4.83 4.83 0 01-1-.41z" />
                </svg>
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={staggerItem}>
            <h4 className="mb-5 text-body-sm font-semibold uppercase tracking-wider text-white/80">
              Pautan Pantas
            </h4>
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div variants={staggerItem}>
            <h4 className="mb-5 text-body-sm font-semibold uppercase tracking-wider text-white/80">
              Perkhidmatan
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <span className="text-body-sm text-white/50">Kek Hari Jadi</span>
              </li>
              <li>
                <span className="text-body-sm text-white/50">Kek Perkahwinan</span>
              </li>
              <li>
                <span className="text-body-sm text-white/50">Kek Custom</span>
              </li>
              <li>
                <span className="text-body-sm text-white/50">Pastri & Tart</span>
              </li>
              <li>
                <span className="text-body-sm text-white/50">Catering</span>
              </li>
              <li>
                <span className="text-body-sm text-white/50">Corporate Orders</span>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={staggerItem}>
            <h4 className="mb-5 text-body-sm font-semibold uppercase tracking-wider text-white/80">
              Hubungi Kami
            </h4>
            <ul className="flex flex-col gap-4">
              <li className="text-body-sm text-white/50">
                <span className="mb-1 block font-medium text-white/70">Alamat</span>
                <span className="whitespace-pre-line">{address}</span>
              </li>
              <li className="text-body-sm text-white/50">
                <span className="mb-1 block font-medium text-white/70">Telefon</span>
                {phone}
              </li>
              <li className="text-body-sm text-white/50">
                <span className="mb-1 block font-medium text-white/70">Email</span>
                {email}
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row"
        >
          <p className="text-body-xs text-white/40">
            © {new Date().getFullYear()} {siteName}. Hak cipta terpelihara.
          </p>

          <div className="flex items-center gap-1 text-body-xs text-white/40">
            <span>Dibuat dengan</span>
            <Heart className="h-3 w-3 text-rose" fill="currentColor" />
            <span>di Malaysia</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll to Top */}
      <motion.button
        onClick={scrollToTop}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.9 }}
        className="absolute bottom-8 right-8 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </motion.button>
    </footer>
  );
}
