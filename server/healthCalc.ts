// Mifflin-St Jeor metabolic calculations and health safety validations

export interface HealthCalculationInput {
  gender: 'male' | 'female';
  birthDate: string; // YYYY-MM-DD
  heightCm: number;
  weightKg: number;
  activityLevel: number; // 1.2 to 1.9
  goalType: 'lose' | 'maintain' | 'gain';
  paceKgPerWeek: number; // e.g. 0.25, 0.5, 0.75
}

export interface HealthCalculationResult {
  ageYears: number;
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  safetyWarnings: string[];
}

export function calculateAge(birthDateStr: string): number {
  const birth = new Date(birthDateStr);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(16, age);
}

export function calculateHealthMetrics(input: HealthCalculationInput): HealthCalculationResult {
  const age = calculateAge(input.birthDate);
  const warnings: string[] = [];

  // BMI
  const heightM = input.heightCm / 100;
  const bmi = Number((input.weightKg / (heightM * heightM)).toFixed(1));
  let bmiCategory = 'Normal';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi < 25) bmiCategory = 'Normal';
  else if (bmi < 30) bmiCategory = 'Overweight';
  else bmiCategory = 'Obese';

  // Mifflin-St Jeor BMR
  // Men: BMR = (10 × weight) + (6.25 × height) - (5 × age) + 5
  // Women: BMR = (10 × weight) + (6.25 × height) - (5 × age) - 161
  let bmr = (10 * input.weightKg) + (6.25 * input.heightCm) - (5 * age);
  if (input.gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  bmr = Math.round(bmr);

  // TDEE
  const tdee = Math.round(bmr * (input.activityLevel || 1.2));

  // Goal calorie delta (1 kg fat ~= 7700 kcal, so 1 kg/week ~= 1100 kcal/day deficit)
  const dailyDelta = Math.round((input.paceKgPerWeek * 7700) / 7);
  let targetCalories = tdee;

  if (input.goalType === 'lose') {
    targetCalories = tdee - dailyDelta;
  } else if (input.goalType === 'gain') {
    targetCalories = tdee + dailyDelta;
  }

  // Safety Floors
  const minSafeFloor = input.gender === 'male' ? 1500 : 1200;
  if (targetCalories < minSafeFloor) {
    warnings.push(`Target adjusted to safe floor (${minSafeFloor} kcal/day). Severe deficits are harmful.`);
    targetCalories = minSafeFloor;
  }

  if (input.paceKgPerWeek > 1.0) {
    warnings.push('A weight change rate over 1.0 kg/week is aggressive and may lead to muscle loss.');
  }

  // Macronutrient breakdown
  // Protein: ~2.0 g per kg of bodyweight, or ~28%
  let targetProteinG = Math.round(input.weightKg * 1.8);
  const proteinKcal = targetProteinG * 4;

  // Fat: ~28% of total calories (9 kcal/g)
  const fatKcal = Math.round(targetCalories * 0.28);
  const targetFatG = Math.round(fatKcal / 9);

  // Carbs: remainder (4 kcal/g)
  const remainingKcal = Math.max(0, targetCalories - proteinKcal - fatKcal);
  const targetCarbsG = Math.round(remainingKcal / 4);

  return {
    ageYears: age,
    bmi,
    bmiCategory,
    bmr,
    tdee,
    targetCalories,
    targetProteinG,
    targetCarbsG,
    targetFatG,
    safetyWarnings: warnings,
  };
}

// Exponential moving average or simple 7-day moving average for weight trend
export function computeWeightTrend(entries: { weightKg: number; loggedAt: string }[]): { date: string; weight: number; trend: number }[] {
  if (entries.length === 0) return [];
  const sorted = [...entries].sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());

  let currentTrend = sorted[0].weightKg;
  const alpha = 0.2; // 20% weight to current measurement, 80% to historical trend

  return sorted.map((entry) => {
    currentTrend = Number((alpha * entry.weightKg + (1 - alpha) * currentTrend).toFixed(2));
    return {
      date: entry.loggedAt.split('T')[0],
      weight: entry.weightKg,
      trend: currentTrend,
    };
  });
}
