"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Upload,
  Trash2,
  X,
  ZoomIn,
  Grid3X3,
  LayoutList,
  Check,
  Loader2,
  Inbox,
} from "lucide-react";
import { galleryService } from "@/lib/services";
import { uploadGalleryImage } from "@/lib/storage";
import type { GalleryItem, GalleryItemInsert } from "@/types";
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

const categoryOptions = [
  { value: "kek", label: "Kek" },
  { value: "pastri", label: "Pastri" },
  { value: "cookies", label: "Cookies" },
  { value: "bts", label: "Behind the Scenes" },
];

interface PendingFile {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    const res = await galleryService.getAll({ pageSize: 100 });
    if (res.success) {
      setItems(res.data);
    } else {
      toast.error("Gagal memuatkan galeri", res.error ?? undefined);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((i) => i.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    setBulkDeleting(true);
    const res = await galleryService.deleteBatch(selectedItems);
    setBulkDeleting(false);

    if (!res.success) {
      toast.error("Gagal padam item", res.error ?? undefined);
      return;
    }

    logActivity({
      action: "delete",
      entity: "gallery",
      details: { count: selectedItems.length },
    });
    void revalidatePublicSite();

    toast.success(`${selectedItems.length} item dipadam`);
    setItems((prev) => prev.filter((i) => !selectedItems.includes(i.id)));
    setSelectedItems([]);
  };

  const handleSingleDelete = async (item: GalleryItem) => {
    const res = await galleryService.delete(item.id);
    if (!res.success) {
      toast.error("Gagal padam", res.error ?? undefined);
      return;
    }
    logActivity({
      action: "delete",
      entity: "gallery",
      entityId: item.id,
      details: { title: item.title },
    });
    void revalidatePublicSite();

    toast.success("Item dipadam", item.title);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  // ─── Upload Flow ──────────────────────────────────────────────────────────

  const openUploadModal = () => {
    setPendingFiles([]);
    setUploadCategory("");
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    if (uploading) return;
    pendingFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    setPendingFiles([]);
    setShowUploadModal(false);
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const next: PendingFile[] = Array.from(files).map((file) => ({
      id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      preview: URL.createObjectURL(file),
      status: "pending",
    }));
    setPendingFiles((prev) => [...prev, ...next]);
  };

  const removePendingFile = (id: string) => {
    setPendingFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0) {
      toast.warning("Tiada fail dipilih");
      return;
    }

    setUploading(true);
    const successful: GalleryItem[] = [];
    let errors = 0;

    for (const pending of pendingFiles) {
      setPendingFiles((prev) =>
        prev.map((p) =>
          p.id === pending.id ? { ...p, status: "uploading" } : p
        )
      );

      const uploadRes = await uploadGalleryImage(pending.file);

      if (!uploadRes.success || !uploadRes.data) {
        errors++;
        setPendingFiles((prev) =>
          prev.map((p) =>
            p.id === pending.id
              ? {
                  ...p,
                  status: "error",
                  error: uploadRes.error ?? "Upload gagal",
                }
              : p
          )
        );
        continue;
      }

      const payload: GalleryItemInsert = {
        title: pending.file.name.replace(/\.[^/.]+$/, ""),
        description: null,
        image_url: uploadRes.data.url,
        thumbnail_url: null,
        category: uploadCategory || null,
        tags: [],
        is_featured: false,
        sort_order: items.length + successful.length,
      };

      const createRes = await galleryService.create(payload);
      if (!createRes.success || !createRes.data) {
        errors++;
        setPendingFiles((prev) =>
          prev.map((p) =>
            p.id === pending.id
              ? {
                  ...p,
                  status: "error",
                  error: createRes.error ?? "Simpan rekod gagal",
                }
              : p
          )
        );
        continue;
      }

      successful.push(createRes.data);
      logActivity({
        action: "upload",
        entity: "gallery",
        entityId: createRes.data.id,
        details: { title: createRes.data.title },
      });
      setPendingFiles((prev) =>
        prev.map((p) =>
          p.id === pending.id ? { ...p, status: "done" } : p
        )
      );
    }

    setUploading(false);

    if (successful.length > 0) {
      toast.success(`${successful.length} gambar dimuat naik`);
      setItems((prev) => [...successful, ...prev]);
      void revalidatePublicSite();
    }
    if (errors > 0) {
      toast.error(`${errors} fail gagal dimuat naik`);
    }
    if (errors === 0) {
      pendingFiles.forEach((f) => URL.revokeObjectURL(f.preview));
      setPendingFiles([]);
      setShowUploadModal(false);
    }
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
            Galeri
          </h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Urus gambar galeri laman web anda
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openUploadModal}
          className="btn-rose"
        >
          <Upload className="mr-2 h-4 w-4" />
          Muat Naik
        </motion.button>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-3 rounded-2xl border border-sand/20 bg-white p-4 shadow-soft-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari gambar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-sand/50 bg-cream/30 py-2.5 pl-10 pr-4 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
            />
          </div>

          {filteredItems.length > 0 && (
            <button
              onClick={selectAll}
              className="rounded-xl border border-sand/50 px-3 py-2.5 text-body-xs font-medium text-muted-foreground transition-colors hover:bg-cream hover:text-foreground"
            >
              {selectedItems.length === filteredItems.length
                ? "Nyahpilih"
                : "Pilih Semua"}
            </button>
          )}

          {selectedItems.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2.5 text-body-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
            >
              {bulkDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Padam ({selectedItems.length})
            </motion.button>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-sand/30 p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              viewMode === "grid"
                ? "bg-cream text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Grid view"
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              viewMode === "list"
                ? "bg-cream text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="List view"
          >
            <LayoutList className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center rounded-2xl border border-sand/20 bg-white py-16">
          <Loader2 className="h-6 w-6 animate-spin text-camel" />
        </div>
      )}

      {/* Empty */}
      {!loading && filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-sand/50 bg-white/50 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream">
            <Inbox className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-display text-heading-md font-semibold text-foreground">
            {searchQuery ? "Tiada gambar dijumpai" : "Galeri masih kosong"}
          </h3>
          <p className="mt-1 text-body-sm text-muted-foreground">
            {searchQuery
              ? "Cuba ubah carian anda"
              : "Muat naik gambar pertama untuk bermula"}
          </p>
        </div>
      )}

