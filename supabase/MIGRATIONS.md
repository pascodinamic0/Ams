# Database Migrations

The tables (`schools`, `profiles`, `students`, etc.) must be created in your Supabase database before the app works.

## Option 1: npm script (recommended)

1. Get your **database connection string** from Supabase:
   - Dashboard → **Project Settings** → **Database**
   - Under **Connection string**, select **URI**
   - Copy the connection string (use the **Transaction** pooler mode for migrations)

2. Add to `.env`:
   ```
   DATABASE_URL=postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

3. Run migrations:
   ```bash
   npm run db:migrate
   ```

## Option 2: Supabase CLI

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

When prompted, enter your database password (from Project Settings → Database).

## Option 3: Run SQL manually

1. Go to Supabase Dashboard → **SQL Editor**
2. Run each file in `supabase/migrations/` **in order** (00001 through 00007)
3. Copy the contents of each `.sql` file and execute
