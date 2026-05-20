// ─── Supabase Auto-Setup Script ───────────────────────────────────────────────
// One-shot setup: runs schema, creates storage buckets + policies, creates
// the first admin user, and links them in the admins table.
//
// Usage:
//   node scripts/setup-supabase.mjs
//
// Reads from .env.local:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY    (REQUIRED — service role, never expose)
//   ADMIN_EMAIL
//   ADMIN_PASSWORD
//   ADMIN_NAME
//
// Idempotent: safe to re-run.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

// ─── Load .env.local ──────────────────────────────────────────────────────────

function loadEnvLocal() {
  const envPath = join(projectRoot, ".env.local");
  if (!existsSync(envPath)) {
    console.error("❌ .env.local not found");
    process.exit(1);
  }
  const content = readFileSync(envPath, "utf8");
  const env = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = loadEnvLocal();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = env.ADMIN_EMAIL || "admin@dapurumi.com";
const ADMIN_PASSWORD = env.ADMIN_PASSWORD || "ChangeMe123!";
const ADMIN_NAME = env.ADMIN_NAME || "Admin";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "❌ NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(emoji, msg) {
  console.log(`${emoji} ${msg}`);
}

async function execSql(sql) {
  // Supabase doesn't expose a direct "run arbitrary SQL" REST endpoint via
  // the JS client. The trick: use the pg-meta endpoint via fetch with the
  // service role key. This endpoint exists on every Supabase project.
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql }),
  });
  if (res.status === 404) {
    // exec_sql RPC not installed — fall back to using direct REST for SQL
    return { ok: false, status: 404, error: "exec_sql RPC not found" };
  }
  if (!res.ok) {
    const txt = await res.text();
    return { ok: false, status: res.status, error: txt };
  }
  return { ok: true };
}

// ─── Step 1: Run Schema ───────────────────────────────────────────────────────

async function runSchema() {
  log("📜", "Running database schema...");

  const schemaPath = join(projectRoot, "supabase", "schema.sql");
  const schemaSql = readFileSync(schemaPath, "utf8");

  // Try via exec_sql RPC first
  const rpcResult = await execSql(schemaSql);
  if (rpcResult.ok) {
    log("✅", "Schema applied via RPC");
    return true;
  }

  // Fallback: use the SQL endpoint that comes with Supabase Studio
  // (database/query). This is the actual endpoint Studio's SQL Editor uses.
  log("ℹ️", "RPC unavailable, trying direct SQL endpoint...");

  // Project ref is the subdomain of SUPABASE_URL
  const ref = new URL(SUPABASE_URL).hostname.split(".")[0];

  // Note: this endpoint requires the management API token, not service role.
  // We'll fall back to instructing the user.
  console.log("");
  console.log(
    "⚠️  Cannot run raw SQL via service role key alone (Supabase limitation)."
  );
  console.log(
    "   Please run the schema manually — it's a one-time, 5-second copy-paste:"
  );
  console.log("");
  console.log(
    `   1. Open: https://supabase.com/dashboard/project/${ref}/sql/new`
  );
  console.log(`   2. Copy ALL contents of: supabase/schema.sql`);
  console.log(`   3. Paste into SQL Editor and click Run`);
  console.log("");
  console.log(
    "   After that, re-run this script to create buckets + admin user."
  );
  console.log("");
  return false;
}

// ─── Step 2: Verify Schema Applied ────────────────────────────────────────────

async function verifySchema() {
  const { error } = await supabase
    .from("admins")
    .select("id", { count: "exact", head: true });

  if (error) {
    log("⚠️", `Schema not applied yet: ${error.message}`);
    return false;
  }
  log("✅", "Schema verified (tables exist)");
  return true;
}

// ─── Step 3: Create Storage Buckets ───────────────────────────────────────────

const BUCKETS = [
  "product-images",
  "gallery-images",
  "hero-images",
  "testimonial-images",
  "branding-assets",
  "cms-assets",
];

