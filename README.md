# CareerNest

A full-stack MERN job portal that connects job seekers with recruiters. Job seekers can browse and filter jobs, apply, and track their applications; recruiters can register a company, post jobs, and manage applicants.

## Features

- JWT-based authentication with role-based access (**Student / Job Seeker** and **Recruiter**)
- Responsive sign-up and sign-in pages with account-role selection and optional profile-photo upload
- Profile management with resume and profile-photo uploads (via Cloudinary)
- Company registration and management for recruiters
- Job posting, browsing, category filters, and search
- One-click job applications and application-status tracking
- Recruiter dashboard with active/archived job filters, applicant counts, and application-status management
- Job-posting form with a candidate-facing preview

## Tech Stack

**Frontend** — `frontend/`
- React 19 + Vite
- Tailwind CSS v4, shadcn-style UI components
- Redux Toolkit + Redux Persist for state management
- React Router v7, Axios

**Backend** — `backend/`
- Node.js + Express
- MongoDB with Mongoose
- JWT authentication, bcrypt password hashing
- Multer + Cloudinary for file uploads (resumes, profile photos)

## Project Structure

```
CareerNest/
├── frontend/          # React + Vite client
│   ├── src/
│   │   ├── components/  # UI, pages, admin & auth views
│   │   ├── redux/       # Redux slices + store
│   │   ├── hooks/       # Data-fetching hooks
│   │   └── utils/       # Constants (API base URL, etc.)
│   └── vercel.json    # SPA rewrite rules for Vercel
├── backend/           # Express API
│   ├── controllers/
│   ├── models/          # User, Company, Job, Application
│   ├── routes/          # /api/v1/{user,company,job,application}
│   ├── middlewares/      # Auth + file upload
│   └── index.js
├── render.yaml         # Render Blueprint for the backend
└── DEPLOYMENT.md
```

## API Overview

Base path: `/api/v1`

| Resource | Endpoint | Method | Auth | Description |
|---|---|---|---|---|
| User | `/user/register` | POST | No | Register a student or recruiter (optional profile photo) |
| User | `/user/login` | POST | No | Log in |
| User | `/user/logout` | GET | No | Log out |
| User | `/user/profile/update` | POST | Yes | Update profile / resume |
| Company | `/company/register` | POST | Yes | Register a company |
| Company | `/company/get` | GET | Yes | List the recruiter's companies |
| Company | `/company/get/:id` | GET | Yes | Get a company by ID |
| Company | `/company/update/:id` | PUT | Yes | Update a company |
| Job | `/job/post` | POST | Yes | Post a job |
| Job | `/job/get` | GET | Yes | List/search jobs |
| Job | `/job/getAdminJobs` | GET | Yes | Jobs posted by the current recruiter |
| Job | `/job/get/:id` | GET | Yes | Get a job by ID |
| Application | `/application/apply/:id` | GET | Yes | Apply to a job |
| Application | `/application/get` | GET | Yes | Get the current user's applications |
| Application | `/application/:id/applicants` | GET | Yes | Get applicants for a job |
| Application | `/application/status/:id/update` | POST | Yes | Update an applicant's status |

There's also a `GET /health` endpoint on the backend for uptime checks.

## Local Setup

### Prerequisites
- Node.js 20.19+ (or 22.12+) and npm
- A MongoDB connection string (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Cloudinary](https://cloudinary.com/) account (for file uploads)

### 1. Clone the repo

```bash
git clone https://github.com/DeeptiBaghel-hub/job-portal-main.git
cd job-portal-main
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
PORT=8000
SECRET_KEY=replace-with-a-long-random-secret
CLOUD_NAME=your-cloudinary-cloud-name
API_KEY=your-cloudinary-api-key
API_SECRET=your-cloudinary-api-secret
CLIENT_URL=http://localhost:5173
```

Run it:

```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start
```

The API will be available at `http://localhost:8000`.

### 3. Frontend

In a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

Set in `.env`:

```
VITE_API_URL=http://localhost:8000
```

Run it:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Run checks

From the `frontend/` directory:

```bash
npm run lint
npm test
npm run build
```

From the `backend/` directory:

```bash
npm test
node --check index.js
```

## Deployment

The repo ships with everything needed to deploy the backend to **Render** and the frontend to **Vercel**.

### 1. Backend on Render

1. Push the repo to GitHub (if not already).
2. In Render, choose **New → Blueprint** and point it at this repository. Render will detect `render.yaml` and configure the `job-portal-api` service automatically (root directory `backend`, build `npm ci`, start `npm start`, health check `/health`).
3. When prompted, set the secret environment variables:
   - `MONGO_URI`
   - `SECRET_KEY`
   - `CLOUD_NAME`
   - `API_KEY`
   - `API_SECRET`
   - `CLIENT_URL` — set this to your Vercel URL once you have it, e.g. `https://your-app.vercel.app`
4. Render supplies `PORT` automatically — you don't need to set it.
5. Deploy, then confirm it's healthy at `https://<your-render-service>.onrender.com/health`.

### 2. Frontend on Vercel

1. In Vercel, **Add New → Project** and import the same repository.
2. Configure the project:
   - **Root Directory:** `frontend`
   - **Install Command:** `npm ci`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add the environment variable:
   - `VITE_API_URL` = `https://<your-render-service>.onrender.com` (no trailing slash)
4. Deploy. `frontend/vercel.json` is already set up to rewrite all routes to `index.html`, so React Router routes keep working on refresh/direct links.

### 3. Wire them together

Once both are live, go back to the Render service and update `CLIENT_URL` to your final Vercel domain, then redeploy the backend so CORS allows requests from the deployed frontend.

### 4. CI/CD

`.github/workflows/ci.yml` runs on pushes and pull requests to `developer`, `main`, and `master`. It runs frontend lint, tests, and a production build, plus backend tests and syntax checks. Connect Render's and Vercel's GitHub integrations so pushes to your deployment branch trigger production deployments after CI passes.

> Never commit real `.env` files — use the `.env.example` templates locally and set the actual values in the Vercel/Render dashboards.

## License

No license specified — add one if you plan to share or open-source this project.
