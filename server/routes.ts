import { Router } from 'express';
import { db, User, Couple, CoupleMember, HealthProfile, Food, MealEntry, Habit, WeightEntry } from './db.js';
import { hashPassword, verifyPassword, hashInvitationToken, createSession, requireAuth, AuthenticatedRequest } from './auth.js';
import { calculateHealthMetrics, computeWeightTrend } from './healthCalc.js';
import { awardXp, checkAndUnlockAchievement, getLevelForXp } from './gamification.js';

export const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'connected',
    service: 'CoupleFit Full-Stack Engine',
  });
});

// ================= AUTHENTICATION =================

apiRouter.post('/auth/register', (req, res) => {
  const { email, password, displayName, invitationToken, language } = req.body;
  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'Email, password, and displayName are required.' });
  }

  const data = db.getData();
  if (data.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const userId = db.generateId();
  const newUser: User = {
    id: userId,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    emailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.users.push(newUser);
  data.userProfiles.push({
    userId,
    displayName,
    avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName)}`,
    language: language || 'en',
    theme: 'dark',
    timezone: 'UTC',
    units: 'metric',
  });

  // Handle invitation token if provided
  let joinedCoupleId: string | null = null;
  if (invitationToken) {
    const hashed = hashInvitationToken(invitationToken);
    const invite = data.coupleInvitations.find((i) => i.tokenHash === hashed && !i.usedAt);
    if (invite && new Date(invite.expiresAt).getTime() > Date.now()) {
      // Check existing members
      const memberCount = data.coupleMembers.filter((m) => m.coupleId === invite.coupleId).length;
      if (memberCount < 2) {
        invite.usedAt = new Date().toISOString();
        data.coupleMembers.push({
          coupleId: invite.coupleId,
          userId,
          role: 'partner',
          joinedAt: new Date().toISOString(),
        });
        joinedCoupleId = invite.coupleId;
      }
    }
  }

  // If not joined via invitation and no couple, automatically create new couple space
  if (!joinedCoupleId) {
    const coupleId = db.generateId();
    data.couples.push({
      id: coupleId,
      name: `${displayName}'s Couple Space`,
      anniversaryDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      status: 'active',
    });
    data.coupleMembers.push({
      coupleId,
      userId,
      role: 'creator',
      joinedAt: new Date().toISOString(),
    });
  }

  db.saveDatabase();
  const token = createSession(userId);
  res.json({ success: true, token, user: { id: userId, email: newUser.email, displayName } });
});

apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const data = db.getData();
  const user = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = createSession(user.id);
  const profile = data.userProfiles.find((p) => p.userId === user.id);
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: profile?.displayName || user.email.split('@')[0],
    },
  });
});

apiRouter.post('/auth/logout', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const data = db.getData();

  const profile = data.userProfiles.find((p) => p.userId === user.id);
  const membership = data.coupleMembers.find((m) => m.userId === user.id);
  const couple = membership ? data.couples.find((c) => c.id === membership.coupleId) : null;
  const partnerMembership = couple
    ? data.coupleMembers.find((m) => m.coupleId === couple.id && m.userId !== user.id)
    : null;
  const partnerProfile = partnerMembership
    ? data.userProfiles.find((p) => p.userId === partnerMembership.userId)
    : null;
  const partnerHealth = partnerMembership
    ? data.healthProfiles.find((hp) => hp.userId === partnerMembership.userId)
    : null;
  const partnerGamification = partnerMembership
    ? data.userGamification.find((g) => g.userId === partnerMembership.userId)
    : null;

  const healthProfile = data.healthProfiles.find((h) => h.userId === user.id);
  let gamification = data.userGamification.find((g) => g.userId === user.id);
  if (!gamification) {
    gamification = {
      userId: user.id,
      totalXp: 0,
      currentLevel: 1,
      unlockedTitles: ['Wellness Novice'],
    };
    data.userGamification.push(gamification);
    db.saveDatabase();
  }

  const levelInfo = getLevelForXp(gamification.totalXp);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
    },
    profile,
    couple: couple
      ? {
          id: couple.id,
          name: couple.name,
          role: membership?.role,
          anniversaryDate: couple.anniversaryDate,
          partner: partnerProfile
            ? {
                userId: partnerProfile.userId,
                displayName: partnerProfile.displayName,
                avatarUrl: partnerProfile.avatarUrl,
                level: partnerGamification?.currentLevel || 1,
                totalXp: partnerGamification?.totalXp || 0,
              }
            : null,
        }
      : null,
    healthProfile: healthProfile || null,
    gamification: {
      ...gamification,
      ...levelInfo,
    },
  });
});

