/**
 * Wrestling Weight Class & Safe Weight Cut Calculator
 * Official UWW (United World Wrestling) Standards & Performance Safety
 */

export interface WeightCategoryOption {
  categoryName: string;
  maxWeightKg: number;
  minWeightKg?: number;
  style: 'greco_roman' | 'freestyle' | 'female';
  ageGroup: 'senior' | 'u23' | 'u20' | 'u17' | 'u15';
  isOlympic: boolean;
}

export const UWW_WEIGHT_CATEGORIES: WeightCategoryOption[] = [
  // Senior Greco-Roman (Olympic: 60, 67, 77, 87, 97, 130)
  { categoryName: '55 kg', maxWeightKg: 55.0, style: 'greco_roman', ageGroup: 'senior', isOlympic: false },
  { categoryName: '60 kg', maxWeightKg: 60.0, minWeightKg: 55.0, style: 'greco_roman', ageGroup: 'senior', isOlympic: true },
  { categoryName: '63 kg', maxWeightKg: 63.0, minWeightKg: 60.0, style: 'greco_roman', ageGroup: 'senior', isOlympic: false },
  { categoryName: '67 kg', maxWeightKg: 67.0, minWeightKg: 63.0, style: 'greco_roman', ageGroup: 'senior', isOlympic: true },
  { categoryName: '72 kg', maxWeightKg: 72.0, minWeightKg: 67.0, style: 'greco_roman', ageGroup: 'senior', isOlympic: false },
  { categoryName: '77 kg', maxWeightKg: 77.0, minWeightKg: 72.0, style: 'greco_roman', ageGroup: 'senior', isOlympic: true },
  { categoryName: '82 kg', maxWeightKg: 82.0, minWeightKg: 77.0, style: 'greco_roman', ageGroup: 'senior', isOlympic: false },
  { categoryName: '87 kg', maxWeightKg: 87.0, minWeightKg: 82.0, style: 'greco_roman', ageGroup: 'senior', isOlympic: true },
  { categoryName: '97 kg', maxWeightKg: 97.0, minWeightKg: 87.0, style: 'greco_roman', ageGroup: 'senior', isOlympic: true },
  { categoryName: '130 kg', maxWeightKg: 130.0, minWeightKg: 97.0, style: 'greco_roman', ageGroup: 'senior', isOlympic: true },

  // Senior Freestyle (Olympic: 57, 65, 74, 86, 97, 125)
  { categoryName: '57 kg', maxWeightKg: 57.0, style: 'freestyle', ageGroup: 'senior', isOlympic: true },
  { categoryName: '61 kg', maxWeightKg: 61.0, minWeightKg: 57.0, style: 'freestyle', ageGroup: 'senior', isOlympic: false },
  { categoryName: '65 kg', maxWeightKg: 65.0, minWeightKg: 61.0, style: 'freestyle', ageGroup: 'senior', isOlympic: true },
  { categoryName: '70 kg', maxWeightKg: 70.0, minWeightKg: 65.0, style: 'freestyle', ageGroup: 'senior', isOlympic: false },
  { categoryName: '74 kg', maxWeightKg: 74.0, minWeightKg: 70.0, style: 'freestyle', ageGroup: 'senior', isOlympic: true },
  { categoryName: '79 kg', maxWeightKg: 79.0, minWeightKg: 74.0, style: 'freestyle', ageGroup: 'senior', isOlympic: false },
  { categoryName: '86 kg', maxWeightKg: 86.0, minWeightKg: 79.0, style: 'freestyle', ageGroup: 'senior', isOlympic: true },
  { categoryName: '92 kg', maxWeightKg: 92.0, minWeightKg: 86.0, style: 'freestyle', ageGroup: 'senior', isOlympic: false },
  { categoryName: '97 kg', maxWeightKg: 97.0, minWeightKg: 92.0, style: 'freestyle', ageGroup: 'senior', isOlympic: true },
  { categoryName: '125 kg', maxWeightKg: 125.0, minWeightKg: 97.0, style: 'freestyle', ageGroup: 'senior', isOlympic: true },

  // Senior Female (Olympic: 50, 53, 57, 62, 68, 76)
  { categoryName: '50 kg', maxWeightKg: 50.0, style: 'female', ageGroup: 'senior', isOlympic: true },
  { categoryName: '53 kg', maxWeightKg: 53.0, minWeightKg: 50.0, style: 'female', ageGroup: 'senior', isOlympic: true },
  { categoryName: '55 kg', maxWeightKg: 55.0, minWeightKg: 53.0, style: 'female', ageGroup: 'senior', isOlympic: false },
  { categoryName: '57 kg', maxWeightKg: 57.0, minWeightKg: 55.0, style: 'female', ageGroup: 'senior', isOlympic: true },
  { categoryName: '59 kg', maxWeightKg: 59.0, minWeightKg: 57.0, style: 'female', ageGroup: 'senior', isOlympic: false },
  { categoryName: '62 kg', maxWeightKg: 62.0, minWeightKg: 59.0, style: 'female', ageGroup: 'senior', isOlympic: true },
  { categoryName: '65 kg', maxWeightKg: 65.0, minWeightKg: 62.0, style: 'female', ageGroup: 'senior', isOlympic: false },
  { categoryName: '68 kg', maxWeightKg: 68.0, minWeightKg: 65.0, style: 'female', ageGroup: 'senior', isOlympic: true },
  { categoryName: '72 kg', maxWeightKg: 72.0, minWeightKg: 68.0, style: 'female', ageGroup: 'senior', isOlympic: false },
  { categoryName: '76 kg', maxWeightKg: 76.0, minWeightKg: 72.0, style: 'female', ageGroup: 'senior', isOlympic: true }
];

