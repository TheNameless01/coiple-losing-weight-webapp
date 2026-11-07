# CoupleFit — Security & Privacy Architecture

## 1. Threat Model & Principles
- **Protected Health Information (PHI)**: Weight, caloric goals, metabolic rates, and body measurements are strictly confidential.
- **Resource Ownership Enforcement**: Every query filtering private data asserts `user_id = current_user.id`. Even if a user knows a partner's record UUID, queries reject unauthorized access (Anti-IDOR).
- **Couple Authorization**: Shared endpoints verify both users belong to the identical active couple (`couple_id`).
- **No Client-side XP Granting**: The client never sends `awardXP(100)`. All XP is computed server-side triggered by validated business events, with cryptographic idempotency keys preventing replay attacks.
- **Single-use Invitation Hashes**: Raw invitation tokens are never stored plaintext in the database; only salted SHA-256 hashes are stored.

## 2. Authentication & Session Security
- **Passwords**: Salted cryptographic hashing (PBKDF2/bcrypt) with high work factors.
- **Tokens**: Cryptographically random 256-bit session tokens.
- **Rate Limiting**: Authentication endpoints rate-limit brute force attempts.
- **CORS**: Restricted to permitted origins and valid headers.
- **Input Validation**: Strict schema validation with type constraints, bounds checking (e.g. realistic weight ranges 30-350 kg, height 100-260 cm, minimum calorie safety floors).

## 3. Safe Health Defaults
- **Caloric Floor Safety**: Calorie deficit recommendations automatically warn or refuse targets below 1200 kcal/day (female) or 1500 kcal/day (male) to prevent malnutrition.
- **Safe Weight Loss Velocity**: Warnings triggered for rates exceeding 1 kg/week.
