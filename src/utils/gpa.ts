import { Course, GRADE_SCALE, Grade, Assessment } from '../types';

/**
 * Calculates the current percentage for a course based on assessments.
 * Logic:
 * - Formative: 20%
 * - If Final exists: Summative 60%, Final 20%
 * - If Final doesn't exist: Summative 80%
 * Empty categories are ignored and weights are redistributed.
 */
export function calculateCurrentPercentage(course: Course): number {
  const assessments = course.assessments;
  
  const formative = assessments.filter(a => a.type === 'Formative' && a.enabled !== false);
  const summative = assessments.filter(a => a.type === 'Summative' && a.enabled !== false);
  const final = assessments.filter(a => a.type === 'Final' && a.enabled !== false);

  const hasFinalMode = course.hasFinal;
  
  const baseWeights = hasFinalMode 
    ? { Formative: 0.2, Summative: 0.6, Final: 0.2 }
    : { Formative: 0.2, Summative: 0.8, Final: 0 };

  let totalWeightedScore = 0;
  let totalWeightUsed = 0;

  if (formative.length > 0) {
    const avg = formative.reduce((acc, a) => acc + a.score, 0) / formative.length;
    totalWeightedScore += avg * baseWeights.Formative;
    totalWeightUsed += baseWeights.Formative;
  }

  if (summative.length > 0) {
    const avg = summative.reduce((acc, a) => acc + a.score, 0) / summative.length;
    totalWeightedScore += avg * baseWeights.Summative;
    totalWeightUsed += baseWeights.Summative;
  }

  if (hasFinalMode && final.length > 0) {
    const avg = final.reduce((acc, a) => acc + a.score, 0) / final.length;
    totalWeightedScore += avg * baseWeights.Final;
    totalWeightUsed += baseWeights.Final;
  }

  if (totalWeightUsed === 0) return 0;
  return totalWeightedScore / totalWeightUsed;
}

/**
 * Determines the letter grade based on percentage.
 */
export function getLetterGrade(percentage: number): Grade {
  for (const scale of GRADE_SCALE) {
    if (percentage >= scale.minScore) return scale.grade;
  }
  return 'F';
}

/**
 * Calculates the Grade Point for a single course.
 * AP Weighting: +1.0 if Grade >= C- (70%) and isWeighted is true
 */
export function calculateGradePoint(course: Course, isWeighted: boolean): number {
  const percentage = calculateCurrentPercentage(course);
  const letterGrade = getLetterGrade(percentage);
  
  const scale = GRADE_SCALE.find(s => s.grade === letterGrade);
  let gp = scale ? scale.gpa : 0;

  if (isWeighted && course.isAP && percentage >= 69.5) {
    gp += 1.0;
  }

  return gp;
}

/**
 * Calculates the required score for the NEXT Summative exam to reach a target grade.
 * Maintains current Summative average and calculates for one additional Summative.
 */
export function calculateNextScoreNeeded(course: Course, targetGrade: Grade): { score: number | null, message?: string } {
  const targetScale = GRADE_SCALE.find(s => s.grade === targetGrade);
  if (!targetScale) return { score: null };
  const targetScore = targetScale.minScore;

  const assessments = course.assessments;
  const formative = assessments.filter(a => a.type === 'Formative' && a.enabled !== false);
  const summative = assessments.filter(a => a.type === 'Summative' && a.enabled !== false);
  const final = assessments.filter(a => a.type === 'Final' && a.enabled !== false);

  const hasFinal = final.length > 0;
  const weights = hasFinal 
    ? { Formative: 0.2, Summative: 0.6, Final: 0.2 }
    : { Formative: 0.2, Summative: 0.8, Final: 0 };

  // We assume the next assessment is Summative.
  // We need to solve for x:
  // Target = (FormativeContrib + SummativeContrib_New + FinalContrib) / TotalWeightUsed_New
  
  let formativeContrib = 0;
  let formativeWeight = 0;
  if (formative.length > 0) {
    formativeContrib = (formative.reduce((acc, a) => acc + a.score, 0) / formative.length) * weights.Formative;
    formativeWeight = weights.Formative;
  }

  let finalContrib = 0;
  let finalWeight = 0;
  if (final.length > 0) {
    finalContrib = (final.reduce((acc, a) => acc + a.score, 0) / final.length) * weights.Final;
    finalWeight = weights.Final;
  }

  const summativeSum = summative.reduce((acc, a) => acc + a.score, 0);
  const summativeCount = summative.length;
  const summativeWeight = weights.Summative;

  // Target = (formativeContrib + ((summativeSum + x) / (summativeCount + 1)) * summativeWeight + finalContrib) / (formativeWeight + summativeWeight + finalWeight)
  const totalWeight = formativeWeight + summativeWeight + finalWeight;
  
  // (Target * totalWeight) - formativeContrib - finalContrib = ((summativeSum + x) / (summativeCount + 1)) * summativeWeight
  // ((Target * totalWeight - formativeContrib - finalContrib) / summativeWeight) * (summativeCount + 1) - summativeSum = x

  const x = ((targetScore * totalWeight - formativeContrib - finalContrib) / summativeWeight) * (summativeCount + 1) - summativeSum;
  
  if (x > 100) {
    return { score: Math.ceil(x * 10) / 10, message: "현실적으로 이번 학기 내 달성 불가능" };
  }
  
  return { score: Math.max(0, Math.ceil(x * 10) / 10) };
}

/**
 * Calculates GPA from a list of grade counts (e.g., A: 5, B: 2)
 */
export function calculateSemesterGPA(gradeCounts: { grade: Grade, count: number }[]): number {
  let totalPoints = 0;
  let totalCount = 0;

  for (const gc of gradeCounts) {
    const scale = GRADE_SCALE.find(s => s.grade === gc.grade);
    if (scale) {
      totalPoints += scale.gpa * gc.count;
      totalCount += gc.count;
    }
  }

  if (totalCount === 0) return 0;
  return totalPoints / totalCount;
}

/**
 * Formats a percentage by truncating (flooring) to a specific number of decimal places
 * to avoid rounding confusion (e.g., 89.499... showing as 89.5 but grading as B+).
 */
export function formatPercentage(percentage: number, decimals: number = 2): string {
  const factor = Math.pow(10, decimals);
  return (Math.floor(percentage * factor) / factor).toFixed(decimals);
}
