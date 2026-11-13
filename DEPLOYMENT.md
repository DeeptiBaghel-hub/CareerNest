# Deployment

## 1. Backend on Render

Create a new Render Blueprint from this repository. Render will use `render.yaml`
to deploy the `backend` service. Set the secret values requested by the Blueprint:

- `MONGO_URI`
- `SECRET_KEY`
- `CLOUD_NAME`
- `API_KEY`
- `API_SECRET`
- `CLIENT_URL` (the final Vercel URL, for example `https://your-app.vercel.app`)

Render provides `PORT` automatically. Verify the service at
`https://<render-service>.onrender.com/health`.

## 2. Frontend on Vercel

Import the same repository into Vercel with these settings:

- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm ci`

Set `VITE_API_URL` to the Render service URL, without a trailing slash:
`https://<render-service>.onrender.com`.

The included `frontend/vercel.json` keeps React Router routes working after a
direct page refresh.

## 3. GitHub CI/CD

The workflow in `.github/workflows/ci.yml` runs on pushes and pull requests to
`developer`, `main`, or `master`. It installs dependencies, runs the frontend
lint, tests, and production build, and runs backend tests and syntax checks.
Enable Vercel's and Render's GitHub deployments for automatic production
deploys after CI passes.

Do not commit `.env` files. Copy the appropriate `.env.example` file locally
for development and configure production values in Vercel and Render.
