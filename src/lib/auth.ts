// ─── Authentication Utilities ─────────────────────────────────────────────────

import { createClient } from "@/lib/supabase/client";
import type { ApiResponse, Admin } from "@/types";

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  signIn: async (email: string, password: string): Promise<ApiResponse<{ user: unknown }>> => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: { user: data.user }, error: null, success: true };
  },

  signOut: async (): Promise<ApiResponse<null>> => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: null, error: null, success: true };
  },

  getSession: async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data.session, error: null, success: true };
  },

  getUser: async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data.user, error: null, success: true };
  },

  getAdminProfile: async (userId: string): Promise<ApiResponse<Admin>> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: data as Admin, error: null, success: true };
  },

  updateLastLogin: async (adminId: string): Promise<void> => {
    const supabase = createClient();
    await supabase
      .from("admins")
      .update({ last_login: new Date().toISOString() })
      .eq("id", adminId);
  },

  resetPassword: async (email: string): Promise<ApiResponse<null>> => {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: null, error: null, success: true, message: "Reset email sent" };
  },

  updatePassword: async (newPassword: string): Promise<ApiResponse<null>> => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data: null, error: null, success: true, message: "Password updated" };
  },

  onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
    const supabase = createClient();
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ─── Auth Guard Utility ───────────────────────────────────────────────────────

export async function requireAuth(): Promise<{
  authenticated: boolean;
  user: unknown;
  admin: Admin | null;
}> {
  const { data: user, error } = await authService.getUser();

  if (error || !user) {
    return { authenticated: false, user: null, admin: null };
  }

  const { data: admin } = await authService.getAdminProfile(
    (user as { id: string }).id
  );

  if (!admin) {
    return { authenticated: false, user, admin: null };
  }

  return { authenticated: true, user, admin };
}

// ─── Permission Helpers ───────────────────────────────────────────────────────

export function canManageProducts(admin: Admin): boolean {
  return ["super_admin", "admin", "editor"].includes(admin.role);
}

export function canManageUsers(admin: Admin): boolean {
  return ["super_admin"].includes(admin.role);
}

export function canManageSettings(admin: Admin): boolean {
  return ["super_admin", "admin"].includes(admin.role);
}

export function canDeleteContent(admin: Admin): boolean {
  return ["super_admin", "admin"].includes(admin.role);
}

export function canViewAnalytics(admin: Admin): boolean {
  return ["super_admin", "admin"].includes(admin.role);
}
