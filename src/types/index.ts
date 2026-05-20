// ─── Database Types (Supabase) ────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: ProductInsert;
        Update: ProductUpdate;
      };
      categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
      };
      gallery: {
        Row: GalleryItem;
        Insert: GalleryItemInsert;
        Update: GalleryItemUpdate;
      };
      testimonials: {
        Row: Testimonial;
        Insert: TestimonialInsert;
        Update: TestimonialUpdate;
      };
      settings: {
        Row: Setting;
        Insert: SettingInsert;
        Update: SettingUpdate;
      };
      admins: {
        Row: Admin;
        Insert: AdminInsert;
        Update: AdminUpdate;
      };
      activity_logs: {
        Row: ActivityLog;
        Insert: ActivityLogInsert;
        Update: ActivityLogUpdate;
      };
      uploads: {
        Row: Upload;
        Insert: UploadInsert;
        Update: UploadUpdate;
      };
      featured_sections: {
        Row: FeaturedSection;
        Insert: FeaturedSectionInsert;
        Update: FeaturedSectionUpdate;
      };
      faqs: {
        Row: Faq;
        Insert: FaqInsert;
        Update: FaqUpdate;
      };
    };
  };
}

// ─── Product Types ────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  long_description: string | null;
  price: number;
  discounted_price: number | null;
  category_id: string;
  image_url: string;
  images: string[];
  tags: string[];
  is_best_seller: boolean;
  is_new: boolean;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  preparation_time: number | null;
  ingredients: string[];
  allergens: string[];
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export type ProductInsert = Omit<Product, "id" | "created_at" | "updated_at">;
export type ProductUpdate = Partial<ProductInsert>;

// ─── Category Types ───────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  name_en: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  product_count: number;
  created_at: string;
  updated_at: string;
}

export type CategoryInsert = Omit<Category, "id" | "created_at" | "updated_at" | "product_count">;
export type CategoryUpdate = Partial<CategoryInsert>;

// ─── Gallery Types ────────────────────────────────────────────────────────────

export interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  thumbnail_url: string | null;
  category: string | null;
  tags: string[];
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type GalleryItemInsert = Omit<GalleryItem, "id" | "created_at" | "updated_at">;
export type GalleryItemUpdate = Partial<GalleryItemInsert>;

// ─── Testimonial Types ────────────────────────────────────────────────────────

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  avatar_url: string | null;
  content: string;
  rating: number;
  is_featured: boolean;
  is_approved: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type TestimonialInsert = Omit<Testimonial, "id" | "created_at" | "updated_at">;
export type TestimonialUpdate = Partial<TestimonialInsert>;

// ─── Settings Types ───────────────────────────────────────────────────────────

export interface Setting {
  id: string;
  key: string;
  value: string;
  type: "string" | "number" | "boolean" | "json";
  group: string;
  label: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export type SettingInsert = Omit<Setting, "id" | "created_at" | "updated_at">;
export type SettingUpdate = Partial<SettingInsert>;

// ─── Admin Types ──────────────────────────────────────────────────────────────

export interface Admin {
  id: string;
  user_id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: "super_admin" | "admin" | "editor";
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export type AdminInsert = Omit<Admin, "id" | "created_at" | "updated_at">;
export type AdminUpdate = Partial<AdminInsert>;

// ─── Activity Log Types ───────────────────────────────────────────────────────

export interface ActivityLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export type ActivityLogInsert = Omit<ActivityLog, "id" | "created_at">;
export type ActivityLogUpdate = Partial<ActivityLogInsert>;

// ─── Upload Types ─────────────────────────────────────────────────────────────

export interface Upload {
  id: string;
  file_name: string;
  original_name: string;
  file_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  bucket: string;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  uploaded_by: string;
  created_at: string;
}

export type UploadInsert = Omit<Upload, "id" | "created_at">;
export type UploadUpdate = Partial<UploadInsert>;

// ─── Featured Section Types ───────────────────────────────────────────────────

export interface FeaturedSection {
  id: string;
  section_key: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  is_active: boolean;
  sort_order: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type FeaturedSectionInsert = Omit<FeaturedSection, "id" | "created_at" | "updated_at">;
export type FeaturedSectionUpdate = Partial<FeaturedSectionInsert>;

// ─── FAQ Types ────────────────────────────────────────────────────────────────

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type FaqInsert = Omit<Faq, "id" | "created_at" | "updated_at">;
export type FaqUpdate = Partial<FaqInsert>;

// ─── UI Component Types ───────────────────────────────────────────────────────

export interface NavLink {
  label: string;
  href: string;
  icon?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface FilterState {
  search: string;
  category: string;
  status: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  description?: string;
  data?: unknown;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: PaginationState;
  error: string | null;
  success: boolean;
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "email" | "password" | "select" | "checkbox" | "file" | "url";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

// ─── Dashboard Stats Types ────────────────────────────────────────────────────

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalGalleryItems: number;
  totalTestimonials: number;
  totalUploads: number;
  recentActivity: ActivityLog[];
}

export interface StatCard {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: string;
  color: string;
}