// Development bootstrap endpoint to seed two connected partner accounts
apiRouter.post('/auth/bootstrap', (req, res) => {
  const data = db.getData();

  // Create or retrieve Partner 1 (Alex)
  let p1 = data.users.find((u) => u.email === 'alex@couplefit.app');
  if (!p1) {
    const id = db.generateId();
    p1 = {
      id,
      email: 'alex@couplefit.app',
      passwordHash: hashPassword('Partner123!'),
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.users.push(p1);
    data.userProfiles.push({
      userId: id,
      displayName: 'Alex',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AlexFit',
      language: 'en',
      theme: 'dark',
      timezone: 'UTC',
      units: 'metric',
    });
  }

  // Create or retrieve Partner 2 (Sam)
  let p2 = data.users.find((u) => u.email === 'sam@couplefit.app');
  if (!p2) {
    const id = db.generateId();
    p2 = {
      id,
      email: 'sam@couplefit.app',
      passwordHash: hashPassword('Partner123!'),
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.users.push(p2);
    data.userProfiles.push({
      userId: id,
      displayName: 'Sam',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SamHealthy',
      language: 'en',
      theme: 'dark',
      timezone: 'UTC',
      units: 'metric',
    });
  }

  // Couple Space
  let couple = data.couples.find((c) => c.name === 'Alex & Sam FitJourney');
  if (!couple) {
    const coupleId = db.generateId();
    couple = {
      id: coupleId,
      name: 'Alex & Sam FitJourney',
      anniversaryDate: '2024-06-15',
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    data.couples.push(couple);

    data.coupleMembers.push(
      { coupleId, userId: p1.id, role: 'creator', joinedAt: new Date().toISOString() },
      { coupleId, userId: p2.id, role: 'partner', joinedAt: new Date().toISOString() }
    );
  }

  // Seed Health Profiles if missing
  if (!data.healthProfiles.some((h) => h.userId === p1!.id)) {
    const metrics = calculateHealthMetrics({
      gender: 'male',
      birthDate: '1995-04-12',
      heightCm: 180,
      weightKg: 82.5,
      activityLevel: 1.55,
      goalType: 'lose',
      paceKgPerWeek: 0.5,
    });
    data.healthProfiles.push({
      userId: p1.id,
      birthDate: '1995-04-12',
      gender: 'male',
      heightCm: 180,
      currentWeightKg: 82.5,
      targetWeightKg: 76.0,
      activityLevel: 1.55,
      goalType: 'lose',
      paceKgPerWeek: 0.5,
      ...metrics,
      updatedAt: new Date().toISOString(),
    });
    // Add sample weight entries
    data.weightEntries.push(
      { id: db.generateId(), userId: p1.id, weightKg: 84.0, loggedAt: new Date(Date.now() - 14 * 86400000).toISOString() },
      { id: db.generateId(), userId: p1.id, weightKg: 83.2, loggedAt: new Date(Date.now() - 7 * 86400000).toISOString() },
      { id: db.generateId(), userId: p1.id, weightKg: 82.5, loggedAt: new Date().toISOString() }
    );
  }

  if (!data.healthProfiles.some((h) => h.userId === p2!.id)) {
    const metrics = calculateHealthMetrics({
      gender: 'female',
      birthDate: '1996-08-23',
      heightCm: 168,
      weightKg: 67.0,
      activityLevel: 1.375,
      goalType: 'lose',
      paceKgPerWeek: 0.4,
    });
    data.healthProfiles.push({
      userId: p2.id,
      birthDate: '1996-08-23',
      gender: 'female',
      heightCm: 168,
      currentWeightKg: 67.0,
      targetWeightKg: 62.0,
      activityLevel: 1.375,
      goalType: 'lose',
      paceKgPerWeek: 0.4,
      ...metrics,
      updatedAt: new Date().toISOString(),
    });
    data.weightEntries.push(
      { id: db.generateId(), userId: p2.id, weightKg: 68.5, loggedAt: new Date(Date.now() - 14 * 86400000).toISOString() },
      { id: db.generateId(), userId: p2.id, weightKg: 67.8, loggedAt: new Date(Date.now() - 7 * 86400000).toISOString() },
      { id: db.generateId(), userId: p2.id, weightKg: 67.0, loggedAt: new Date().toISOString() }
    );
  }

  // Seed sample couple challenge
  if (!data.coupleChallenges.some((c) => c.coupleId === couple!.id)) {
    data.coupleChallenges.push({
      id: db.generateId(),
      coupleId: couple.id,
      code: 'COUPLE_CHALLENGE_HYDRATION_30K',
      titleEn: 'Couple Hydration Harmony',
      titleFr: 'Harmonie d\'Hydratation du Couple',
      titleAr: 'تحدي تناغم شرب الماء للثنائي (30,000 مل)',
      descEn: 'Drink a combined 30,000ml of water together over 7 days.',
      descFr: 'Buvez ensemble 30 000 ml d\'eau sur 7 jours.',
      descAr: 'اشربا معاً 30,000 مل من الماء خلال 7 أيام.',
      metric: 'combined_water',
      targetTotal: 30000,
      rewardXp: 250,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'active',
    });
  }

  // Seed some habits for Alex and Sam
  if (!data.habits.some((h) => h.userId === p1!.id)) {
    data.habits.push(
      { id: db.generateId(), userId: p1.id, title: 'Morning Hydration Glass', titleFr: 'Verre d\'eau au réveil', titleAr: 'كوب ماء دافئ في الصباح', icon: 'Droplets', targetFrequency: 'daily', createdAt: new Date().toISOString() },
      { id: db.generateId(), userId: p1.id, title: 'No Late Night Snacking', titleFr: 'Pas de grignotage tardif', titleAr: 'الامتناع عن السكريات ليلاً', icon: 'Moon', targetFrequency: 'daily', createdAt: new Date().toISOString() }
    );
  }

  // Seed initial meals for today
  const today = new Date().toISOString().split('T')[0];
  if (!data.mealEntries.some((m) => m.userId === p1!.id && m.loggedDate === today)) {
    data.mealEntries.push({
      id: db.generateId(),
      userId: p1.id,
      mealType: 'breakfast',
      foodId: 'food_rolled_oats',
      foodName: 'Whole Rolled Oats',
      foodNameFr: 'Flocons d\'Avoine Complète',
      foodNameAr: 'رقائق الشوفان الكاملة',
      servingName: '1 dry cup (50g)',
      quantity: 1,
      loggedDate: today,
      calories: 190,
      protein: 6.8,
      carbs: 34,
      fat: 3.2,
      createdAt: new Date().toISOString(),
    });
    awardXp(p1.id, 20, 'meal_log', 'breakfast_init', 'Logged breakfast', `boot_meal_${p1.id}`);
  }

  db.saveDatabase();

  const tokenP1 = createSession(p1.id);
  res.json({
    success: true,
    message: 'Bootstrap complete: Demo couple accounts created for Alex & Sam.',
    accounts: {
      alex: { email: 'alex@couplefit.app', password: 'Partner123!', token: tokenP1 },
      sam: { email: 'sam@couplefit.app', password: 'Partner123!' },
    },
  });
});

// ================= COUPLE MANAGEMENT =================

apiRouter.post('/couples/invite', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const data = db.getData();
  const membership = data.coupleMembers.find((m) => m.userId === user.id);
  if (!membership) {
    return res.status(400).json({ error: 'You must have an active couple space to invite a partner.' });
  }

  // Check member count
  const count = data.coupleMembers.filter((m) => m.coupleId === membership.coupleId).length;
  if (count >= 2) {
    return res.status(400).json({ error: 'Your couple space already has 2 members.' });
  }

  const rawToken = 'cf_inv_' + Math.random().toString(36).substring(2, 10);
  const tokenHash = hashInvitationToken(rawToken);
  const expiresAt = new Date(Date.now() + 72 * 3600 * 1000).toISOString();

  data.coupleInvitations.push({
    id: db.generateId(),
    coupleId: membership.coupleId,
    inviterId: user.id,
    tokenHash,
    expiresAt,
  });

  db.saveDatabase();
  res.json({ success: true, invitationToken: rawToken, expiresAt });
});

apiRouter.post('/couples/join', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { invitationToken } = req.body;
  if (!invitationToken) {
    return res.status(400).json({ error: 'Invitation token is required.' });
  }

  const data = db.getData();
  const tokenHash = hashInvitationToken(invitationToken);
  const invite = data.coupleInvitations.find((i) => i.tokenHash === tokenHash && !i.usedAt);
  if (!invite) {
    return res.status(404).json({ error: 'Invitation not found or has already been used.' });
  }

  if (new Date(invite.expiresAt).getTime() < Date.now()) {
    return res.status(400).json({ error: 'This invitation token has expired.' });
  }

  // Check existing couple membership
  const existingMembers = data.coupleMembers.filter((m) => m.coupleId === invite.coupleId);
  if (existingMembers.length >= 2) {
    return res.status(400).json({ error: 'This couple space already has the maximum of 2 partners.' });
  }

  // Remove old solitary couple if empty
  const oldMembership = data.coupleMembers.find((m) => m.userId === user.id);
  if (oldMembership) {
    data.coupleMembers = data.coupleMembers.filter((m) => m.userId !== user.id);
  }

  data.coupleMembers.push({
    coupleId: invite.coupleId,
    userId: user.id,
    role: 'partner',
    joinedAt: new Date().toISOString(),
  });
  invite.usedAt = new Date().toISOString();

  // Create welcome notification
  data.notifications.unshift({
    id: db.generateId(),
    userId: user.id,
    titleEn: 'Joined Couple Space!',
    titleFr: 'Espace Couple Rejoint !',
    titleAr: 'تم الانضمام إلى مساحة الشريك بنجاح!',
    bodyEn: 'You are now connected with your partner. Motivate and grow together!',
    bodyFr: 'Vous êtes maintenant connecté avec votre partenaire. Encouragez-vous !',
    bodyAr: 'أنت الآن متصل بشريكك. حفزا بعضكما وانطلقا معاً نحو الصحة والرشاقة!',
    type: 'partner_activity',
    read: false,
    createdAt: new Date().toISOString(),
  });

  checkAndUnlockAchievement(user.id, 'COUPLE_SYNERGY');
  db.saveDatabase();

  res.json({ success: true, message: 'Successfully joined couple space!' });
});

// Quick switcher for local dual-partner testing
apiRouter.post('/couples/switch-partner', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const data = db.getData();
  const membership = data.coupleMembers.find((m) => m.userId === user.id);
  if (!membership) {
    return res.status(400).json({ error: 'No couple space found.' });
  }

  const partnerMember = data.coupleMembers.find(
    (m) => m.coupleId === membership.coupleId && m.userId !== user.id
  );
  if (!partnerMember) {
    return res.status(404).json({ error: 'Partner not found in couple space.' });
  }

  const partnerToken = createSession(partnerMember.userId);
  const partnerUser = data.users.find((u) => u.id === partnerMember.userId);
  const partnerProfile = data.userProfiles.find((p) => p.userId === partnerMember.userId);

  res.json({
    success: true,
    token: partnerToken,
    user: {
      id: partnerMember.userId,
      email: partnerUser?.email,
      displayName: partnerProfile?.displayName,
    },
  });
});