      {/* Gallery Grid/List */}
      {!loading && filteredItems.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className={
            viewMode === "grid"
              ? "grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              : "flex flex-col gap-2"
          }
        >
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              variants={staggerItem}
              className={`group relative overflow-hidden rounded-2xl border border-sand/20 bg-white shadow-soft-sm transition-all hover:shadow-soft-md ${
                selectedItems.includes(item.id)
                  ? "ring-2 ring-rose ring-offset-2"
                  : ""
              } ${viewMode === "list" ? "flex items-center gap-4 p-3" : ""}`}
            >
              {viewMode === "grid" ? (
                <>
                  <div className="relative aspect-square overflow-hidden bg-cream/40">
                    <div
                      className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url(${item.image_url})` }}
                    />

                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 transition-all group-hover:bg-black/40">
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.1 }}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100"
                        onClick={() => setLightboxImage(item.image_url)}
                        aria-label="View full size"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => handleSingleDelete(item)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-red-600 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>

                    <button
                      onClick={() => toggleSelect(item.id)}
                      className={`absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${
                        selectedItems.includes(item.id)
                          ? "border-rose bg-rose text-white"
                          : "border-white/80 bg-white/60 text-transparent backdrop-blur-sm group-hover:border-sand"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>

                    {item.is_featured && (
                      <span className="absolute bottom-2 right-2 rounded-full bg-amber-500/90 px-2 py-0.5 text-body-xs font-medium text-white">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="p-3">
                    <p className="truncate text-body-xs font-medium text-foreground">
                      {item.title}
                    </p>
                    {item.category && (
                      <p className="text-body-xs text-muted-foreground">
                        {item.category}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => toggleSelect(item.id)}
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                      selectedItems.includes(item.id)
                        ? "border-rose bg-rose text-white"
                        : "border-sand/50 text-transparent hover:border-camel"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>

                  <div
                    className="h-14 w-14 flex-shrink-0 rounded-xl bg-cover bg-center bg-cream/40"
                    style={{ backgroundImage: `url(${item.image_url})` }}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="truncate text-body-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    {item.category && (
                      <p className="text-body-xs text-muted-foreground">
                        {item.category}
                      </p>
                    )}
                  </div>

                  {item.is_featured && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-body-xs font-medium text-amber-700">
                      Featured
                    </span>
                  )}

                  <div className="flex gap-1">
                    <button
                      onClick={() => setLightboxImage(item.image_url)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-cream hover:text-foreground"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleSingleDelete(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <>
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={closeUploadModal}
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
                    Muat Naik Gambar
                  </h2>
                  <button
                    onClick={closeUploadModal}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-cream hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Drop Zone */}
                <div
                  className="relative rounded-2xl border-2 border-dashed border-sand/50 bg-cream/20 p-8 text-center transition-colors hover:border-camel/50"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFilesSelected(e.dataTransfer.files);
                  }}
                >
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 text-body-md font-medium text-foreground">
                    Seret & lepas gambar di sini
                  </p>
                  <p className="mt-1 text-body-sm text-muted-foreground">
                    atau klik untuk memilih fail
                  </p>
                  <p className="mt-3 text-body-xs text-muted-foreground/60">
                    PNG, JPG, WebP, AVIF • Maks 8MB setiap fail
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFilesSelected(e.target.files)}
                    className="hidden"
                  />
                </div>

                {/* Pending Files Preview */}
                {pendingFiles.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2 text-body-xs font-medium text-muted-foreground">
                      {pendingFiles.length} fail dipilih
                    </p>
                    <div className="grid gap-2 grid-cols-3 sm:grid-cols-4">
                      {pendingFiles.map((pf) => (
                        <div
                          key={pf.id}
                          className="relative aspect-square overflow-hidden rounded-xl border border-sand/30 bg-cream/40"
                        >
                          <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${pf.preview})` }}
                          />
                          {pf.status === "uploading" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <Loader2 className="h-5 w-5 animate-spin text-white" />
                            </div>
                          )}
                          {pf.status === "done" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-green-500/40">
                              <Check className="h-6 w-6 text-white" />
                            </div>
                          )}
                          {pf.status === "error" && (
                            <div
                              className="absolute inset-0 flex items-center justify-center bg-red-500/60 p-1 text-center text-body-xs text-white"
                              title={pf.error}
                            >
                              {pf.error ?? "Ralat"}
                            </div>
                          )}
                          {pf.status === "pending" && !uploading && (
                            <button
                              onClick={() => removePendingFile(pf.id)}
                              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category */}
                <div className="mt-5">
                  <label className="mb-2 block text-body-sm font-medium text-foreground">
                    Kategori
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                  >
                    <option value="">Pilih kategori (pilihan)</option>
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={closeUploadModal}
                    disabled={uploading}
                    className="btn-outline flex-1 disabled:opacity-60"
                  >
                    Batal
                  </button>
                  <motion.button
                    whileHover={{ scale: uploading ? 1 : 1.02 }}
                    whileTap={{ scale: uploading ? 1 : 0.98 }}
                    onClick={handleUpload}
                    disabled={uploading || pendingFiles.length === 0}
                    className="btn-rose flex-1 disabled:opacity-60"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memuat naik...
                      </>
                    ) : (
                      `Muat Naik${pendingFiles.length ? ` (${pendingFiles.length})` : ""}`
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-h-[85vh] max-w-4xl overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="aspect-square w-full min-w-[300px] bg-cover bg-center sm:min-w-[500px] sm:aspect-[4/3]"
                style={{ backgroundImage: `url(${lightboxImage})` }}
              />
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/40"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
