# Lift Calc

A dark-themed weightlifting companion for tracking lifts, calculating training percentages, and visualizing progress.

## Stack

React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui, Supabase (auth, database, edge functions), Recharts. All weights are in kilograms.

## Getting started

```bash
npm install
cp .env.example .env   # fill in your Supabase project URL + anon key
npm run dev
```

## Supabase setup

1. Create a Supabase project.
2. Apply the schema: `supabase db push` (or run `supabase/migrations/*.sql` directly in the SQL editor).
3. Deploy the edge function: `supabase functions deploy extract-workout-from-image`.
4. Set the `LOVABLE_API_KEY` secret for the edge function (used to call the AI gateway for photo scanning).

## Guest mode

Without signing in, visitors can use the Calculator and Plates tabs, with state persisted locally in the browser. Signing up unlocks Log Workout, History, and Settings, all backed by Supabase with row-level security.