// ================= HEALTH & ONBOARDING =================

apiRouter.get('/health/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const data = db.getData();
  const profile = data.healthProfiles.find((h) => h.userId === user.id);
  res.json({ profile: profile || null });
});

apiRouter.post('/health/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { gender, birthDate, heightCm, currentWeightKg, targetWeightKg, activityLevel, goalType, paceKgPerWeek } = req.body;

  if (!gender || !birthDate || !heightCm || !currentWeightKg || !activityLevel) {
    return res.status(400).json({ error: 'Please provide all required physiological metrics.' });
  }

  const metrics = calculateHealthMetrics({
    gender,
    birthDate,
    heightCm: Number(heightCm),
    weightKg: Number(currentWeightKg),
    activityLevel: Number(activityLevel),
    goalType: goalType || 'lose',
    paceKgPerWeek: Number(paceKgPerWeek || 0.5),
  });

  const data = db.getData();
  let existing = data.healthProfiles.find((h) => h.userId === user.id);

  if (existing) {
    Object.assign(existing, {
      gender,
      birthDate,
      heightCm: Number(heightCm),
      currentWeightKg: Number(currentWeightKg),
      targetWeightKg: Number(targetWeightKg || currentWeightKg),
      activityLevel: Number(activityLevel),
      goalType: goalType || 'lose',
      paceKgPerWeek: Number(paceKgPerWeek || 0.5),
      ...metrics,
      updatedAt: new Date().toISOString(),
    });
  } else {
    existing = {
      userId: user.id,
      gender,
      birthDate,
      heightCm: Number(heightCm),
      currentWeightKg: Number(currentWeightKg),
      targetWeightKg: Number(targetWeightKg || currentWeightKg),
      activityLevel: Number(activityLevel),
      goalType: goalType || 'lose',
      paceKgPerWeek: Number(paceKgPerWeek || 0.5),
      ...metrics,
      updatedAt: new Date().toISOString(),
    };
    data.healthProfiles.push(existing);
  }

  // Also record initial weight entry if no weight logged today
  const today = new Date().toISOString().split('T')[0];
  const hasTodayWeight = data.weightEntries.some(
    (w) => w.userId === user.id && w.loggedAt.startsWith(today)
  );
  if (!hasTodayWeight) {
    data.weightEntries.push({
      id: db.generateId(),
      userId: user.id,
      weightKg: Number(currentWeightKg),
      notes: 'Initial check-in',
      loggedAt: new Date().toISOString(),
    });
  }

  // Award onboarding XP
  awardXp(user.id, 50, 'milestone', 'onboarding', 'Completed health onboarding', `onboarding_${user.id}`);
  db.saveDatabase();

  res.json({ success: true, profile: existing, calculations: metrics });
});

