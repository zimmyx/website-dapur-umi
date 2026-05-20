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
  HelpCircle,
} from "lucide-react";
import { faqService } from "@/lib/services";
import type { Faq, FaqInsert } from "@/types";
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

interface FaqForm {
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
}

const emptyForm: FaqForm = {
  question: "",
  answer: "",
  category: "",
  is_active: true,
};

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Faq | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FaqForm>(emptyForm);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadFaqs = useCallback(async () => {
    setLoading(true);
    const res = await faqService.getAll({ pageSize: 100 });
    if (res.success) {
      setFaqs(res.data);
    } else {
      toast.error("Gagal memuatkan soalan lazim", res.error ?? undefined);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFaqs();
  }, [loadFaqs]);

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (faq: Faq) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category ?? "",
      is_active: faq.is_active,
    });
    setEditingId(faq.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedQ = formData.question.trim();
    const trimmedA = formData.answer.trim();

    if (!trimmedQ || !trimmedA) {
      toast.error("Maklumat tidak lengkap", "Sila isi soalan dan jawapan.");
      return;
    }

    setSubmitting(true);

    const existing = editingId ? faqs.find((f) => f.id === editingId) : null;

    const payload: FaqInsert = {
      question: trimmedQ,
      answer: trimmedA,
      category: formData.category.trim() || null,
      sort_order: existing?.sort_order ?? faqs.length,
      is_active: formData.is_active,
    };

    const res = editingId
      ? await faqService.update(editingId, payload)
      : await faqService.create(payload);

    setSubmitting(false);

    if (!res.success) {
      toast.error(
        editingId
          ? "Gagal mengemaskini soalan lazim"
          : "Gagal menambah soalan lazim",
        res.error ?? undefined
      );
      return;
    }

    logActivity({
      action: editingId ? "update" : "create",
      entity: "faq",
      entityId: res.data?.id ?? editingId,
      details: { question: trimmedQ },
    });
    void revalidatePublicSite();

    toast.success(
      editingId ? "Soalan lazim dikemas kini" : "Soalan lazim ditambah",
      trimmedQ.length > 50 ? trimmedQ.slice(0, 50) + "..." : trimmedQ
    );
    setShowModal(false);
    loadFaqs();
  };

  const handleDelete = async (faq: Faq) => {
    setDeletingId(faq.id);
    const res = await faqService.delete(faq.id);
    setDeletingId(null);

    if (!res.success) {
      toast.error("Gagal memadamkan soalan lazim", res.error ?? undefined);
      return;
    }

    logActivity({
      action: "delete",
      entity: "faq",
      entityId: faq.id,
      details: { question: faq.question },
    });
    void revalidatePublicSite();

    toast.success("Soalan lazim dipadam");
    setShowDeleteConfirm(null);
    setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
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
            Soalan Lazim
          </h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Urus soalan dan jawapan yang sering ditanya pelanggan
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreateModal}
          className="btn-rose"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Soalan
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
            placeholder="Cari soalan..."
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

      {/* Empty */}
      {!loading && filteredFaqs.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-sand/50 bg-white/50 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream">
            <Inbox className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-display text-heading-md font-semibold text-foreground">
            {searchQuery ? "Tiada soalan dijumpai" : "Belum ada soalan lazim"}
          </h3>
          <p className="mt-1 text-body-sm text-muted-foreground">
            {searchQuery
              ? "Cuba ubah carian anda"
              : "Tambah soalan pertama untuk bermula"}
          </p>
        </div>
      )}

      {/* List */}
      {!loading && filteredFaqs.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3"
        >
          {filteredFaqs.map((faq) => (
            <motion.div
              key={faq.id}
              variants={staggerItem}
              className="group rounded-2xl border border-sand/20 bg-white shadow-soft-sm transition-all hover:shadow-soft-md"
            >
              <div className="flex items-start gap-4 p-4 sm:p-5">
                <div className="cursor-grab pt-1 text-muted-foreground/40 hover:text-muted-foreground">
                  <GripVertical className="h-5 w-5" />
                </div>

                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-cream">
                  <HelpCircle className="h-5 w-5 text-camel" />
                </div>

                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() =>
                    setExpandedId(expandedId === faq.id ? null : faq.id)
                  }
                >
                  <h3 className="font-display text-body-md font-semibold text-foreground">
                    {faq.question}
                  </h3>
                  <p
                    className={`mt-1 text-body-sm text-muted-foreground ${
                      expandedId === faq.id
                        ? "whitespace-pre-line"
                        : "line-clamp-1"
                    }`}
                  >
                    {faq.answer}
                  </p>
                </div>

                <span
                  className={`hidden flex-shrink-0 rounded-full px-2.5 py-0.5 text-body-xs font-medium sm:inline-flex ${
                    faq.is_active
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {faq.is_active ? "Aktif" : "Tidak aktif"}
                </span>

                <div className="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => openEditModal(faq)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-cream hover:text-foreground"
                    aria-label="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(faq)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                    aria-label="Padam"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
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
                    {editingId
                      ? "Sunting Soalan Lazim"
                      : "Tambah Soalan Lazim"}
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
                      Soalan <span className="text-rose">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.question}
                      onChange={(e) =>
                        setFormData({ ...formData, question: e.target.value })
                      }
                      placeholder="cth: Bagaimana cara membuat tempahan?"
                      required
                      className="w-full rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-foreground">
                      Jawapan <span className="text-rose">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={formData.answer}
                      onChange={(e) =>
                        setFormData({ ...formData, answer: e.target.value })
                      }
                      placeholder="Tulis jawapan yang lengkap..."
                      required
                      className="w-full resize-none rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-body-sm font-medium text-foreground">
                      Kategori (Pilihan)
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      placeholder="cth: Tempahan, Penghantaran, Pembayaran"
                      className="w-full rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                    />
                  </div>

                  <label className="flex items-center gap-2 rounded-xl border border-sand/30 p-3 cursor-pointer hover:bg-cream/30">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-sand text-rose focus:ring-rose"
                    />
                    <span className="text-body-sm font-medium text-foreground">
                      Paparkan di laman web
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
                  Padam soalan ini?
                </h3>
                <p className="mt-2 text-body-sm text-muted-foreground line-clamp-3">
                  &ldquo;{showDeleteConfirm.question}&rdquo;
                </p>
                <p className="mt-2 text-body-xs text-muted-foreground">
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
