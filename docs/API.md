# CoupleFit — REST API Specification (`/api/v1`)

## Base URL
`/api/v1`

## Headers
- `Content-Type: application/json`
- `Authorization: Bearer <session_token>`

## Key Route Groups

### Health & System
- `GET /health` -> `{ status: "ok", version: "1.0.0", timestamp: string, database: "connected" }`

### Authentication (`/auth`)
- `POST /auth/register` -> `{ email, password, displayName, invitationToken? }` -> `{ user, token }`
- `POST /auth/login` -> `{ email, password }` -> `{ user, token }`
- `POST /auth/logout` -> `{ success: true }`
- `GET /auth/me` -> `{ user, profile, couple, healthProfile, gamification }`
- `POST /auth/bootstrap` -> Development helper: seeds two default connected partner accounts for quick test setup without opening public registration.

### Couple Space (`/couples`)
- `POST /couples` -> Create new couple space `{ name }`
- `POST /couples/invite` -> Generate single-use invitation link & token hash
- `POST /couples/join` -> Join couple via invitation token `{ token }`
- `GET /couples/current` -> Couple status, partner summary, active challenges, shared streak
- `POST /couples/disconnect` -> Disconnect couple while safeguarding individual health history

### Health & Onboarding (`/health`)
- `POST /health/profile` -> Complete or update health profile (Mifflin-St Jeor calculation)
- `GET /health/profile` -> Current BMR, TDEE, macros, target deficit
- `GET /health/weights` -> Weight history with calculated trend
- `POST /health/weights` -> Log new weight entry `{ weightKg, notes? }`
- `DELETE /health/weights/:id` -> Delete weight entry (user-owned only)

### Nutrition (`/nutrition`)
- `GET /nutrition/foods?q=&category=` -> Search foods catalog (International, Algerian, North African, packaged, custom)
- `POST /nutrition/foods` -> Create custom food entry
- `GET /nutrition/diary?date=YYYY-MM-DD` -> Meals logged for date with macro breakdown
- `POST /nutrition/diary` -> Log meal entry with immutable nutritional snapshot
- `DELETE /nutrition/diary/:id` -> Remove meal entry
- `GET /nutrition/favorites` & `POST /nutrition/favorites` -> Toggle favorite foods

### Activity & Wellness (`/activity`)
- `GET /activity/water?date=YYYY-MM-DD` -> Daily water consumption vs target
- `POST /activity/water` -> Log water intake `{ amountMl: number }`
- `GET /activity/logs?date=YYYY-MM-DD` -> Activity logs (walk, run, workout, yoga)
- `POST /activity/logs` -> Log workout / activity session
- `GET /activity/habits` & `POST /activity/habits` -> Manage custom habits
- `POST /activity/habits/toggle` -> Check off habit for date
- `GET /activity/wellness?date=YYYY-MM-DD` & `POST /activity/wellness` -> Sleep, mood, energy check-in

### Gamification & Quests (`/gamification`)
- `GET /gamification/overview` -> Total XP, level, progress to next level, active titles
- `GET /gamification/quests` -> Daily, weekly, and couple quests with validated completion state
- `GET /gamification/achievements` -> Master list of achievements and user's unlocked status
- `GET /gamification/ledger` -> Audit log of XP transactions with idempotency keys
- `GET /gamification/challenges` -> Current active couple challenges

### Couple Interaction & Social (`/social`)
- `GET /social/feed` -> Recent shared activities & milestones from partner
- `POST /social/react` -> Send reaction/cheer to partner's activity
- `GET /social/chat` -> Private couple chat messages
- `POST /social/chat` -> Send private couple message `{ text }`
- `GET /social/notifications` -> In-app notifications
- `POST /social/notifications/:id/read` -> Mark notification as read