apiRouter.get('/health/weights', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const data = db.getData();
  const entries = data.weightEntries
    .filter((w) => w.userId === user.id)
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());

  const trend = computeWeightTrend(entries);
  res.json({ entries, trend });
});

apiRouter.post('/health/weights', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { weightKg, notes } = req.body;
  const numWeight = Number(weightKg);

  if (!numWeight || numWeight < 30 || numWeight > 350) {
    return res.status(400).json({ error: 'Please enter a valid weight between 30 kg and 350 kg.' });
  }

  const data = db.getData();
  const newEntry: WeightEntry = {
    id: db.generateId(),
    userId: user.id,
    weightKg: numWeight,
    notes: notes || undefined,
    loggedAt: new Date().toISOString(),
  };

  data.weightEntries.push(newEntry);

  // Update current weight in health profile
  const hp = data.healthProfiles.find((h) => h.userId === user.id);
  if (hp) {
    hp.currentWeightKg = numWeight;
    const recalc = calculateHealthMetrics({
      gender: hp.gender,
      birthDate: hp.birthDate,
      heightCm: hp.heightCm,
      weightKg: numWeight,
      activityLevel: hp.activityLevel,
      goalType: hp.goalType,
      paceKgPerWeek: hp.paceKgPerWeek,
    });
    Object.assign(hp, recalc);
  }

  const todayStr = new Date().toISOString().split('T')[0];
  awardXp(user.id, 25, 'milestone', newEntry.id, 'Logged weight check-in', `weight_${user.id}_${todayStr}`);
  db.saveDatabase();

  res.json({ success: true, entry: newEntry });
});

