# Livingroom Poker

A mobile-first poker club website for daily coin entry, player rankings and player performance.

## Features

- Public daily leaderboard, sorted by final coins (highest first)
- Daily winner recognition
- Player profiles with daily coin history
- 7-day, 30-day and all-time profile filters
- Performance chart, best balance, average balance, daily wins and ranking
- Admin sign-in
- Admin player management
- Admin daily coin entry; re-saving a date updates that date
- Supabase/Postgres persistence with row-level security
- GitHub Pages deployment using GitHub Actions
- No hand history

## Stack

- React + Vite
- Supabase Auth + PostgreSQL
- GitHub Pages (hosting)
- GitHub Actions (build and deploy)

## 1. Create the Supabase database

1. Create a project at https://supabase.com.
2. Open **SQL Editor** in Supabase.
3. Copy and run the complete `supabase/schema.sql` file.
4. Open **Project Settings → API** (or **Data API**) and copy the Project URL and anon/publishable key.
5. Do not use the `service_role` / secret key in this frontend project.

## 2. Create your admin account

1. In Supabase, open **Authentication → Users** and create your admin user with your email and a strong password.
2. Copy that user's UUID.
3. In SQL Editor, run the final INSERT statement at the bottom of `supabase/schema.sql`, replacing `YOUR_AUTH_USER_UUID` with your admin user's UUID.

Only UUIDs listed in `public.admin_users` can create or edit players and daily results. Visitors can read active players and published scores.

## 3. Run locally (optional)

Install Node.js 20 or newer, then:

```bash
npm install
cp .env.example .env
```

Put your Supabase URL and anon key in `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Start the local development server:

```bash
npm run dev
```

Open the local URL Vite prints, usually http://localhost:5173.

## 4. Upload to GitHub

1. Create a new empty GitHub repository, for example `livingroom-poker`.
2. Upload the contents of this project folder to the repository root (not the enclosing folder).
3. Commit the files to the `main` branch.

Or use Git:

```bash
git init
git add .
git commit -m "Build Livingroom Poker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/livingroom-poker.git
git push -u origin main
```

Do not commit `.env`; it is excluded by `.gitignore`.

## 5. Add GitHub repository secrets

In your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

Add these two secrets exactly:

- `VITE_SUPABASE_URL` — your Supabase Project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon/publishable key

The anon key is intended for browser use when Row Level Security is correctly configured. Never add the Supabase service-role key.

## 6. Enable GitHub Pages

1. Open **Settings → Pages** in your repository.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Push to `main` (or manually run the workflow under **Actions → Deploy Livingroom Poker to GitHub Pages → Run workflow**).
4. Wait for the workflow to finish successfully.
5. Your website will be available at:

   `https://YOUR_USERNAME.github.io/REPOSITORY_NAME/`

The included `.github/workflows/deploy.yml` builds the Vite app and publishes the `dist` folder to GitHub Pages. The Vite config uses relative asset paths so it works from a repository subpath.

## Daily coin workflow

1. Sign in through **Admin**.
2. Open **Enter coins**.
3. Select the game date.
4. Enter each active player's final coin balance.
5. Save daily results.
6. The public daily leaderboard sorts that day's players from highest to lowest.

Every date is independent. Daily coin balances are never carried forward or added together. Re-saving the same date updates that date's records.

## All-time ranking

All-time ranking is based on number of daily wins. Ties are broken by best recorded daily balance, then average recorded daily balance. It is not a cumulative coin balance.

## Current scope and limitations

- Records final daily coin balances only.
- Does not calculate session profit/loss because buy-in or starting-stack values are not collected.
- Does not include hand history.
- Achievements and best-hand-of-the-week are not implemented in this first release.
- Public player pages do not require player accounts; only the admin area is authenticated.
- Supabase is still required for persistent cloud data and admin authentication. GitHub Pages hosts the website, not the database.
