// Quick diagnostic — what did the schema actually apply?
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

const supabase = createClient(get("NEXT_PUBLIC_SUPABASE_URL"), get("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { autoRefreshToken: false, persistSession: false },
});

const tables = ["categories", "products", "gallery", "testimonials", "settings", "admins", "uploads", "activity_logs", "featured_sections"];

console.log("Checking each table:");
for (const t of tables) {
  const { data, error, count } = await supabase.from(t).select("*", { count: "exact", head: true });
  if (error) {
    console.log(`  ❌ ${t}: ${error.message}`);
  } else {
    console.log(`  ✅ ${t}: ${count ?? 0} rows`);
  }
}

console.log("");
console.log("Trying explicit insert into admins:");
const { data: u } = await supabase.auth.admin.listUsers();
const user = u?.users.find((x) => x.email === "admin@dapurumi.com");
if (user) {
  const { data, error } = await supabase.from("admins").insert({
    user_id: user.id,
    email: "admin@dapurumi.com",
    name: "Admin",
    role: "super_admin",
    is_active: true,
  }).select();
  if (error) {
    console.log(`  ❌ Insert error: ${JSON.stringify(error)}`);
  } else {
    console.log(`  ✅ Inserted: ${JSON.stringify(data)}`);
  }
}
