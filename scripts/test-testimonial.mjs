// Diagnose testimonial RLS issue
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
const get = (k) => {
  const m = env.match(new RegExp(`^${k}=(.+)$`, "m"));
  return m ? m[1].trim() : null;
};

const supabase = createClient(
  get("NEXT_PUBLIC_SUPABASE_URL"),
  get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
);

// Sign in as admin
await supabase.auth.signInWithPassword({
  email: get("ADMIN_EMAIL"),
  password: get("ADMIN_PASSWORD"),
});

console.log("Trying to insert testimonial...");
const { data, error } = await supabase
  .from("testimonials")
  .insert({
    name: "Test User",
    role: "Pelanggan",
    avatar_url: null,
    content: "Test content",
    rating: 5,
    is_featured: false,
    is_approved: true,
    sort_order: 0,
  })
  .select();

if (error) {
  console.log("ERROR:", JSON.stringify(error, null, 2));
} else {
  console.log("SUCCESS:", data);
  // Cleanup
  if (data && data[0]) {
    await supabase.from("testimonials").delete().eq("id", data[0].id);
  }
}

await supabase.auth.signOut();
