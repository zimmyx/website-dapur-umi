"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDown, Sparkles } from "lucide-react";
import { placeholderImages, siteConfig } from "@/lib/constants";
import {
  staggerContainer,
  staggerItem,
  floatAnimation,
  floatAnimationSlow,
} from "@/lib/animations";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <motion.div className="absolute inset-0 z-0" style={{ scale }}>
        <div
          className="h-full w-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${placeholderImages.hero[0]})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cream/80 via-cream/60 to-cream" />
        <div className="absolute inset-0 bg-gradient-to-r from-cream/40 via-transparent to-cream/40" />
      </motion.div>

      {/* Floating Decorative Elements */}
      <motion.div
        variants={floatAnimation}
        initial="initial"
        animate="animate"
        className="absolute left-[10%] top-[20%] z-10 hidden lg:block"
      >
        <div className="h-20 w-20 rounded-full bg-rose/20 blur-xl" />
      </motion.div>

      <motion.div
        variants={floatAnimationSlow}
        initial="initial"
        animate="animate"
        className="absolute right-[15%] top-[30%] z-10 hidden lg:block"
      >
        <div className="h-16 w-16 rounded-full bg-camel/30 blur-lg" />
      </motion.div>

      <motion.div
        variants={floatAnimation}
        initial="initial"
        animate="animate"
        className="absolute bottom-[25%] left-[20%] z-10 hidden lg:block"
      >
        <div className="h-12 w-12 rounded-full bg-sand/40 blur-md" />
      </motion.div>

      <motion.div
        variants={floatAnimationSlow}
        initial="initial"
        animate="animate"
        className="absolute bottom-[30%] right-[10%] z-10 hidden lg:block"
      >
        <div className="h-24 w-24 rounded-full bg-rose/10 blur-2xl" />
      </motion.div>

      {/* Main Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-20 mx-auto max-w-5xl px-4 text-center sm:px-6"
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-6"
        >
          {/* Badge */}
          <motion.div
            variants={staggerItem}
            className="inline-flex items-center gap-2 rounded-full border border-camel/30 bg-white/60 px-4 py-2 backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-rose" />
            <span className="text-body-sm font-medium text-camel-500">
              Premium Handcrafted Bakery
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={staggerItem}
            className="font-display text-display-md font-bold tracking-tight text-foreground sm:text-display-lg lg:text-display-xl"
          >
            <span className="block">Dari Dapur,</span>
            <span className="block">
              Sampai Ke{" "}
              <span className="relative inline-block">
                <span className="text-gradient-luxury">Hati</span>
                <motion.span
                  className="absolute -bottom-2 left-0 h-1 w-full rounded-full bg-rose/60"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={staggerItem}
            className="max-w-2xl text-body-lg text-muted-foreground sm:text-xl"
          >
            Setiap ciptaan kami adalah ungkapan kasih sayang — dipanggang dengan
            bahan premium, dihias dengan seni, dan dihantar dengan penuh cinta
            untuk momen istimewa anda.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={staggerItem}
            className="mt-4 flex flex-col items-center gap-4 sm:flex-row"
          >
            <motion.a
              href="#products"
              className="btn-rose group"
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
              href={siteConfig.links.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Tempah Sekarang
            </motion.a>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={staggerItem}
            className="mt-8 flex items-center gap-2 text-body-sm text-muted-foreground"
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
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-body-xs font-medium uppercase tracking-widest text-muted-foreground">
            Scroll
          </span>
          <ArrowDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </motion.div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 z-10 h-32 bg-gradient-to-t from-cream to-transparent" />
    </section>
  );
}
