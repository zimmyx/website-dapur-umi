// ─── Supabase Service Layer ───────────────────────────────────────────────────
// Reusable service abstraction for all Supabase operations

import { createClient } from "@/lib/supabase/client";
import type {
  Product,
  ProductInsert,
  ProductUpdate,
  Category,
  CategoryInsert,
  CategoryUpdate,
  GalleryItem,
  GalleryItemInsert,
  GalleryItemUpdate,
  Testimonial,
  TestimonialInsert,
  TestimonialUpdate,
  Setting,
  SettingInsert,
  SettingUpdate,
  Upload,
  UploadInsert,
  FeaturedSection,
  FeaturedSectionInsert,
  FeaturedSectionUpdate,
  ActivityLog,
  ActivityLogInsert,
  Faq,
  FaqInsert,
  FaqUpdate,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

// ─── Generic CRUD Service ─────────────────────────────────────────────────────

interface QueryOptions {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
  search?: string;
  searchColumn?: string;
  filters?: Record<string, unknown>;
}

async function fetchAll<T>(
  table: string,
  options: QueryOptions = {}
): Promise<PaginatedResponse<T>> {
  const supabase = createClient();
  const {
    page = 1,
    pageSize = 20,
    orderBy = "created_at",
    orderDirection = "desc",
    search,
    searchColumn,
    filters,
  } = options;

  let query = supabase.from(table).select("*", { count: "exact" });

  // Apply search
  if (search && searchColumn) {
    query = query.ilike(searchColumn, `%${search}%`);
  }

  // Apply filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query = query.eq(key, value);
      }
    });
  }

  // Apply ordering
  query = query.order(orderBy, { ascending: orderDirection === "asc" });

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return {
      data: [],
      pagination: { page, pageSize, total: 0, totalPages: 0 },
      error: error.message,
      success: false,
    };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    data: (data as T[]) || [],
    pagination: { page, pageSize, total, totalPages },
    error: null,
    success: true,
  };
}

async function fetchById<T>(table: string, id: string): Promise<ApiResponse<T>> {
  const supabase = createClient();
  const { data, error } = await supabase.from(table).select("*").eq("id", id).single();

  if (error) {
    return { data: null, error: error.message, success: false };
  }

  return { data: data as T, error: null, success: true };
}

async function fetchBySlug<T>(table: string, slug: string): Promise<ApiResponse<T>> {
  const supabase = createClient();
  const { data, error } = await supabase.from(table).select("*").eq("slug", slug).single();

  if (error) {
    return { data: null, error: error.message, success: false };
  }

  return { data: data as T, error: null, success: true };
}

async function create<T>(table: string, payload: Record<string, unknown>): Promise<ApiResponse<T>> {
  const supabase = createClient();
  const { data, error } = await supabase.from(table).insert(payload).select().single();

  if (error) {
    return { data: null, error: error.message, success: false };
  }

  return { data: data as T, error: null, success: true, message: "Created successfully" };
}

async function update<T>(
  table: string,
  id: string,
  payload: Record<string, unknown>
): Promise<ApiResponse<T>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(table)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message, success: false };
  }

  return { data: data as T, error: null, success: true, message: "Updated successfully" };
}

async function remove(table: string, id: string): Promise<ApiResponse<null>> {
  const supabase = createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);

  if (error) {
    return { data: null, error: error.message, success: false };
  }

  return { data: null, error: null, success: true, message: "Deleted successfully" };
}

async function removeBatch(table: string, ids: string[]): Promise<ApiResponse<null>> {
  const supabase = createClient();
  const { error } = await supabase.from(table).delete().in("id", ids);

  if (error) {
    return { data: null, error: error.message, success: false };
  }

  return { data: null, error: null, success: true, message: "Deleted successfully" };
}

// ─── Product Service ──────────────────────────────────────────────────────────

