"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Grid3X3,
  Image as ImageIcon,
  MessageSquare,
  Upload,
  ArrowUpRight,
  Activity,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { activityLogService } from "@/lib/services";
import type { ActivityLog } from "@/types";
import { toast } from "@/hooks";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/animations";

interface DashboardStats {
  products: number;
  categories: number;
  gallery: number;
  testimonials: number;
}

const statConfig = [
  {
    key: "products" as const,
    title: "Total Produk",
    icon: Package,
    color: "bg-blue-50 text-blue-600",
    href: "/admin/products",
  },
  {
    key: "categories" as const,
    title: "Kategori",
    icon: Grid3X3,
    color: "bg-purple-50 text-purple-600",
    href: "/admin/categories",
  },
  {
    key: "gallery" as const,
    title: "Galeri",
    icon: ImageIcon,
    color: "bg-green-50 text-green-600",
    href: "/admin/gallery",
  },
  {
    key: "testimonials" as const,
    title: "Testimoni",
    icon: MessageSquare,
    color: "bg-amber-50 text-amber-600",
    href: "/admin/testimonials",
  },
];

const quickActions = [
  { label: "Tambah Produk", href: "/admin/products", icon: Package },
  { label: "Muat Naik Gambar", href: "/admin/gallery", icon: Upload },
  { label: "Urus Testimoni", href: "/admin/testimonials", icon: MessageSquare },
  { label: "Tetapan Laman", href: "/admin/settings", icon: Activity },
];

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = Date.now();
  const diff = now - date.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "baru sahaja";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} minit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} hari lalu`;
  return date.toLocaleDateString("ms-MY", {
    day: "numeric",
    month: "short",
  });
}

const activityColor = (action: string) => {
  if (action.includes("create")) return "bg-green-500";
  if (action.includes("upload")) return "bg-blue-500";
  if (action.includes("approve")) return "bg-amber-500";
  if (action.includes("delete")) return "bg-red-500";
  return "bg-purple-500";
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const [productsRes, categoriesRes, galleryRes, testimonialsRes, activityRes] =
      await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("categories").select("*", { count: "exact", head: true }),
        supabase.from("gallery").select("*", { count: "exact", head: true }),
        supabase
          .from("testimonials")
          .select("*", { count: "exact", head: true }),
        activityLogService.getRecent(8),
      ]);

    const errs = [
      productsRes.error,
      categoriesRes.error,
      galleryRes.error,
      testimonialsRes.error,
    ].filter(Boolean);

    if (errs.length > 0) {
      toast.error("Gagal memuat statistik", errs[0]?.message);
    }

    setStats({
      products: productsRes.count ?? 0,
      categories: categoriesRes.count ?? 0,
      gallery: galleryRes.count ?? 0,
      testimonials: testimonialsRes.count ?? 0,
    });

    if (activityRes.success && activityRes.data) {
      setActivities(activityRes.data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <h1 className="font-display text-display-sm font-bold text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-body-md text-muted-foreground">
          Selamat datang kembali! Berikut adalah ringkasan laman web anda.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {statConfig.map((cfg) => {
          const Icon = cfg.icon;
          const value = stats?.[cfg.key];
          return (
            <motion.div key={cfg.key} variants={staggerItem}>
              <Link href={cfg.href}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="rounded-2xl border border-sand/20 bg-white p-6 shadow-soft-sm transition-shadow hover:shadow-soft-md"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${cfg.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="font-display text-display-sm font-bold text-foreground">
                      {loading ? (
                        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                      ) : (
                        (value ?? 0)
                      )}
                    </div>
                    <div className="mt-0.5 text-body-sm text-muted-foreground">
                      {cfg.title}
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="rounded-2xl border border-sand/20 bg-white p-6 shadow-soft-sm">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-heading-md font-semibold text-foreground">
                Aktiviti Terkini
              </h3>
              <span className="text-body-xs text-muted-foreground">
                {activities.length} rekod
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-8 w-8 text-muted-foreground/40" />
                <p className="mt-3 text-body-sm font-medium text-foreground">
                  Belum ada aktiviti
                </p>
                <p className="mt-1 text-body-xs text-muted-foreground">
                  Aktiviti pentadbiran akan muncul di sini
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-cream/50"
                  >
                    <div
                      className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${activityColor(
                        activity.action
                      )}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-medium text-foreground capitalize">
                        {activity.action.replace(/_/g, " ")}
                      </p>
                      <p className="truncate text-body-xs text-muted-foreground">
                        {activity.entity_type}
                        {activity.entity_id && ` · ${activity.entity_id.slice(0, 8)}`}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-body-xs text-muted-foreground">
                      {formatRelativeTime(activity.created_at)}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions + Status */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <div className="rounded-2xl border border-sand/20 bg-white p-6 shadow-soft-sm">
            <h3 className="mb-5 font-display text-heading-md font-semibold text-foreground">
              Tindakan Pantas
            </h3>

            <div className="flex flex-col gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-cream/50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream">
                        <Icon className="h-4 w-4 text-foreground" />
                      </div>
                      <span className="text-body-sm font-medium text-foreground">
                        {action.label}
                      </span>
                      <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Site Status */}
          <div className="mt-4 rounded-2xl border border-sand/20 bg-white p-6 shadow-soft-sm">
            <h3 className="mb-4 font-display text-heading-md font-semibold text-foreground">
              Status Laman
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">
                  Laman Web
                </span>
                <span className="flex items-center gap-1.5 text-body-xs font-medium text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Aktif
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">
                  Database
                </span>
                <span
                  className={`flex items-center gap-1.5 text-body-xs font-medium ${
                    loading
                      ? "text-muted-foreground"
                      : stats
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      loading
                        ? "bg-muted-foreground"
                        : stats
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                  {loading ? "Menyemak..." : stats ? "Aktif" : "Bermasalah"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">
                  Storage
                </span>
                <span className="flex items-center gap-1.5 text-body-xs font-medium text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Aktif
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
