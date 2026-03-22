export type Grade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'F';

export interface GradeScale {
  grade: Grade;
  minScore: number;
  gpa: number;
}

export const GRADE_SCALE: GradeScale[] = [
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
];

export type AssessmentType = 'Summative' | 'Formative' | 'Final';

export interface Assessment {
  id: string;
  type: AssessmentType;
  score: number;
  memo: string;
  date: string;
}

export interface Course {
  id: string;
  name: string;
  isAP: boolean;
  hasFinal?: boolean; // New property for Final Exam Mode
  assessments: Assessment[];
  targetGrade: Grade;
}
