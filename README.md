# AI Mystery Room

AI Mystery Room is a fictional, AI-generated mystery game. Players turn a fictional premise into an investigation, inspect suspects and evidence, make a final accusation, and receive a scored result. The included deterministic mock provider runs the complete game loop without an AI key, Redis, or media services.

## Prerequisites

- Node.js 22 or later
- A MongoDB database (MongoDB Atlas or local MongoDB)

## Run locally

Install dependencies and create your local environment file:

```bash
npm install
copy .env.example .env
```

Set `MONGODB_URI` in `.env` to a valid MongoDB connection string, then run:

```bash
npm run dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:5000`; it will not start until MongoDB is connected.

Run validation and production builds with:

```bash
npm run typecheck
npm run build
```

`AI_PROVIDER=mock` is the supported local and production default. Keep Gemini and all other provider credentials server-side; do not expose them through `VITE_*` variables.

## Deploy

### Backend: Render

Create a Node Web Service from this repository. Leave the Root Directory blank and use:

```text
Build Command: npm ci --include=dev && npm run build -w server
Start Command: node server/dist/server.js
Health Check Path: /api/health
```

Set these Render environment variables:

```text
NODE_ENV=production
MONGODB_URI=<your MongoDB Atlas connection string>
AI_PROVIDER=mock
CLIENT_ORIGIN=https://<your-vercel-project>.vercel.app
COOKIE_NAME=amr_guest
```

Do not set `PORT`; Render provides it. In MongoDB Atlas, add the network access entry required for your Render service before deploying.

### Frontend: Vercel

Import the same repository into Vercel and configure the project as follows:

```text
Root Directory: client
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

Set this Vercel environment variable for Production (and Preview if needed):

```text
BACKEND_URL=https://<your-render-service>.onrender.com
```

Do not include a trailing slash. The committed `client/vercel.json` proxies `/api/*` requests to `BACKEND_URL` and provides the React single-page-app fallback. After setting `BACKEND_URL`, redeploy Vercel. Verify the proxy at:

```text
https://<your-vercel-project>.vercel.app/api/health
```

It should return JSON with a connected database status.

## Architecture

- `client/`: React/Vite investigation interface.
- `server/`: Express API, Mongoose-backed case persistence, guest-session ownership, deterministic mock case generator, private/public DTO separation, and deterministic accusation scoring.

All displayed artifacts are fictional game content. Cases are persisted in MongoDB and expire after 30 days through the collection TTL index. BullMQ generation jobs and durable media storage remain future production milestones.
