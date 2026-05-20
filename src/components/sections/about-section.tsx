"use client";

import { motion } from "framer-motion";
import { Heart, Sparkles, BookOpen } from "lucide-react";
import { aboutContent } from "@/lib/constants";
import {
  staggerContainer,
  staggerItem,
  fadeInUp,
  lineReveal,
} from "@/lib/animations";

const iconMap = {
  Heart,
  Sparkles,
  BookOpen,
};

export function AboutSection() {
  return (
    <section
      id="about"
      className="section-padding relative overflow-hidden bg-white"
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-rose/10 blur-3xl" />
        <div className="absolute -right-40 bottom-20 h-80 w-80 rounded-full bg-camel/10 blur-3xl" />
      </div>

      <div className="container-narrow relative z-10">
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12 text-center"
        >
          <motion.div
            variants={staggerItem}
            className="mb-4 flex items-center justify-center gap-3"
          >
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

        {/* Story */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto flex max-w-3xl flex-col gap-6 text-center"
        >
          {aboutContent.story.map((paragraph, index) => (
            <p
              key={index}
              className="text-body-md leading-relaxed text-muted-foreground sm:text-body-lg"
            >
              {paragraph}
            </p>
          ))}
        </motion.div>

        {/* Values */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-16 grid gap-4 sm:grid-cols-3"
        >
          {aboutContent.values.map((value, index) => {
            const Icon = iconMap[value.icon as keyof typeof iconMap];
            return (
              <motion.div
                key={value.title}
                variants={staggerItem}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="rounded-2xl border border-sand/30 bg-cream/50 p-6 text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose/10">
                  <Icon className="h-6 w-6 text-rose" />
                </div>
                <h4 className="font-display text-heading-sm font-semibold text-foreground">
                  {value.title}
                </h4>
                <p className="mt-2 text-body-sm text-muted-foreground">
                  {value.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
