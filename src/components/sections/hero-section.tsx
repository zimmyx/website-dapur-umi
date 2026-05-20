"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDown, Sparkles, MessageCircle } from "lucide-react";
import { whatsappLink, type SiteSettings } from "@/lib/site-settings";
import {
  staggerContainer,
  staggerItem,
  floatAnimation,
  floatAnimationSlow,
} from "@/lib/animations";

export function HeroSection({ settings }: { settings?: SiteSettings }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const tagline = settings?.siteTagline || "Dari Dapur, Sampai Ke Hati";
  const description =
    settings?.siteDescription ||
    "Setiap ciptaan kami adalah ungkapan kasih sayang — dipanggang dengan bahan premium, dihias dengan seni, dan dihantar dengan penuh cinta untuk momen istimewa anda.";
  const whatsapp = settings?.contactWhatsapp || "+60123456789";
  const waUrl = whatsappLink(whatsapp);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden pt-20 sm:pt-24"
    >
      {/* Gradient Mesh Background — replaces static photo */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cream via-cream-100 to-sand-50" />

        {/* Aurora blobs */}
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-32 top-20 h-[500px] w-[500px] rounded-full bg-rose/30 blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-32 bottom-20 h-[500px] w-[500px] rounded-full bg-camel/30 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sand/40 blur-[100px]"
        />

        {/* Subtle grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.7'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Floating Decorative Elements - hidden on small screens to reduce clutter */}
      <motion.div
        variants={floatAnimation}
        initial="initial"
        animate="animate"
        className="absolute left-[10%] top-[20%] z-10 hidden lg:block"
      >
        <div className="h-20 w-20 rounded-full border border-rose/30 bg-rose/10 backdrop-blur-sm" />
      </motion.div>

      <motion.div
        variants={floatAnimationSlow}
        initial="initial"
        animate="animate"
        className="absolute right-[15%] top-[30%] z-10 hidden lg:block"
      >
        <div className="h-16 w-16 rounded-full border border-camel/40 bg-camel/10 backdrop-blur-sm" />
      </motion.div>

      <motion.div
        variants={floatAnimation}
        initial="initial"
        animate="animate"
        className="absolute bottom-[25%] left-[20%] z-10 hidden lg:block"
      >
        <div className="h-12 w-12 rounded-full bg-sand/40 backdrop-blur-md" />
      </motion.div>

      {/* Main Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-20 mx-auto w-full max-w-5xl px-5 text-center sm:px-6"
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-5 sm:gap-6"
        >
          {/* Badge */}
          <motion.div
            variants={staggerItem}
            className="inline-flex items-center gap-2 rounded-full border border-camel/30 bg-white/70 px-4 py-1.5 backdrop-blur-md sm:py-2"
          >
            <Sparkles className="h-3.5 w-3.5 text-rose sm:h-4 sm:w-4" />
            <span className="text-xs font-medium text-camel-500 sm:text-body-sm">
              Bakeri Buatan Tangan Premium
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={staggerItem}
            className="font-display font-bold leading-[1.05] tracking-tight text-foreground"
            style={{
              fontSize: "clamp(2.25rem, 8vw, 5rem)",
            }}
          >
            {tagline.split(",").length > 1 ? (
              <>
                <span className="block">{tagline.split(",")[0]},</span>
                <span className="block">
                  <span className="relative inline-block">
                    <span className="text-gradient-luxury">
                      {tagline.split(",").slice(1).join(",").trim()}
                    </span>
                    <motion.span
                      className="absolute -bottom-2 left-0 h-1 w-full rounded-full bg-rose/60"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 1.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </span>
                </span>
              </>
            ) : (
              <span className="text-gradient-luxury">{tagline}</span>
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={staggerItem}
            className="mx-auto max-w-2xl text-body-md leading-relaxed text-muted-foreground sm:text-body-lg sm:leading-relaxed"
          >
            {description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={staggerItem}
            className="mt-2 flex w-full flex-col items-stretch gap-3 sm:mt-4 sm:w-auto sm:flex-row sm:items-center sm:gap-4"
          >
            <motion.a
              href="#products"
              className="btn-rose group !px-6 sm:!px-8"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Lihat Menu Kami</span>
              <motion.span
                className="ml-2 inline-block"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.a>

            <motion.a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-foreground/15 bg-white/60 px-6 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:border-foreground/30 hover:bg-white sm:px-8"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageCircle className="h-4 w-4 text-green-600" />
              Tempah Sekarang
            </motion.a>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={staggerItem}
            className="mt-2 flex items-center gap-2 text-body-sm text-muted-foreground sm:mt-4"
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-500">
                  ★
                </span>
              ))}
              <span className="ml-1 font-medium">5.0</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 sm:bottom-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        <motion.a
          href="#about"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Skrol ke bawah"
        >
          <span className="text-body-xs font-medium uppercase tracking-widest">
            Skrol
          </span>
          <ArrowDown className="h-4 w-4" />
        </motion.a>
      </motion.div>
    </section>
  );
}
