# Deployment

This project is split as:

- Render: Node/Express API from `server/index.js`
- Vercel: Vite React frontend from `src/`

## Render backend

Create or update a Render Web Service from this repository.

Use these settings:

- Runtime: Node
- Build command: `npm ci --include=dev && npm run build`
- Start command: `npm run start`
- Health check path: `/api/health`

Required environment variables:

- `NODE_VERSION=22`
- `NODE_ENV=production`
- `DATABASE_URL`
- `JWT_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `VITE_API_BASE_URL=`

Use `.env.render.example` as the checklist for Render. The Neon database value should use this host:

```text
ep-billowing-poetry-aq4d1xzh-pooler.c-8.us-east-1.aws.neon.tech
```

Keep the full database URL in Render's Environment tab. Do not commit the real password to this repository.

After the first deploy, run the schema once from Render Shell:

```sh
node server/apply-schema.mjs
```

Then verify:

```sh
curl https://YOUR-RENDER-SERVICE.onrender.com/api/health
```

Expected response:

```json
{"ok":true,"databaseReady":true}
```

## Vercel frontend

Use these settings:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

Set this Vercel environment variable, also saved locally in `.env.vercel`:

- `VITE_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com`

For the current Render service name, use:

- `VITE_API_BASE_URL=https://lisacademy-api.onrender.com`

The current `vercel.json` also rewrites `/api/*` to `https://lisacademy-api.onrender.com`, so the frontend can work either through this environment variable or through the rewrite.

After deploying Vercel, test the frontend from the browser. If you are using the `vercel.json` rewrite instead of `VITE_API_BASE_URL`, you can also test:

```sh
curl https://YOUR-VERCEL-SITE.vercel.app/api/health
```

or open the site and test member/admin login.