export interface WeightCutCalculationResult {
  currentWeightKg: number;
  targetWeightKg: number;
  weightDifferenceKg: number;
  percentBodyWeightCut: number;
  weeksRemaining: number;
  requiredWeeklyRateKg: number;
  recommendedWeeklyRateKg: number;
  riskLevel: 'safe' | 'moderate' | 'dangerous';
  hydrationStatus: 'optimal' | 'dehydrated' | 'severely_dehydrated';
  recommendationsAr: string[];
  recommendationsEn: string[];
  recommendationsFr: string[];
}

export const MAX_SAFE_WEEKLY_LOSS_KG = 0.75; // Max 0.75-1.0kg per week
export const MAX_SAFE_PERCENT_CUT = 5.0;     // Max 5% total body mass cut safely

export function calculateWeightCutPlan(
  currentWeightKg: number,
  targetWeightKg: number,
  targetDateStr: string,
  urineSpecificGravity?: number
): WeightCutCalculationResult {
  const diffKg = Number((currentWeightKg - targetWeightKg).toFixed(2));
  const percentCut = currentWeightKg > 0 ? Number(((diffKg / currentWeightKg) * 100).toFixed(1)) : 0;

  const today = new Date();
  const targetDate = new Date(targetDateStr);
  const timeDiffMs = Math.max(targetDate.getTime() - today.getTime(), 1000 * 60 * 60 * 24);
  const daysRemaining = Math.max(1, Math.ceil(timeDiffMs / (1000 * 60 * 60 * 24)));
  const weeksRemaining = Number((daysRemaining / 7).toFixed(1));

  const requiredWeeklyRateKg = weeksRemaining > 0 ? Number((diffKg / weeksRemaining).toFixed(2)) : diffKg;

  // Hydration status check based on Urine Specific Gravity (USG)
  let hydrationStatus: 'optimal' | 'dehydrated' | 'severely_dehydrated' = 'optimal';
  if (urineSpecificGravity) {
    if (urineSpecificGravity > 1.025) hydrationStatus = 'severely_dehydrated';
    else if (urineSpecificGravity > 1.020) hydrationStatus = 'dehydrated';
  }

  // Risk Classification
  let riskLevel: 'safe' | 'moderate' | 'dangerous' = 'safe';
  if (diffKg <= 0) {
    riskLevel = 'safe';
  } else if (requiredWeeklyRateKg > 1.2 || percentCut > 7.0 || hydrationStatus === 'severely_dehydrated') {
    riskLevel = 'dangerous';
  } else if (requiredWeeklyRateKg > MAX_SAFE_WEEKLY_LOSS_KG || percentCut > MAX_SAFE_PERCENT_CUT || hydrationStatus === 'dehydrated') {
    riskLevel = 'moderate';
  }

  const recommendationsAr: string[] = [];
  const recommendationsEn: string[] = [];
  const recommendationsFr: string[] = [];

  if (diffKg <= 0) {
    recommendationsAr.push('الوزن الحالي ضمن النطاق المطلوب للفئة Target Weight.');
    recommendationsEn.push('Current weight is on point for the target class.');
    recommendationsFr.push('Le poids actuel est déjà dans la catégorie cible.');
  } else if (riskLevel === 'safe') {
    recommendationsAr.push(`القطع تدريجي وآمن (${requiredWeeklyRateKg} كجم/أسبوع). ركز على التغذية المتوازنة.`);
    recommendationsEn.push(`Gradual safe cut (${requiredWeeklyRateKg} kg/week). Focus on balanced sports nutrition.`);
    recommendationsFr.push(`Perte progressive sûre (${requiredWeeklyRateKg} kg/semaine). Focus sur la nutrition sportive.`);
  } else if (riskLevel === 'moderate') {
    recommendationsAr.push(`معدل التخفيض (${requiredWeeklyRateKg} كجم/أسبوع) أعلى بقليل من الموصى به. ينصح ببدء الخفض في وقت أبكر.`);
    recommendationsEn.push(`Weekly reduction (${requiredWeeklyRateKg} kg/week) is moderately elevated. Extend preparation window.`);
    recommendationsFr.push(`Taux hebdomadaire (${requiredWeeklyRateKg} kg/semaine) modérément élevé. Allongez la fenêtre de préparation.`);
  } else {
    recommendationsAr.push('تحذير: هذا التخفيض سريع جداً وقد يسبب الجفاف وهبوط الأداء الكبدي/العضلي. ينصح بتعديل الفئة أو التاريخ.');
    recommendationsEn.push('WARNING: Rapid cut detected. High risk of acute dehydration and severe power loss. Adjust target category.');
    recommendationsFr.push('ATTENTION: Perte trop rapide. Risque élevé de déshydratation et baisse de force. Réajustez la catégorie.');
  }

  if (hydrationStatus !== 'optimal') {
    recommendationsAr.push('تنبيه مؤشر الجفاف: شرب المياه بانتظام وإضافة الأملاح المعدنية الكهرلية Electrocytes.');
    recommendationsEn.push('Hydration Warning: Increase fluid intake with electrolyte salts prior to official weigh-in.');
    recommendationsFr.push('Alerte Hydratation: Augmentez la prise d\'eau et sels électrolytes avant la pesée officielle.');
  }

  return {
    currentWeightKg,
    targetWeightKg,
    weightDifferenceKg: diffKg,
    percentBodyWeightCut: percentCut,
    weeksRemaining,
    requiredWeeklyRateKg,
    recommendedWeeklyRateKg: MAX_SAFE_WEEKLY_LOSS_KG,
    riskLevel,
    hydrationStatus,
    recommendationsAr,
    recommendationsEn,
    recommendationsFr
  };
}
