"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { testimonialData as fallbackTestimonials } from "@/lib/constants";
import type { Testimonial } from "@/types";
import {
  staggerContainer,
  staggerItem,
  lineReveal,
} from "@/lib/animations";

interface DisplayTestimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

export function TestimonialsSection({
  testimonials,
}: {
  testimonials?: Testimonial[];
}) {
  const display: DisplayTestimonial[] =
    testimonials && testimonials.length > 0
      ? testimonials.map((t) => ({
          id: t.id,
          name: t.name,
          role: t.role ?? "",
          avatar: t.avatar_url ?? "",
          content: t.content,
          rating: t.rating,
        }))
      : fallbackTestimonials.map((t) => ({
          id: t.id,
          name: t.name,
          role: t.role,
          avatar: t.avatar,
          content: t.content,
          rating: t.rating,
        }));

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % display.length);
  }, [display.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + display.length) % display.length);
  }, [display.length]);

  // Auto-advance
  useEffect(() => {
    if (display.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, display.length]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 200 : -200,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -200 : 200,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.4, ease: [0.7, 0, 0.84, 0] as const },
    }),
  };

  if (display.length === 0) return null;

  // Guard against current going out of range when display shrinks
  const safeIndex = Math.min(current, display.length - 1);
  const testimonial = display[safeIndex];

  return (
    <section id="testimonials" className="section-padding-lg relative overflow-hidden bg-cream">
      {/* Decorative Background */}
      <div className="absolute inset-0">
        <div className="absolute left-1/4 top-20 h-40 w-40 rounded-full bg-rose/5 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-40 w-40 rounded-full bg-camel/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Quote className="h-64 w-64 text-sand/10" />
        </div>
      </div>

      <div className="container-narrow relative z-10">
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
              Testimoni
            </span>
            <motion.span variants={lineReveal} className="h-px w-12 bg-camel" />
          </motion.div>

          <motion.h2
            variants={staggerItem}
            className="font-display text-display-sm font-bold text-foreground sm:text-display-md"
          >
            Kata Mereka
          </motion.h2>

          <motion.p
            variants={staggerItem}
            className="mx-auto mt-4 max-w-xl text-body-lg text-muted-foreground"
          >
            Kepuasan pelanggan adalah kebanggaan kami. Dengar sendiri apa kata
            mereka tentang pengalaman bersama Dapur Umi.
          </motion.p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative mx-auto max-w-3xl">
          <div className="min-h-[320px] overflow-hidden rounded-3xl border border-sand/20 bg-white/80 p-8 shadow-soft-lg backdrop-blur-sm sm:p-12">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={safeIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col items-center text-center"
              >
                {/* Quote Icon */}
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-rose/10">
                  <Quote className="h-5 w-5 text-rose" />
                </div>

                {/* Content */}
                <p className="mb-8 max-w-xl text-body-lg leading-relaxed text-foreground italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Rating */}
                <div className="mb-4 flex items-center gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-500"
                      fill="currentColor"
                    />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div
                    className="h-14 w-14 rounded-full bg-cover bg-center bg-cream/40 ring-2 ring-sand/30 ring-offset-2"
                    style={
                      testimonial.avatar
                        ? { backgroundImage: `url(${testimonial.avatar})` }
                        : undefined
                    }
                  />
                  <div className="text-left">
                    <h4 className="font-display text-heading-sm font-semibold text-foreground">
                      {testimonial.name}
                    </h4>
                    {testimonial.role && (
                      <p className="text-body-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          {display.length > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prev}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-sand/50 bg-white shadow-soft-sm transition-colors hover:bg-cream"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </motion.button>

              <div className="flex items-center gap-2">
                {display.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDirection(index > safeIndex ? 1 : -1);
                      setCurrent(index);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === safeIndex
                        ? "w-8 bg-rose"
                        : "w-2 bg-sand hover:bg-camel"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={next}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-sand/50 bg-white shadow-soft-sm transition-colors hover:bg-cream"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5 text-foreground" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
