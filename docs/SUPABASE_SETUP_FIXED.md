# Supabase setup and applying migrations

This document explains how to apply the schema health-check migration and run a local health check.

Prerequisites

- Node.js (>=16)
- Supabase CLI (optional but recommended) — <https://supabase.com/docs/guides/cli>
- Your Supabase project URL and anon key

1. Add environment variables

Create a `.env` in the project root with the following values (replace placeholders):

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Optional runtime env
SUPABASE_URL=$VITE_SUPABASE_URL
SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
```

2. Apply migrations using Supabase CLI (recommended)

```bash
# start local supabase DB (if using local stack)
npx supabase start

# push the SQL migrations in supabase/migrations to your project
npx supabase db push

# alternatively, open Supabase web console and paste the SQL in the SQL editor
```

3. Run the local health-check script (TypeScript)

Install ts-node if you don't have it:

```bash
npm install -D ts-node typescript @types/node
```

Then run:

```bash
npx ts-node src/tools/checkSupabaseHealth.ts
```

You should see:

- `RPC result: true`
- One or more rows from `public.health_check`

4. Troubleshooting

- If the RPC returns an error about the function missing, ensure the migration SQL was applied.
- If the `health_check` select fails, confirm the table exists.
- If using CI or GitHub Actions, store `SUPABASE_URL` and `SUPABASE_ANON_KEY` as repository secrets.

5. Next steps (optional)

- Add a GitHub Action to run `npx ts-node src/tools/checkSupabaseHealth.ts` on PRs (requires secrets).
- Add an endpoint in your backend to call `public.check_schema_health()` and report status on a `/health` route.