export const productService = {
  getAll: (options?: QueryOptions) =>
    fetchAll<Product>("products", { searchColumn: "name", ...options }),

  getById: (id: string) => fetchById<Product>("products", id),

  getBySlug: (slug: string) => fetchBySlug<Product>("products", slug),

  getFeatured: async (): Promise<ApiResponse<Product[]>> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_featured", true)
      .eq("is_available", true)
      .order("sort_order", { ascending: true })
      .limit(6);

    if (error) return { data: null, error: error.message, success: false };
    return { data: data as Product[], error: null, success: true };
  },

  getBestSellers: async (): Promise<ApiResponse<Product[]>> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_best_seller", true)
      .eq("is_available", true)
      .order("sort_order", { ascending: true })
      .limit(8);

    if (error) return { data: null, error: error.message, success: false };
    return { data: data as Product[], error: null, success: true };
  },

  getByCategory: async (categoryId: string): Promise<ApiResponse<Product[]>> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", categoryId)
      .eq("is_available", true)
      .order("sort_order", { ascending: true });

    if (error) return { data: null, error: error.message, success: false };
    return { data: data as Product[], error: null, success: true };
  },

  create: (payload: ProductInsert) => create<Product>("products", payload as unknown as Record<string, unknown>),

  update: (id: string, payload: ProductUpdate) =>
    update<Product>("products", id, payload as unknown as Record<string, unknown>),

  delete: (id: string) => remove("products", id),

  deleteBatch: (ids: string[]) => removeBatch("products", ids),

  updateSortOrder: async (items: { id: string; sort_order: number }[]): Promise<ApiResponse<null>> => {
    const supabase = createClient();
    const promises = items.map(({ id, sort_order }) =>
      supabase.from("products").update({ sort_order }).eq("id", id)
    );
    const results = await Promise.all(promises);
    const error = results.find((r) => r.error);
    if (error?.error) return { data: null, error: error.error.message, success: false };
    return { data: null, error: null, success: true };
  },
};

// ─── Category Service ─────────────────────────────────────────────────────────

export const categoryService = {
  getAll: (options?: QueryOptions) =>
    fetchAll<Category>("categories", { orderBy: "sort_order", orderDirection: "asc", ...options }),

  getActive: async (): Promise<ApiResponse<Category[]>> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) return { data: null, error: error.message, success: false };
    return { data: data as Category[], error: null, success: true };
  },

  getById: (id: string) => fetchById<Category>("categories", id),

  getBySlug: (slug: string) => fetchBySlug<Category>("categories", slug),

  create: (payload: CategoryInsert) =>
    create<Category>("categories", payload as unknown as Record<string, unknown>),

  update: (id: string, payload: CategoryUpdate) =>
    update<Category>("categories", id, payload as unknown as Record<string, unknown>),

  delete: (id: string) => remove("categories", id),
};

// ─── Gallery Service ──────────────────────────────────────────────────────────

export const galleryService = {
  getAll: (options?: QueryOptions) =>
    fetchAll<GalleryItem>("gallery", { orderBy: "sort_order", orderDirection: "asc", ...options }),

  getFeatured: async (): Promise<ApiResponse<GalleryItem[]>> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .eq("is_featured", true)
      .order("sort_order", { ascending: true })
      .limit(8);

    if (error) return { data: null, error: error.message, success: false };
    return { data: data as GalleryItem[], error: null, success: true };
  },

  getById: (id: string) => fetchById<GalleryItem>("gallery", id),

  create: (payload: GalleryItemInsert) =>
    create<GalleryItem>("gallery", payload as unknown as Record<string, unknown>),

  update: (id: string, payload: GalleryItemUpdate) =>
    update<GalleryItem>("gallery", id, payload as unknown as Record<string, unknown>),

  delete: (id: string) => remove("gallery", id),

  deleteBatch: (ids: string[]) => removeBatch("gallery", ids),
};

// ─── Testimonial Service ──────────────────────────────────────────────────────

export const testimonialService = {
  getAll: (options?: QueryOptions) =>
    fetchAll<Testimonial>("testimonials", { searchColumn: "name", ...options }),

  getApproved: async (): Promise<ApiResponse<Testimonial[]>> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_approved", true)
      .order("sort_order", { ascending: true });

    if (error) return { data: null, error: error.message, success: false };
    return { data: data as Testimonial[], error: null, success: true };
  },

  getFeatured: async (): Promise<ApiResponse<Testimonial[]>> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_featured", true)
      .eq("is_approved", true)
      .order("sort_order", { ascending: true })
      .limit(4);

    if (error) return { data: null, error: error.message, success: false };
    return { data: data as Testimonial[], error: null, success: true };
  },

  getById: (id: string) => fetchById<Testimonial>("testimonials", id),

  create: (payload: TestimonialInsert) =>
    create<Testimonial>("testimonials", payload as unknown as Record<string, unknown>),

  update: (id: string, payload: TestimonialUpdate) =>
    update<Testimonial>("testimonials", id, payload as unknown as Record<string, unknown>),

  delete: (id: string) => remove("testimonials", id),
};

// ─── Settings Service ─────────────────────────────────────────────────────────

export const settingsService = {
  getAll: (options?: QueryOptions) =>
    fetchAll<Setting>("settings", { orderBy: "group", orderDirection: "asc", ...options }),

  getByGroup: async (group: string): Promise<ApiResponse<Setting[]>> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("group", group)
      .order("key", { ascending: true });

    if (error) return { data: null, error: error.message, success: false };
    return { data: data as Setting[], error: null, success: true };
  },

  getByKey: async (key: string): Promise<ApiResponse<Setting>> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("key", key)
      .single();

    if (error) return { data: null, error: error.message, success: false };
    return { data: data as Setting, error: null, success: true };
  },

  upsert: async (payload: SettingInsert): Promise<ApiResponse<Setting>> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("settings")
      .upsert(payload, { onConflict: "key" })
      .select()
      .single();

    if (error) return { data: null, error: error.message, success: false };
    return { data: data as Setting, error: null, success: true };
  },

  update: (id: string, payload: SettingUpdate) =>
    update<Setting>("settings", id, payload as unknown as Record<string, unknown>),
};

