"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from "lucide-react";
import { contactInfo } from "@/lib/constants";
import type { SiteSettings } from "@/lib/site-settings";
import { whatsappLink } from "@/lib/site-settings";
import {
  staggerContainer,
  staggerItem,
  fadeInLeft,
  fadeInRight,
  lineReveal,
} from "@/lib/animations";

export function ContactSection({ settings }: { settings?: SiteSettings }) {
  const phone = settings?.contactPhone || contactInfo.phone;
  const email = settings?.contactEmail || contactInfo.email;
  const address = settings?.contactAddress || contactInfo.address;
  const whatsapp = settings?.contactWhatsapp || "+60123456789";

  return (
    <section id="contact" className="section-padding-lg relative overflow-hidden bg-cream">
      {/* Decorative */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-sand to-transparent" />
        <div className="absolute -left-20 bottom-20 h-60 w-60 rounded-full bg-rose/5 blur-3xl" />
        <div className="absolute -right-20 top-20 h-60 w-60 rounded-full bg-camel/5 blur-3xl" />
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
              Hubungi Kami
            </span>
            <motion.span variants={lineReveal} className="h-px w-12 bg-camel" />
          </motion.div>

          <motion.h2
            variants={staggerItem}
            className="font-display text-display-sm font-bold text-foreground sm:text-display-md"
          >
            Jom Berbual
          </motion.h2>

          <motion.p
            variants={staggerItem}
            className="mx-auto mt-4 max-w-xl text-body-lg text-muted-foreground"
          >
            Kami sentiasa gembira mendengar daripada anda. Hubungi kami untuk
            tempahan, pertanyaan, atau sekadar untuk bertanya khabar.
          </motion.p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Info */}
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col gap-8"
          >
            {/* Contact Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <motion.a
                href={`tel:${phone.replace(/\s/g, "")}`}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-sand/30 bg-white/80 p-6 shadow-soft-sm backdrop-blur-sm"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose/10">
                  <Phone className="h-5 w-5 text-rose" />
                </div>
                <h4 className="font-display text-heading-sm font-semibold text-foreground">
                  Telefon
                </h4>
                <p className="mt-1 text-body-sm text-muted-foreground">{phone}</p>
              </motion.a>

              <motion.a
                href={`mailto:${email}`}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-sand/30 bg-white/80 p-6 shadow-soft-sm backdrop-blur-sm"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose/10">
                  <Mail className="h-5 w-5 text-rose" />
                </div>
                <h4 className="font-display text-heading-sm font-semibold text-foreground">
                  Email
                </h4>
                <p className="mt-1 break-all text-body-sm text-muted-foreground">
                  {email}
                </p>
              </motion.a>

              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-sand/30 bg-white/80 p-6 shadow-soft-sm backdrop-blur-sm"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose/10">
                  <MapPin className="h-5 w-5 text-rose" />
                </div>
                <h4 className="font-display text-heading-sm font-semibold text-foreground">
                  Alamat
                </h4>
                <p className="mt-1 whitespace-pre-line text-body-sm text-muted-foreground">
                  {address}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-sand/30 bg-white/80 p-6 shadow-soft-sm backdrop-blur-sm"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose/10">
                  <Clock className="h-5 w-5 text-rose" />
                </div>
                <h4 className="font-display text-heading-sm font-semibold text-foreground">
                  Waktu Operasi
                </h4>
                <div className="mt-1 space-y-0.5">
                  {contactInfo.hours.map((h) => (
                    <p key={h.day} className="text-body-sm text-muted-foreground">
                      <span className="font-medium">{h.day}:</span> {h.time}
                    </p>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* WhatsApp CTA */}
            <motion.a
              href={whatsappLink(whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 rounded-2xl border border-green-200 bg-green-50 p-6 shadow-soft-sm transition-all hover:shadow-soft-md"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-display text-heading-sm font-semibold text-foreground">
                  WhatsApp Kami
                </h4>
                <p className="text-body-sm text-muted-foreground">
                  Respon pantas dalam masa 30 minit
                </p>
              </div>
              <Send className="ml-auto h-5 w-5 text-green-600" />
            </motion.a>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="rounded-3xl border border-sand/30 bg-white/80 p-8 shadow-soft-md backdrop-blur-sm sm:p-10">
              <h3 className="mb-6 font-display text-heading-lg font-semibold text-foreground">
                Hantar Mesej
              </h3>

              <form
                className="flex flex-col gap-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const name = (form.elements.namedItem("name") as HTMLInputElement)?.value || "";
                  const phoneNum = (form.elements.namedItem("phone") as HTMLInputElement)?.value || "";
                  const subject = (form.elements.namedItem("subject") as HTMLSelectElement)?.value || "";
                  const message = (form.elements.namedItem("message") as HTMLTextAreaElement)?.value || "";
                  const text = `Halo Dapur Umi! Saya ${name}.\n\nSubjek: ${subject}\nNo. Tel: ${phoneNum}\n\n${message}`;
                  window.open(whatsappLink(whatsapp, text), "_blank");
                }}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-2 block text-body-sm font-medium text-foreground"
                    >
                      Nama
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      placeholder="Nama penuh anda"
                      required
                      className="w-full rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="mb-2 block text-body-sm font-medium text-foreground"
                    >
                      No. Telefon
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      placeholder="+60 12-345 6789"
                      className="w-full rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="mb-2 block text-body-sm font-medium text-foreground"
                  >
                    Subjek
                  </label>
                  <select
                    id="contact-subject"
                    name="subject"
                    className="w-full rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm text-foreground transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                  >
                    <option value="Tempahan Baru">Tempahan Baru</option>
                    <option value="Kek Custom">Kek Custom</option>
                    <option value="Catering">Catering</option>
                    <option value="Maklum Balas">Maklum Balas</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="mb-2 block text-body-sm font-medium text-foreground"
                  >
                    Mesej
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    placeholder="Tulis mesej anda di sini..."
                    required
                    className="w-full resize-none rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-rose mt-2 w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Hantar via WhatsApp
                </motion.button>
                <p className="text-center text-body-xs text-muted-foreground">
                  Mesej akan dibuka dalam WhatsApp untuk anda hantar
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
