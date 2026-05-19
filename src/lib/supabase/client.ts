import { createBrowserClient } from "@supabase/ssr";

const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder-key";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { url: PLACEHOLDER_URL, key: PLACEHOLDER_KEY };
  }

  try {
    new URL(url);
    return { url, key };
  } catch {
    return { url: PLACEHOLDER_URL, key: PLACEHOLDER_KEY };
  }
}

export function createClient() {
  const { url, key } = getSupabaseConfig();
  return createBrowserClient(url, key);
}
