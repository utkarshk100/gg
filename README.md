# PostFlow

An AI-powered LinkedIn content assistant. Type a one-line idea and PostFlow writes three polished LinkedIn drafts in **your** voice. It can also borrow the structure (not the words) of creators you admire.

PostFlow never connects to your LinkedIn account and never posts anything. It only writes text for you to copy and post yourself.

## Stack

| Layer    | Tech |
| -------- | ---- |
| Frontend | React 19 + TypeScript + Tailwind CSS v4, bundled by Vite (`src/`) |
| Backend  | [Hono](https://hono.dev) API running on **Cloudflare Workers** (`server/`) |
| Database | **Cloudflare D1** (SQLite-based), queried with [Kysely](https://kysely.dev) |
| Auth     | Email/password (PBKDF2 via Web Crypto), a signed JWT in an httpOnly session cookie |
| AI       | Anthropic Claude API (`@anthropic-ai/sdk`), called only from the Worker |
| Hosting  | One Cloudflare Worker serves both the React build and `/api/*` |

## Local setup

**Requirements:** Node.js 20 or newer (22 LTS recommended) and npm. You don't need a Cloudflare account to run locally.

```bash
npm install
```

### 1. Add your local secrets

```bash
cp .dev.vars.example .dev.vars
```

Open `.dev.vars` and set:

```dotenv
ANTHROPIC_API_KEY=sk-ant-...your key...
JWT_SECRET=paste-a-long-random-string-here
```

To generate a `JWT_SECRET`, run:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`.dev.vars` is gitignored. The key is only used by the Worker and is never sent to the browser.

### 2. Create the local database

```bash
npm run db:migrate
```

This applies the SQL files in `migrations/` to a local D1 database stored in `.wrangler/`.

### 3. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000 and create an account. Vite serves the React app and runs the API Worker in Cloudflare's local runtime, so `/api` works from the same address.

### Other scripts

| Command | What it does |
| ------- | ------------ |
| `npm run lint` | Type-checks the frontend and the Worker |
| `npm run build` | Builds the React app and the Worker into `dist/` |
| `npm run preview` | Builds, then serves the production build locally |
| `npm run deploy` | Builds and deploys to Cloudflare |
| `npm run db:migrate:remote` | Applies migrations to the production D1 database |

## Project layout

```
server/
  index.ts            Hono app for /api/*, error handling
  env.ts              Worker bindings and secrets
  auth.ts             Password hashing, session cookie, auth + rate-limit middleware
  db/                 Kysely + D1 setup, batch helper, table types
  ai/                 Claude client + prompt builders
  routes/             auth, profile, voice samples/profile, inspirations, generate, drafts
migrations/           D1 schema (SQL), applied with wrangler
src/
  pages/              Auth, Onboarding, Dashboard, Results, Inspiration Library, Voice Profile
  components/         App shell, UI primitives, LinkedIn post card, inspiration manager
  context/            Auth + toast providers
  lib/                API client, types, constants
wrangler.jsonc        Worker config: static assets, D1 binding, rate limits
```

## API

| Method | Path | Notes |
| ------ | ---- | ----- |
| POST | `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout` | Sets or clears the session cookie. Signup and login are limited to 10 per minute per IP |
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
| POST | `/api/generate` | `{ one_liner, selected_modes?, regenerate_single_mode?, inspiration_id?, replace_draft_id? }`. AI calls are limited to 10 per minute per user |
| PATCH | `/api/drafts/:id/status` | `{ status: "copied" \| "discarded", post_text? }` |
| PATCH | `/api/drafts/:id` | Saves an edited `post_text` |
| POST | `/api/drafts/discard` | Bulk-discards uncopied drafts when you leave the results screen |
| GET | `/api/drafts/recent`, `/api/drafts/stats` | Dashboard list and the 7-day count |

### How generation works

- You pick **one** style chip on the Dashboard. Your pick comes first in the results, followed by the next two styles in the list (Punchy → Storytelling → Listicle → Contrarian). You always get three different takes.
- The prompt is built from your profile, content pillars, writing samples and cached style traits, plus the samples of the inspiration you selected (if any). If you have no writing samples yet, it falls back to a neutral professional tone.
- Claude must return JSON. The server parses and validates it, and retries once if the JSON is malformed. Each variant is saved as a `drafts` row with status `generated`. Suggested hashtags are appended to the post text.
- **Copy Text** marks a draft `copied`. **Regenerate** marks the old version `discarded`. When you leave the results screen, any draft you didn't copy is marked `discarded`. A copied draft is never downgraded.

## Deploying to Cloudflare

Everything runs on one Cloudflare Worker: it serves the React build and handles `/api/*`, with D1 as the database. Deploying needs a free Cloudflare account. The **Workers Paid plan ($5/month) is recommended**: the free plan allows only 10 ms of CPU per request, which signups (password hashing) can exceed.

### 1. Log in

```bash
npx wrangler login
```

### 2. Database

The production D1 database `postflow` already exists on the account and its tables are created; its id is in `wrangler.jsonc`. To deploy to a **different** Cloudflare account instead, run `npx wrangler d1 create postflow`, put the printed `database_id` into `wrangler.jsonc`, and run `npm run db:migrate:remote`.

### 3. Set the secrets

```bash
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put JWT_SECRET
```

Each command asks you to paste the value. Use a different `JWT_SECRET` from your local one.

### 4. Deploy

```bash
npm run deploy
```

Wrangler prints the live address, for example `https://postflow.<your-subdomain>.workers.dev`. Open it and sign up.

To redeploy after changes, run `npm run deploy` again. When you add a new file to `migrations/`, run `npm run db:migrate:remote` before deploying.

**Optional: deploy on every push.** In the Cloudflare dashboard, open **Workers & Pages → postflow → Settings → Build** and connect the GitHub repository. Set the build command to `npm run build` and the deploy command to `npx wrangler deploy`.

### Adding your own domain later

1. Buy a domain. Buying it from **Cloudflare Registrar** (dashboard → **Domain Registration**) is simplest because its DNS is already on Cloudflare. A domain from another registrar works too, once you add it to Cloudflare and switch its nameservers.
2. In the dashboard, open **Workers & Pages → postflow → Settings → Domains & Routes → Add → Custom domain**, and enter e.g. `app.yourdomain.com` or `yourdomain.com`.
3. Cloudflare creates the DNS record and HTTPS certificate automatically. Nothing in the code needs to change.
