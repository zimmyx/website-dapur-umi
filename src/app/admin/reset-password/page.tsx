"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { authService } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { staggerContainer, staggerItem } from "@/lib/animations";

function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validatingSession, setValidatingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  // Verify the user has a recovery session (Supabase opens one when the
  // recovery link is clicked).
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      setHasSession(!!data.session);
      setValidatingSession(false);
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Kata laluan mesti sekurang-kurangnya 8 aksara.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Kata laluan tidak sepadan.");
      return;
    }

    setLoading(true);
    const res = await authService.updatePassword(password);
    setLoading(false);

    if (!res.success) {
      setError(res.error ?? "Gagal kemas kini kata laluan.");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/admin/login");
    }, 2000);
  };

  if (validatingSession) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-camel" />
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="text-center">
        <h2 className="font-display text-heading-lg font-semibold text-foreground">
          Pautan Tidak Sah
        </h2>
        <p className="mt-2 text-body-sm text-muted-foreground">
          Pautan reset telah luput atau tidak sah. Sila minta pautan baru.
        </p>
        <Link
          href="/admin/forgot-password"
          className="mt-6 inline-flex items-center gap-2 text-body-sm font-medium text-rose hover:underline"
        >
          Minta pautan baru
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
          <Lock className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="font-display text-heading-lg font-semibold text-foreground">
          Berjaya!
        </h2>
        <p className="mt-2 text-body-sm text-muted-foreground">
          Kata laluan anda telah dikemas kini. Mengalihkan ke log masuk...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="font-display text-heading-lg font-semibold text-foreground">
          Tetapkan Kata Laluan Baru
        </h2>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Masukkan kata laluan baru untuk akaun anda.
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
          <label className="mb-2 block text-body-sm font-medium text-foreground">
            Kata Laluan Baru
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full rounded-xl border border-sand/50 bg-cream/30 py-3 pl-11 pr-12 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

        <div>
          <label className="mb-2 block text-body-sm font-medium text-foreground">
            Sahkan Kata Laluan
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full rounded-xl border border-sand/50 bg-cream/30 py-3 pl-11 pr-4 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
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
              Mengemaskini...
            </>
          ) : (
            "Kemas Kini Kata Laluan"
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
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
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
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-camel" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </motion.div>
      </motion.div>
    </div>
  );
}
