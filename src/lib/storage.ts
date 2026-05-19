// ─── Storage Upload Utilities ─────────────────────────────────────────────────
// Reusable upload pipeline for Supabase Storage

import { createClient } from "@/lib/supabase/client";
import { BUCKETS } from "@/lib/constants";
import type { ApiResponse, Upload, UploadInsert } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadOptions {
  bucket: string;
  folder?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  generateUniqueName?: boolean;
  quality?: number;
}

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
  originalName: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_MAX_SIZE_MB = 5;
const DEFAULT_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

// ─── Utility Functions ────────────────────────────────────────────────────────

function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";
  const cleanName = originalName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9]/g, "-")
    .toLowerCase()
    .substring(0, 30);
  return `${cleanName}-${timestamp}-${random}.${extension}`;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function validateFile(
  file: File,
  maxSizeMB: number,
  allowedTypes: string[]
): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed. Allowed: ${allowedTypes.join(", ")}`,
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum (${maxSizeMB}MB)`,
    };
  }

  return { valid: true };
}

async function getImageDimensions(file: File): Promise<ImageDimensions | null> {
  if (!file.type.startsWith("image/")) return null;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

// ─── Core Upload Function ─────────────────────────────────────────────────────

export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<ApiResponse<UploadResult>> {
  const {
    bucket,
    folder = "",
    maxSizeMB = DEFAULT_MAX_SIZE_MB,
    allowedTypes = DEFAULT_ALLOWED_TYPES,
    generateUniqueName = true,
  } = options;

  // Validate
  const validation = validateFile(file, maxSizeMB, allowedTypes);
  if (!validation.valid) {
    return { data: null, error: validation.error!, success: false };
  }

  // Generate file name
  const fileName = generateUniqueName ? generateUniqueFileName(file.name) : file.name;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  // Get image dimensions
  const dimensions = await getImageDimensions(file);

  // Upload to Supabase Storage
  const supabase = createClient();
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return { data: null, error: uploadError.message, success: false };
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

  const result: UploadResult = {
    url: urlData.publicUrl,
    path: filePath,
    fileName,
    originalName: file.name,
    size: file.size,
    mimeType: file.type,
    ...(dimensions && { width: dimensions.width, height: dimensions.height }),
  };

  return { data: result, error: null, success: true };
}

// ─── Batch Upload ─────────────────────────────────────────────────────────────

export async function uploadFiles(
  files: File[],
  options: UploadOptions
): Promise<ApiResponse<UploadResult[]>> {
  const results: UploadResult[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const result = await uploadFile(file, options);
    if (result.success && result.data) {
      results.push(result.data);
    } else {
      errors.push(`${file.name}: ${result.error}`);
    }
  }

  if (errors.length > 0 && results.length === 0) {
    return { data: null, error: errors.join("; "), success: false };
  }

  return {
    data: results,
    error: errors.length > 0 ? `Partial upload: ${errors.join("; ")}` : null,
    success: true,
  };
}

// ─── Delete File ──────────────────────────────────────────────────────────────

export async function deleteFile(
  bucket: string,
  filePath: string
): Promise<ApiResponse<null>> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if (error) {
    return { data: null, error: error.message, success: false };
  }

  return { data: null, error: null, success: true };
}

// ─── Delete Multiple Files ────────────────────────────────────────────────────

export async function deleteFiles(
  bucket: string,
  filePaths: string[]
): Promise<ApiResponse<null>> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove(filePaths);

  if (error) {
    return { data: null, error: error.message, success: false };
  }

  return { data: null, error: null, success: true };
}

// ─── Preset Upload Functions ──────────────────────────────────────────────────

export function uploadProductImage(file: File) {
  return uploadFile(file, {
    bucket: BUCKETS.PRODUCT_IMAGES,
    folder: "products",
    maxSizeMB: 5,
  });
}

export function uploadGalleryImage(file: File) {
  return uploadFile(file, {
    bucket: BUCKETS.GALLERY_IMAGES,
    folder: "gallery",
    maxSizeMB: 8,
  });
}

export function uploadHeroImage(file: File) {
  return uploadFile(file, {
    bucket: BUCKETS.HERO_IMAGES,
    folder: "hero",
    maxSizeMB: 10,
  });
}

export function uploadTestimonialImage(file: File) {
  return uploadFile(file, {
    bucket: BUCKETS.TESTIMONIAL_IMAGES,
    folder: "testimonials",
    maxSizeMB: 3,
  });
}

export function uploadBrandingAsset(file: File) {
  return uploadFile(file, {
    bucket: BUCKETS.BRANDING_ASSETS,
    folder: "branding",
    maxSizeMB: 10,
    allowedTypes: [...DEFAULT_ALLOWED_TYPES, "image/svg+xml", "application/pdf"],
  });
}

export function uploadCmsAsset(file: File) {
  return uploadFile(file, {
    bucket: BUCKETS.CMS_ASSETS,
    folder: "cms",
    maxSizeMB: 10,
  });
}

// ─── Record Upload in Database ────────────────────────────────────────────────

export async function recordUpload(
  result: UploadResult,
  bucket: string,
  uploadedBy: string
): Promise<ApiResponse<Upload>> {
  const supabase = createClient();

  const payload: UploadInsert = {
    file_name: result.fileName,
    original_name: result.originalName,
    file_path: result.path,
    file_url: result.url,
    file_size: result.size,
    mime_type: result.mimeType,
    bucket,
    width: result.width || null,
    height: result.height || null,
    alt_text: null,
    uploaded_by: uploadedBy,
  };

  const { data, error } = await supabase
    .from("uploads")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message, success: false };
  }

  return { data: data as Upload, error: null, success: true };
}

// ─── Export Utilities ─────────────────────────────────────────────────────────

export { formatFileSize, validateFile, getImageDimensions, generateUniqueFileName };
