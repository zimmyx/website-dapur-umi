"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Star, Flame } from "lucide-react";
import { siteConfig } from "@/lib/constants";
import type { Product, Category } from "@/types";
import { whatsappLink, type SiteSettings } from "@/lib/site-settings";
import {
  staggerContainer,
  staggerItem,
  staggerContainerFast,
  cardHover,
  imageHover,
  lineReveal,
  revealFromBottom,
} from "@/lib/animations";
import { formatCurrency } from "@/lib/utils";

interface DisplayProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryName: string | null;
  isBestSeller: boolean;
  isNew: boolean;
}

interface DisplayCategoryPill {
  id: string;
  name: string;
  icon: string;
}

function ProductCard({
  product,
  whatsappUrl,
}: {
  product: DisplayProduct;
  whatsappUrl: string;
}) {
  const interestUrl = whatsappUrl.includes("?")
    ? `${whatsappUrl}&text=${encodeURIComponent(`Saya berminat dengan ${product.name}`)}`
    : `${whatsappUrl}?text=${encodeURIComponent(`Saya berminat dengan ${product.name}`)}`;
  const orderUrl = whatsappUrl.includes("?")
    ? `${whatsappUrl}&text=${encodeURIComponent(`Saya ingin membuat tempahan ${product.name} (${formatCurrency(product.price)})`)}`
    : `${whatsappUrl}?text=${encodeURIComponent(`Saya ingin membuat tempahan ${product.name} (${formatCurrency(product.price)})`)}`;

  return (
    <motion.div
      variants={staggerItem}
      initial="rest"
      whileHover="hover"
      className="group relative"
    >
      <motion.div
        variants={cardHover}
        className="overflow-hidden rounded-3xl border border-sand/20 bg-white shadow-soft-sm transition-all"
      >
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-cream/40">
          <motion.div variants={imageHover} className="h-full w-full">
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${product.image})` }}
            />
          </motion.div>

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {product.isBestSeller && (
              <span className="inline-flex items-center gap-1 rounded-full bg-foreground/90 px-3 py-1 text-body-xs font-semibold text-white backdrop-blur-sm">
                <Flame className="h-3 w-3" />
                Paling Laris
              </span>
            )}
            {product.isNew && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose/90 px-3 py-1 text-body-xs font-semibold text-white backdrop-blur-sm">
                <Star className="h-3 w-3" />
                Baru
              </span>
            )}
          </div>

          {/* Quick Action */}
          <motion.div
            className="absolute bottom-3 right-3"
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
          >
            <a
              href={interestUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-soft-md backdrop-blur-sm transition-transform hover:scale-110"
              aria-label="Tanya lebih lanjut"
            >
              <ShoppingBag className="h-4 w-4 text-foreground" />
            </a>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-5">
          {product.categoryName && (
            <div className="mb-1 text-body-xs font-medium uppercase tracking-wider text-camel">
              {product.categoryName}
            </div>
          )}
          <h3 className="font-display text-heading-sm font-semibold text-foreground">
            {product.name}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-body-sm text-muted-foreground">
            {product.description}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-display text-heading-md font-bold text-foreground">
              {formatCurrency(product.price)}
            </span>
            <motion.a
              href={orderUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full bg-cream px-4 py-2 text-body-xs font-semibold text-foreground transition-colors hover:bg-sand"
            >
              Tempah
            </motion.a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ProductsSection({
  products,
  categories,
  settings,
}: {
  products?: Product[];
  categories?: Category[];
  settings?: SiteSettings;
}) {
  // Hide section entirely when DB has no products
  if (!products || products.length === 0) return null;

  const whatsappUrl = settings?.contactWhatsapp
    ? whatsappLink(settings.contactWhatsapp)
    : siteConfig.links.whatsapp;

  // Prefer featured/best-seller/new products. Fall back to first 6 if none flagged.
  const flagged = products.filter(
    (p) => p.is_featured || p.is_best_seller || p.is_new
  );
  const finalProducts: DisplayProduct[] = (
    flagged.length > 0 ? flagged.slice(0, 6) : products.slice(0, 6)
  ).map((p) => {
    const cat = categories?.find((c) => c.id === p.category_id);
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image_url,
      categoryName: cat?.name ?? null,
      isBestSeller: p.is_best_seller,
      isNew: p.is_new,
    };
  });

  // Category pills (only show if we have categories)
  const pills: DisplayCategoryPill[] =
    categories?.slice(0, 5).map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon ?? "📦",
    })) ?? [];

  return (
    <section
      id="products"
      className="section-padding-lg relative overflow-hidden bg-cream"
    >
      {/* Decorative Background */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-sand to-transparent" />
        <div className="absolute -right-20 top-40 h-60 w-60 rounded-full bg-rose/5 blur-3xl" />
        <div className="absolute -left-20 bottom-40 h-60 w-60 rounded-full bg-camel/5 blur-3xl" />
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
          <motion.div
            variants={staggerItem}
            className="mb-4 flex items-center justify-center gap-3"
          >
            <motion.span variants={lineReveal} className="h-px w-12 bg-camel" />
            <span className="text-body-sm font-semibold uppercase tracking-[0.2em] text-camel">
              Menu Pilihan
            </span>
            <motion.span variants={lineReveal} className="h-px w-12 bg-camel" />
          </motion.div>

          <motion.h2
            variants={staggerItem}
            className="font-display text-display-sm font-bold text-foreground sm:text-display-md"
          >
            Ciptaan Istimewa Kami
          </motion.h2>

          <motion.p
            variants={staggerItem}
            className="mx-auto mt-4 max-w-2xl text-body-lg text-muted-foreground"
          >
            Setiap hidangan dihasilkan dengan bahan premium dan sentuhan kasih
            sayang, menjadikan setiap gigitan satu pengalaman yang tidak dapat
            dilupakan.
          </motion.p>
        </motion.div>

        {/* Category Pills */}
        {pills.length > 0 && (
          <motion.div
            variants={staggerContainerFast}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-12 flex flex-wrap items-center justify-center gap-3"
          >
            <motion.button
              variants={staggerItem}
              className="rounded-full bg-foreground px-5 py-2.5 text-body-sm font-medium text-white shadow-soft-sm"
            >
              Semua
            </motion.button>
            {pills.map((category) => (
              <motion.button
                key={category.id}
                variants={staggerItem}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-full border border-sand/50 bg-white/80 px-5 py-2.5 text-body-sm font-medium text-foreground shadow-soft-sm backdrop-blur-sm transition-all hover:border-camel hover:bg-white"
              >
                <span className="mr-1.5">{category.icon}</span>
                {category.name}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Products Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {finalProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              whatsappUrl={whatsappUrl}
            />
          ))}
        </motion.div>

        {/* View All CTA */}
        <motion.div
          variants={revealFromBottom}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="btn-luxury"
          >
            Lihat Semua Menu
            <span className="ml-2">→</span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
