"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useScroll } from "@/hooks";
import { navLinks } from "@/lib/constants";
import { whatsappLink, type SiteSettings } from "@/lib/site-settings";

export function Navbar({ settings }: { settings?: SiteSettings }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");
  const scrolled = useScroll({ threshold: 50 });

  const whatsapp = settings?.contactWhatsapp || "+60123456789";
  const waUrl = whatsappLink(whatsapp);
  const siteName = settings?.siteName || "Dapur Umi";

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Scroll spy for active section
  useEffect(() => {
    const sections = navLinks
      .map((l) => l.href.replace("#", ""))
      .map((id) => document.getElementById(id));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((s) => s && observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const [first, ...rest] = siteName.split(" ");
  const second = rest.join(" ");

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || mobileOpen
            ? "bg-cream/95 backdrop-blur-md shadow-soft-sm"
            : "bg-transparent"
        }`}
      >
        <nav className="container-luxury flex items-center justify-between py-3 sm:py-4">
          {/* Logo */}
          <Link
            href="#home"
            className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
            onClick={() => setMobileOpen(false)}
          >
            {first} {second && <span className="text-rose">{second}</span>}
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const id = link.href.replace("#", "");
              const isActive = activeSection === id;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="navbar-active"
                        className="absolute inset-0 rounded-full bg-white/60"
                        style={{ zIndex: -1 }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Desktop CTA */}
          <Link
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg lg:inline-flex"
          >
            <MessageCircle className="h-4 w-4" />
            Tempah
          </Link>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/60 text-foreground backdrop-blur-sm transition-colors hover:bg-white lg:hidden"
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={20} />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </nav>
      </header>

      {/* Mobile Menu — Full screen drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-cream lg:hidden"
            style={{ paddingTop: "var(--navbar-height, 68px)" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="flex h-full flex-col px-6 pb-8 pt-6"
            >
              <ul className="flex flex-1 flex-col gap-1">
                {navLinks.map((link, idx) => {
                  const id = link.href.replace("#", "");
                  const isActive = activeSection === id;
                  return (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + idx * 0.04 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between rounded-2xl px-5 py-4 text-lg font-medium transition-all ${
                          isActive
                            ? "bg-white text-foreground shadow-soft-sm"
                            : "text-foreground/80 hover:bg-white/60"
                        }`}
                      >
                        <span>{link.label}</span>
                        <span
                          className={`text-2xl transition-transform ${
                            isActive ? "translate-x-0 text-rose" : "-translate-x-2 opacity-50"
                          }`}
                        >
                          →
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 flex flex-col gap-3"
              >
                <Link
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full bg-rose px-6 py-4 text-base font-semibold text-white shadow-lg"
                >
                  <MessageCircle className="h-5 w-5" />
                  Tempah Melalui WhatsApp
                </Link>
                <p className="text-center text-body-xs text-muted-foreground">
                  Respon pantas dalam masa 30 minit
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