apiRouter.delete('/health/weights/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { id } = req.params;
  const data = db.getData();

  const index = data.weightEntries.findIndex((w) => w.id === id && w.userId === user.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Weight entry not found or unauthorized.' });
  }

  data.weightEntries.splice(index, 1);
  db.saveDatabase();
  res.json({ success: true, message: 'Weight entry deleted.' });
});

// ================= NUTRITION & FOOD DIARY =================

apiRouter.get('/nutrition/foods', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { q, category } = req.query;
  const data = db.getData();

  let foods = data.foods.filter(
    (f) => !f.isCustom || f.creatorUserId === user.id
  );

  if (category && typeof category === 'string' && category !== 'all') {
    foods = foods.filter((f) => f.category === category);
  }

  if (q && typeof q === 'string') {
    const term = q.toLowerCase().trim();
    foods = foods.filter(
      (f) =>
        f.name.toLowerCase().includes(term) ||
        f.nameFr?.toLowerCase().includes(term) ||
        f.nameAr?.includes(term) ||
        f.brand?.toLowerCase().includes(term)
    );
  }

  res.json({ foods });
});

apiRouter.post('/nutrition/foods', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { name, nameFr, nameAr, category, servingUnit, servingSize, calories, protein, carbs, fat, fiber, sugar, sodium } = req.body;

  if (!name || calories === undefined || protein === undefined) {
    return res.status(400).json({ error: 'Food name, calories, and protein are required.' });
  }

  const data = db.getData();
  const customFood: Food = {
    id: db.generateId(),
    name,
    nameFr: nameFr || name,
    nameAr: nameAr || name,
    category: category || 'international',
    servingUnit: servingUnit || 'portion',
    servingSize: Number(servingSize) || 100,
    calories: Number(calories),
    protein: Number(protein),
    carbs: Number(carbs || 0),
    fat: Number(fat || 0),
    fiber: Number(fiber || 0),
    sugar: Number(sugar || 0),
    sodium: Number(sodium || 0),
    isVerified: false,
    isCustom: true,
    creatorUserId: user.id,
  };

  data.foods.push(customFood);
  db.saveDatabase();
  res.json({ success: true, food: customFood });
});

apiRouter.get('/nutrition/diary', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const data = db.getData();

  const entries = data.mealEntries.filter(
    (m) => m.userId === user.id && m.loggedDate === date
  );

  const totals = entries.reduce(
    (acc, m) => {
      acc.calories += m.calories;
      acc.protein += m.protein;
      acc.carbs += m.carbs;
      acc.fat += m.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  res.json({ date, entries, totals });
});

apiRouter.post('/nutrition/diary', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { foodId, mealType, quantity, loggedDate } = req.body;

  if (!foodId || !mealType || !quantity) {
    return res.status(400).json({ error: 'Food, meal type, and quantity are required.' });
  }

  const data = db.getData();
  const food = data.foods.find((f) => f.id === foodId);
  if (!food) {
    return res.status(404).json({ error: 'Food item not found.' });
  }

  const date = loggedDate || new Date().toISOString().split('T')[0];
  const qty = Number(quantity);

  const newEntry: MealEntry = {
    id: db.generateId(),
    userId: user.id,
    mealType,
    foodId: food.id,
    foodName: food.name,
    foodNameFr: food.nameFr,
    foodNameAr: food.nameAr,
    servingName: food.servingUnit,
    quantity: qty,
    loggedDate: date,
    calories: Math.round(food.calories * qty),
    protein: Math.round(food.protein * qty * 10) / 10,
    carbs: Math.round(food.carbs * qty * 10) / 10,
    fat: Math.round(food.fat * qty * 10) / 10,
    createdAt: new Date().toISOString(),
  };

  data.mealEntries.push(newEntry);

  // Check achievements & award XP
  checkAndUnlockAchievement(user.id, 'FIRST_MEAL');
  awardXp(user.id, 20, 'meal_log', newEntry.id, `Logged meal (${mealType})`, `meal_${newEntry.id}`);

  // Broadcast to couple activity feed
  const membership = data.coupleMembers.find((m) => m.userId === user.id);
  const profile = data.userProfiles.find((p) => p.userId === user.id);
  if (membership) {
    data.coupleActivityEvents.unshift({
      id: db.generateId(),
      coupleId: membership.coupleId,
      userId: user.id,
      userName: profile?.displayName || 'Partner',
      eventType: 'meal',
      titleEn: `Logged ${food.name} for ${mealType}`,
      titleFr: `A enregistré ${food.nameFr || food.name} pour le ${mealType}`,
      titleAr: `قام بتسجيل وجبة (${food.nameAr || food.name})`,
      xpEarned: 20,
      reactions: [],
      createdAt: new Date().toISOString(),
    });
  }

  db.saveDatabase();
  res.json({ success: true, entry: newEntry });
});

