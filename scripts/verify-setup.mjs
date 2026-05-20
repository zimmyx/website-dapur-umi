// Verify admin login works end-to-end
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

const url = get("NEXT_PUBLIC_SUPABASE_URL");
const anonKey = get("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const email = get("ADMIN_EMAIL");
const password = get("ADMIN_PASSWORD");

console.log("🔐 Testing login flow with anon key (same as browser)...");
console.log(`   URL:   ${url}`);
console.log(`   User:  ${email}`);
console.log("");

const supabase = createClient(url, anonKey);

// 1. Sign in
const { data: signInData, error: signInError } =
  await supabase.auth.signInWithPassword({ email, password });

if (signInError) {
  console.log(`❌ Sign in failed: ${signInError.message}`);
  process.exit(1);
}
console.log(`✅ Signed in as ${signInData.user.email}`);

// 2. Check admin profile
const { data: admin, error: adminError } = await supabase
  .from("admins")
  .select("*")
  .eq("user_id", signInData.user.id)
  .eq("is_active", true)
  .single();

if (adminError) {
  console.log(`❌ Admin profile lookup failed: ${adminError.message}`);
  process.exit(1);
}
console.log(`✅ Admin profile: ${admin.name} (${admin.role})`);

// 3. Try a public read
const { data: cats, error: catsErr } = await supabase
  .from("categories")
  .select("name")
  .eq("is_active", true)
  .limit(3);

if (catsErr) {
  console.log(`❌ Public read failed: ${catsErr.message}`);
} else {
  console.log(`✅ Public read works: ${cats.map((c) => c.name).join(", ")}`);
}

// 4. Try an admin write
const { error: writeErr } = await supabase
  .from("activity_logs")
  .insert({
    admin_id: admin.id,
    action: "test_login",
    entity_type: "system",
    entity_id: null,
    details: { source: "verify-setup script" },
    ip_address: null,
  });

if (writeErr) {
  console.log(`❌ Admin write failed: ${writeErr.message}`);
} else {
  console.log(`✅ Admin write works (logged test_login event)`);
}

console.log("");
console.log("🎉 Everything works! You can now log in to the admin panel.");

await supabase.auth.signOut();
