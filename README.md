# CoupleFit — Couples Fitness & Wellness Platform

CoupleFit is a private, full-stack fitness and wellness web application designed specifically for two romantic partners. It integrates nutrition tracking (with international and Algerian/North African foods), body weight trend analytics, water tracking, physical workouts, sleep and habit tracking, with a non-toxic gamification layer (XP, levels, daily & couple quests, mutual challenges, and private couple chat).

## Architecture Highlights
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide Icons + PWA (Service Worker + Web App Manifest)
- **Backend**: Versioned REST API (`/api/v1`) with real authentication, session handling, server-side XP ledger with idempotency keys, and transactional database storage.
- **Languages**: English, French, Arabic (with full bidirectional RTL layout support).
- **Dual Stack Support**: 
  - Active runtime: Full-stack Node.js / Express running directly on port 3000 with live Vite integration.
  - Production container stack: Docker Compose with FastAPI, PostgreSQL, and Alembic migrations in `/api`.

## Quick Start
```bash
# Install dependencies
npm install

# Start full-stack development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Health Check
```bash
curl http://localhost:3000/api/v1/health
```
