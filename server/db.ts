import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  avatarUrl: string;
  language: 'en' | 'fr' | 'ar';
  theme: 'light' | 'dark';
  timezone: string;
  units: 'metric' | 'imperial';
}

export interface Couple {
  id: string;
  name: string;
  anniversaryDate: string;
  createdAt: string;
  status: 'active' | 'paused';
}

export interface CoupleMember {
  coupleId: string;
  userId: string;
  role: 'creator' | 'partner';
  joinedAt: string;
}

export interface CoupleInvitation {
  id: string;
  coupleId: string;
  inviterId: string;
  tokenHash: string;
  inviteeEmail?: string;
  expiresAt: string;
  usedAt?: string;
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
  updatedAt: string;
}

export interface WeightEntry {
  id: string;
  userId: string;
  weightKg: number;
  notes?: string;
  loggedAt: string;
}

export interface Food {
  id: string;
  name: string;
  nameFr: string;
  nameAr: string;
  brand?: string;
  category: 'algerian' | 'north_african' | 'international' | 'packaged' | 'produce';
  servingUnit: string;
  servingSize: number; // e.g. 100g, 1 piece
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  isVerified: boolean;
  isCustom: boolean;
  creatorUserId?: string;
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
  quantity: number; // multiplier of servingSize
  loggedDate: string; // YYYY-MM-DD
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
}

export interface WaterEntry {
  id: string;
  userId: string;
  amountMl: number;
  loggedDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  userId: string;
  activityType: 'walk' | 'run' | 'cycle' | 'strength' | 'yoga' | 'swimming' | 'other';
  durationMinutes: number;
  distanceKm?: number;
  estimatedCalories?: number;
  notes?: string;
  loggedAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  titleFr: string;
  titleAr: string;
  icon: string;
  targetFrequency: 'daily' | 'weekly';
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  completedDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface WellnessLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  sleepHours: number;
  sleepQuality: number; // 1-5
  mood: number; // 1-5
  energyLevel: number; // 1-5
  notes?: string;
  createdAt: string;
}

export interface XpTransaction {
  id: string;
  userId: string;
  amount: number;
  sourceType: 'meal_log' | 'water_goal' | 'activity' | 'habit' | 'quest' | 'couple_challenge' | 'milestone';
  sourceId: string;
  reason: string;
  idempotencyKey: string;
  createdAt: string;
}

export interface UserGamification {
  userId: string;
  totalXp: number;
  currentLevel: number;
  unlockedTitles: string[];
}

export interface Achievement {
  id: string;
  code: string;
  titleEn: string;
  titleFr: string;
  titleAr: string;
  descEn: string;
  descFr: string;
  descAr: string;
  category: 'nutrition' | 'hydration' | 'activity' | 'consistency' | 'couple';
  badgeIcon: string;
  xpReward: number;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: string;
}

export interface Quest {
  id: string;
  code: string;
  type: 'daily' | 'weekly' | 'couple';
  titleEn: string;
  titleFr: string;
  titleAr: string;
  descEn: string;
  descFr: string;
  descAr: string;
  metric: 'meals' | 'water' | 'activity' | 'habits' | 'couple_both_meals';
  targetCount: number;
  xpReward: number;
}

export interface CoupleChallenge {
  id: string;
  coupleId: string;
  code: string;
  titleEn: string;
  titleFr: string;
  titleAr: string;
  descEn: string;
  descFr: string;
  descAr: string;
  metric: 'combined_water' | 'combined_meals' | 'combined_workouts' | 'combined_xp';
  targetTotal: number;
  rewardXp: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed';
}

export interface CoupleMessage {
  id: string;
  coupleId: string;
  senderId: string;
  text: string;
  reaction?: string;
  createdAt: string;
}

export interface CoupleActivityEvent {
  id: string;
  coupleId: string;
  userId: string;
  userName: string;
  eventType: 'meal' | 'water' | 'workout' | 'achievement' | 'quest' | 'level_up';
  titleEn: string;
  titleFr: string;
  titleAr: string;
  xpEarned: number;
  reactions: { userId: string; reaction: string }[];
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  titleEn: string;
  titleFr: string;
  titleAr: string;
  bodyEn: string;
  bodyFr: string;
  bodyAr: string;
  type: 'achievement' | 'level_up' | 'quest' | 'partner_activity' | 'reminder';
  read: boolean;
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  userProfiles: UserProfile[];
  couples: Couple[];
  coupleMembers: CoupleMember[];
  coupleInvitations: CoupleInvitation[];
  healthProfiles: HealthProfile[];
  weightEntries: WeightEntry[];
  foods: Food[];
  mealEntries: MealEntry[];
  waterEntries: WaterEntry[];
  activityEntries: ActivityEntry[];
  habits: Habit[];
  habitLogs: HabitLog[];
  wellnessLogs: WellnessLog[];
  xpTransactions: XpTransaction[];
  userGamification: UserGamification[];
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  quests: Quest[];
  coupleChallenges: CoupleChallenge[];
  coupleMessages: CoupleMessage[];
  coupleActivityEvents: CoupleActivityEvent[];
  notifications: NotificationItem[];
  favoriteFoodIds: { userId: string; foodId: string }[];
}