apiRouter.delete('/nutrition/diary/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { id } = req.params;
  const data = db.getData();

  const index = data.mealEntries.findIndex((m) => m.id === id && m.userId === user.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Meal entry not found or unauthorized.' });
  }

  data.mealEntries.splice(index, 1);
  db.saveDatabase();
  res.json({ success: true, message: 'Meal entry deleted.' });
});

apiRouter.get('/nutrition/favorites', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const data = db.getData();
  const favIds = data.favoriteFoodIds.filter((f) => f.userId === user.id).map((f) => f.foodId);
  const favoriteFoods = data.foods.filter((f) => favIds.includes(f.id));
  res.json({ favoriteFoods });
});

apiRouter.post('/nutrition/favorites/toggle', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { foodId } = req.body;
  const data = db.getData();

  const idx = data.favoriteFoodIds.findIndex((f) => f.userId === user.id && f.foodId === foodId);
  let isFavorite = false;
  if (idx >= 0) {
    data.favoriteFoodIds.splice(idx, 1);
    isFavorite = false;
  } else {
    data.favoriteFoodIds.push({ userId: user.id, foodId });
    isFavorite = true;
  }

  db.saveDatabase();
  res.json({ success: true, isFavorite });
});

// ================= ACTIVITY, WATER & WELLNESS =================

apiRouter.get('/activity/water', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const data = db.getData();

  const entries = data.waterEntries.filter(
    (w) => w.userId === user.id && w.loggedDate === date
  );
  const totalMl = entries.reduce((sum, w) => sum + w.amountMl, 0);

  res.json({ date, totalMl, targetMl: 2500, entries });
});

apiRouter.post('/activity/water', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { amountMl, loggedDate } = req.body;
  const ml = Number(amountMl);

  if (!ml || ml <= 0) {
    return res.status(400).json({ error: 'Please enter a positive amount in milliliters.' });
  }

  const date = loggedDate || new Date().toISOString().split('T')[0];
  const data = db.getData();

  data.waterEntries.push({
    id: db.generateId(),
    userId: user.id,
    amountMl: ml,
    loggedDate: date,
    createdAt: new Date().toISOString(),
  });

  // Calculate day total
  const dayTotal = data.waterEntries
    .filter((w) => w.userId === user.id && w.loggedDate === date)
    .reduce((s, w) => s + w.amountMl, 0);

  if (dayTotal >= 2500) {
    checkAndUnlockAchievement(user.id, 'HYDRATION_HERO');
    awardXp(user.id, 30, 'water_goal', date, 'Met daily hydration target of 2,500ml', `water_goal_${user.id}_${date}`);
  }

  db.saveDatabase();
  res.json({ success: true, loggedMl: ml, totalDayMl: dayTotal });
});

apiRouter.get('/activity/logs', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const data = db.getData();
  const entries = data.activityEntries
    .filter((a) => a.userId === user.id)
    .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
  res.json({ entries });
});

apiRouter.post('/activity/logs', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { activityType, durationMinutes, distanceKm, notes } = req.body;

  if (!activityType || !durationMinutes) {
    return res.status(400).json({ error: 'Activity type and duration (minutes) are required.' });
  }

  const data = db.getData();
  const duration = Number(durationMinutes);
  // Estimate caloric expenditure (~6-8 kcal/min for moderate activity)
  const estimatedCalories = Math.round(duration * 7.5);

  const entry = {
    id: db.generateId(),
    userId: user.id,
    activityType,
    durationMinutes: duration,
    distanceKm: distanceKm ? Number(distanceKm) : undefined,
    estimatedCalories,
    notes: notes || undefined,
    loggedAt: new Date().toISOString(),
  };

  data.activityEntries.push(entry);

  checkAndUnlockAchievement(user.id, 'WORKOUT_STARTER');
  awardXp(user.id, 35, 'activity', entry.id, `Completed ${duration}m ${activityType}`, `act_${entry.id}`);

  // Broadcast to couple feed
  const membership = data.coupleMembers.find((m) => m.userId === user.id);
  const profile = data.userProfiles.find((p) => p.userId === user.id);
  if (membership) {
    data.coupleActivityEvents.unshift({
      id: db.generateId(),
      coupleId: membership.coupleId,
      userId: user.id,
      userName: profile?.displayName || 'Partner',
      eventType: 'workout',
      titleEn: `Finished ${duration} min of ${activityType}`,
      titleFr: `A terminé ${duration} min de ${activityType}`,
      titleAr: `أنهى تمرين ${activityType} لمدة ${duration} دقيقة`,
      xpEarned: 35,
      reactions: [],
      createdAt: new Date().toISOString(),
    });
  }

  db.saveDatabase();
  res.json({ success: true, entry });
});

