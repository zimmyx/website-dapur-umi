"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Star,
  Flame,
  Loader2,
  Inbox,
  Image as ImageIcon,
} from "lucide-react";
import { productService, categoryService } from "@/lib/services";
import type { Product, ProductInsert, Category } from "@/types";
import { toast } from "@/hooks";
import { formatCurrency, slugify } from "@/lib/utils";
import { logActivity } from "@/lib/activity";
import { revalidatePublicSite } from "@/lib/actions";
import { ImageUpload } from "@/components/ui/image-upload";
import { BUCKETS } from "@/lib/constants";
import {
  staggerContainer,
  staggerItem,
  fadeInUp,
  modalVariants,
  overlayVariants,
} from "@/lib/animations";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category_id: string;
  image_url: string;
  is_best_seller: boolean;
  is_new: boolean;
  is_available: boolean;
  is_featured: boolean;
}

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  image_url: "",
  is_best_seller: false,
  is_new: false,
  is_available: true,
  is_featured: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductForm>(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Product | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [productsRes, categoriesRes] = await Promise.all([
      productService.getAll({ pageSize: 100 }),
      categoryService.getAll({ pageSize: 100 }),
    ]);

    if (productsRes.success) {
      setProducts(productsRes.data);
    } else {
      toast.error("Gagal memuatkan produk", productsRes.error ?? undefined);
    }

    if (categoriesRes.success) {
      setCategories(categoriesRes.data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const categoryById = (id: string | null) =>
    id ? categories.find((c) => c.id === id) : undefined;

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openCreateModal = () => {
    setFormData({
      ...emptyForm,
      category_id: categories[0]?.id ?? "",
    });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category_id: product.category_id ?? "",
      image_url: product.image_url,
      is_best_seller: product.is_best_seller,
      is_new: product.is_new,
      is_available: product.is_available,
      is_featured: product.is_featured,
    });
    setEditingId(product.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedDesc = formData.description.trim();
    const priceNum = parseFloat(formData.price);

    if (!trimmedName || !trimmedDesc) {
      toast.error("Maklumat tidak lengkap", "Sila isi nama dan penerangan.");
      return;
    }
    if (Number.isNaN(priceNum) || priceNum < 0) {
      toast.error("Harga tidak sah", "Sila masukkan harga yang sah.");
      return;
    }
    if (!formData.category_id) {
      toast.error("Kategori diperlukan", "Sila pilih kategori produk.");
      return;
    }
    if (!formData.image_url.trim()) {
      toast.error("Gambar diperlukan", "Sila masukkan URL gambar produk.");
      return;
    }

    setSubmitting(true);

    const existing = editingId ? products.find((p) => p.id === editingId) : null;

    const payload: ProductInsert = {
      name: trimmedName,
      slug: existing?.slug ?? (slugify(trimmedName) || `produk-${Date.now()}`),
      description: trimmedDesc,
      long_description: existing?.long_description ?? null,
      price: priceNum,
      discounted_price: existing?.discounted_price ?? null,
      category_id: formData.category_id,
      image_url: formData.image_url.trim(),
      images: existing?.images ?? [],
      tags: existing?.tags ?? [],
      is_best_seller: formData.is_best_seller,
      is_new: formData.is_new,
      is_available: formData.is_available,
      is_featured: formData.is_featured,
      sort_order: existing?.sort_order ?? products.length,
      preparation_time: existing?.preparation_time ?? null,
      ingredients: existing?.ingredients ?? [],
      allergens: existing?.allergens ?? [],
      rating: existing?.rating ?? 0,
      review_count: existing?.review_count ?? 0,
    };

    const res = editingId
      ? await productService.update(editingId, payload)
      : await productService.create(payload);

    setSubmitting(false);

    if (!res.success) {
      toast.error(
        editingId ? "Gagal kemas kini produk" : "Gagal tambah produk",
        res.error ?? undefined
      );
      return;
    }

    logActivity({
      action: editingId ? "update" : "create",
      entity: "product",
      entityId: res.data?.id ?? editingId,
      details: { name: trimmedName },
    });
    void revalidatePublicSite();

    toast.success(
      editingId ? "Produk dikemas kini" : "Produk ditambah",
      trimmedName
    );
    setShowModal(false);
    loadData();
  };

  const handleDelete = async (product: Product) => {
    setDeletingId(product.id);
    const res = await productService.delete(product.id);
    setDeletingId(null);

    if (!res.success) {
      toast.error("Gagal padam produk", res.error ?? undefined);
      return;
    }

    logActivity({
      action: "delete",
      entity: "product",
      entityId: product.id,
      details: { name: product.name },
    });
    void revalidatePublicSite();

    toast.success("Produk dipadam", product.name);
    setShowDeleteConfirm(null);
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
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
            Produk
          </h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Urus semua produk bakeri kami
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreateModal}
          disabled={categories.length === 0}
          className="btn-rose disabled:opacity-60"
          title={
            categories.length === 0
              ? "Tambah kategori dahulu sebelum menambah produk"
              : undefined
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </motion.button>
      </motion.div>

      {/* Filters Bar */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-3 rounded-2xl border border-sand/20 bg-white p-4 shadow-soft-sm sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-sand/50 bg-cream/30 py-2.5 pl-10 pr-4 text-body-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-xl border border-sand/50 bg-cream/30 px-4 py-2.5 text-body-sm text-foreground transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
        >
          <option value="all">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center rounded-2xl border border-sand/20 bg-white py-16">
          <Loader2 className="h-6 w-6 animate-spin text-camel" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-sand/50 bg-white/50 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream">
            <Inbox className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-display text-heading-md font-semibold text-foreground">
            {searchQuery || selectedCategory !== "all"
              ? "Tiada produk dijumpai"
              : "Belum ada produk"}
          </h3>
          <p className="mt-1 text-body-sm text-muted-foreground">
            {searchQuery || selectedCategory !== "all"
              ? "Cuba ubah carian atau penapis anda"
              : "Tambah produk pertama untuk bermula"}
          </p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && filteredProducts.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {filteredProducts.map((product) => {
            const cat = categoryById(product.category_id);
            return (
              <motion.div
                key={product.id}
                variants={staggerItem}
                className="group overflow-hidden rounded-2xl border border-sand/20 bg-white shadow-soft-sm transition-shadow hover:shadow-soft-md"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-cream/40">
                  {product.image_url ? (
                    <div
                      className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${product.image_url})` }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                  {/* Badges */}
                  <div className="absolute left-3 top-3 flex gap-2">
                    {product.is_best_seller && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-body-xs font-medium text-white">
                        <Flame className="h-3 w-3" />
                        Best
                      </span>
                    )}
                    {product.is_new && (
                      <span className="flex items-center gap-1 rounded-full bg-rose/90 px-2 py-0.5 text-body-xs font-medium text-white">
                        <Star className="h-3 w-3" />
                        New
                      </span>
                    )}
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
                      aria-label="Edit product"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(product)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-red-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
                      aria-label="Delete product"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="mb-1 text-body-xs font-medium uppercase tracking-wider text-camel">
                    {cat?.name ?? "Tiada kategori"}
                  </div>
                  <h3 className="font-display text-heading-sm font-semibold text-foreground">
                    {product.name}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-body-xs text-muted-foreground">
                    {product.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-display text-heading-sm font-bold text-foreground">
                      {formatCurrency(product.price)}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-body-xs font-medium ${
                        product.is_available
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {product.is_available ? "Tersedia" : "Tidak tersedia"}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
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
                    {editingId ? "Sunting Produk" : "Tambah Produk Baru"}
                  </h2>
                  <button
                    onClick={() => !submitting && setShowModal(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-cream hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-foreground">
                      Nama Produk <span className="text-rose">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="cth: Red Velvet Dream"
                      required
                      className="w-full rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-foreground">
                      Penerangan <span className="text-rose">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Penerangan ringkas produk..."
                      required
                      className="w-full resize-none rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-body-sm font-medium text-foreground">
                        Harga (RM) <span className="text-rose">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                        className="w-full rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-body-sm font-medium text-foreground">
                        Kategori <span className="text-rose">*</span>
                      </label>
                      <select
                        value={formData.category_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category_id: e.target.value,
                          })
                        }
                        required
                        className="w-full rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                      >
                        <option value="">Pilih kategori</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-foreground">
                      Gambar Produk <span className="text-rose">*</span>
                    </label>
                    <ImageUpload
                      value={formData.image_url}
                      onChange={(url) =>
                        setFormData({ ...formData, image_url: url })
                      }
                      uploadOptions={{
                        bucket: BUCKETS.PRODUCT_IMAGES,
                        folder: "products",
                        maxSizeMB: 5,
                      }}
                      aspectClass="aspect-[16/10]"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 rounded-xl border border-sand/30 p-3 cursor-pointer hover:bg-cream/30">
                      <input
                        type="checkbox"
                        checked={formData.is_best_seller}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_best_seller: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-sand text-rose focus:ring-rose"
                      />
                      <span className="text-body-xs font-medium text-foreground">
                        Best Seller
                      </span>
                    </label>
                    <label className="flex items-center gap-2 rounded-xl border border-sand/30 p-3 cursor-pointer hover:bg-cream/30">
                      <input
                        type="checkbox"
                        checked={formData.is_new}
                        onChange={(e) =>
                          setFormData({ ...formData, is_new: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-sand text-rose focus:ring-rose"
                      />
                      <span className="text-body-xs font-medium text-foreground">
                        Produk Baru
                      </span>
                    </label>
                    <label className="flex items-center gap-2 rounded-xl border border-sand/30 p-3 cursor-pointer hover:bg-cream/30">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_featured: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-sand text-rose focus:ring-rose"
                      />
                      <span className="text-body-xs font-medium text-foreground">
                        Featured
                      </span>
                    </label>
                    <label className="flex items-center gap-2 rounded-xl border border-sand/30 p-3 cursor-pointer hover:bg-cream/30">
                      <input
                        type="checkbox"
                        checked={formData.is_available}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_available: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-sand text-rose focus:ring-rose"
                      />
                      <span className="text-body-xs font-medium text-foreground">
                        Tersedia
                      </span>
                    </label>
                  </div>

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
                  Tindakan ini tidak boleh dibatalkan. Produk akan dipadam secara
                  kekal.
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