const SEED_FOODS: Food[] = [
  // Algerian & North African Specialties
  {
    id: 'food_couscous_chicken',
    name: 'Couscous with Steamed Vegetables & Chicken',
    nameFr: 'Couscous aux Légumes et Poulet',
    nameAr: 'كسكسي بالخضار والدجاج الجزائري',
    category: 'algerian',
    servingUnit: 'plate (350g)',
    servingSize: 350,
    calories: 460,
    protein: 28,
    carbs: 64,
    fat: 9,
    fiber: 7,
    sugar: 6,
    sodium: 480,
    isVerified: true,
    isCustom: false,
  },
  {
    id: 'food_chorba_frik',
    name: 'Chorba Frik (Cracked Green Wheat Soup)',
    nameFr: 'Chorba Frik Traditionnelle',
    nameAr: 'شربة فريك جزائرية تقليدية',
    category: 'algerian',
    servingUnit: 'bowl (280ml)',
    servingSize: 280,
    calories: 220,
    protein: 16,
    carbs: 26,
    fat: 6,
    fiber: 5,
    sugar: 3,
    sodium: 520,
    isVerified: true,
    isCustom: false,
  },
  {
    id: 'food_shakshuka',
    name: 'Shakshuka with Poached Eggs & Peppers',
    nameFr: 'Chakchouka aux Poivrons et Œufs',
    nameAr: 'شكشوكة بالفلفل والطماطم والبيض',
    category: 'north_african',
    servingUnit: 'serving (250g)',
    servingSize: 250,
    calories: 280,
    protein: 15,
    carbs: 18,
    fat: 16,
    fiber: 4,
    sugar: 7,
    sodium: 440,
    isVerified: true,
    isCustom: false,
  },
  {
    id: 'food_tajine_zitoune',
    name: 'Tajine Zitoune (Chicken & Green Olive Stew)',
    nameFr: 'Tajine Zitoune au Poulet',
    nameAr: 'طاجين الزيتون بالدجاج',
    category: 'algerian',
    servingUnit: 'portion (300g)',
    servingSize: 300,
    calories: 410,
    protein: 34,
    carbs: 12,
    fat: 24,
    fiber: 4,
    sugar: 3,
    sodium: 590,
    isVerified: true,
    isCustom: false,
  },
  {
    id: 'food_rechta',
    name: 'Rechta Algéroise (Thin Noodles with Chicken & Turnip)',
    nameFr: 'Rechta Algéroise au Poulet et Navets',
    nameAr: 'رشتة عاصمية بالدجاج واللفت',
    category: 'algerian',
    servingUnit: 'plate (320g)',
    servingSize: 320,
    calories: 480,
    protein: 30,
    carbs: 68,
    fat: 10,
    fiber: 4,
    sugar: 4,
    sodium: 490,
    isVerified: true,
    isCustom: false,
  },
  {
    id: 'food_deglet_nour',
    name: 'Algerian Deglet Nour Dates',
    nameFr: 'Dattes Deglet Nour d\'Algérie',
    nameAr: 'تمر دقلة نور جزائري فاخر',
    category: 'produce',
    servingUnit: '3 dates (45g)',
    servingSize: 45,
    calories: 125,
    protein: 1,
    carbs: 32,
    fat: 0.2,
    fiber: 3.2,
    sugar: 28,
    sodium: 1,
    isVerified: true,
    isCustom: false,
  },
  {
    id: 'food_kesra_bread',
    name: 'Traditional Algerian Kesra Galette',
    nameFr: 'Pain Galette Kesra Traditionnelle',
    nameAr: 'كسرة رخساس / أغروم جزائري',
    category: 'algerian',
    servingUnit: '1/4 galette (70g)',
    servingSize: 70,
    calories: 210,
    protein: 5.5,
    carbs: 36,
    fat: 5,
    fiber: 2.2,
    sugar: 1,
    sodium: 260,
    isVerified: true,
    isCustom: false,
  },
  // International Clean Fitness Staples
  {
    id: 'food_chicken_breast',
    name: 'Grilled Skinless Chicken Breast',
    nameFr: 'Blanc de Poulet Grillé',
    nameAr: 'صدر دجاج مشوي بدون جلد',
    category: 'international',
    servingUnit: '100g cooked',
    servingSize: 100,
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    sodium: 74,
    isVerified: true,
    isCustom: false,
  },
  {
    id: 'food_rolled_oats',
    name: 'Whole Rolled Oats',
    nameFr: 'Flocons d\'Avoine Complète',
    nameAr: 'رقائق الشوفان الكاملة',
    category: 'international',
    servingUnit: 'dry cup (50g)',
    servingSize: 50,
    calories: 190,
    protein: 6.8,
    carbs: 34,
    fat: 3.2,
    fiber: 5.2,
    sugar: 0.8,
    sodium: 3,
    isVerified: true,
    isCustom: false,
  },
  {
    id: 'food_greek_yogurt',
    name: 'Plain Greek Yogurt (0% Fat)',
    nameFr: 'Yaourt Grec Nature 0%',
    nameAr: 'زبادي يوناني طبيعي خالي الدسم',
    category: 'international',
    servingUnit: '1 pot (150g)',
    servingSize: 150,
    calories: 88,
    protein: 15,
    carbs: 5.4,
    fat: 0.3,
    fiber: 0,
    sugar: 4.8,
    sodium: 65,
    isVerified: true,
    isCustom: false,
  },
  {
    id: 'food_eggs_boiled',
    name: 'Large Whole Eggs (Hard Boiled)',
    nameFr: 'Œufs Entiers Durs',
    nameAr: 'بيض مسلوق كامل كبير',
    category: 'international',
    servingUnit: '2 large eggs (100g)',
    servingSize: 100,
    calories: 143,
    protein: 12.6,
    carbs: 0.7,
    fat: 9.5,
    fiber: 0,
    sugar: 0.6,
    sodium: 140,
    isVerified: true,
    isCustom: false,
  },
  {
    id: 'food_salmon_fillet',
    name: 'Pan-Seared Atlantic Salmon Fillet',
    nameFr: 'Pavé de Saumon Poêlé',
    nameAr: 'فيليه سلمون مشوي',
    category: 'international',
    servingUnit: '150g fillet',
    servingSize: 150,
    calories: 310,
    protein: 34,
    carbs: 0,
    fat: 18,
    fiber: 0,
    sugar: 0,
    sodium: 90,
    isVerified: true,
    isCustom: false,
  },
  {
    id: 'food_olive_oil_extra',
    name: 'Extra Virgin Olive Oil (Cold-Pressed)',
    nameFr: 'Huile d\'Olive Extra Vierge',
    nameAr: 'زيت زيتون بكر ممتاز معصور على البارد',
    category: 'produce',
    servingUnit: '1 tablespoon (14ml)',
    servingSize: 14,
    calories: 119,
    protein: 0,
    carbs: 0,
    fat: 13.5,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    isVerified: true,
    isCustom: false,
  },
  {
    id: 'food_brown_rice',
    name: 'Steamed Brown Basmati Rice',
    nameFr: 'Riz Basmati Complet Cuit',
    nameAr: 'أرز بني بسمتي مطبوخ',
    category: 'international',
    servingUnit: '1 cup cooked (150g)',
    servingSize: 150,
    calories: 175,
    protein: 4,
    carbs: 36,
    fat: 1.4,
    fiber: 3.1,
    sugar: 0.5,
    sodium: 5,
    isVerified: true,
    isCustom: false,
  },
  {
    id: 'food_banana',
    name: 'Fresh Ripe Banana',
    nameFr: 'Banane Fraîche',
    nameAr: 'موز طازج',
    category: 'produce',
    servingUnit: '1 medium (118g)',
    servingSize: 118,
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.3,
    fiber: 3.1,
    sugar: 14.4,
    sodium: 1,
    isVerified: true,
    isCustom: false,
  },
  {
    id: 'food_whey_protein',
    name: 'Whey Protein Isolate Shake',
    nameFr: 'Shaker de Whey Isolate',
    nameAr: 'واي بروتين آيزوليت شيك',
    category: 'packaged',
    servingUnit: '1 scoop (30g in water)',
    servingSize: 30,
    calories: 115,
    protein: 26,
    carbs: 1.2,
    fat: 0.5,
    fiber: 0,
    sugar: 0.5,
    sodium: 85,
    isVerified: true,
    isCustom: false,
  }
];

