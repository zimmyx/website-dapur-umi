# Dapur Umi — Deployment & Setup Guide

## Prerequisites

- Supabase project (https://supabase.com)
- Vercel account (or any Node.js host)
- Node.js 20+ for local development

## 1. Local Setup

```bash
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://dapurumi.com
```

Run dev server:

```bash
npm run dev
```

The site works without Supabase configured — sections fall back to placeholder content from `src/lib/constants.ts`.

## 2. Supabase Setup (Required for Admin Features)

### 2.1 Run Database Schema

Open Supabase Dashboard → SQL Editor → paste contents of `supabase/schema.sql` → Run.

This creates:
- 9 tables (products, categories, gallery, testimonials, settings, admins, activity_logs, uploads, featured_sections)
- Indexes, triggers, and Row Level Security policies
- Seed data for default categories, settings, and featured sections

### 2.2 Create Storage Buckets

Open Supabase Dashboard → Storage → New bucket. Create these as **public**:

- `product-images`
- `gallery-images`
- `hero-images`
- `testimonial-images`
- `branding-assets`
- `cms-assets`

### 2.3 Storage Policies

In SQL Editor, run:

```sql
-- Public read access on all buckets
CREATE POLICY "Public read all buckets" ON storage.objects
  FOR SELECT USING (bucket_id IN (
    'product-images', 'gallery-images', 'hero-images',
    'testimonial-images', 'branding-assets', 'cms-assets'
  ));

-- Admins can upload
CREATE POLICY "Admins can upload" ON storage.objects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Admins can delete
CREATE POLICY "Admins can delete" ON storage.objects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );
```

### 2.4 Create First Admin

1. Supabase Dashboard → Authentication → Users → **Add user**
2. Choose "Create new user", set email + password
3. Copy the new user's UUID
4. Run in SQL Editor (replace UUID and email):

```sql
INSERT INTO admins (user_id, email, name, role, is_active)
VALUES (
  'paste-user-uuid-here',
  'admin@dapurumi.com',
  'Admin',
  'super_admin',
  true
);
```

### 2.5 Configure Auth Redirect URL

For password reset to work, add to Supabase Dashboard → Authentication → URL Configuration:

- **Site URL:** `https://dapurumi.com` (or your domain)
- **Redirect URLs:** add `https://dapurumi.com/admin/reset-password`

For local dev, also add `http://localhost:3000/admin/reset-password`.

## 3. Test Locally

```bash
npm run dev
```

- Visit `http://localhost:3000` — public site should load
- Visit `http://localhost:3000/admin/login` — log in with the admin you created
- Try adding a category → it should show up on the public homepage within 60 seconds (or instantly on hard refresh, thanks to revalidation)

## 4. Vercel Deployment

### Environment Variables (Vercel Dashboard)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://dapurumi.com
```

### Optional `vercel.json`

```json
{
  "framework": "nextjs",
  "regions": ["sin1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/(.*)\\.(jpg|jpeg|png|webp|avif|gif|svg|ico)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### Deploy

1. Push to GitHub
2. Import repository in Vercel
3. Set environment variables
4. Deploy
5. Update Supabase Auth redirect URLs to your production domain

## Post-Deployment Checklist

- [ ] Public website loads
- [ ] Admin login works
- [ ] Add a test category → appears on `/`
- [ ] Add a test product → appears on `/`
- [ ] Upload a gallery image → appears on `/`
- [ ] Add a testimonial (mark approved) → appears on `/`
- [ ] Edit settings (e.g., site name, phone) → reflected in footer
- [ ] Activity log shows entries on the dashboard
- [ ] Forgot password email arrives and reset link works
- [ ] Mobile responsive
- [ ] Lighthouse score check

## How the System Works

### Public Site (`/`)

- Server-rendered (Server Component)
- Fetches data from Supabase via `loadSiteData()` (`src/lib/site-data.ts`)
- ISR with `revalidate = 60` (refreshes every 60s)
- Falls back to constants in `src/lib/constants.ts` when Supabase is empty/unreachable

### Admin (`/admin/*`)

- Auth-protected via Supabase Auth
- All CRUD goes through `src/lib/services.ts`
- Each action logs to `activity_logs` and triggers `revalidatePath('/')` so changes appear on the public site immediately
- Image uploads go through `src/lib/storage.ts` → Supabase Storage

### Architecture

- `src/lib/site-settings.ts` — shared types (safe for client + server)
- `src/lib/site-data.ts` — server-only Supabase loader
- `src/lib/services.ts` — admin CRUD service layer
- `src/lib/auth.ts` — auth wrappers
- `src/lib/activity.ts` — admin ID cache + activity logging
- `src/lib/actions.ts` — server actions (revalidation)

## Performance Optimization

- Static pages pre-rendered where possible
- Public homepage uses ISR (60s)
- Images served via Next.js Image optimization
- Font optimization via `next/font`
- CSS purging via TailwindCSS
- Package optimization via `experimental.optimizePackageImports`

## Security

- Row Level Security (RLS) enabled on all tables
- Public can only read approved/active rows
- All write operations require active admin
- Auth middleware protects admin routes (`src/middleware.ts`)
- HTTPS enforced via Vercel
