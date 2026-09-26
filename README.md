# PostFlow

An AI-powered LinkedIn content assistant. Type a one-line idea and PostFlow writes three polished LinkedIn drafts in **your** voice. It can also borrow the structure (not the words) of creators you admire.

PostFlow never connects to your LinkedIn account and never posts anything. It only writes text for you to copy and post yourself.

## Stack

| Layer    | Tech |
| -------- | ---- |
| Frontend | React 19 + TypeScript + Tailwind CSS v4, bundled by Vite (`src/`) |
| Backend  | Node.js + Express, run with `tsx` (`server/`) |
| Database | SQLite (`better-sqlite3`) through the [Kysely](https://kysely.dev) query builder |
| Auth     | Email/password (bcrypt), a JWT in an httpOnly session cookie |
| AI       | Anthropic Claude API (`@anthropic-ai/sdk`), called only from the backend |

## Local setup

**Requirements:** Node.js 20 or newer (22 LTS recommended) and npm.

```bash
npm install
```

### 1. Create your `.env` file

Copy the example file and fill it in:

```bash
cp .env.example .env
```

Then open `.env` in your editor and set:

```dotenv
ANTHROPIC_API_KEY=sk-ant-...your key...
JWT_SECRET=paste-a-long-random-string-here
```

To generate a `JWT_SECRET`, run:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`.env` is gitignored. The key is read on the server only and is never sent to the browser.

Optional settings: `ANTHROPIC_MODEL` (default `claude-sonnet-4-5`), `PORT` (API port, default `3001`) and `DATABASE_FILE` (default `./data/postflow.db`).

### 2. Set up the database

```bash
npm run db:migrate
```

This creates `data/postflow.db` and applies every migration. The API server also runs pending migrations when it starts, so this step is safe to repeat.

### 3. Start the dev server

```bash
npm run dev
```

This starts two processes:

- **Web:** http://localhost:3000 (Vite with hot reload; open this one)
- **API:** http://localhost:3001 (Express; Vite proxies `/api/*` to it)

Create an account at http://localhost:3000/signup and go through the onboarding.

### Other scripts

| Command | What it does |
| ------- | ------------ |
| `npm run lint` | Type-checks the frontend and the backend |
| `npm run build` | Builds the frontend into `dist/` |
| `npm start` | Runs the API in production mode and serves `dist/` from the same port (needs `JWT_SECRET`) |

## Project layout

```
server/
  index.ts            Express app, rate limits, error handler
  env.ts              Environment config
  auth.ts             JWT session cookie + requireAuth middleware
  db/                 Kysely instance, schema types, migrations
  ai/                 Claude client + prompt builders
  routes/             auth, profile, voice samples/profile, inspirations, generate, drafts
src/
  pages/              Auth, Onboarding, Dashboard, Results, Inspiration Library, Voice Profile
  components/         App shell, UI primitives, LinkedIn post card, inspiration manager
  context/            Auth + toast providers
  lib/                API client, types, constants
```

## API

| Method | Path | Notes |
| ------ | ---- | ----- |
| POST | `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout` | Sets or clears the session cookie |
| GET | `/api/auth/me` | Current user |
| GET/PUT | `/api/profile` | Name, role, industry, content pillars, onboarding flag |
| GET/POST | `/api/voice-samples` | Up to 5 samples |
| PUT/DELETE | `/api/voice-samples/:id` | |
| GET | `/api/voice-profile` | Cached style traits, plus `is_stale` when samples changed since the last analysis |
| POST | `/api/voice-profile/analyze` | Calls Claude and caches the extracted style traits |
| GET/POST | `/api/inspirations` | Up to 3 creators, each with its samples |
| PUT/DELETE | `/api/inspirations/:id` | PUT replaces the name and all samples |
| GET/POST | `/api/inspirations/:id/samples` | Up to 3 samples per creator |
| DELETE | `/api/inspirations/:id/samples/:sampleId` | |
| POST | `/api/generate` | `{ one_liner, selected_modes?, regenerate_single_mode?, inspiration_id?, replace_draft_id? }` |
| PATCH | `/api/drafts/:id/status` | `{ status: "copied" \| "discarded", post_text? }` |
| PATCH | `/api/drafts/:id` | Saves an edited `post_text` |
| POST | `/api/drafts/discard` | Bulk-discards uncopied drafts when you leave the results screen |
| GET | `/api/drafts/recent`, `/api/drafts/stats` | Dashboard list and the 7-day count |

### How generation works

- You pick **one** style chip on the Dashboard. Your pick comes first in the results, followed by the next two styles in the list (Punchy → Storytelling → Listicle → Contrarian). You always get three different takes.
- The prompt is built from your profile, content pillars, writing samples and cached style traits, plus the samples of the inspiration you selected (if any). If you have no writing samples yet, it falls back to a neutral professional tone.
- Claude must return JSON. The server parses and validates it, and retries once if the JSON is malformed. Each variant is saved as a `drafts` row with status `generated`. Suggested hashtags are appended to the post text.
- **Copy Text** marks a draft `copied`. **Regenerate** marks the old version `discarded`. When you leave the results screen, any draft you didn't copy is marked `discarded`. A copied draft is never downgraded.

## Deploying with your own domain

PostFlow runs as one Node.js server that serves both the API and the built frontend. Because the database is a SQLite file, the host must provide **permanent disk storage**. Serverless hosts like Vercel and Netlify don't keep files between runs, so they are not a good fit. The steps below use [Render](https://render.com); Railway works the same way with a "Volume" in place of a Disk.

### 1. Create the web service

1. Sign in to Render with GitHub and click **New → Web Service**.
2. Choose the `gg` repository and the branch to deploy (usually `main`).
3. Fill in:
   - **Runtime:** Node
   - **Build command:** `npm ci --include=dev && npm run build`
   - **Start command:** `npm start`
4. Choose a paid instance type. The free tier has no permanent disk, so the database would be erased on every restart.

### 2. Add a disk for the database

In the service's **Disks** section, add a disk:

- **Mount path:** `/var/data`
- **Size:** 1 GB is plenty to start

### 3. Set environment variables

Under **Environment**, add:

| Key | Value |
| --- | ----- |
| `ANTHROPIC_API_KEY` | your Anthropic API key |
| `JWT_SECRET` | a long random string (see [Create your `.env` file](#1-create-your-env-file)) |
| `DATABASE_FILE` | `/var/data/postflow.db` |

Don't set `NODE_ENV`: `npm start` sets it to `production` itself, and setting it during the build would skip the build tools. Render provides `PORT` automatically.

Click **Deploy**. When the log shows `API listening`, the app is live at an address like `https://postflow.onrender.com`. The database tables are created on first start.

### 4. Connect your domain

1. Buy a domain from any registrar (for example Cloudflare or Namecheap).
2. In Render, open the service's **Settings → Custom Domains** and add your domain, for example `app.yourdomain.com`.
3. At your registrar, add the DNS record Render shows you. For a subdomain this is a **CNAME** pointing to your `onrender.com` address. For a bare domain (`yourdomain.com`), follow Render's instructions for an `A` or `ALIAS` record.
4. Wait for DNS to update (minutes to a few hours). Render then issues an HTTPS certificate automatically.

### Updating

Every push to the deployed branch triggers a new deploy. Data in `/var/data` is kept between deploys.

## Moving to Postgres later

The queries and migrations only use portable column types and string UUID primary keys. To switch:

1. `npm install pg`.
2. In `server/db/index.ts`, replace `SqliteDialect` with `PostgresDialect({ pool: new Pool({ connectionString: process.env.DATABASE_URL }) })`.
3. Run `npm run db:migrate` against the new database.