const SEED_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_meal',
    code: 'FIRST_MEAL',
    titleEn: 'First Bite Logged',
    titleFr: 'Premier Repas Enregistré',
    titleAr: 'أول وجبة مسجلة',
    descEn: 'Logged your very first meal with macronutrient details.',
    descFr: 'Enregistrement de votre tout premier repas avec détails.',
    descAr: 'قمت بتسجيل أول وجبة في مذكرتك الغذائية.',
    category: 'nutrition',
    badgeIcon: 'UtensilsCrossed',
    xpReward: 50,
  },
  {
    id: 'ach_hydration_hero',
    code: 'HYDRATION_HERO',
    titleEn: 'Hydration Champion',
    titleFr: 'Champion de l\'Hydratation',
    titleAr: 'بطل الترطيب اليومي',
    descEn: 'Reached your full daily water target of 2,500ml+.',
    descFr: 'Atteint l\'objectif quotidien d\'eau de 2500ml et plus.',
    descAr: 'حققت هدف شرب الماء اليومي بالكامل (2500 مل أو أكثر).',
    category: 'hydration',
    badgeIcon: 'Droplets',
    xpReward: 60,
  },
  {
    id: 'ach_workout_starter',
    code: 'WORKOUT_STARTER',
    titleEn: 'Movement igniter',
    titleFr: 'Première Séance de Sport',
    titleAr: 'أول جلسة تمرين',
    descEn: 'Completed and recorded your first active fitness session.',
    descFr: 'Complété votre première session d\'activité sportive.',
    descAr: 'أكملت وسجلت أول جلسة نشاط رياضي لك.',
    category: 'activity',
    badgeIcon: 'Flame',
    xpReward: 75,
  },
  {
    id: 'ach_consistency_3',
    code: 'CONSISTENCY_3',
    titleEn: '3-Day Consistency Streak',
    titleFr: 'Série de 3 Jours Consécutifs',
    titleAr: 'سلسلة 3 أيام متتالية',
    descEn: 'Logged healthy actions three consecutive days.',
    descFr: 'Actions santé enregistrées 3 jours d\'affilée.',
    descAr: 'سجلت عادات صحية لثلاثة أيام متتالية.',
    category: 'consistency',
    badgeIcon: 'Zap',
    xpReward: 100,
  },
  {
    id: 'ach_couple_synergy',
    code: 'COUPLE_SYNERGY',
    titleEn: 'Couple Synergy Milestone',
    titleFr: 'Synergie du Couple',
    titleAr: 'تناغم الثنائي الرياضي',
    descEn: 'Both partners logged meals and cheered each other on the same day.',
    descFr: 'Les deux partenaires ont enregistré leurs repas le même jour.',
    descAr: 'قام كلا الشريكين بتسجيل وجباتهما وتشجيع بعضهما في نفس اليوم.',
    category: 'couple',
    badgeIcon: 'HeartHandshake',
    xpReward: 150,
  },
  {
    id: 'ach_habit_master',
    code: 'HABIT_MASTER',
    titleEn: 'Habit Anchor',
    titleFr: 'Maître des Habitudes',
    titleAr: 'مرساة العادات الصحية',
    descEn: 'Completed daily wellness habits 5 times.',
    descFr: 'Complété vos habitudes de bien-être 5 fois.',
    descAr: 'أكملت عاداتك الصحية واليومية 5 مرات.',
    category: 'consistency',
    badgeIcon: 'CheckCircle2',
    xpReward: 90,
  }
];