// ─── Featured Section Service ─────────────────────────────────────────────────

export const featuredSectionService = {
  getAll: (options?: QueryOptions) =>
    fetchAll<FeaturedSection>("featured_sections", {
      orderBy: "sort_order",
      orderDirection: "asc",
      ...options,
    }),

  getByKey: async (sectionKey: string): Promise<ApiResponse<FeaturedSection>> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("featured_sections")
      .select("*")
      .eq("section_key", sectionKey)
      .single();

    if (error) return { data: null, error: error.message, success: false };
    return { data: data as FeaturedSection, error: null, success: true };
  },

  getActive: async (): Promise<ApiResponse<FeaturedSection[]>> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("featured_sections")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) return { data: null, error: error.message, success: false };
    return { data: data as FeaturedSection[], error: null, success: true };
  },

  create: (payload: FeaturedSectionInsert) =>
    create<FeaturedSection>("featured_sections", payload as unknown as Record<string, unknown>),

  update: (id: string, payload: FeaturedSectionUpdate) =>
    update<FeaturedSection>("featured_sections", id, payload as unknown as Record<string, unknown>),

  delete: (id: string) => remove("featured_sections", id),
};

// ─── Activity Log Service ─────────────────────────────────────────────────────

export const activityLogService = {
  getAll: (options?: QueryOptions) =>
    fetchAll<ActivityLog>("activity_logs", { ...options }),

  getRecent: async (limit = 10): Promise<ApiResponse<ActivityLog[]>> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return { data: null, error: error.message, success: false };
    return { data: data as ActivityLog[], error: null, success: true };
  },

  log: async (payload: ActivityLogInsert): Promise<ApiResponse<ActivityLog>> => {
    return create<ActivityLog>("activity_logs", payload as unknown as Record<string, unknown>);
  },
};

// ─── Upload Service ───────────────────────────────────────────────────────────

export const uploadService = {
  getAll: (options?: QueryOptions) =>
    fetchAll<Upload>("uploads", { ...options }),

  getByBucket: async (bucket: string): Promise<ApiResponse<Upload[]>> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("uploads")
      .select("*")
      .eq("bucket", bucket)
      .order("created_at", { ascending: false });

    if (error) return { data: null, error: error.message, success: false };
    return { data: data as Upload[], error: null, success: true };
  },

  create: (payload: UploadInsert) =>
    create<Upload>("uploads", payload as unknown as Record<string, unknown>),

  delete: async (id: string, filePath: string, bucket: string): Promise<ApiResponse<null>> => {
    const supabase = createClient();

    // Delete from storage
    const { error: storageError } = await supabase.storage.from(bucket).remove([filePath]);
    if (storageError) {
      return { data: null, error: storageError.message, success: false };
    }

    // Delete record
    return remove("uploads", id);
  },

  deleteBatch: async (
    items: { id: string; file_path: string; bucket: string }[]
  ): Promise<ApiResponse<null>> => {
    const supabase = createClient();

    // Group by bucket for efficient deletion
    const bucketGroups = items.reduce(
      (acc, item) => {
        if (!acc[item.bucket]) acc[item.bucket] = [];
        acc[item.bucket].push(item.file_path);
        return acc;
      },
      {} as Record<string, string[]>
    );

    // Delete from storage
    for (const [bucket, paths] of Object.entries(bucketGroups)) {
      const { error } = await supabase.storage.from(bucket).remove(paths);
      if (error) return { data: null, error: error.message, success: false };
    }

    // Delete records
    const ids = items.map((i) => i.id);
    return removeBatch("uploads", ids);
  },
};

// ─── FAQ Service ──────────────────────────────────────────────────────────────

export const faqService = {
  getAll: (options?: QueryOptions) =>
    fetchAll<Faq>("faqs", { orderBy: "sort_order", orderDirection: "asc", ...options }),

  getActive: async (): Promise<ApiResponse<Faq[]>> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) return { data: null, error: error.message, success: false };
    return { data: data as Faq[], error: null, success: true };
  },

  getById: (id: string) => fetchById<Faq>("faqs", id),

  create: (payload: FaqInsert) =>
    create<Faq>("faqs", payload as unknown as Record<string, unknown>),

  update: (id: string, payload: FaqUpdate) =>
    update<Faq>("faqs", id, payload as unknown as Record<string, unknown>),

  delete: (id: string) => remove("faqs", id),
};
