"use client";

import { motion } from "framer-motion";
import { Heart, Sparkles, BookOpen } from "lucide-react";
import { aboutContent, placeholderImages } from "@/lib/constants";
import {
  staggerContainer,
  staggerItem,
  fadeInLeft,
  fadeInRight,
  revealFromBottom,
  lineReveal,
} from "@/lib/animations";
import { useIntersectionObserver, useCountUp } from "@/hooks";

function StatCounter({ value, label }: { value: string; label: string }) {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.5,
    triggerOnce: true,
  });

  const numericValue = parseInt(value.replace(/\D/g, ""));
  const suffix = value.replace(/[0-9]/g, "");
  const count = useCountUp(numericValue, 2000, 0, isVisible);

  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-display-sm font-bold text-foreground sm:text-display-md">
        {count}
        {suffix}
      </div>
      <div className="mt-1 text-body-sm text-muted-foreground">{label}</div>
    </div>
  );
}

const iconMap = {
  Heart,
  Sparkles,
  BookOpen,
};

export function AboutSection() {
  return (
    <section id="about" className="section-padding relative overflow-hidden bg-white">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-rose/10 blur-3xl" />
        <div className="absolute -right-40 bottom-20 h-80 w-80 rounded-full bg-camel/10 blur-3xl" />
      </div>

      <div className="container-luxury relative z-10">
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16 text-center"
        >
          <motion.div variants={staggerItem} className="mb-4 flex items-center justify-center gap-3">
            <motion.span variants={lineReveal} className="h-px w-12 bg-camel" />
            <span className="text-body-sm font-semibold uppercase tracking-[0.2em] text-camel">
              Tentang Kami
            </span>
            <motion.span variants={lineReveal} className="h-px w-12 bg-camel" />
          </motion.div>

          <motion.h2
            variants={staggerItem}
            className="font-display text-display-sm font-bold text-foreground sm:text-display-md"
          >
            {aboutContent.title}
          </motion.h2>

          <motion.p
            variants={staggerItem}
            className="mx-auto mt-4 max-w-2xl text-body-lg text-muted-foreground"
          >
            {aboutContent.subtitle}
          </motion.p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Image Side */}
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${placeholderImages.about})` }}
              />
              <div className="image-overlay-soft" />
            </div>

            {/* Floating Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="absolute -bottom-6 -right-6 rounded-2xl border border-sand/30 bg-white/90 p-5 shadow-soft-lg backdrop-blur-sm sm:p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose/10">
                  <Heart className="h-6 w-6 text-rose" fill="currentColor" />
                </div>
                <div>
                  <div className="font-display text-heading-md font-bold text-foreground">8 Tahun</div>
                  <div className="text-body-sm text-muted-foreground">Pengalaman</div>
                </div>
              </div>
            </motion.div>

            {/* Decorative Element */}
            <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full border-2 border-dashed border-camel/30" />
          </motion.div>

          {/* Text Side */}
          <motion.div
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col gap-6"
          >
            {aboutContent.story.map((paragraph, index) => (
              <p key={index} className="text-body-md leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}

            {/* Values */}
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {aboutContent.values.map((value, index) => {
                const Icon = iconMap[value.icon as keyof typeof iconMap];
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="rounded-2xl border border-sand/30 bg-cream/50 p-4 text-center"
                  >
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose/10">
                      <Icon className="h-5 w-5 text-rose" />
                    </div>
                    <h4 className="text-body-sm font-semibold text-foreground">{value.title}</h4>
                    <p className="mt-1 text-body-xs text-muted-foreground">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          variants={revealFromBottom}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-20 rounded-3xl border border-sand/30 bg-gradient-to-r from-cream via-white to-cream p-8 shadow-soft-md sm:p-12"
        >
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {aboutContent.stats.map((stat) => (
              <StatCounter key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
