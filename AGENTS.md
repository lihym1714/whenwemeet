# AGENTS.md

## Stack and routing
- This repo uses Next.js 16 App Router with `next-intl`; locale routes live under `src/app/[locale]/` and request routing is handled by `proxy.ts`.
- Keep `/ko` and `/en` in sync. Text lives in `messages/ko.json` and `messages/en.json`.
- Root `/` should stay a redirect to `/ko`, not a second homepage implementation.

## Data flow
- Event creation, join, and availability saves are server actions in `src/app/[locale]/actions.ts`.
- Supabase access is server-side only through `src/lib/supabase/server.ts`. The current design intentionally avoids browser-side direct writes.
- Participant identity is tracked with an HTTP-only cookie per event slug (`wm_participant_<slug>`). Preserve that pattern when changing join/edit flows.

## Scheduling model
- Grid generation and aggregation live in `src/lib/schedule.ts`. Slot IDs are UTC ISO timestamps derived from the event timezone.
- `availability_entries.slot_ids` stores an array of slot IDs; do not switch formats casually because the grid, aggregation, and save flow all depend on it.

## Supabase
- Required env vars are in `.env.example`. Runtime should degrade gracefully when they are missing, but live create/join/save must only use configured server-side keys.
- Schema source of truth is `supabase/migrations/20260420130000_initial_schema.sql`.

## Verification
- Before finishing work, run at least `npm run lint`, `npm run typecheck`, and `npm run build`.
- If you change locale routing, server actions, or the scheduling logic, re-check both `/ko` and `/en` paths.
