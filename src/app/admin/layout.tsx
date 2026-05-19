"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Grid3X3,
  Image,
  MessageSquare,
  ShoppingBag,
  Upload,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
} from "lucide-react";
import { authService } from "@/lib/auth";
import { adminNavLinks } from "@/lib/constants";
import { Toaster } from "@/components/ui/toaster";
import { clearAdminIdCache } from "@/lib/activity";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Package,
  Grid3X3,
  Image,
  MessageSquare,
  ShoppingBag,
  Upload,
  Settings,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Skip layout for auth pages (login, forgot-password, reset-password)
  const isAuthPage =
    pathname === "/admin/login" ||
    pathname === "/admin/forgot-password" ||
    pathname === "/admin/reset-password";

  if (isAuthPage) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  const handleLogout = async () => {
    await authService.signOut();
    clearAdminIdCache();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-cream/50">
      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 hidden h-full border-r border-sand/30 bg-white/90 backdrop-blur-xl transition-all duration-300 lg:block ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sand/20 px-5">
            {!collapsed && (
              <Link href="/admin" className="font-display text-heading-md font-bold text-foreground">
                Dapur <span className="text-rose">Umi</span>
              </Link>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-cream hover:text-foreground"
              aria-label="Toggle sidebar"
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform ${collapsed ? "" : "rotate-180"}`}
              />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="flex flex-col gap-1">
              {adminNavLinks.map((link) => {
                const Icon = iconMap[link.icon];
                const isActive = pathname === link.href;

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-body-sm font-medium transition-all ${
                        isActive
                          ? "bg-rose/10 text-rose shadow-soft-sm"
                          : "text-muted-foreground hover:bg-cream hover:text-foreground"
                      } ${collapsed ? "justify-center" : ""}`}
                      title={collapsed ? link.label : undefined}
                    >
                      {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                      {!collapsed && <span>{link.label}</span>}
                      {isActive && !collapsed && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-rose" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom Actions */}
          <div className="border-t border-sand/20 p-3">
            <button
              onClick={handleLogout}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-body-sm font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>Log Keluar</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-50 h-full w-64 border-r border-sand/30 bg-white shadow-soft-2xl lg:hidden"
            >
              <div className="flex h-full flex-col">
                <div className="flex h-16 items-center justify-between border-b border-sand/20 px-5">
                  <Link href="/admin" className="font-display text-heading-md font-bold text-foreground">
                    Dapur <span className="text-rose">Umi</span>
                  </Link>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                    aria-label="Close sidebar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4">
                  <ul className="flex flex-col gap-1">
                    {adminNavLinks.map((link) => {
                      const Icon = iconMap[link.icon];
                      const isActive = pathname === link.href;

                      return (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-body-sm font-medium transition-all ${
                              isActive
                                ? "bg-rose/10 text-rose"
                                : "text-muted-foreground hover:bg-cream hover:text-foreground"
                            }`}
                          >
                            {Icon && <Icon className="h-5 w-5" />}
                            <span>{link.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="border-t border-sand/20 p-3">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-body-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Log Keluar</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          collapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-sand/20 bg-white/80 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-cream hover:text-foreground lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden items-center gap-2 text-body-sm sm:flex">
              <Link href="/admin" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              {pathname !== "/admin" && (
                <>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium text-foreground capitalize">
                    {pathname.split("/").pop()?.replace(/-/g, " ")}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-cream hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose" />
            </button>

            {/* Admin Avatar */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose to-camel text-body-xs font-bold text-white">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <Toaster />
    </div>
  );
}
