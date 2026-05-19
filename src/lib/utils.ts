import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("ms-MY", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function formatDateShort(dateString: string): string {
  return new Intl.DateTimeFormat("ms-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
}

export function generateOrderNumber(): string {
  const now = new Date();
  const datePart = [
    now.getFullYear().toString().slice(-2),
    (now.getMonth() + 1).toString().padStart(2, "0"),
    now.getDate().toString().padStart(2, "0"),
  ].join("");
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DU${datePart}-${randomPart}`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function getWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function getImageUrl(path: string): string {
  // Use Unsplash food images as placeholders
  // Format: /images/filename or full URL
  if (path.startsWith("http")) return path;
  return path;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Menunggu Pengesahan",
    confirmed: "Disahkan",
    preparing: "Sedang Disediakan",
    ready: "Sedia Untuk Diambil/Dihantar",
    delivering: "Sedang Dihantar",
    delivered: "Telah Diterima",
    cancelled: "Dibatalkan",
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-orange-100 text-orange-800",
    ready: "bg-green-100 text-green-800",
    delivering: "bg-purple-100 text-purple-800",
    delivered: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    pending: "⏳",
    confirmed: "✅",
    preparing: "👨‍🍳",
    ready: "📦",
    delivering: "🛵",
    delivered: "🎉",
    cancelled: "❌",
  };
  return icons[status] || "📋";
}

export function getGradientForCategory(category: string): string {
  const gradients: Record<string, string> = {
    "makanan-berat": "from-amber-500 to-orange-600",
    "lauk-pauk": "from-red-500 to-rose-600",
    "sayur-sayuran": "from-green-500 to-emerald-600",
    "sambal-dan-sos": "from-red-600 to-red-700",
    "kuih-muih": "from-pink-400 to-rose-500",
    minuman: "from-cyan-400 to-blue-500",
  };
  return gradients[category] || "from-gray-400 to-gray-500";
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
