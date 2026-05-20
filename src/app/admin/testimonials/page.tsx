"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Star,
  Check,
  X,
  Trash2,
  Edit,
  Quote,
  Loader2,
  Inbox,
} from "lucide-react";
import { testimonialService } from "@/lib/services";
import type { Testimonial, TestimonialInsert } from "@/types";
import { toast } from "@/hooks";
import { logActivity } from "@/lib/activity";
import { revalidatePublicSite } from "@/lib/actions";
import {
  staggerContainer,
  staggerItem,
  fadeInUp,
  modalVariants,
  overlayVariants,
} from "@/lib/animations";

interface TestimonialForm {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar_url: string;
  is_featured: boolean;
  is_approved: boolean;
}

const emptyForm: TestimonialForm = {
  name: "",
  role: "",
  content: "",
  rating: 5,
  avatar_url: "",
  is_featured: false,
  is_approved: true,
};

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TestimonialForm>(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState<Testimonial | null>(null);

  const loadTestimonials = useCallback(async () => {
    setLoading(true);
    const res = await testimonialService.getAll({ pageSize: 100 });
    if (res.success) {
      setTestimonials(res.data);
    } else {
      toast.error("Gagal memuatkan testimoni", res.error ?? undefined);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  const filteredTestimonials = testimonials.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (testimonial: Testimonial) => {
    setFormData({
      name: testimonial.name,
      role: testimonial.role ?? "",
      content: testimonial.content,
      rating: testimonial.rating,
      avatar_url: testimonial.avatar_url ?? "",
      is_featured: testimonial.is_featured,
      is_approved: testimonial.is_approved,
    });
    setEditingId(testimonial.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedContent = formData.content.trim();

    if (!trimmedName || !trimmedContent) {
      toast.error("Maklumat tidak lengkap", "Sila isi nama dan testimoni.");
      return;
    }

    setSubmitting(true);

    const existing = editingId
      ? testimonials.find((t) => t.id === editingId)
      : null;

    const payload: TestimonialInsert = {
      name: trimmedName,
      role: formData.role.trim() || null,
      avatar_url: formData.avatar_url.trim() || null,
      content: trimmedContent,
      rating: formData.rating,
      is_featured: formData.is_featured,
      is_approved: formData.is_approved,
      sort_order: existing?.sort_order ?? testimonials.length,
    };

    const res = editingId
      ? await testimonialService.update(editingId, payload)
      : await testimonialService.create(payload);

    setSubmitting(false);

    if (!res.success) {
      toast.error(
        editingId ? "Gagal kemas kini testimoni" : "Gagal tambah testimoni",
        res.error ?? undefined
      );
      return;
    }

    logActivity({
      action: editingId ? "update" : "create",
      entity: "testimonial",
      entityId: res.data?.id ?? editingId,
      details: { name: trimmedName },
    });
    void revalidatePublicSite();

    toast.success(
      editingId ? "Testimoni dikemas kini" : "Testimoni ditambah",
      trimmedName
    );
    setShowModal(false);
    loadTestimonials();
  };

  const handleDelete = async (testimonial: Testimonial) => {
    setDeletingId(testimonial.id);
    const res = await testimonialService.delete(testimonial.id);
    setDeletingId(null);

    if (!res.success) {
      toast.error("Gagal padam testimoni", res.error ?? undefined);
      return;
    }

    logActivity({
      action: "delete",
      entity: "testimonial",
      entityId: testimonial.id,
      details: { name: testimonial.name },
    });
    void revalidatePublicSite();

    toast.success("Testimoni dipadam", testimonial.name);
    setShowDeleteConfirm(null);
    setTestimonials((prev) => prev.filter((t) => t.id !== testimonial.id));
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
            Testimoni
          </h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Urus testimoni pelanggan anda
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreateModal}
          className="btn-rose"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Testimoni
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
            placeholder="Cari testimoni..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-sand/50 bg-cream/30 py-2.5 pl-10 pr-4 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
          />
        </div>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center rounded-2xl border border-sand/20 bg-white py-16">
          <Loader2 className="h-6 w-6 animate-spin text-camel" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTestimonials.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-sand/50 bg-white/50 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream">
            <Inbox className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-display text-heading-md font-semibold text-foreground">
            {searchQuery ? "Tiada testimoni dijumpai" : "Belum ada testimoni"}
          </h3>
          <p className="mt-1 text-body-sm text-muted-foreground">
            {searchQuery
              ? "Cuba ubah carian anda"
              : "Tambah testimoni pertama untuk bermula"}
          </p>
        </div>
      )}

      {/* Testimonials List */}
      {!loading && filteredTestimonials.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2"
        >
          {filteredTestimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={staggerItem}
              className="group relative overflow-hidden rounded-2xl border border-sand/20 bg-white p-6 shadow-soft-sm transition-all hover:shadow-soft-md"
            >
              <Quote className="absolute -right-2 -top-2 h-16 w-16 text-sand/20" />

              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-full bg-cover bg-center bg-cream/40 ring-2 ring-sand/20"
                    style={
                      testimonial.avatar_url
                        ? { backgroundImage: `url(${testimonial.avatar_url})` }
                        : undefined
                    }
                  />
                  <div>
                    <h4 className="font-display text-heading-sm font-semibold text-foreground">
                      {testimonial.name}
                    </h4>
                    {testimonial.role && (
                      <p className="text-body-xs text-muted-foreground">
                        {testimonial.role}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => openEditModal(testimonial)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-cream hover:text-foreground"
                    aria-label="Edit"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(testimonial)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="relative mt-3 flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating
                        ? "text-yellow-500"
                        : "text-sand/40"
                    }`}
                    fill={i < testimonial.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>

              <p className="relative mt-3 line-clamp-3 text-body-sm leading-relaxed text-muted-foreground italic">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              <div className="relative mt-4 flex items-center gap-2">
                <span
                  className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-body-xs font-medium ${
                    testimonial.is_approved
                      ? "bg-green-50 text-green-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  <Check className="h-3 w-3" />
                  {testimonial.is_approved ? "Diluluskan" : "Menunggu"}
                </span>
                {testimonial.is_featured && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-body-xs font-medium text-amber-700">
                    <Star className="h-3 w-3" />
                    Featured
                  </span>
                )}
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
                    {editingId ? "Sunting Testimoni" : "Tambah Testimoni"}
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
                        Nama <span className="text-rose">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Nama pelanggan"
                        required
                        className="w-full rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-body-sm font-medium text-foreground">
                        Peranan
                      </label>
                      <input
                        type="text"
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value })
                        }
                        placeholder="cth: Pelanggan Setia"
                        className="w-full rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-foreground">
                      URL Avatar
                    </label>
                    <input
                      type="url"
                      value={formData.avatar_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          avatar_url: e.target.value,
                        })
                      }
                      placeholder="https://..."
                      className="w-full rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-foreground">
                      Testimoni <span className="text-rose">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      placeholder="Tulis testimoni pelanggan..."
                      required
                      className="w-full resize-none rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-foreground">
                      Rating
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, rating: star })
                          }
                          className="p-0.5"
                        >
                          <Star
                            className={`h-6 w-6 transition-colors ${
                              star <= formData.rating
                                ? "text-yellow-500"
                                : "text-sand/40 hover:text-yellow-300"
                            }`}
                            fill={
                              star <= formData.rating ? "currentColor" : "none"
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 rounded-xl border border-sand/30 p-3 cursor-pointer hover:bg-cream/30">
                      <input
                        type="checkbox"
                        checked={formData.is_approved}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_approved: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-sand text-rose focus:ring-rose"
                      />
                      <span className="text-body-xs font-medium text-foreground">
                        Diluluskan
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
                  Padam testimoni dari {showDeleteConfirm.name}?
                </h3>
                <p className="mt-2 text-body-sm text-muted-foreground">
                  Tindakan ini tidak boleh dibatalkan.
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
