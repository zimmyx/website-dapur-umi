"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  GripVertical,
  Loader2,
  Inbox,
} from "lucide-react";
import { categoryService } from "@/lib/services";
import type { Category, CategoryInsert } from "@/types";
import { toast } from "@/hooks";
import { slugify } from "@/lib/utils";
import { logActivity } from "@/lib/activity";
import { revalidatePublicSite } from "@/lib/actions";
import {
  staggerContainer,
  staggerItem,
  fadeInUp,
  modalVariants,
  overlayVariants,
} from "@/lib/animations";

interface CategoryForm {
  name: string;
  name_en: string;
  slug: string;
  description: string;
  icon: string;
  is_active: boolean;
}

const emptyForm: CategoryForm = {
  name: "",
  name_en: "",
  slug: "",
  description: "",
  icon: "",
  is_active: true,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Category | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryForm>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    const res = await categoryService.getAll({ pageSize: 100 });
    if (res.success) {
      setCategories(res.data);
    } else {
      toast.error("Gagal memuat kategori", res.error ?? undefined);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.name_en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setSlugTouched(false);
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setFormData({
      name: category.name,
      name_en: category.name_en,
      slug: category.slug,
      description: category.description ?? "",
      icon: category.icon ?? "",
      is_active: category.is_active,
    });
    setEditingId(category.id);
    setSlugTouched(true);
    setShowModal(true);
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: slugTouched || editingId ? prev.slug : slugify(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedNameEn = formData.name_en.trim();
    const finalSlug = formData.slug.trim() || slugify(trimmedName);

    if (!trimmedName || !trimmedNameEn || !finalSlug) {
      toast.error("Maklumat tidak lengkap", "Sila isi nama dan slug.");
      return;
    }

    setSubmitting(true);

    const payload: CategoryInsert = {
      name: trimmedName,
      name_en: trimmedNameEn,
      slug: finalSlug,
      description: formData.description.trim() || null,
      icon: formData.icon.trim() || null,
      image_url: null,
      color: null,
      sort_order: editingId
        ? (categories.find((c) => c.id === editingId)?.sort_order ?? 0)
        : categories.length,
      is_active: formData.is_active,
    };

    const res = editingId
      ? await categoryService.update(editingId, payload)
      : await categoryService.create(payload);

    setSubmitting(false);

    if (!res.success) {
      toast.error(
        editingId ? "Gagal kemas kini kategori" : "Gagal tambah kategori",
        res.error ?? undefined
      );
      return;
    }

    logActivity({
      action: editingId ? "update" : "create",
      entity: "category",
      entityId: res.data?.id ?? editingId,
      details: { name: trimmedName },
    });
    void revalidatePublicSite();

    toast.success(
      editingId ? "Kategori dikemas kini" : "Kategori ditambah",
      trimmedName
    );
    setShowModal(false);
    loadCategories();
  };

  const handleDelete = async (category: Category) => {
    setDeletingId(category.id);
    const res = await categoryService.delete(category.id);
    setDeletingId(null);

    if (!res.success) {
      toast.error("Gagal padam kategori", res.error ?? undefined);
      return;
    }

    logActivity({
      action: "delete",
      entity: "category",
      entityId: category.id,
      details: { name: category.name },
    });
    void revalidatePublicSite();

    toast.success("Kategori dipadam", category.name);
    setShowDeleteConfirm(null);
    setCategories((prev) => prev.filter((c) => c.id !== category.id));
  };

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
            Kategori
          </h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Urus kategori produk anda
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreateModal}
          className="btn-rose"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kategori
        </motion.button>
      </motion.div>

      {/* Search */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-sand/20 bg-white p-4 shadow-soft-sm"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-sand/50 bg-cream/30 py-2.5 pl-10 pr-4 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
          />
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center rounded-2xl border border-sand/20 bg-white py-16">
          <Loader2 className="h-6 w-6 animate-spin text-camel" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCategories.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-sand/50 bg-white/50 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream">
            <Inbox className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-display text-heading-md font-semibold text-foreground">
            {searchQuery ? "Tiada kategori dijumpai" : "Belum ada kategori"}
          </h3>
          <p className="mt-1 text-body-sm text-muted-foreground">
            {searchQuery
              ? "Cuba ubah carian anda"
              : "Tambah kategori pertama untuk bermula"}
          </p>
        </div>
      )}

      {/* Categories List */}
      {!loading && filteredCategories.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3"
        >
          {filteredCategories.map((category) => (
            <motion.div
              key={category.id}
              variants={staggerItem}
              className="group flex items-center gap-4 rounded-2xl border border-sand/20 bg-white p-4 shadow-soft-sm transition-all hover:shadow-soft-md sm:p-5"
            >
              {/* Drag Handle */}
              <div className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground">
                <GripVertical className="h-5 w-5" />
              </div>

              {/* Icon */}
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-cream text-2xl">
                {category.icon || "📦"}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-heading-sm font-semibold text-foreground">
                    {category.name}
                  </h3>
                  <span className="text-body-xs text-muted-foreground">
                    ({category.name_en})
                  </span>
                </div>
                <p className="mt-0.5 truncate text-body-xs text-muted-foreground">
                  {category.description || category.slug}
                </p>
              </div>

              {/* Product Count */}
              <div className="hidden text-center sm:block">
                <div className="text-heading-sm font-bold text-foreground">
                  {category.product_count ?? 0}
                </div>
                <div className="text-body-xs text-muted-foreground">Produk</div>
              </div>

              {/* Status */}
              <span
                className={`hidden rounded-full px-2.5 py-0.5 text-body-xs font-medium sm:inline-flex ${
                  category.is_active
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {category.is_active ? "Aktif" : "Tidak aktif"}
              </span>

              {/* Actions */}
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => openEditModal(category)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-cream hover:text-foreground"
                  aria-label="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(category)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => !submitting && setShowModal(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border border-sand/20 bg-white p-6 shadow-soft-2xl sm:p-8"
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-display text-heading-lg font-semibold text-foreground">
                    {editingId ? "Edit Kategori" : "Tambah Kategori Baru"}
                  </h2>
                  <button
                    onClick={() => !submitting && setShowModal(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-cream hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-body-sm font-medium text-foreground">
                        Nama (BM) <span className="text-rose">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="cth: Kek & Cake"
                        required
                        className="w-full rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-body-sm font-medium text-foreground">
                        Nama (EN) <span className="text-rose">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name_en}
                        onChange={(e) =>
                          setFormData({ ...formData, name_en: e.target.value })
                        }
                        placeholder="cth: Cakes"
                        required
                        className="w-full rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-body-sm font-medium text-foreground">
                        Slug <span className="text-rose">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => {
                          setSlugTouched(true);
                          setFormData({ ...formData, slug: e.target.value });
                        }}
                        placeholder="cth: kek-cake"
                        required
                        className="w-full rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm font-mono transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-body-sm font-medium text-foreground">
                        Ikon (Emoji)
                      </label>
                      <input
                        type="text"
                        value={formData.icon}
                        onChange={(e) =>
                          setFormData({ ...formData, icon: e.target.value })
                        }
                        placeholder="🎂"
                        className="w-full rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-foreground">
                      Penerangan
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Penerangan ringkas kategori..."
                      className="w-full resize-none rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                    />
                  </div>

                  <label className="flex items-center gap-2 rounded-xl border border-sand/30 p-3 cursor-pointer hover:bg-cream/30">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-sand text-rose focus:ring-rose"
                    />
                    <span className="text-body-sm font-medium text-foreground">
                      Aktif
                    </span>
                  </label>

                  <div className="mt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      disabled={submitting}
                      className="btn-outline flex-1 disabled:opacity-60"
                    >
                      Batal
                    </button>
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: submitting ? 1 : 1.02 }}
                      whileTap={{ scale: submitting ? 1 : 0.98 }}
                      className="btn-rose flex-1 disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : editingId ? (
                        "Kemas Kini"
                      ) : (
                        "Simpan"
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => !deletingId && setShowDeleteConfirm(null)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full max-w-sm rounded-2xl border border-sand/20 bg-white p-6 shadow-soft-2xl"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="font-display text-heading-md font-semibold text-foreground">
                  Padam {showDeleteConfirm.name}?
                </h3>
                <p className="mt-2 text-body-sm text-muted-foreground">
                  Tindakan ini tidak boleh dibatalkan. Produk dalam kategori ini
                  akan kehilangan kategorinya.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    disabled={!!deletingId}
                    className="btn-outline flex-1 disabled:opacity-60"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteConfirm)}
                    disabled={!!deletingId}
                    className="flex-1 inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:opacity-60"
                  >
                    {deletingId ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memadam...
                      </>
                    ) : (
                      "Padam"
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
