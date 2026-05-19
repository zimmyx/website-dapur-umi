"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/lib/auth";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authService.signIn(email, password);

      if (!result.success) {
        setError(result.error || "Login gagal. Sila semak email dan kata laluan.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Ralat berlaku. Sila cuba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      {/* Background Decorative */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-rose/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-camel/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-[600px] w-[600px] rounded-full border border-sand/10" />
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <motion.div variants={staggerItem} className="mb-8 text-center">
          <h1 className="font-display text-display-sm font-bold text-foreground">
            Dapur <span className="text-rose">Umi</span>
          </h1>
          <p className="mt-2 text-body-sm text-muted-foreground">
            Admin Dashboard
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          variants={staggerItem}
          className="rounded-3xl border border-sand/30 bg-white/80 p-8 shadow-soft-lg backdrop-blur-sm sm:p-10"
        >
          <div className="mb-6">
            <h2 className="font-display text-heading-lg font-semibold text-foreground">
              Selamat Kembali
            </h2>
            <p className="mt-1 text-body-sm text-muted-foreground">
              Log masuk untuk mengurus laman web anda
            </p>
          </div>

          {/* Error Message */}
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
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-body-sm font-medium text-foreground"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dapurumi.com"
                  required
                  className="w-full rounded-xl border border-sand/50 bg-cream/30 py-3 pl-11 pr-4 text-body-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-body-sm font-medium text-foreground"
                >
                  Kata Laluan
                </label>
                <Link
                  href="/admin/forgot-password"
                  className="text-body-xs font-medium text-rose hover:underline"
                >
                  Lupa kata laluan?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-sand/50 bg-cream/30 py-3 pl-11 pr-12 text-body-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
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
                  Sedang log masuk...
                </>
              ) : (
                "Log Masuk"
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer */}
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
