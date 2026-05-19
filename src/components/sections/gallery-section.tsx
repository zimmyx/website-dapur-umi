"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";
import { placeholderImages } from "@/lib/constants";
import type { GalleryItem } from "@/types";
import {
  staggerContainer,
  staggerItem,
  staggerItemScale,
  lineReveal,
  scaleIn,
  overlayVariants,
} from "@/lib/animations";

interface DisplayItem {
  id: string;
  image: string;
  title: string;
  category: string;
}

const fallbackItems: DisplayItem[] = [
  { id: "1", image: placeholderImages.gallery[0], title: "Red Velvet Masterpiece", category: "Kek" },
  { id: "2", image: placeholderImages.gallery[1], title: "Artisan Croissants", category: "Pastri" },
  { id: "3", image: placeholderImages.gallery[2], title: "Baking Process", category: "Behind the Scenes" },
  { id: "4", image: placeholderImages.gallery[3], title: "Fresh Ingredients", category: "Bahan" },
  { id: "5", image: placeholderImages.gallery[4], title: "Wedding Cake", category: "Kek" },
  { id: "6", image: placeholderImages.gallery[5], title: "Chocolate Collection", category: "Pastri" },
  { id: "7", image: placeholderImages.gallery[6], title: "Birthday Special", category: "Kek" },
  { id: "8", image: placeholderImages.gallery[7], title: "Cookie Artistry", category: "Cookies" },
];

function GalleryLightbox({
  image,
  title,
  onClose,
}: {
  image: string;
  title: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="relative max-h-[85vh] max-w-4xl overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="aspect-[4/3] w-full min-w-[300px] bg-cover bg-center sm:min-w-[600px]"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <h3 className="font-display text-heading-lg font-semibold text-white">{title}</h3>
        </div>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
          aria-label="Close lightbox"
        >
          <X className="h-5 w-5" />
        </button>
      </motion.div>
    </motion.div>
  );
}

export function GallerySection({ items }: { items?: GalleryItem[] }) {
  const [selectedImage, setSelectedImage] = useState<{
    image: string;
    title: string;
  } | null>(null);

  const display: DisplayItem[] =
    items && items.length > 0
      ? items.slice(0, 8).map((item) => ({
          id: item.id,
          image: item.image_url,
          title: item.title,
          category: item.category ?? "",
        }))
      : fallbackItems;

  return (
    <>
      <section id="gallery" className="section-padding-lg relative overflow-hidden bg-white">
        {/* Decorative */}
        <div className="absolute inset-0">
          <div className="absolute left-0 top-1/2 h-px w-full bg-gradient-to-r from-transparent via-sand/30 to-transparent" />
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
                Galeri
              </span>
              <motion.span variants={lineReveal} className="h-px w-12 bg-camel" />
            </motion.div>

            <motion.h2
              variants={staggerItem}
              className="font-display text-display-sm font-bold text-foreground sm:text-display-md"
            >
              Karya Seni Kami
            </motion.h2>

            <motion.p
              variants={staggerItem}
              className="mx-auto mt-4 max-w-2xl text-body-lg text-muted-foreground"
            >
              Setiap ciptaan adalah kanvas — dihias dengan teliti, dipersembahkan
              dengan bangga. Lihatlah keindahan yang lahir dari dapur kami.
            </motion.p>
          </motion.div>

          {/* Masonry Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4"
          >
            {display.map((item, index) => {
              const heights = [
                "aspect-[3/4]",
                "aspect-square",
                "aspect-[4/5]",
                "aspect-[3/4]",
                "aspect-square",
                "aspect-[4/5]",
                "aspect-[3/4]",
                "aspect-square",
              ];

              return (
                <motion.div
                  key={item.id}
                  variants={staggerItemScale}
                  className="mb-4 break-inside-avoid"
                >
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl"
                    onClick={() =>
                      setSelectedImage({ image: item.image, title: item.title })
                    }
                  >
                    <div
                      className={`${heights[index % heights.length]} w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110`}
                      style={{ backgroundImage: `url(${item.image})` }}
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/40">
                      <div className="translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        {item.category && (
                          <span className="mb-1 block text-body-xs font-medium uppercase tracking-wider text-white/80">
                            {item.category}
                          </span>
                        )}
                        <h4 className="text-center font-display text-heading-sm font-semibold text-white">
                          {item.title}
                        </h4>
                      </div>
                    </div>

                    {/* Corner Accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 scale-x-0 bg-gradient-to-r from-rose via-camel to-rose transition-transform duration-300 group-hover:scale-x-100" />
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <GalleryLightbox
          image={selectedImage.image}
          title={selectedImage.title}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}
