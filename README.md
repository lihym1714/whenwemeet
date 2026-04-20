# WhenWeMeet

A bilingual Korean/English availability planner inspired by When2Meet, rebuilt with a more polished interface, locale-aware routing, and a Supabase-backed server-action workflow.

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- next-intl for `/ko` and `/en`
- Supabase Postgres for events, participants, and saved availability

## Local development

1. Copy `.env.example` to `.env.local`
2. Fill in the Supabase values
3. Apply `supabase/migrations/20260420130000_initial_schema.sql` to your Supabase project
4. Run:

```bash
npm install
npm run dev
```

## Required environment variables

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## What works now

- Create an event from the landing page
- Join via share link with a display name
- Paint availability with click/drag or keyboard navigation
- Save selections to Supabase via server actions
- Switch between Korean and English routes without losing page context

## Deploying to Vercel

- Import the GitHub repository into Vercel
- Add the same environment variables from `.env.local`
- Redeploy after the Supabase schema is applied
