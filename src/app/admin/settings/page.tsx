"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Globe,
  Phone,
  Mail,
  MapPin,
  Loader2,
} from "lucide-react";
import { settingsService } from "@/lib/services";
import type { Setting } from "@/types";
import { toast } from "@/hooks";
import { logActivity } from "@/lib/activity";
import { revalidatePublicSite } from "@/lib/actions";
import { fadeInUp } from "@/lib/animations";

// ─── Settings Schema ──────────────────────────────────────────────────────────
// Mirrors the seed in supabase/schema.sql and may be extended.

interface SettingDef {
  key: string;
  label: string;
  description?: string;
  group: "general" | "contact" | "social" | "business";
  type: "string" | "number" | "boolean" | "json";
  inputType?: "text" | "textarea" | "email" | "tel" | "url" | "number";
  placeholder?: string;
}

const SETTINGS_SCHEMA: SettingDef[] = [
  // General
  { key: "site_name", label: "Nama Laman", group: "general", type: "string", inputType: "text" },
  { key: "site_tagline", label: "Tagline", group: "general", type: "string", inputType: "text" },
  { key: "site_description", label: "Penerangan Laman", group: "general", type: "string", inputType: "textarea" },
  // Contact
  { key: "contact_email", label: "Email", group: "contact", type: "string", inputType: "email" },
  { key: "contact_phone", label: "Telefon", group: "contact", type: "string", inputType: "tel" },
  { key: "contact_whatsapp", label: "WhatsApp", group: "contact", type: "string", inputType: "tel", description: "Format: +60123456789 (tanpa ruang atau tanda hubung)" },
  { key: "contact_address", label: "Alamat", group: "contact", type: "string", inputType: "textarea" },
  // Social
  { key: "social_instagram", label: "Instagram", group: "social", type: "string", inputType: "url" },
  { key: "social_facebook", label: "Facebook", group: "social", type: "string", inputType: "url" },
  { key: "social_tiktok", label: "TikTok", group: "social", type: "string", inputType: "url" },
  // Business
  { key: "delivery_fee", label: "Yuran Penghantaran (RM)", group: "business", type: "number", inputType: "number" },
  { key: "free_delivery_min", label: "Penghantaran Percuma (Min RM)", group: "business", type: "number", inputType: "number" },
  { key: "min_order_days", label: "Hari Minimum Tempahan", group: "business", type: "number", inputType: "number" },
];

const tabs = [
  { id: "general", label: "Umum", icon: Globe },
  { id: "contact", label: "Hubungi", icon: Phone },
  { id: "social", label: "Media Sosial", icon: Mail },
  { id: "business", label: "Perniagaan", icon: MapPin },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [initialValues, setInitialValues] = useState<Record<string, string>>({});

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const res = await settingsService.getAll({ pageSize: 200 });
    if (!res.success) {
      toast.error("Gagal memuat tetapan", res.error ?? undefined);
      setLoading(false);
      return;
    }

    const map: Record<string, string> = {};
    for (const def of SETTINGS_SCHEMA) {
      map[def.key] = "";
    }
    for (const setting of res.data as Setting[]) {
      map[setting.key] = setting.value;
    }
    setValues(map);
    setInitialValues(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const isDirty = SETTINGS_SCHEMA.some(
    (def) => values[def.key] !== initialValues[def.key]
  );

  const handleSave = async () => {
    setSaving(true);

    const changed = SETTINGS_SCHEMA.filter(
      (def) => values[def.key] !== initialValues[def.key]
    );

    if (changed.length === 0) {
      setSaving(false);
      return;
    }

    let errors = 0;
    for (const def of changed) {
      const res = await settingsService.upsert({
        key: def.key,
        value: values[def.key] ?? "",
        type: def.type,
        group: def.group,
        label: def.label,
        description: def.description ?? null,
      });
      if (!res.success) {
        errors++;
      }
    }

    setSaving(false);

    if (errors > 0) {
      toast.error(`${errors} tetapan gagal disimpan`);
    } else {
      logActivity({
        action: "update",
        entity: "setting",
        details: {
          count: changed.length,
          keys: changed.map((c) => c.key),
        },
      });
      void revalidatePublicSite();
      toast.success("Tetapan disimpan", `${changed.length} medan dikemas kini`);
      setInitialValues({ ...values });
    }
  };

  const fieldsForTab = SETTINGS_SCHEMA.filter((def) => def.group === activeTab);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="font-display text-display-sm font-bold text-foreground">
            Tetapan
          </h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Urus tetapan laman web anda
          </p>
        </div>
        <motion.button
          whileHover={{ scale: saving || !isDirty ? 1 : 1.02 }}
          whileTap={{ scale: saving || !isDirty ? 1 : 0.98 }}
          onClick={handleSave}
          disabled={saving || !isDirty || loading}
          className="btn-rose disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Simpan Perubahan
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className="flex gap-1 overflow-x-auto rounded-2xl border border-sand/20 bg-white p-1.5 shadow-soft-sm"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-body-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-cream text-foreground shadow-soft-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center rounded-2xl border border-sand/20 bg-white py-16">
          <Loader2 className="h-6 w-6 animate-spin text-camel" />
        </div>
      )}

      {/* Form */}
      {!loading && (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-sand/20 bg-white p-6 shadow-soft-sm sm:p-8"
        >
          <div className="mb-6">
            <h3 className="font-display text-heading-md font-semibold text-foreground capitalize">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h3>
            <p className="mt-1 text-body-sm text-muted-foreground">
              Semua perubahan disimpan ke pangkalan data Supabase
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {fieldsForTab.map((def) => {
              const fullWidth = def.inputType === "textarea";
              const value = values[def.key] ?? "";
              return (
                <div
                  key={def.key}
                  className={fullWidth ? "sm:col-span-2" : undefined}
                >
                  <label className="mb-2 block text-body-sm font-medium text-foreground">
                    {def.label}
                  </label>
                  {def.inputType === "textarea" ? (
                    <textarea
                      rows={3}
                      value={value}
                      onChange={(e) => handleChange(def.key, e.target.value)}
                      placeholder={def.placeholder}
                      className="w-full resize-none rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                    />
                  ) : (
                    <input
                      type={def.inputType ?? "text"}
                      value={value}
                      onChange={(e) => handleChange(def.key, e.target.value)}
                      placeholder={def.placeholder}
                      className="w-full rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                    />
                  )}
                  {def.description && (
                    <p className="mt-1 text-body-xs text-muted-foreground">
                      {def.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {fieldsForTab.length === 0 && (
            <p className="text-body-sm text-muted-foreground">
              Tiada tetapan dalam kategori ini.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