const SEED_QUESTS: Quest[] = [
  {
    id: 'quest_daily_meals_3',
    code: 'DAILY_MEALS_3',
    type: 'daily',
    titleEn: 'Nourish Mindfully (3 Meals)',
    titleFr: 'Nutrition Complète (3 Repas)',
    titleAr: 'تغذية متوازنة (3 وجبات اليوم)',
    descEn: 'Log breakfast, lunch, and dinner to track daily macros accurately.',
    descFr: 'Enregistrez vos trois repas pour suivre vos macronutriments.',
    descAr: 'سجل الفطور والغداء والعشاء لمتابعة سعراتك وعناصرك.',
    metric: 'meals',
    targetCount: 3,
    xpReward: 40,
  },
  {
    id: 'quest_daily_water',
    code: 'DAILY_WATER_2L',
    type: 'daily',
    titleEn: 'Optimal Hydration Flow',
    titleFr: 'Hydratation Quotidienne (2000ml)',
    titleAr: 'ترطيب مثالي (شرب 2000 مل ماء)',
    descEn: 'Reach at least 2,000ml of fresh water today.',
    descFr: 'Buvez au moins 2000ml d\'eau aujourd\'hui.',
    descAr: 'اشرب على الأقل 2000 مل من الماء خلال اليوم.',
    metric: 'water',
    targetCount: 2000,
    xpReward: 35,
  },
  {
    id: 'quest_daily_movement',
    code: 'DAILY_MOVEMENT',
    type: 'daily',
    titleEn: 'Daily Vitality Walk / Workout',
    titleFr: 'Séance de Mouvement / Marche',
    titleAr: 'حركة يومية ونشاط (20 دقيقة فأكثر)',
    descEn: 'Log at least 20 minutes of active movement or walking.',
    descFr: 'Enregistrez au moins 20 minutes d\'activité ou de marche.',
    descAr: 'سجل نشاطاً رياضياً أو مشياً لمدة 20 دقيقة على الأقل.',
    metric: 'activity',
    targetCount: 1,
    xpReward: 45,
  },
  {
    id: 'quest_daily_habit',
    code: 'DAILY_HABIT',
    type: 'daily',
    titleEn: 'Mindful Wellness Habit',
    titleFr: 'Habitude Bien-être du Jour',
    titleAr: 'عادة صحية ونفسية يومية',
    descEn: 'Check off at least one wellness habit or sleep check-in today.',
    descFr: 'Cochez au moins une habitude bien-être aujourd\'hui.',
    descAr: 'قم بإنجاز عادة صحية واحدة على الأقل اليوم.',
    metric: 'habits',
    targetCount: 1,
    xpReward: 30,
  },
  {
    id: 'quest_couple_both_meals',
    code: 'COUPLE_BOTH_MEALS',
    type: 'couple',
    titleEn: 'Team Plate: Both Log Meals',
    titleFr: 'Défi Couple: Les Deux Enregistrent',
    titleAr: 'تحدي الثنائي: كليكما يسجل وجباته اليوم',
    descEn: 'Both partners record at least 2 meals on the same date.',
    descFr: 'Les deux partenaires enregistrent au moins 2 repas aujourd\'hui.',
    descAr: 'يسجل كلا الشريكين وجبتين على الأقل في اليوم نفسه.',
    metric: 'couple_both_meals',
    targetCount: 2,
    xpReward: 80,
  }
];

