"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadFile, type UploadOptions } from "@/lib/storage";
import { toast } from "@/hooks";

export interface ImageUploadProps {
  /** Current image URL */
  value: string;
  /** Called with the new public URL after a successful upload */
  onChange: (url: string) => void;
  /** Storage upload options (bucket, folder, max size, etc.) */
  uploadOptions: UploadOptions;
  /** Whether the user can also paste a URL manually */
  allowUrlInput?: boolean;
  /** Aspect ratio for the preview (default 16/10) */
  aspectClass?: string;
  /** Label text */
  label?: string;
  /** Disable interaction */
  disabled?: boolean;
}

/**
 * Reusable image upload control. Handles drag-drop, click-to-select,
 * and optional manual URL input. Calls onChange with the public URL on
 * successful upload to Supabase Storage.
 */
export function ImageUpload({
  value,
  onChange,
  uploadOptions,
  allowUrlInput = true,
  aspectClass = "aspect-[16/10]",
  label,
  disabled = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    const res = await uploadFile(file, uploadOptions);
    setUploading(false);

    if (!res.success || !res.data) {
      toast.error("Gagal muat naik gambar", res.error ?? undefined);
      return;
    }

    onChange(res.data.url);
    toast.success("Gambar dimuat naik");
  };

  const handleClick = () => {
    if (disabled || uploading) return;
    inputRef.current?.click();
  };

  return (
    <div>
      {label && (
        <label className="mb-2 block text-body-sm font-medium text-foreground">
          {label}
        </label>
      )}

      {/* Preview / Drop zone */}
      <motion.div
        whileHover={disabled ? undefined : { scale: 1.005 }}
        onClick={handleClick}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled || uploading) return;
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-all ${
          disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:border-camel/50"
        } ${
          dragOver
            ? "border-rose bg-rose/5"
            : value
            ? "border-sand/30"
            : "border-sand/50 bg-cream/20"
        } ${aspectClass} w-full`}
      >
        {value ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${value})` }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all hover:bg-black/40 hover:opacity-100">
              <div className="flex flex-col items-center gap-2 text-white">
                <Upload className="h-6 w-6" />
                <span className="text-body-xs font-medium">
                  Klik untuk ganti
                </span>
              </div>
            </div>
            {!disabled && !uploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80"
                aria-label="Buang gambar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-camel" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground/60" />
            )}
            <p className="text-body-sm font-medium text-foreground">
              {uploading
                ? "Memuat naik..."
                : "Klik atau seret gambar ke sini"}
            </p>
            <p className="text-body-xs text-muted-foreground/60">
              PNG, JPG, WebP, AVIF
            </p>
          </div>
        )}

        {uploading && value && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled || uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </motion.div>

      {/* Optional manual URL input */}
      {allowUrlInput && (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || uploading}
          placeholder="atau tampal URL gambar..."
          className="mt-2 w-full rounded-xl border border-sand/50 bg-cream/30 px-4 py-2.5 text-body-xs transition-all focus:border-camel focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel/20 disabled:opacity-60"
        />
      )}
    </div>
  );
}