apiRouter.get('/activity/habits', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const data = db.getData();

  const habits = data.habits.filter((h) => h.userId === user.id);
  const completedHabitIds = data.habitLogs
    .filter((hl) => hl.userId === user.id && hl.completedDate === date)
    .map((hl) => hl.habitId);

  res.json({ habits, completedHabitIds, date });
});

apiRouter.post('/activity/habits', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { title, titleFr, titleAr, icon, targetFrequency } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Habit title is required.' });
  }

  const data = db.getData();
  const habit: Habit = {
    id: db.generateId(),
    userId: user.id,
    title,
    titleFr: titleFr || title,
    titleAr: titleAr || title,
    icon: icon || 'CheckCircle2',
    targetFrequency: targetFrequency || 'daily',
    createdAt: new Date().toISOString(),
  };

  data.habits.push(habit);
  db.saveDatabase();
  res.json({ success: true, habit });
});

apiRouter.post('/activity/habits/toggle', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { habitId, date } = req.body;
  const logDate = date || new Date().toISOString().split('T')[0];
  const data = db.getData();

  const idx = data.habitLogs.findIndex(
    (hl) => hl.userId === user.id && hl.habitId === habitId && hl.completedDate === logDate
  );

  let completed = false;
  if (idx >= 0) {
    data.habitLogs.splice(idx, 1);
    completed = false;
  } else {
    data.habitLogs.push({
      id: db.generateId(),
      habitId,
      userId: user.id,
      completedDate: logDate,
      createdAt: new Date().toISOString(),
    });
    completed = true;
    awardXp(user.id, 15, 'habit', habitId, 'Completed daily habit', `habit_${user.id}_${habitId}_${logDate}`);
  }

  db.saveDatabase();
  res.json({ success: true, completed });
});

apiRouter.get('/activity/wellness', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const data = db.getData();

  const log = data.wellnessLogs.find((w) => w.userId === user.id && w.date === date);
  res.json({ log: log || null });
});

apiRouter.post('/activity/wellness', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { date, sleepHours, sleepQuality, mood, energyLevel, notes } = req.body;
  const logDate = date || new Date().toISOString().split('T')[0];
  const data = db.getData();

  let log = data.wellnessLogs.find((w) => w.userId === user.id && w.date === logDate);
  if (log) {
    Object.assign(log, {
      sleepHours: Number(sleepHours || 7),
      sleepQuality: Number(sleepQuality || 3),
      mood: Number(mood || 3),
      energyLevel: Number(energyLevel || 3),
      notes: notes || undefined,
    });
  } else {
    log = {
      id: db.generateId(),
      userId: user.id,
      date: logDate,
      sleepHours: Number(sleepHours || 7),
      sleepQuality: Number(sleepQuality || 3),
      mood: Number(mood || 3),
      energyLevel: Number(energyLevel || 3),
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };
    data.wellnessLogs.push(log);
  }

  awardXp(user.id, 20, 'milestone', log.id, 'Logged wellness check-in', `well_${user.id}_${logDate}`);
  db.saveDatabase();
  res.json({ success: true, log });
});

// ================= GAMIFICATION, QUESTS & CHALLENGES =================

apiRouter.get('/gamification/overview', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const data = db.getData();

  let g = data.userGamification.find((ug) => ug.userId === user.id);
  if (!g) {
    g = { userId: user.id, totalXp: 0, currentLevel: 1, unlockedTitles: ['Wellness Novice'] };
    data.userGamification.push(g);
    db.saveDatabase();
  }

  const levelInfo = getLevelForXp(g.totalXp);
  const userAchs = data.userAchievements.filter((ua) => ua.userId === user.id);
  const achievements = data.achievements.map((a) => ({
    ...a,
    unlocked: userAchs.some((ua) => ua.achievementId === a.id),
    unlockedAt: userAchs.find((ua) => ua.achievementId === a.id)?.unlockedAt,
  }));

  res.json({
    gamification: {
      ...g,
      ...levelInfo,
    },
    achievements,
  });
});

