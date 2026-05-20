"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { whatsappLink, type SiteSettings } from "@/lib/site-settings";

/**
 * Floating WhatsApp action button for mobile users.
 * Appears after scrolling 300px to avoid hero overlap.
 */
export function FloatingWhatsApp({ settings }: { settings?: SiteSettings }) {
  const [visible, setVisible] = useState(false);
  const phone = settings?.contactWhatsapp || "+60123456789";
  const url = whatsappLink(phone);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-soft-2xl ring-4 ring-green-500/20 transition-shadow hover:shadow-soft-2xl sm:bottom-8 sm:right-8 sm:h-16 sm:w-16"
          aria-label="Hubungi kami melalui WhatsApp"
        >
          {/* Pulse ring */}
          <span className="absolute inset-0 animate-ping rounded-full bg-green-500 opacity-30" />
          <MessageCircle className="relative h-6 w-6 sm:h-7 sm:w-7" />
        </motion.a>
      )}
    </AnimatePresence>
  );
}
