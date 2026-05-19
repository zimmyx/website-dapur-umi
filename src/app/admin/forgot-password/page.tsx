"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { authService } from "@/lib/auth";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await authService.resetPassword(email);

    setLoading(false);

    if (!res.success) {
      setError(res.error ?? "Gagal menghantar email reset.");
      return;
    }

    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      {/* Background Decorative */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-rose/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-camel/10 blur-3xl" />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        <motion.div variants={staggerItem} className="mb-8 text-center">
          <h1 className="font-display text-display-sm font-bold text-foreground">
            Dapur <span className="text-rose">Umi</span>
          </h1>
          <p className="mt-2 text-body-sm text-muted-foreground">
            Reset Kata Laluan
          </p>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="rounded-3xl border border-sand/30 bg-white/80 p-8 shadow-soft-lg backdrop-blur-sm sm:p-10"
        >
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="font-display text-heading-lg font-semibold text-foreground">
                Email Dihantar
              </h2>
              <p className="mt-2 text-body-sm text-muted-foreground">
                Kami telah menghantar pautan reset kata laluan ke{" "}
                <span className="font-medium text-foreground">{email}</span>.
                Sila semak peti masuk anda.
              </p>
              <Link
                href="/admin/login"
                className="mt-6 inline-flex items-center gap-2 text-body-sm font-medium text-rose hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke log masuk
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="font-display text-heading-lg font-semibold text-foreground">
                  Lupa Kata Laluan?
                </h2>
                <p className="mt-1 text-body-sm text-muted-foreground">
                  Masukkan email anda dan kami akan hantar pautan untuk reset
                  kata laluan.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-body-sm text-red-700"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label
                    htmlFor="reset-email"
                    className="mb-2 block text-body-sm font-medium text-foreground"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@dapurumi.com"
                      required
                      className="w-full rounded-xl border border-sand/50 bg-cream/30 py-3 pl-11 pr-4 text-body-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="btn-rose mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menghantar...
                    </>
                  ) : (
                    "Hantar Pautan Reset"
                  )}
                </motion.button>

                <Link
                  href="/admin/login"
                  className="inline-flex items-center justify-center gap-2 text-body-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke log masuk
                </Link>
              </form>
            </>
          )}
        </motion.div>

        <motion.p
          variants={staggerItem}
          className="mt-6 text-center text-body-xs text-muted-foreground"
        >
          © {new Date().getFullYear()} Dapur Umi. Admin Panel.
        </motion.p>
      </motion.div>
    </div>
  );
}
