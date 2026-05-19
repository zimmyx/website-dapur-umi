"use client";

import { motion } from "framer-motion";
import { productCategories as fallbackCategories } from "@/lib/constants";
import type { Category } from "@/types";
import {
  staggerContainer,
  staggerItem,
  lineReveal,
} from "@/lib/animations";

interface DisplayCategory {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  color: string;
}

const fallbackColors = [
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-yellow-400 to-amber-500",
  "from-orange-400 to-red-500",
  "from-green-400 to-emerald-500",
  "from-cyan-400 to-blue-500",
];

function toDisplay(category: Category, index: number): DisplayCategory {
  return {
    id: category.id,
    name: category.name,
    nameEn: category.name_en,
    icon: category.icon ?? "📦",
    description: category.description ?? "",
    color: category.color ?? fallbackColors[index % fallbackColors.length],
  };
}

export function CategoriesSection({
  categories,
}: {
  categories?: Category[];
}) {
  const display: readonly DisplayCategory[] =
    categories && categories.length > 0
      ? categories.map(toDisplay)
      : fallbackCategories;

  return (
    <section className="section-padding relative overflow-hidden bg-white">
      {/* Decorative */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 bottom-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-sand to-transparent" />
      </div>

      <div className="container-luxury relative z-10">
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-14 text-center"
        >
          <motion.div variants={staggerItem} className="mb-4 flex items-center justify-center gap-3">
            <motion.span variants={lineReveal} className="h-px w-12 bg-camel" />
            <span className="text-body-sm font-semibold uppercase tracking-[0.2em] text-camel">
              Kategori
            </span>
            <motion.span variants={lineReveal} className="h-px w-12 bg-camel" />
          </motion.div>

          <motion.h2
            variants={staggerItem}
            className="font-display text-display-sm font-bold text-foreground sm:text-display-md"
          >
            Jelajahi Koleksi Kami
          </motion.h2>

          <motion.p
            variants={staggerItem}
            className="mx-auto mt-4 max-w-xl text-body-lg text-muted-foreground"
          >
            Dari kek mewah hingga kuih tradisional — temui kegemaran anda
            dalam koleksi kami yang pelbagai.
          </motion.p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {display.map((category) => (
            <motion.div
              key={category.id}
              variants={staggerItem}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-sand/20 bg-gradient-to-br from-white to-cream p-8 shadow-soft-sm transition-shadow hover:shadow-soft-lg"
            >
              {/* Background Gradient Accent */}
              <div
                className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${category.color} opacity-10 blur-2xl transition-opacity duration-500 group-hover:opacity-20`}
              />

              {/* Icon */}
              <div className="relative mb-4 text-4xl">{category.icon}</div>

              {/* Content */}
              <h3 className="relative font-display text-heading-md font-semibold text-foreground">
                {category.name}
              </h3>
              <p className="relative mt-1 text-body-xs text-muted-foreground/70">
                {category.nameEn}
              </p>
              <p className="relative mt-3 text-body-sm leading-relaxed text-muted-foreground">
                {category.description}
              </p>

              {/* Arrow indicator */}
              <div className="relative mt-5 flex items-center gap-2 text-body-sm font-medium text-camel opacity-0 transition-all duration-300 group-hover:opacity-100">
                <span>Lihat produk</span>
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </div>

              {/* Bottom accent line */}
              <div
                className={`absolute bottom-0 left-0 h-1 w-full scale-x-0 bg-gradient-to-r ${category.color} transition-transform duration-500 group-hover:scale-x-100`}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