apiRouter.get('/gamification/quests', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const today = new Date().toISOString().split('T')[0];
  const data = db.getData();

  // Evaluate progress for quests
  const todayMeals = data.mealEntries.filter((m) => m.userId === user.id && m.loggedDate === today).length;
  const todayWater = data.waterEntries
    .filter((w) => w.userId === user.id && w.loggedDate === today)
    .reduce((s, w) => s + w.amountMl, 0);
  const todayActivities = data.activityEntries.filter(
    (a) => a.userId === user.id && a.loggedAt.startsWith(today)
  ).length;
  const todayHabits = data.habitLogs.filter(
    (h) => h.userId === user.id && h.completedDate === today
  ).length;

  // Partner data for couple quest
  const membership = data.coupleMembers.find((m) => m.userId === user.id);
  const partnerMember = membership
    ? data.coupleMembers.find((m) => m.coupleId === membership.coupleId && m.userId !== user.id)
    : null;
  const partnerTodayMeals = partnerMember
    ? data.mealEntries.filter((m) => m.userId === partnerMember.userId && m.loggedDate === today).length
    : 0;

  const questsWithProgress = data.quests.map((q) => {
    let current = 0;
    if (q.metric === 'meals') current = todayMeals;
    else if (q.metric === 'water') current = todayWater;
    else if (q.metric === 'activity') current = todayActivities;
    else if (q.metric === 'habits') current = todayHabits;
    else if (q.metric === 'couple_both_meals') current = Math.min(todayMeals, partnerTodayMeals);

    const completed = current >= q.targetCount;
    return {
      ...q,
      currentCount: current,
      completed,
    };
  });

  res.json({ quests: questsWithProgress });
});

apiRouter.get('/gamification/challenges', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const data = db.getData();
  const membership = data.coupleMembers.find((m) => m.userId === user.id);

  if (!membership) {
    return res.json({ challenges: [] });
  }

  // Calculate actual combined progress for couple
  const partnerMember = data.coupleMembers.find(
    (m) => m.coupleId === membership.coupleId && m.userId !== user.id
  );
  const userIds = [user.id];
  if (partnerMember) userIds.push(partnerMember.userId);

  const combinedWater = data.waterEntries
    .filter((w) => userIds.includes(w.userId))
    .reduce((s, w) => s + w.amountMl, 0);

  const challenges = data.coupleChallenges
    .filter((c) => c.coupleId === membership.coupleId)
    .map((c) => ({
      ...c,
      currentTotal: combinedWater,
      isCompleted: combinedWater >= c.targetTotal,
    }));

  res.json({ challenges });
});

// ================= SOCIAL, COUPLE FEED & CHAT =================

apiRouter.get('/social/feed', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const data = db.getData();
  const membership = data.coupleMembers.find((m) => m.userId === user.id);

  if (!membership) {
    return res.json({ events: [] });
  }

  const events = data.coupleActivityEvents
    .filter((e) => e.coupleId === membership.coupleId)
    .slice(0, 30);

  res.json({ events });
});

apiRouter.post('/social/react', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { eventId, reaction } = req.body;
  const data = db.getData();

  const event = data.coupleActivityEvents.find((e) => e.id === eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  // Upsert user reaction
  const existingIdx = event.reactions.findIndex((r) => r.userId === user.id);
  if (existingIdx >= 0) {
    event.reactions[existingIdx].reaction = reaction;
  } else {
    event.reactions.push({ userId: user.id, reaction });
  }

  awardXp(user.id, 10, 'milestone', eventId, 'Cheered partner on activity', `cheer_${user.id}_${eventId}`);
  db.saveDatabase();

  res.json({ success: true, event });
});

apiRouter.get('/social/chat', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const data = db.getData();
  const membership = data.coupleMembers.find((m) => m.userId === user.id);

  if (!membership) {
    return res.json({ messages: [] });
  }

  const messages = data.coupleMessages
    .filter((m) => m.coupleId === membership.coupleId)
    .slice(-50);

  res.json({ messages });
});

apiRouter.post('/social/chat', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message text cannot be empty.' });
  }

  const data = db.getData();
  const membership = data.coupleMembers.find((m) => m.userId === user.id);
  if (!membership) {
    return res.status(400).json({ error: 'You are not in a couple space.' });
  }

  const msg = {
    id: db.generateId(),
    coupleId: membership.coupleId,
    senderId: user.id,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  data.coupleMessages.push(msg);
  db.saveDatabase();
  res.json({ success: true, message: msg });
});

apiRouter.get('/social/notifications', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const data = db.getData();
  const notifications = data.notifications.filter((n) => n.userId === user.id).slice(0, 20);
  res.json({ notifications });
});

apiRouter.post('/social/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { id } = req.params;
  const data = db.getData();

  const notif = data.notifications.find((n) => n.id === id && n.userId === user.id);
  if (notif) {
    notif.read = true;
    db.saveDatabase();
  }

  res.json({ success: true });
});
