"use server";

import { revalidatePath } from "next/cache";

/**
 * Revalidates the public marketing site so admin edits show up immediately
 * instead of waiting for the 60s ISR window.
 *
 * Called from client components via `await revalidatePublicSite()`.
 */
export async function revalidatePublicSite() {
  revalidatePath("/");
}
