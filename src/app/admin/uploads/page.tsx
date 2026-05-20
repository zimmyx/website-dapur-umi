"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload as UploadIcon,
  Search,
  Trash2,
  X,
  Grid3X3,
  LayoutList,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Inbox,
} from "lucide-react";
import { BUCKETS } from "@/lib/constants";
import { formatFileSize, uploadFile } from "@/lib/storage";
import { uploadService } from "@/lib/services";
import { getCurrentAdminId, logActivity } from "@/lib/activity";
import type { Upload, UploadInsert } from "@/types";
import { toast, useCopyToClipboard } from "@/hooks";
import {
  staggerContainer,
  staggerItem,
  fadeInUp,
  modalVariants,
  overlayVariants,
} from "@/lib/animations";

const bucketOptions = [
  { value: "all", label: "Semua Bucket" },
  { value: BUCKETS.PRODUCT_IMAGES, label: "Product Images" },
  { value: BUCKETS.GALLERY_IMAGES, label: "Gallery Images" },
  { value: BUCKETS.HERO_IMAGES, label: "Hero Images" },
  { value: BUCKETS.TESTIMONIAL_IMAGES, label: "Testimonial Images" },
  { value: BUCKETS.BRANDING_ASSETS, label: "Branding Assets" },
  { value: BUCKETS.CMS_ASSETS, label: "CMS Assets" },
];

