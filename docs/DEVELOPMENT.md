# CoupleFit — Development Guide

## Local Setup Options

### Option A: Node.js / Full-Stack Vite + Express (Immediate Development)
The applet includes a full-stack Express + Vite runtime implementing the complete `/api/v1` REST API, real persistent database, and responsive frontend with PWA support:

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Lint & build production bundle
npm run lint
npm run build
```

### Option B: Docker Compose (Python FastAPI + PostgreSQL + Next.js Stack)
For standalone multi-container deployment:

```bash
# Copy environment variables
cp .env.example .env

# Start PostgreSQL, FastAPI backend, and Frontend
docker-compose up --build
```

Services:
- **Web App**: http://localhost:3000
- **FastAPI API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432
