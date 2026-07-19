# Adonis

Manga & novel platform with a public reader and an admin publish panel.

## Structure

```
Adonis/
  frontend/   Next.js (App Router) — public site + admin UI
  backend/    Express API — auth, series, chapters, Cloudinary uploads
```

## Stack

- **Frontend:** Next.js, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Images:** Cloudinary
- **Auth:** JWT (public readers register; admin is seeded)

## Setup

### 1. MongoDB

Run MongoDB locally or use Atlas, then set `MONGODB_URI` in `backend/.env`.

### 2. Cloudinary

Create a free Cloudinary account and set in `backend/.env`:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### 3. Backend

```bash
cd backend
copy .env.example .env   # or edit the existing .env
npm install
npm run seed:admin
npm run dev
```

API: `http://localhost:5000`

Default admin (change in `.env` before seeding):

- Email: `admin@adonis.com`
- Password: `Admin@123456`

### 4. Frontend

```bash
cd frontend
copy .env.local.example .env.local
npm install
npm run dev
```

App: `http://localhost:3000`

## Features

**Public**

- Bold black/white landing page
- Browse manga & novels
- Register / login to read chapters
- Manga reader (stacked page images)
- Novel reader (text)

**Admin** (`/admin` after admin login)

- Dashboard with views & counts
- Publish new manga or novel (cover upload)
- Add manga chapters (multi-image pages) or novel chapters (text)
- Draft / publish toggle
- Per-series and per-chapter view counts

## Notes

- Catalog listing is public; opening a chapter requires a logged-in user.
- Only users with `role: admin` can access `/admin` and publish endpoints.

## Deploy to Heroku

See **[DEPLOY.md](./DEPLOY.md)** — single Heroku app serves API + Next.js from the repo root (`package.json` + `Procfile` + `server.js`).