async function createBuckets() {
  log("🪣", "Creating storage buckets...");

  for (const name of BUCKETS) {
    const { error } = await supabase.storage.createBucket(name, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
    });

    if (error) {
      if (
        error.message.includes("already exists") ||
        error.message.includes("Duplicate")
      ) {
        log("  ✓", `${name} (exists)`);
      } else {
        log("  ✗", `${name}: ${error.message}`);
      }
    } else {
      log("  +", `${name} (created)`);
    }
  }
}

// ─── Step 4: Storage Policies ─────────────────────────────────────────────────

async function setupStoragePolicies() {
  log("🔒", "Storage policies require manual SQL setup (one-time).");
  console.log("");
  console.log("   Run this in Supabase SQL Editor (https://supabase.com/dashboard):");
  console.log("");
  console.log(`   -- Public read access on all buckets`);
  console.log(`   DROP POLICY IF EXISTS "Public read all buckets" ON storage.objects;`);
  console.log(`   CREATE POLICY "Public read all buckets" ON storage.objects`);
  console.log(`     FOR SELECT USING (bucket_id IN (`);
  console.log(`       'product-images', 'gallery-images', 'hero-images',`);
  console.log(`       'testimonial-images', 'branding-assets', 'cms-assets'`);
  console.log(`     ));`);
  console.log(``);
  console.log(`   -- Admins can upload`);
  console.log(`   DROP POLICY IF EXISTS "Admins can upload" ON storage.objects;`);
  console.log(`   CREATE POLICY "Admins can upload" ON storage.objects`);
  console.log(`     FOR INSERT WITH CHECK (`);
  console.log(`       EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid() AND is_active = true)`);
  console.log(`     );`);
  console.log(``);
  console.log(`   -- Admins can delete`);
  console.log(`   DROP POLICY IF EXISTS "Admins can delete" ON storage.objects;`);
  console.log(`   CREATE POLICY "Admins can delete" ON storage.objects`);
  console.log(`     FOR DELETE USING (`);
  console.log(`       EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid() AND is_active = true)`);
  console.log(`     );`);
  console.log("");
}

// ─── Step 5: Create Admin User ────────────────────────────────────────────────

async function createAdminUser() {
  log("👤", `Setting up admin user: ${ADMIN_EMAIL}`);

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users.find((u) => u.email === ADMIN_EMAIL);

  let userId;
  if (existing) {
    log("  ✓", `Auth user already exists (${existing.id})`);
    userId = existing.id;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });

    if (error) {
      log("  ✗", `Failed to create user: ${error.message}`);
      return false;
    }
    userId = data.user.id;
    log("  +", `Auth user created (${userId})`);
  }

  // Check / insert admin profile
  const { data: existingAdmin } = await supabase
    .from("admins")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingAdmin) {
    log("  ✓", `Admin profile already exists`);
  } else {
    const { error } = await supabase.from("admins").insert({
      user_id: userId,
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: "super_admin",
      is_active: true,
    });

    if (error) {
      log("  ✗", `Failed to insert admin profile: ${error.message}`);
      return false;
    }
    log("  +", `Admin profile created`);
  }

  console.log("");
  log("🔑", "Admin credentials:");
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log("");
  return true;
}

// ─── Run ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("");
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Dapur Umi — Supabase Auto-Setup");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log(`  URL: ${SUPABASE_URL}`);
  console.log("");

  const schemaApplied = await verifySchema();

  if (!schemaApplied) {
    await runSchema();
    console.log("");
    console.log(
      "Stopping here. Apply the schema manually, then re-run this script."
    );
    process.exit(1);
  }

  console.log("");
  await createBuckets();

  console.log("");
  await setupStoragePolicies();

  console.log("");
  const adminOk = await createAdminUser();

  if (!adminOk) {
    process.exit(1);
  }

  console.log("");
  console.log("═══════════════════════════════════════════════════════");
  console.log("  ✅ Setup complete!");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log("  Next steps:");
  console.log("  1. Apply storage policies SQL (shown above) in SQL Editor");
  console.log("  2. Run: npm run dev");
  console.log("  3. Open: http://localhost:3000/admin/login");
  console.log("");
}

main().catch((err) => {
  console.error("");
  console.error("❌ Setup failed:", err);
  process.exit(1);
});
