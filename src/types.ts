export type Language = 'en' | 'fr' | 'ar';
export type Theme = 'dark' | 'light';

export interface User {
  id: string;
  email: string;
  displayName: string;
}

export interface PartnerSummary {
  userId: string;
  displayName: string;
  avatarUrl: string;
  level: number;
  totalXp: number;
}

export interface CoupleSummary {
  id: string;
  name: string;
  role: 'creator' | 'partner';
  anniversaryDate: string;
  partner: PartnerSummary | null;
}

export interface HealthProfile {
  userId: string;
  birthDate: string;
  gender: 'male' | 'female';
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  activityLevel: number;
  goalType: 'lose' | 'maintain' | 'gain';
  paceKgPerWeek: number;
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  bmi: number;
  bmiCategory: string;
  safetyWarnings?: string[];
}

export interface GamificationState {
  userId: string;
  totalXp: number;
  currentLevel: number;
  unlockedTitles: string[];
  nextLevelXp: number;
  progressPct: number;
}

export interface FoodItem {
  id: string;
  name: string;
  nameFr: string;
  nameAr: string;
  brand?: string;
  category: 'algerian' | 'north_african' | 'international' | 'packaged' | 'produce';
  servingUnit: string;
  servingSize: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  isVerified: boolean;
  isCustom: boolean;
}

export interface MealEntry {
  id: string;
  userId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodId: string;
  foodName: string;
  foodNameFr: string;
  foodNameAr: string;
  servingName: string;
  quantity: number;
  loggedDate: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
}

export interface WeightRecord {
  id: string;
  userId: string;
  weightKg: number;
  notes?: string;
  loggedAt: string;
}

export interface WeightTrendPoint {
  date: string;
  weight: number;
  trend: number;
}

export interface HabitItem {
  id: string;
  userId: string;
  title: string;
  titleFr: string;
  titleAr: string;
  icon: string;
  targetFrequency: 'daily' | 'weekly';
  createdAt: string;
}

export interface ActivityRecord {
  id: string;
  userId: string;
  activityType: 'walk' | 'run' | 'cycle' | 'strength' | 'yoga' | 'swimming' | 'other';
  durationMinutes: number;
  distanceKm?: number;
  estimatedCalories?: number;
  notes?: string;
  loggedAt: string;
}

export interface WellnessRecord {
  id: string;
  userId: string;
  date: string;
  sleepHours: number;
  sleepQuality: number;
  mood: number;
  energyLevel: number;
  notes?: string;
}

export interface QuestItem {
  id: string;
  code: string;
  type: 'daily' | 'weekly' | 'couple';
  titleEn: string;
  titleFr: string;
  titleAr: string;
  descEn: string;
  descFr: string;
  descAr: string;
  metric: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  xpReward: number;
}

export interface AchievementItem {
  id: string;
  code: string;
  titleEn: string;
  titleFr: string;
  titleAr: string;
  descEn: string;
  descFr: string;
  descAr: string;
  category: string;
  badgeIcon: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface CoupleChallengeItem {
  id: string;
  coupleId: string;
  code: string;
  titleEn: string;
  titleFr: string;
  titleAr: string;
  descEn: string;
  descFr: string;
  descAr: string;
  metric: string;
  targetTotal: number;
  currentTotal: number;
  isCompleted: boolean;
  rewardXp: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed';
}

export interface CoupleActivityEvent {
  id: string;
  coupleId: string;
  userId: string;
  userName: string;
  eventType: string;
  titleEn: string;
  titleFr: string;
  titleAr: string;
  xpEarned: number;
  reactions: { userId: string; reaction: string }[];
  createdAt: string;
}

export interface CoupleMessage {
  id: string;
  coupleId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  titleEn: string;
  titleFr: string;
  titleAr: string;
  bodyEn: string;
  bodyFr: string;
  bodyAr: string;
  type: string;
  read: boolean;
  createdAt: string;
}
