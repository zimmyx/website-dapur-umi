# Dapur Umi

Premium handcrafted bakery website with admin dashboard. Built with Next.js 15, Supabase, and TailwindCSS.

## Stack

- **Next.js 15** (App Router, Server Components, ISR)
- **React 19**
- **Supabase** (Postgres + Auth + Storage + RLS)
- **TailwindCSS 4** + custom design tokens
- **Framer Motion** for animations
- **Radix UI** primitives + custom components
- **TypeScript**

## Features

### Public Site (`/`)
- Server-rendered with ISR (60s revalidation)
- Hero, About, Categories, Products, Gallery, Testimonials, FAQ, Contact, Footer
- Auto-fetches data from Supabase, falls back to placeholder content if empty
- Mobile-first responsive design
- WhatsApp ordering integration

### Admin Dashboard (`/admin`)
- Login + forgot/reset password flows
- CRUD for products, categories, gallery, testimonials, settings
- Multi-file upload to Supabase Storage with progress tracking
- File manager with bucket overview
- Activity logging on every action
- Auto-revalidates public site on every change
- Toast notifications

## Quick Start

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
npm run dev
```

Visit `http://localhost:3000`.

The site works without Supabase configured — admin actions will be no-ops and sections fall back to placeholder content.

## Setup

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full setup instructions:

1. Create Supabase project
2. Run `supabase/schema.sql`
3. Create storage buckets
4. Add storage policies
5. Create admin user
6. Configure auth redirect URLs
7. Deploy to Vercel

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Run production build locally
npm run lint     # ESLint
```

## Architecture

```
src/
├── app/                       # Next.js App Router
│   ├── page.tsx              # Public homepage (server component)
│   ├── layout.tsx            # Root layout
│   └── admin/                # Admin pages (client components)
│       ├── login/
│       ├── forgot-password/
│       ├── reset-password/
│       ├── products/
│       ├── categories/
│       ├── gallery/
│       ├── testimonials/
│       ├── uploads/
│       └── settings/
├── components/
│   ├── sections/             # Public site sections
│   ├── ui/                   # Reusable UI primitives
│   └── navbar.tsx
├── lib/
│   ├── site-data.ts          # Server-only Supabase loader
│   ├── site-settings.ts      # Shared types/helpers (client-safe)
│   ├── services.ts           # CRUD service layer
│   ├── auth.ts               # Auth wrappers
│   ├── activity.ts           # Activity logging + admin cache
│   ├── actions.ts            # Server actions (revalidation)
│   ├── storage.ts            # File upload utilities
│   └── supabase/             # SSR/client/middleware Supabase clients
├── hooks/                    # React hooks (toast, etc.)
└── types/                    # TypeScript types

supabase/
└── schema.sql                # Database schema, RLS, seed data
```

## License

Private project.
