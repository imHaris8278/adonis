# Heroku deployment (single app)

Adonis deploys as **one Heroku app**: Express API + Next.js on the same dyno/port.

## Why the GitHub deploy failed before

Heroku looked at the **repo root** and found no `package.json` / language files (only `frontend/` and `backend/`), so it could not detect a buildpack.

That is fixed with a root `package.json`, `Procfile`, and `server.js`.

## GitHub → Heroku (your setup: adonisnofrills)

1. Push this repo to GitHub (`main`).
2. In Heroku → **Settings** → **Buildpacks** → ensure **heroku/nodejs** is set (or clear and redeploy — root `package.json` auto-detects Node).
3. **Settings → Config Vars** set:

| Key | Value |
|-----|--------|
| `MONGODB_URI` | your Atlas URI (`.../adonis?...`) |
| `JWT_SECRET` | long random string |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | `https://adonisnofrills-XXXX.herokuapp.com` |
| `CLOUDINARY_CLOUD_NAME` | your cloud |
| `CLOUDINARY_API_KEY` | your key |
| `CLOUDINARY_API_SECRET` | your secret |
| `ADMIN_EMAIL` | `admin@adonis.com` |
| `ADMIN_PASSWORD` | strong password |
| `ADMIN_NAME` | `Admin` |
| `NODE_ENV` | `production` (usually set automatically) |

`NEXT_PUBLIC_API_URL=/api` is set during `heroku-postbuild` automatically (same-origin API).

4. Deploy → Manual deploy → **Deploy branch**.
5. Seed admin once:

```bash
heroku run -a adonisnofrills npm run seed:admin
```

6. Open the app and login.

## Local development (unchanged)

Still run two processes:

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

Frontend uses `http://localhost:5000/api` via `.env.local`.
