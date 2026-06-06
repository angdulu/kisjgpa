export type Grade = 
  | 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'F';

export interface GradeScale {
  grade: Grade;
  minScore: number;
  gpa: number;
}

export type SchoolScaleKey = 'KISJ' | 'US';

export interface SchoolScaleConfig {
  key: SchoolScaleKey;
  name: string;
  grades: GradeScale[];
  apWeight: number;
  minAPWeightScore: number;
}

export const SCHOOL_SCALES: Record<SchoolScaleKey, SchoolScaleConfig> = {
  KISJ: {
    key: 'KISJ',
    name: 'KISJ (Korea International School Jeju)',
    apWeight: 1.0,
    minAPWeightScore: 69.5,
    grades: [
      { grade: 'A+', minScore: 97.5, gpa: 4.0 },
      { grade: 'A', minScore: 92.5, gpa: 4.0 },
      { grade: 'A-', minScore: 89.5, gpa: 3.667 },
      { grade: 'B+', minScore: 86.5, gpa: 3.333 },
      { grade: 'B', minScore: 82.5, gpa: 3.0 },
      { grade: 'B-', minScore: 79.5, gpa: 2.667 },
      { grade: 'C+', minScore: 76.5, gpa: 2.333 },
      { grade: 'C', minScore: 72.5, gpa: 2.0 },
      { grade: 'C-', minScore: 69.5, gpa: 1.667 },
      { grade: 'D+', minScore: 66.5, gpa: 1.333 },
      { grade: 'D', minScore: 62.5, gpa: 1.0 },
      { grade: 'D-', minScore: 59.5, gpa: 0.667 },
      { grade: 'F', minScore: 0, gpa: 0 },
    ],
  },
  US: {
    key: 'US',
    name: 'Standard US Grading Scale',
    apWeight: 1.0,
    minAPWeightScore: 70.0,
    grades: [
      { grade: 'A', minScore: 93.0, gpa: 4.0 },
      { grade: 'A-', minScore: 90.0, gpa: 3.7 },
      { grade: 'B+', minScore: 87.0, gpa: 3.3 },
      { grade: 'B', minScore: 83.0, gpa: 3.0 },
      { grade: 'B-', minScore: 80.0, gpa: 2.7 },
      { grade: 'C+', minScore: 77.0, gpa: 2.3 },
      { grade: 'C', minScore: 73.0, gpa: 2.0 },
      { grade: 'C-', minScore: 70.0, gpa: 1.7 },
      { grade: 'D+', minScore: 67.0, gpa: 1.3 },
      { grade: 'D', minScore: 63.0, gpa: 1.0 },
      { grade: 'D-', minScore: 60.0, gpa: 0.7 },
      { grade: 'F', minScore: 0, gpa: 0 },
    ],
  },
};

export const GRADE_SCALE: GradeScale[] = SCHOOL_SCALES.KISJ.grades;

export type AssessmentType = 'Summative' | 'Formative' | 'Final';

export interface Assessment {
  id: string;
  type: AssessmentType;
  score: number;
  memo: string;
  enabled?: boolean;
}

export interface Course {
  id: string;
  name: string;
  isAP: boolean;
  hasFinal?: boolean; // New property for Final Exam Mode
  assessments: Assessment[];
  targetGrade?: Grade;
  credit: number;
}

export interface SemesterGradeCount {
  grade: Grade;
  count: number;
}

export interface SemesterGPA {
  id: string;
  label: string; // e.g., "9th Grade"
  semester: string; // e.g., "1st Semester"
  gpa: number;
  gradeCounts?: SemesterGradeCount[]; // Optional: for the "Calculate from Grades" feature
}
