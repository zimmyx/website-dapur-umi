// ─── Validation Utilities ─────────────────────────────────────────────────────
// Reusable validation system for forms and API inputs

export type ValidationRule = {
  validate: (value: unknown) => boolean;
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

// ─── Core Validators ──────────────────────────────────────────────────────────

export const validators = {
  required: (message = "This field is required"): ValidationRule => ({
    validate: (value) => {
      if (typeof value === "string") return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined;
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value) => typeof value === "string" && value.trim().length >= min,
    message: message || `Minimum ${min} characters required`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value) => typeof value === "string" && value.trim().length <= max,
    message: message || `Maximum ${max} characters allowed`,
  }),

  email: (message = "Invalid email address"): ValidationRule => ({
    validate: (value) =>
      typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  phone: (message = "Invalid phone number"): ValidationRule => ({
    validate: (value) =>
      typeof value === "string" && /^[\+]?[0-9\s\-\(\)]{8,15}$/.test(value),
    message,
  }),

  url: (message = "Invalid URL"): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== "string" || value.trim() === "") return true; // optional
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  min: (min: number, message?: string): ValidationRule => ({
    validate: (value) => typeof value === "number" && value >= min,
    message: message || `Minimum value is ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule => ({
    validate: (value) => typeof value === "number" && value <= max,
    message: message || `Maximum value is ${max}`,
  }),

  positive: (message = "Must be a positive number"): ValidationRule => ({
    validate: (value) => typeof value === "number" && value > 0,
    message,
  }),

  slug: (message = "Invalid slug format"): ValidationRule => ({
    validate: (value) =>
      typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
    message,
  }),

  pattern: (regex: RegExp, message = "Invalid format"): ValidationRule => ({
    validate: (value) => typeof value === "string" && regex.test(value),
    message,
  }),

  fileSize: (maxMB: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (value instanceof File) return value.size <= maxMB * 1024 * 1024;
      return true;
    },
    message: message || `File size must be less than ${maxMB}MB`,
  }),

  fileType: (types: string[], message?: string): ValidationRule => ({
    validate: (value) => {
      if (value instanceof File) return types.includes(value.type);
      return true;
    },
    message: message || `Allowed file types: ${types.join(", ")}`,
  }),

  match: (fieldName: string, getValue: () => unknown, message?: string): ValidationRule => ({
    validate: (value) => value === getValue(),
    message: message || `Must match ${fieldName}`,
  }),
};

// ─── Validation Runner ────────────────────────────────────────────────────────

export function validate(
  data: Record<string, unknown>,
  rules: Record<string, ValidationRule[]>
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];

    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        errors[field] = rule.message;
        break; // Stop at first error for this field
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ─── Preset Validation Schemas ────────────────────────────────────────────────

export const productValidation = {
  name: [validators.required("Product name is required"), validators.maxLength(100)],
  slug: [validators.required("Slug is required"), validators.slug()],
  description: [validators.required("Description is required"), validators.maxLength(500)],
  price: [validators.required("Price is required"), validators.positive()],
  category_id: [validators.required("Category is required")],
  image_url: [validators.required("Image is required"), validators.url()],
};

export const categoryValidation = {
  name: [validators.required("Category name is required"), validators.maxLength(50)],
  slug: [validators.required("Slug is required"), validators.slug()],
};

export const testimonialValidation = {
  name: [validators.required("Name is required"), validators.maxLength(100)],
  content: [
    validators.required("Content is required"),
    validators.minLength(20, "Minimum 20 characters"),
    validators.maxLength(500),
  ],
  rating: [validators.required("Rating is required"), validators.min(1), validators.max(5)],
};

export const loginValidation = {
  email: [validators.required("Email is required"), validators.email()],
  password: [validators.required("Password is required"), validators.minLength(6)],
};

export const settingValidation = {
  key: [validators.required("Key is required"), validators.slug()],
  value: [validators.required("Value is required")],
  label: [validators.required("Label is required")],
};

// ─── Slug Generator ───────────────────────────────────────────────────────────

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

// ─── Sanitize Input ───────────────────────────────────────────────────────────

export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

export function sanitizeHtml(html: string): string {
  const allowedTags = ["b", "i", "em", "strong", "br", "p", "ul", "ol", "li"];
  const tagRegex = /<\/?([a-zA-Z]+)[^>]*>/g;

  return html.replace(tagRegex, (match, tag) => {
    if (allowedTags.includes(tag.toLowerCase())) {
      return match;
    }
    return "";
  });
}