interface PendingFile {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export default function AdminUploadsPage() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBucket, setSelectedBucket] = useState("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadBucket, setUploadBucket] = useState<string>(
    BUCKETS.PRODUCT_IMAGES
  );
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [copied, copy] = useCopyToClipboard();

  const loadUploads = useCallback(async () => {
    setLoading(true);
    const res = await uploadService.getAll({ pageSize: 200 });
    if (res.success) {
      setUploads(res.data);
    } else {
      toast.error("Gagal memuatkan fail", res.error ?? undefined);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUploads();
  }, [loadUploads]);

  const filteredUploads = uploads.filter((u) => {
    const matchesSearch = u.original_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesBucket =
      selectedBucket === "all" || u.bucket === selectedBucket;
    return matchesSearch && matchesBucket;
  });

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const totalSize = uploads.reduce((acc, u) => acc + u.file_size, 0);

  const handleSingleDelete = async (upload: Upload) => {
    const res = await uploadService.delete(
      upload.id,
      upload.file_path,
      upload.bucket
    );
    if (!res.success) {
      toast.error("Gagal padam fail", res.error ?? undefined);
      return;
    }
    logActivity({
      action: "delete",
      entity: "upload",
      entityId: upload.id,
      details: { file_name: upload.original_name },
    });
    toast.success("Fail dipadam", upload.original_name);
    setUploads((prev) => prev.filter((u) => u.id !== upload.id));
    setSelectedItems((prev) => prev.filter((i) => i !== upload.id));
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    setBulkDeleting(true);

    const items = uploads
      .filter((u) => selectedItems.includes(u.id))
      .map((u) => ({ id: u.id, file_path: u.file_path, bucket: u.bucket }));

    const res = await uploadService.deleteBatch(items);
    setBulkDeleting(false);

    if (!res.success) {
      toast.error("Gagal padam fail", res.error ?? undefined);
      return;
    }

    logActivity({
      action: "delete",
      entity: "upload",
      details: { count: selectedItems.length },
    });
    toast.success(`${selectedItems.length} fail dipadam`);
    setUploads((prev) => prev.filter((u) => !selectedItems.includes(u.id)));
    setSelectedItems([]);
  };

  // ─── Upload Flow ──────────────────────────────────────────────────────────

  const openUploadModal = () => {
    setPendingFiles([]);
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

    const adminId = await getCurrentAdminId();
    if (!adminId) {
      toast.error("Sesi tidak sah", "Sila log masuk semula.");
      return;
    }

    setUploading(true);
    const successful: Upload[] = [];
    let errors = 0;

    for (const pending of pendingFiles) {
      setPendingFiles((prev) =>
        prev.map((p) =>
          p.id === pending.id ? { ...p, status: "uploading" } : p
        )
      );

      const uploadRes = await uploadFile(pending.file, {
        bucket: uploadBucket,
        folder: uploadBucket.replace(/-images|-assets/, ""),
        maxSizeMB: 10,
      });

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

      const payload: UploadInsert = {
        file_name: uploadRes.data.fileName,
        original_name: uploadRes.data.originalName,
        file_path: uploadRes.data.path,
        file_url: uploadRes.data.url,
        file_size: uploadRes.data.size,
        mime_type: uploadRes.data.mimeType,
        bucket: uploadBucket,
        width: uploadRes.data.width ?? null,
        height: uploadRes.data.height ?? null,
        alt_text: null,
        uploaded_by: adminId,
      };

      const recordRes = await uploadService.create(payload);
      if (!recordRes.success || !recordRes.data) {
        errors++;
        setPendingFiles((prev) =>
          prev.map((p) =>
            p.id === pending.id
              ? {
                  ...p,
                  status: "error",
                  error: recordRes.error ?? "Simpan rekod gagal",
                }
              : p
          )
        );
        continue;
      }

      successful.push(recordRes.data);
      logActivity({
        action: "upload",
        entity: "upload",
        entityId: recordRes.data.id,
        details: {
          file_name: recordRes.data.original_name,
          bucket: uploadBucket,
        },
      });
      setPendingFiles((prev) =>
        prev.map((p) => (p.id === pending.id ? { ...p, status: "done" } : p))
      );
    }

    setUploading(false);

    if (successful.length > 0) {
      toast.success(`${successful.length} fail dimuat naik`);
      setUploads((prev) => [...successful, ...prev]);
    }
    if (errors > 0) {
      toast.error(`${errors} fail gagal`);
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
            Muat Naik
          </h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Urus semua fail yang dimuat naik • {uploads.length} fail •{" "}
            {formatFileSize(totalSize)}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openUploadModal}
          className="btn-rose"
        >
          <UploadIcon className="mr-2 h-4 w-4" />
          Muat Naik Fail
        </motion.button>
      </motion.div>

      {/* Storage Overview */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.05 }}
        className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6"
      >
        {bucketOptions.slice(1).map((bucket) => {
          const count = uploads.filter((u) => u.bucket === bucket.value).length;
          return (
            <button
              key={bucket.value}
              onClick={() =>
                setSelectedBucket(
                  selectedBucket === bucket.value ? "all" : bucket.value
                )
              }
              className={`rounded-xl border p-3 text-left transition-all ${
                selectedBucket === bucket.value
                  ? "border-rose/30 bg-rose/5 shadow-soft-sm"
                  : "border-sand/20 bg-white hover:border-camel/30 hover:shadow-soft-sm"
              }`}
            >
              <div className="text-heading-sm font-bold text-foreground">
                {count}
              </div>
              <div className="mt-0.5 truncate text-body-xs text-muted-foreground">
                {bucket.label.replace(" Images", "").replace(" Assets", "")}
              </div>
            </button>
          );
        })}
      </motion.div>

      {/* Toolbar */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-3 rounded-2xl border border-sand/20 bg-white p-4 shadow-soft-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari fail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-sand/50 bg-cream/30 py-2.5 pl-10 pr-4 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
            />
          </div>

          {selectedItems.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2.5 text-body-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-60"
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

        <div className="flex items-center gap-2">
          <select
            value={selectedBucket}
            onChange={(e) => setSelectedBucket(e.target.value)}
            className="rounded-xl border border-sand/50 bg-cream/30 px-3 py-2.5 text-body-xs transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
          >
            {bucketOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 rounded-xl border border-sand/30 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-cream text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-cream text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <LayoutList className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center rounded-2xl border border-sand/20 bg-white py-16">
          <Loader2 className="h-6 w-6 animate-spin text-camel" />
        </div>
      )}

      {/* Empty */}
      {!loading && filteredUploads.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-sand/50 bg-white/50 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream">
            <Inbox className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-display text-heading-md font-semibold text-foreground">
            {searchQuery || selectedBucket !== "all"
              ? "Tiada fail dijumpai"
              : "Belum ada fail"}
          </h3>
          <p className="mt-1 text-body-sm text-muted-foreground">
            {searchQuery || selectedBucket !== "all"
              ? "Cuba ubah carian atau penapis anda"
              : "Muat naik fail pertama untuk bermula"}
          </p>
        </div>
      )}

      {/* Files Grid/List */}
      {!loading && filteredUploads.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className={
            viewMode === "grid"
              ? "grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              : "flex flex-col gap-2"
          }
        >
          {filteredUploads.map((upload) => (
            <motion.div
              key={upload.id}
              variants={staggerItem}
              className={`group relative overflow-hidden rounded-2xl border border-sand/20 bg-white shadow-soft-sm transition-all hover:shadow-soft-md ${
                selectedItems.includes(upload.id)
                  ? "ring-2 ring-rose ring-offset-2"
                  : ""
              } ${viewMode === "list" ? "flex items-center gap-4 p-3" : ""}`}
            >
              {viewMode === "grid" ? (
                <>
                  <div className="relative aspect-square overflow-hidden bg-cream/40">
                    <div
                      className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${upload.file_url})` }}
                    />

                    <button
                      onClick={() => toggleSelect(upload.id)}
                      className={`absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${
                        selectedItems.includes(upload.id)
                          ? "border-rose bg-rose text-white"
                          : "border-white/80 bg-white/60 text-transparent backdrop-blur-sm"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>

                    <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => copy(upload.file_url)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-foreground shadow-sm backdrop-blur-sm hover:bg-white"
                        title="Copy URL"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleSingleDelete(upload)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-red-600 shadow-sm backdrop-blur-sm hover:bg-white"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3">
                    <p className="truncate text-body-xs font-medium text-foreground">
                      {upload.original_name}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-body-xs text-muted-foreground">
                        {formatFileSize(upload.file_size)}
                      </span>
                      <span className="rounded-full bg-cream px-2 py-0.5 text-body-xs text-muted-foreground">
                        {upload.bucket
                          .replace("-images", "")
                          .replace("-assets", "")}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => toggleSelect(upload.id)}
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                      selectedItems.includes(upload.id)
                        ? "border-rose bg-rose text-white"
                        : "border-sand/50 text-transparent hover:border-camel"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>

                  <div
                    className="h-12 w-12 flex-shrink-0 rounded-xl bg-cover bg-center bg-cream/40"
                    style={{ backgroundImage: `url(${upload.file_url})` }}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="truncate text-body-sm font-medium text-foreground">
                      {upload.original_name}
                    </p>
                    <p className="text-body-xs text-muted-foreground">
                      {formatFileSize(upload.file_size)} • {upload.mime_type}
                    </p>
                  </div>

                  <span className="hidden rounded-full bg-cream px-2.5 py-0.5 text-body-xs text-muted-foreground sm:inline-flex">
                    {upload.bucket
                      .replace("-images", "")
                      .replace("-assets", "")}
                  </span>

                  <div className="flex gap-1">
                    <button
                      onClick={() => copy(upload.file_url)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-cream hover:text-foreground"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <a
                      href={upload.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-cream hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleSingleDelete(upload)}
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
                    Muat Naik Fail
                  </h2>
                  <button
                    onClick={closeUploadModal}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-cream hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-5">
                  <label className="mb-2 block text-body-sm font-medium text-foreground">
                    Destinasi Bucket
                  </label>
                  <select
                    value={uploadBucket}
                    onChange={(e) => setUploadBucket(e.target.value)}
                    className="w-full rounded-xl border border-sand/50 bg-cream/30 px-4 py-3 text-body-sm transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20"
                  >
                    {bucketOptions.slice(1).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFilesSelected(e.dataTransfer.files);
                  }}
                  className="relative cursor-pointer rounded-2xl border-2 border-dashed border-sand/50 bg-cream/20 p-8 text-center transition-colors hover:border-camel/50"
                >
                  <UploadIcon className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 text-body-md font-medium text-foreground">
                    Seret & lepas fail di sini
                  </p>
                  <p className="mt-1 text-body-sm text-muted-foreground">
                    atau klik untuk memilih fail
                  </p>
                  <p className="mt-3 text-body-xs text-muted-foreground/60">
                    PNG, JPG, WebP, AVIF • Maks 10MB setiap fail
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

      {/* Copy Toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 rounded-xl bg-foreground px-4 py-3 text-body-sm font-medium text-white shadow-soft-lg"
          >
            URL disalin ke clipboard ✓
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
