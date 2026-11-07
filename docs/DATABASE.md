# CoupleFit — Database Architecture & Schema Specification

## 1. Engine & Standard Conventions
- **Database Engine**: PostgreSQL 16+ (Production/Docker) with transactional persistence engine in active dev/preview runtime.
- **Keys**: UUID v4 primary keys across all relational entities.
- **Timestamps**: UTC ISO-8601 timestamps (`created_at`, `updated_at`).
- **Constraints**: Foreign keys with `ON DELETE CASCADE` or `RESTRICT` where audit traces are preserved.

## 2. Table Domains

### Accounts & Couples
- `users`: `id` (UUID), `email` (unique, indexed), `password_hash`, `email_verified` (bool), `created_at`, `updated_at`
- `user_profiles`: `user_id` (FK -> users.id), `display_name`, `avatar_url`, `language` ('en'|'fr'|'ar'), `theme` ('light'|'dark'), `timezone`, `units` ('metric'|'imperial')
- `couples`: `id` (UUID), `name`, `anniversary_date`, `created_at`, `status` ('active'|'paused')
- `couple_members`: `couple_id` (FK -> couples.id), `user_id` (FK -> users.id, unique), `role` ('creator'|'partner'), `joined_at`
- `couple_invitations`: `id` (UUID), `couple_id` (FK), `inviter_id` (FK), `token_hash` (unique), `invitee_email`, `expires_at`, `used_at`

### Health Profiles & Calculations
- `health_profiles`: `user_id` (FK), `birth_date`, `gender` ('male'|'female'), `height_cm`, `current_weight_kg`, `target_weight_kg`, `activity_level` (1.2 to 1.9), `goal_type` ('lose'|'maintain'|'gain'), `pace_kg_per_week`, `bmr`, `tdee`, `target_calories`, `target_protein_g`, `target_carbs_g`, `target_fat_g`
- `weight_entries`: `id` (UUID), `user_id` (FK), `weight_kg`, `logged_at` (timestamp), `notes`, `trend_weight_kg`

### Nutrition & Food Database
- `foods`: `id` (UUID), `name`, `name_ar`, `name_fr`, `brand`, `is_verified` (bool), `is_custom` (bool), `creator_user_id` (nullable FK), `category` ('international'|'algerian'|'north_african'|'packaged'|'produce'), `serving_unit`, `serving_size`, `calories`, `protein`, `carbs`, `fat`, `fiber`, `sugar`, `sodium`
- `meal_entries`: `id` (UUID), `user_id` (FK), `meal_type` ('breakfast'|'lunch'|'dinner'|'snack'), `food_id` (FK), `serving_name`, `quantity`, `logged_date` (YYYY-MM-DD), `snapshot_calories`, `snapshot_protein`, `snapshot_carbs`, `snapshot_fat`, `created_at`
- `custom_recipes`: `id` (UUID), `user_id` (FK), `title`, `servings`, `total_calories`, `total_protein`, `total_carbs`, `total_fat`, `created_at`
- `favorite_foods`: `user_id` (FK), `food_id` (FK), `created_at`

### Activity, Hydration & Wellness
- `water_entries`: `id` (UUID), `user_id` (FK), `amount_ml`, `logged_date`, `created_at`
- `activity_entries`: `id` (UUID), `user_id` (FK), `activity_type` ('walk'|'run'|'cycle'|'strength'|'yoga'|'other'), `duration_minutes`, `distance_km`, `estimated_calories`, `logged_at`, `notes`
- `wellness_logs`: `id` (UUID), `user_id` (FK), `date`, `sleep_hours`, `sleep_quality` (1-5), `mood` (1-5), `energy_level` (1-5), `notes`
- `habits`: `id` (UUID), `user_id` (FK), `title`, `frequency` ('daily'|'weekly'), `target_days`, `created_at`
- `habit_logs`: `habit_id` (FK), `user_id` (FK), `completed_date`, `created_at`

### Gamification & Quests
- `xp_transactions`: `id` (UUID), `user_id` (FK), `amount`, `source_type` ('meal_log'|'water_goal'|'workout'|'habit'|'quest'|'couple_challenge'), `source_id`, `idempotency_key` (UNIQUE), `created_at`
- `user_gamification`: `user_id` (FK, unique), `total_xp`, `current_level`, `unlocked_titles`
- `achievements`: `id`, `code`, `title_en`, `title_fr`, `title_ar`, `description_en`, `badge_icon`, `category`, `xp_reward`
- `user_achievements`: `user_id` (FK), `achievement_id`, `unlocked_at`
- `quests`: `id`, `type` ('daily'|'weekly'|'couple'), `title_en`, `title_fr`, `title_ar`, `target_count`, `xp_reward`, `metric` ('meals'|'water'|'activity'|'habits')
- `couple_challenges`: `id` (UUID), `couple_id` (FK), `title`, `description`, `target_total`, `current_progress`, `start_date`, `end_date`, `reward_xp`, `status` ('active'|'completed'|'expired')

### Social & Couple Interaction
- `couple_messages`: `id` (UUID), `couple_id` (FK), `sender_id` (FK), `content`, `reaction`, `created_at`
- `couple_activities`: `id` (UUID), `couple_id` (FK), `user_id` (FK), `event_type`, `title`, `xp_earned`, `created_at`, `reactions`
- `notifications`: `id` (UUID), `user_id` (FK), `title`, `message`, `type`, `read`, `created_at`
