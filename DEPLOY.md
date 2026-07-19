# Heroku deployment

Wasi uses **two Heroku apps** (API + web). MongoDB Atlas and Cloudinary stay as external services.

## Prerequisites

- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed and logged in (`heroku login`)
- Git repo at the project root (`e:\Wasi`) — if missing:

```bash
cd e:\Wasi
git init
git add -A
git commit -m "Initial commit"
```

- MongoDB Atlas Network Access allows `0.0.0.0/0` (or Heroku outbound access)
- Cloudinary credentials ready

## 1. Create the apps

```bash
# from e:\Wasi
heroku create wasi-api
heroku create wasi-web
```

Note the URLs, e.g.:

- API: `https://wasi-api-xxxx.herokuapp.com`
- Web: `https://wasi-web-xxxx.herokuapp.com`

## 2. Configure the API (`wasi-api`)

```bash
heroku config:set -a wasi-api ^
  MONGODB_URI="mongodb+srv://USER:PASS@cluster.mongodb.net/wasi?retryWrites=true&w=majority" ^
  JWT_SECRET="replace_with_long_random_string" ^
  JWT_EXPIRES_IN="7d" ^
  CLIENT_URL="https://wasi-web-xxxx.herokuapp.com" ^
  CLOUDINARY_CLOUD_NAME="your_cloud" ^
  CLOUDINARY_API_KEY="your_key" ^
  CLOUDINARY_API_SECRET="your_secret" ^
  ADMIN_EMAIL="admin@wasi.com" ^
  ADMIN_PASSWORD="choose_a_strong_password" ^
  ADMIN_NAME="Admin"
```

On macOS/Linux use `\` instead of `^` for line breaks, or set vars one at a time.

## 3. Configure the frontend (`wasi-web`)

`NEXT_PUBLIC_API_URL` is baked in at **build** time:

```bash
heroku config:set -a wasi-web NEXT_PUBLIC_API_URL="https://wasi-api-xxxx.herokuapp.com/api"
```

## 4. Deploy (git subtree from monorepo)

Heroku expects each app’s files at the repo root, so push each folder with subtree:

```bash
# API
git add -A
git commit -m "Prepare Heroku deploy"
heroku git:remote -a wasi-api -r heroku-api
git subtree push --prefix backend heroku-api main

# Frontend
heroku git:remote -a wasi-web -r heroku-web
git subtree push --prefix frontend heroku-web main
```

If `main` is not your branch name, use `master` or your branch.

### Subtree push tip (if it fails)

```bash
git subtree split --prefix backend -b backend-deploy
git push heroku-api backend-deploy:main --force
git branch -D backend-deploy

git subtree split --prefix frontend -b frontend-deploy
git push heroku-web frontend-deploy:main --force
git branch -D frontend-deploy
```

## 5. Seed the admin user

```bash
heroku run -a wasi-api npm run seed:admin
```

## 6. Verify

```bash
heroku open -a wasi-web
heroku logs --tail -a wasi-api
curl https://wasi-api-xxxx.herokuapp.com/api/health
```

## After rename / custom domains

1. Update `CLIENT_URL` on the API to the real frontend origin(s), comma-separated if needed.
2. Update `NEXT_PUBLIC_API_URL` on the web app, then **redeploy** the frontend so the new URL is baked into the build:

```bash
heroku config:set -a wasi-web NEXT_PUBLIC_API_URL="https://new-api-url/api"
git subtree push --prefix frontend heroku-web main
```

## Notes

- Dynos sleep on inactive Eco plans — first request can be slow.
- Large manga uploads go through the API dyno to Cloudinary; very big batches may hit Heroku’s 30s request timeout — upload in smaller chapter batches if needed.
- Never commit `.env` files; use `heroku config:set` only.
