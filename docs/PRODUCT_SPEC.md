# CoupleFit — Product Specification

## 1. Executive Summary
CoupleFit is a private, mobile-first web application and Progressive Web App (PWA) designed exclusively for two romantic partners who want to collaborate on fitness, nutrition, and wellness. It merges clinical-grade metabolic and nutritional tracking with a healthy, respectful gamification system (XP, levels, daily & couple quests, achievements).

## 2. Core Principles
1. **Individual Data Sovereignty**: Each partner owns their private health parameters (weight, basal metabolic rate, individual meals, sleep, mood).
2. **Transparent Shared Space**: The couple shares a joint space for mutual encouragement, collaborative quests, friendly non-toxic challenges, and shared activity streaks.
3. **No Unhealthy Dieting Incentives**: XP is never awarded for starvation, extreme caloric deficit, rapid weight loss, or punishing workout durations.
4. **Forgiving Consistency**: Progress accumulates over time; missing a single day never resets long-term earned experience or historical records.
5. **Private & Invitation-Only**: Exactly two connected members per couple space; no public discovery or random social feeds.

## 3. Five Core Modules
- **Nutrition**: Calorie and macro target tracking, food database with International and Algerian/North African cuisines, custom foods, recipes, and serving size conversion.
- **Health & Progress**: Mifflin-St Jeor metabolic calculations (BMR, TDEE, suggested deficit/surplus), weight history, moving-average trend line, target deadlines.
- **Activity & Wellness**: Water intake logging (ml), cardio & strength sessions, step counts, sleep duration/quality, mood & energy tracking, daily habit checkboxes.
- **Gamification Engine**: Server-authoritative XP transactions with idempotency, duplicate prevention, leveling curves, unlockable badges, and rewards.
- **Together & Couple Experience**: Mutual dashboard, real-time encouragement, activity feed, cooperative couple quests, private couple chat with emoji reactions.

## 4. Internationalization & Accessibility
- Complete localization in **English (en)**, **French (fr)**, and **Arabic (ar)**.
- First-class Arabic Right-To-Left (RTL) layout support, mirrored directional icons, and typography.
- Theme support: Light and Dark mode with persistent user preference.
