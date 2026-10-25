# AI Mystery Room

A fictional, AI-generated mystery game. The included deterministic mock provider makes the complete game loop runnable without an AI key, Redis, or media services.

## Run locally

```bash
npm install
npm run dev
```

Create a root `.env` from `.env.example` and set `MONGODB_URI` to a valid MongoDB connection string. Open `http://localhost:5173`. The API runs at `http://localhost:5000` and will not start until MongoDB is connected.

```bash
npm run typecheck
npm run build
```

Copy `.env.example` to `.env` to customize settings. `AI_PROVIDER=mock` is the supported local default. Gemini credentials must remain server-side; the Gemini adapter is intentionally a configuration boundary until a provider deployment is enabled.

## Architecture

- `client/`: React/Vite investigation interface.
- `server/`: Express API, Mongoose-backed case persistence, guest-session ownership, deterministic mock case generator, private/public DTO separation, and deterministic accusation scoring.

All displayed artifacts are fictional game content. Cases are persisted in MongoDB and expire after 30 days through the collection TTL index. BullMQ generation jobs and durable media storage remain future production milestones.
