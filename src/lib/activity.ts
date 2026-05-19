// ─── Admin Activity Logging Helper ────────────────────────────────────────────
// Caches the current admin's profile ID and provides a fire-and-forget
// `logActivity()` helper that admin pages call after each CRUD action.

import { createClient } from "@/lib/supabase/client";
import { activityLogService } from "@/lib/services";

let cachedAdminId: string | null = null;
let inFlight: Promise<string | null> | null = null;

async function fetchAdminId(): Promise<string | null> {
  const supabase = createClient();
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes?.user) return null;

  const { data, error } = await supabase
    .from("admins")
    .select("id")
    .eq("user_id", userRes.user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;
  return (data as { id: string }).id;
}

export async function getCurrentAdminId(): Promise<string | null> {
  if (cachedAdminId) return cachedAdminId;
  if (inFlight) return inFlight;
  inFlight = fetchAdminId().then((id) => {
    cachedAdminId = id;
    inFlight = null;
    return id;
  });
  return inFlight;
}

export function clearAdminIdCache() {
  cachedAdminId = null;
  inFlight = null;
}

// ─── Action types ─────────────────────────────────────────────────────────────

export type AdminAction =
  | "create"
  | "update"
  | "delete"
  | "upload"
  | "approve"
  | "publish";

export type AdminEntity =
  | "product"
  | "category"
  | "gallery"
  | "testimonial"
  | "setting"
  | "upload"
  | "featured_section";

interface LogPayload {
  action: AdminAction;
  entity: AdminEntity;
  entityId?: string | null;
  details?: Record<string, unknown>;
}

/**
 * Fire-and-forget activity logger. Failures are swallowed so logging never
 * breaks the calling action. Skips silently if the user isn't an admin
 * (which means RLS would reject the insert anyway).
 */
export function logActivity(payload: LogPayload): void {
  void (async () => {
    try {
      const adminId = await getCurrentAdminId();
      if (!adminId) return;

      await activityLogService.log({
        admin_id: adminId,
        action: `${payload.action}_${payload.entity}`,
        entity_type: payload.entity,
        entity_id: payload.entityId ?? null,
        details: payload.details ?? null,
        ip_address: null,
      });
    } catch {
      // Swallow — logging is non-critical
    }
  })();
}
