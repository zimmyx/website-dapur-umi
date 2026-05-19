"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus } from "lucide-react";
import { faqData } from "@/lib/constants";
import {
  staggerContainer,
  staggerItem,
  lineReveal,
} from "@/lib/animations";

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      variants={staggerItem}
      className="group overflow-hidden rounded-2xl border border-sand/30 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-camel/30 hover:shadow-soft-sm"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-6 text-left transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-display text-heading-sm font-semibold text-foreground pr-4">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-cream transition-colors group-hover:bg-sand/50"
        >
          <Plus className="h-4 w-4 text-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.25, delay: 0.1 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.25, ease: [0.7, 0, 0.84, 0] },
                opacity: { duration: 0.15 },
              },
            }}
            className="overflow-hidden"
          >
            <div className="border-t border-sand/20 px-6 pb-6 pt-4">
              <p className="text-body-md leading-relaxed text-muted-foreground">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section-padding-lg relative overflow-hidden bg-white">
      {/* Decorative */}
      <div className="absolute inset-0">
        <div className="absolute -left-20 top-1/3 h-60 w-60 rounded-full bg-rose/5 blur-3xl" />
        <div className="absolute -right-20 bottom-1/3 h-60 w-60 rounded-full bg-camel/5 blur-3xl" />
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
              Soalan Lazim
            </span>
            <motion.span variants={lineReveal} className="h-px w-12 bg-camel" />
          </motion.div>

          <motion.h2
            variants={staggerItem}
            className="font-display text-display-sm font-bold text-foreground sm:text-display-md"
          >
            Ada Soalan?
          </motion.h2>

          <motion.p
            variants={staggerItem}
            className="mx-auto mt-4 max-w-xl text-body-lg text-muted-foreground"
          >
            Kami sedia membantu. Berikut adalah jawapan kepada soalan yang sering
            ditanya oleh pelanggan kami.
          </motion.p>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-col gap-3"
        >
          {faqData.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </motion.div>

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-body-md text-muted-foreground">
            Masih ada soalan?{" "}
            <a
              href="https://wa.me/60123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-rose transition-colors hover:text-rose-400"
            >
              Hubungi kami di WhatsApp
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