class DatabaseService {
  private dbPath: string;
  private data: DatabaseSchema;

  constructor() {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbPath = path.join(dataDir, 'db.json');
    this.data = this.loadDatabase();
  }

  private getDefaultSchema(): DatabaseSchema {
    return {
      users: [],
      userProfiles: [],
      couples: [],
      coupleMembers: [],
      coupleInvitations: [],
      healthProfiles: [],
      weightEntries: [],
      foods: [...SEED_FOODS],
      mealEntries: [],
      waterEntries: [],
      activityEntries: [],
      habits: [],
      habitLogs: [],
      wellnessLogs: [],
      xpTransactions: [],
      userGamification: [],
      achievements: [...SEED_ACHIEVEMENTS],
      userAchievements: [],
      quests: [...SEED_QUESTS],
      coupleChallenges: [],
      coupleMessages: [],
      coupleActivityEvents: [],
      notifications: [],
      favoriteFoodIds: [],
    };
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf8');
        const parsed = JSON.parse(raw);
        // Ensure all collections exist
        const schema = { ...this.getDefaultSchema(), ...parsed };
        // Ensure seed foods and achievements are always merged
        if (!schema.foods || schema.foods.length === 0) schema.foods = [...SEED_FOODS];
        if (!schema.achievements || schema.achievements.length === 0) schema.achievements = [...SEED_ACHIEVEMENTS];
        if (!schema.quests || schema.quests.length === 0) schema.quests = [...SEED_QUESTS];
        return schema;
      }
    } catch (err) {
      console.error('Failed to parse db.json, initializing fresh schema', err);
    }
    const fresh = this.getDefaultSchema();
    this.saveDatabase(fresh);
    return fresh;
  }

  public saveDatabase(dataToSave?: DatabaseSchema) {
    if (dataToSave) this.data = dataToSave;
    const tempPath = `${this.dbPath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf8');
    fs.renameSync(tempPath, this.dbPath);
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  public generateId(): string {
    return crypto.randomUUID();
  }
}

export const db = new DatabaseService();
