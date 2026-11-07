import { db, XpTransaction, UserGamification } from './db.js';

export function getLevelForXp(xp: number): { level: number; currentLevelXp: number; nextLevelXp: number; progressPct: number } {
  // Level threshold curve:
  // L1: 0
  // L2: 150
  // L3: 350
  // L4: 600
  // L5: 900
  // L(n) = Math.floor(100 * Math.pow(n, 1.5))
  let level = 1;
  while (getXpThresholdForLevel(level + 1) <= xp) {
    level++;
  }

  const prevThreshold = getXpThresholdForLevel(level);
  const nextThreshold = getXpThresholdForLevel(level + 1);
  const xpInCurrentLevel = xp - prevThreshold;
  const xpNeededForNext = nextThreshold - prevThreshold;
  const progressPct = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpNeededForNext) * 100)));

  return {
    level,
    currentLevelXp: xp,
    nextLevelXp: nextThreshold,
    progressPct,
  };
}

export function getXpThresholdForLevel(lvl: number): number {
  if (lvl <= 1) return 0;
  return Math.round(80 * Math.pow(lvl - 1, 1.6) * 1.5);
}

export function getTitlesForLevel(level: number): string[] {
  const titles = ['Wellness Novice'];
  if (level >= 3) titles.push('Habit Builder');
  if (level >= 5) titles.push('Consistent Partner');
  if (level >= 8) titles.push('Hydration Master');
  if (level >= 12) titles.push('Fitness Crusader');
  if (level >= 20) titles.push('Couple Fitness Champion');
  return titles;
}

export function awardXp(
  userId: string,
  amount: number,
  sourceType: XpTransaction['sourceType'],
  sourceId: string,
  reason: string,
  idempotencyKey: string
): { awarded: boolean; newTotalXp: number; leveledUp: boolean; newLevel: number } {
  const data = db.getData();

  // Check idempotency key: duplicate protection
  const existing = data.xpTransactions.find((t) => t.idempotencyKey === idempotencyKey);
  let userGame = data.userGamification.find((g) => g.userId === userId);

  if (!userGame) {
    userGame = {
      userId,
      totalXp: 0,
      currentLevel: 1,
      unlockedTitles: ['Wellness Novice'],
    };
    data.userGamification.push(userGame);
  }

  if (existing) {
    // Already awarded
    const { level } = getLevelForXp(userGame.totalXp);
    return {
      awarded: false,
      newTotalXp: userGame.totalXp,
      leveledUp: false,
      newLevel: level,
    };
  }

  const oldLevel = userGame.currentLevel;
  userGame.totalXp += amount;
  const { level: newLevel } = getLevelForXp(userGame.totalXp);
  const leveledUp = newLevel > oldLevel;
  userGame.currentLevel = newLevel;
  userGame.unlockedTitles = getTitlesForLevel(newLevel);

  const tx: XpTransaction = {
    id: db.generateId(),
    userId,
    amount,
    sourceType,
    sourceId,
    reason,
    idempotencyKey,
    createdAt: new Date().toISOString(),
  };
  data.xpTransactions.push(tx);

  // If leveled up, create a notification
  if (leveledUp) {
    data.notifications.unshift({
      id: db.generateId(),
      userId,
      titleEn: `Level Up! Reached Level ${newLevel}`,
      titleFr: `Niveau Supérieur ! Niveau ${newLevel} atteint`,
      titleAr: `ترقية! لقد وصلت إلى المستوى ${newLevel}`,
      bodyEn: `Congratulations! Keep nurturing healthy habits together.`,
      bodyFr: `Félicitations ! Continuez à cultiver de saines habitudes ensemble.`,
      bodyAr: `مبروك! واصل بناء العادات الصحية الجميلة مع شريكك.`,
      type: 'level_up',
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  db.saveDatabase();

  return {
    awarded: true,
    newTotalXp: userGame.totalXp,
    leveledUp,
    newLevel,
  };
}

export function checkAndUnlockAchievement(userId: string, achievementCode: string): boolean {
  const data = db.getData();
  const ach = data.achievements.find((a) => a.code === achievementCode);
  if (!ach) return false;

  const alreadyUnlocked = data.userAchievements.some((ua) => ua.userId === userId && ua.achievementId === ach.id);
  if (alreadyUnlocked) return false;

  data.userAchievements.push({
    userId,
    achievementId: ach.id,
    unlockedAt: new Date().toISOString(),
  });

  // Award XP
  awardXp(
    userId,
    ach.xpReward,
    'milestone',
    ach.id,
    `Unlocked achievement: ${ach.titleEn}`,
    `ach_${userId}_${ach.id}`
  );

  // Notification
  data.notifications.unshift({
    id: db.generateId(),
    userId,
    titleEn: `Achievement Unlocked: ${ach.titleEn}`,
    titleFr: `Succès Débloqué : ${ach.titleFr}`,
    titleAr: `إنجاز جديد: ${ach.titleAr}`,
    bodyEn: ach.descEn,
    bodyFr: ach.descFr,
    bodyAr: ach.descAr,
    type: 'achievement',
    read: false,
    createdAt: new Date().toISOString(),
  });

  db.saveDatabase();
  return true;
}
