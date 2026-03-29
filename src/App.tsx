/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  ChevronRight, 
  ArrowLeft, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  Trash2,
  Calculator,
  GraduationCap,
  Calendar,
  FileText,
  Settings,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { Course, Grade, GRADE_SCALE, Assessment, AssessmentType } from './types';
import { 
  calculateCurrentPercentage, 
  getLetterGrade, 
  calculateGradePoint 
} from './utils/gpa';

// Mock Initial Data
const INITIAL_COURSES: Course[] = [];

const COMMON_COURSES = [
  "AP Seminar",
  "AP Research",
  "AP English Language",
  "AP English Literature",
  "AP Calculus AB",
  "AP Calculus BC",
  "AP Statistics",
  "AP Biology",
  "AP Chemistry",
  "AP Environmental Science",
  "AP Physics 1",
  "AP Physics 2",
  "AP Physics C – Mechanics",
  "AP Physics C – Electricity and Magnetism",
  "AP Chinese",
  "AP Spanish",
  "AP Human Geography",
  "AP World History",
  "AP US History",
  "AP Psychology",
  "AP Microeconomics",
  "AP Macroeconomics",
  "AP Comparative Government",
  "AP Computer Science A",
  "AP Computer Science Principles",
  "AP 2-D Design",
  "AP 3-D Design",
  "AP Drawing",
  "AP Music Theory",
  "English 9",
  "Writing 9",
  "English 10",
  "English 11",
  "English 12",
  "Creative Writing",
  "Film as Literature",
  "Journalism",
  "Advanced Writing",
  "Geometry",
  "Algebra II",
  "Pre-Calculus",
  "Calculus",
  "Multivariable Calculus",
  "Biology",
  "Chemistry",
  "Physics",
  "Marine Science",
  "Global Studies 9",
  "Global Studies 10",
  "US History",
  "Economics",
  "Psychology",
  "Sociology",
  "Chinese I",
  "Chinese II",
  "Chinese III",
  "Chinese IV",
  "Heritage Chinese",
  "Spanish I",
  "Spanish II",
  "Spanish III",
  "Spanish IV",
  "Health and Physical Education 9",
  "Health and Physical Education 10",
  "Team Sports",
  "Personal Fitness",
  "Design and Technology",
  "Advanced Design and Technology",
  "Digital Media Publications",
  "Digital Photography",
  "Engineering",
  "Advanced Engineering",
  "Graphic Design",
  "Programming 1",
  "Programming 2",
  "Robotics",
  "Advanced Robotics",
  "Videography",
  "Yearbook",
  "Korean Language 9",
  "Korean Language 10",
  "Korean Social Studies 9",
  "Korean Social Studies 10"
];

const COURSE_ALIASES: Record<string, string[]> = {
  "pe": ["Health and Physical Education 9", "Health and Physical Education 10", "Team Sports", "Personal Fitness"],
  "ap lang": ["AP English Language"],
  "ap lit": ["AP English Literature"],
  "ap comp sci": ["AP Computer Science A", "AP Computer Science Principles"],
  "ap csa": ["AP Computer Science A"],
  "ap csp": ["AP Computer Science Principles"],
  "calc": ["Calculus", "AP Calculus AB", "AP Calculus BC", "Multivariable Calculus"],
  "chem": ["Chemistry", "AP Chemistry"],
  "bio": ["Biology", "AP Biology"],
  "phys": ["Physics", "AP Physics 1", "AP Physics 2", "AP Physics C – Mechanics", "AP Physics C – Electricity and Magnetism"],
  "gov": ["AP Comparative Government"],
  "econ": ["Economics", "AP Microeconomics", "AP Macroeconomics"],
  "psych": ["Psychology", "AP Psychology"],
  "hist": ["AP World History", "AP US History", "US History", "Global Studies 9", "Global Studies 10"],
};

export default function App() {
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('kisj-gpa-courses');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isWeighted, setIsWeighted] = useState(() => {
    const saved = localStorage.getItem('kisj-gpa-weighted');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('kisj-gpa-courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('kisj-gpa-weighted', JSON.stringify(isWeighted));
  }, [isWeighted]);

  const selectedCourse = useMemo(() => 
    courses.find(c => c.id === selectedCourseId), 
    [courses, selectedCourseId]
  );

  const overallGPA = useMemo(() => {
    if (courses.length === 0) return "0.000";
    const totalPoints = courses.reduce((acc, c) => acc + (calculateGradePoint(c, isWeighted) * (c.credit || 1.0)), 0);
    const totalCredits = courses.reduce((acc, c) => acc + (c.credit || 1.0), 0);
    return (totalPoints / totalCredits).toFixed(3);
  }, [courses, isWeighted]);

  const addCourse = (newCourse: Course) => {
    setCourses([...courses, newCourse]);
    setIsAddingCourse(false);
  };

  const updateCourse = (updatedCourse: Course) => {
    setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };

  const deleteCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
    setSelectedCourseId(null);
  };

  const addAssessment = (courseId: string, assessment: Assessment) => {
    setCourses(courses.map(c => 
      c.id === courseId 
        ? { ...c, assessments: [...c.assessments, assessment] }
        : c
    ));
  };

  const updateAssessment = (courseId: string, updatedAssessment: Assessment) => {
    setCourses(courses.map(c => 
      c.id === courseId 
        ? { ...c, assessments: c.assessments.map(a => a.id === updatedAssessment.id ? updatedAssessment : a) }
        : c
    ));
  };

  const deleteAssessment = (courseId: string, assessmentId: string) => {
    setCourses(courses.map(c => 
      c.id === courseId 
        ? { ...c, assessments: c.assessments.filter(a => a.id !== assessmentId) }
        : c
    ));
  };

  const resetAllData = () => {
    setCourses(INITIAL_COURSES);
    setIsWeighted(true);
    localStorage.removeItem('kisj-gpa-courses');
    localStorage.removeItem('kisj-gpa-weighted');
    setIsResetting(false);
    setSelectedCourseId(null);
  };

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-[#111111] text-[#191F28] dark:text-[#F9FAFB] font-sans selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors duration-300">
      <div className="w-full max-w-md mx-auto bg-white dark:bg-[#111111] min-h-[100dvh] relative overflow-hidden flex flex-col pb-[env(safe-area-inset-bottom)]">
        
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md px-6 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-5 flex items-center justify-between border-b border-[#F2F4F6] dark:border-[#2C2C34]">
          {selectedCourseId ? (
            <div className="flex items-center justify-between w-full">
              <button 
                onClick={() => setSelectedCourseId(null)}
                className="p-3 -ml-2 hover:bg-[#F2F4F6] dark:hover:bg-[#2C2C34] rounded-full transition-colors"
              >
                <ArrowLeft size={28} />
              </button>
              <div className="flex items-center gap-2">
                {/* Course GPA removed as requested */}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3182F6] rounded-xl flex items-center justify-center">
                <GraduationCap size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">KISJ GPA</h1>
            </div>
          )}
          {!selectedCourseId && (
            <div className="flex items-center gap-5">
              <div className="flex items-center bg-[#F2F4F6] dark:bg-[#202027] p-1.5 rounded-xl">
                <button 
                  onClick={() => setIsWeighted(false)}
                  className={`px-4 py-2 text-[12px] font-bold rounded-lg transition-all ${!isWeighted ? 'bg-white dark:bg-[#333D4B] text-[#3182F6] dark:text-white shadow-sm' : 'text-[#8B95A1]'}`}
                >
                  UW
                </button>
                <button 
                  onClick={() => setIsWeighted(true)}
                  className={`px-4 py-2 text-[12px] font-bold rounded-lg transition-all ${isWeighted ? 'bg-white dark:bg-[#333D4B] text-[#3182F6] dark:text-white shadow-sm' : 'text-[#8B95A1]'}`}
                >
                  W
                </button>
              </div>
              <div className="text-right">
                <div className="text-[12px] text-[#8B95A1] font-bold uppercase tracking-widest">GPA</div>
                <div className="text-2xl font-black text-[#3182F6]">{overallGPA}</div>
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 pb-32">
            <AnimatePresence mode="wait">
              {!selectedCourseId ? (
                <Dashboard 
                  courses={courses} 
                  onSelectCourse={setSelectedCourseId} 
                />
              ) : (
                <CourseDetail 
                  course={selectedCourse!} 
                  onDelete={() => deleteCourse(selectedCourse!.id)}
                  onUpdateCourse={updateCourse}
                  onAddAssessment={(a) => addAssessment(selectedCourse!.id, a)}
                  onUpdateAssessment={(a) => updateAssessment(selectedCourse!.id, a)}
                  onDeleteAssessment={(id) => deleteAssessment(selectedCourse!.id, id)}
                />
              )}
            </AnimatePresence>
          </div>
        </main>

        {!selectedCourseId && (
          <div className="px-6 py-5 bg-white dark:bg-[#111111] border-t border-[#F2F4F6] dark:border-[#2C2C34] z-10">
            <div className="bg-[#F9FAFB] dark:bg-[#202027] p-4 rounded-2xl border border-[#F2F4F6] dark:border-[#2C2C34] flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-[#3182F6]">
                  <ShieldCheck size={18} />
                  <span className="text-[12px] font-bold uppercase tracking-wider">Privacy First</span>
                </div>
                <p className="text-[11px] text-[#8B95A1] leading-relaxed">Data is stored only on your device.</p>
              </div>
              <button 
                onClick={() => setIsResetting(true)}
                className="px-4 py-2.5 bg-[#F2F4F6] dark:bg-[#2C2C34] text-[#8B95A1] hover:text-red-500 text-[12px] font-bold rounded-xl transition-all flex items-center gap-2"
              >
                <Trash2 size={14} />
                Reset
              </button>
            </div>
            <footer className="mt-4 flex items-center justify-center gap-4 text-[11px] text-[#B0B8C1] dark:text-[#4E5968]">
              <span>KISJ Guidelines</span>
              <span className="w-px h-3 bg-[#F2F4F6] dark:bg-[#2C2C34]" />
              <a href="mailto:jwookim27@kis.ac" className="text-[#3182F6] font-bold hover:underline">Support</a>
            </footer>
          </div>
        )}

        {/* FAB */}
        {!selectedCourseId && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddingCourse(true)}
            className="absolute bottom-[150px] right-6 w-16 h-16 bg-[#3182F6] text-white rounded-full shadow-lg flex items-center justify-center z-30"
          >
            <Plus size={32} />
          </motion.button>
        )}

        {/* Modals */}
        <AnimatePresence>
          {isAddingCourse && (
            <AddCourseModal 
              onClose={() => setIsAddingCourse(false)} 
              onAdd={addCourse} 
            />
          )}
          {isResetting && (
            <ResetModal 
              onClose={() => setIsResetting(false)}
              onConfirm={resetAllData}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Dashboard({ courses, onSelectCourse }: { courses: Course[], onSelectCourse: (id: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <section>
        <h2 className="text-2xl font-bold mb-5 px-1">My Courses</h2>
        <div className="grid gap-3.5">
          {courses.map(course => {
            const percentage = calculateCurrentPercentage(course);
            const letterGrade = getLetterGrade(percentage);

            return (
              <motion.div
                key={course.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onSelectCourse(course.id)}
                className="bg-white dark:bg-[#202027] border border-[#F2F4F6] dark:border-[#2C2C34] p-5 rounded-2xl cursor-pointer flex items-center justify-between group transition-all hover:shadow-sm"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xl leading-tight dark:text-[#F9FAFB]">{course.name}</span>
                    {course.isAP && (
                      <span className="text-[11px] font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded uppercase">AP</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-black text-[#3182F6] leading-none mb-1.5">{letterGrade}</div>
                    <div className="text-[12px] text-[#8B95A1] font-bold">{percentage.toFixed(1)}%</div>
                  </div>
                  <ChevronRight size={22} className="text-[#B0B8C1] group-hover:text-[#3182F6] transition-colors" />
                </div>
              </motion.div>
            );
          })}
          {courses.length === 0 && (
            <div className="text-center py-12 text-[#8B95A1]">
              <Calculator size={48} className="mx-auto mb-4 opacity-20" />
              <p>No courses added yet.</p>
              <p className="text-sm">Tap the + button to start.</p>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}

function CourseDetail({ 
  course, 
  onDelete, 
  onUpdateCourse,
  onAddAssessment, 
  onUpdateAssessment,
  onDeleteAssessment 
}: { 
  course: Course, 
  onDelete: () => void,
  onUpdateCourse: (c: Course) => void,
  onAddAssessment: (a: Assessment) => void,
  onUpdateAssessment: (a: Assessment) => void,
  onDeleteAssessment: (id: string) => void
}) {
  const percentage = calculateCurrentPercentage(course);
  const letterGrade = getLetterGrade(percentage);
  
  const targetMinScore = useMemo(() => 
    GRADE_SCALE.find(s => s.grade === course.targetGrade)?.minScore || 92.5,
    [course.targetGrade]
  );

  const targetProgress = Math.min((percentage / targetMinScore) * 100, 100);
  const isExceeding = percentage >= targetMinScore;
  
  const [isAddingAssessment, setIsAddingAssessment] = useState<AssessmentType | null>(null);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const assessmentsByType = {
    Summative: course.assessments.filter(a => a.type === 'Summative'),
    Formative: course.assessments.filter(a => a.type === 'Formative'),
    Final: course.assessments.filter(a => a.type === 'Final')
  };

  const toggleFinalMode = () => {
    onUpdateCourse({ ...course, hasFinal: !course.hasFinal });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Summary Card */}
      <div className="text-center space-y-3 relative">
        <div className="flex flex-col items-center justify-center gap-2">
          <h2 className="text-4xl font-extrabold tracking-tight dark:text-[#F9FAFB] leading-tight px-4">{course.name}</h2>
          <div className="flex items-center gap-2">
            {course.isAP && (
              <span className="text-[11px] font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full uppercase">AP Course</span>
            )}
            <button 
              onClick={() => setIsEditingCourse(true)}
              className="p-2 text-[#8B95A1] hover:bg-[#F2F4F6] dark:hover:bg-[#2C2C34] rounded-full transition-colors flex items-center justify-center"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
        <div 
          onClick={() => setIsEditingCourse(true)}
          className="flex items-center justify-center gap-2 text-[#8B95A1] font-bold cursor-pointer hover:text-[#3182F6] transition-colors text-base"
        >
          <span>Target Grade: {course.targetGrade || 'Not Set'}</span>
          <ChevronDown size={18} className="mt-0.5" />
        </div>
      </div>

      {/* Grade Gauge */}
      <div className="bg-white dark:bg-[#202027] border border-[#F2F4F6] dark:border-[#2C2C34] p-7 rounded-3xl space-y-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[12px] text-[#8B95A1] font-bold uppercase tracking-wider mb-1">Current Grade</p>
            <p className="text-6xl font-black text-[#3182F6]">{letterGrade}</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-[#8B95A1] font-bold uppercase tracking-wider mb-1">Percentage</p>
            <p className="text-3xl font-bold text-[#191F28] dark:text-[#F9FAFB]">{percentage.toFixed(1)}%</p>
          </div>
        </div>

        {/* Target Progress Bar */}
        {course.targetGrade ? (
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-2">
                <Target size={16} className={isExceeding ? "text-emerald-500" : "text-[#3182F6]"} />
                <span className="text-[12px] font-bold text-[#8B95A1] uppercase tracking-wider">Target Progress</span>
              </div>
              <span className={`text-sm font-black ${isExceeding ? "text-emerald-500" : "text-[#3182F6]"}`}>
                {isExceeding ? 'EXCEEDED' : `${targetProgress.toFixed(0)}%`}
              </span>
            </div>
            <div className="h-4 bg-[#F2F4F6] dark:bg-[#2C2C34] rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${targetProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${isExceeding ? 'bg-emerald-500' : 'bg-[#3182F6]'}`}
              />
            </div>
            <p className="text-[11px] text-[#B0B8C1] font-bold text-center leading-relaxed">
              {isExceeding 
                ? `Target ${course.targetGrade} reached!` 
                : `${(targetMinScore - percentage).toFixed(1)}% more for ${course.targetGrade}`
              }
            </p>
          </div>
        ) : (
          <div 
            onClick={() => setIsEditingCourse(true)}
            className="py-4 border-2 border-dashed border-[#F2F4F6] dark:border-[#2C2C34] rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-[#2C2C34] transition-colors"
          >
            <Target size={20} className="text-[#B0B8C1]" />
            <p className="text-[12px] font-bold text-[#8B95A1]">Tap to set your target grade</p>
          </div>
        )}
      </div>

      {/* Final Exam Mode Toggle */}
      <div className="flex items-center justify-between p-5 bg-white dark:bg-[#202027] border border-[#F2F4F6] dark:border-[#2C2C34] rounded-2xl">
        <div className="flex flex-col">
          <span className="font-bold text-[#191F28] dark:text-[#F9FAFB]">Final Exam Mode</span>
          <span className="text-xs text-[#8B95A1]">60/20/20 Weighting Ratio</span>
        </div>
        <button 
          onClick={toggleFinalMode}
          className={`w-12 h-6 rounded-full transition-colors relative ${course.hasFinal ? 'bg-[#3182F6]' : 'bg-[#B0B8C1] dark:bg-[#333D4B]'}`}
        >
          <motion.div 
            animate={{ x: course.hasFinal ? 26 : 2 }}
            className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
          />
        </button>
      </div>

      {/* Assessments List (Toss Style) */}
      <section className="space-y-6">
        {(['Summative', 'Formative', 'Final'] as AssessmentType[]).map(type => {
          const list = assessmentsByType[type];
          const isFinalDisabled = type === 'Final' && !course.hasFinal;
          if (isFinalDisabled && list.length === 0) return null;

          const average = list.length > 0 
            ? (list.reduce((acc, a) => acc + a.score, 0) / list.length).toFixed(1) 
            : null;

          return (
            <div key={type} className={`space-y-3 ${isFinalDisabled ? 'opacity-40 grayscale' : ''}`}>
              <div className="flex items-center justify-between px-2">
                <div className="flex items-baseline gap-2">
                  <h4 className="text-sm font-bold text-[#8B95A1] uppercase tracking-widest">{type}</h4>
                  {average && (
                    <span className="text-sm font-bold text-[#B0B8C1]">(Avg: {average}%)</span>
                  )}
                </div>
                {!isFinalDisabled && (
                  <button 
                    onClick={() => setIsAddingAssessment(type)}
                    className="w-6 h-6 bg-[#F2F4F6] dark:bg-[#2D3540] text-[#3182F6] rounded-full flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
              
              <div className="bg-white dark:bg-[#202027] border border-[#F2F4F6] dark:border-[#2C2C34] rounded-3xl overflow-hidden divide-y divide-[#F2F4F6] dark:divide-[#2C2C34]">
                {list.map(a => (
                  <div 
                    key={a.id} 
                    onClick={() => !isFinalDisabled && setEditingAssessment(a)}
                    className="p-4 flex items-center justify-between hover:bg-[#F9FAFB] dark:hover:bg-[#2C2C34] transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F2F4F6] dark:bg-[#2C2C34] rounded-xl flex items-center justify-center text-[#8B95A1]">
                        <FileText size={20} />
                      </div>
                      <div className="flex items-center">
                        <p className="font-bold text-sm dark:text-[#F9FAFB]">{a.memo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-black text-lg dark:text-[#F9FAFB]">{a.score}%</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteAssessment(a.id);
                        }}
                        className="p-2 text-[#B0B8C1] hover:text-red-500 opacity-40 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {list.length === 0 && (
                  <div className="p-8 text-center text-[#B0B8C1] text-xs font-medium italic">
                    {isFinalDisabled ? 'Enable Final Exam Mode to add scores.' : `No ${type.toLowerCase()} scores yet.`}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <button 
        onClick={() => setIsConfirmingDelete(true)}
        className="w-full py-4 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl transition-colors"
      >
        <Trash2 size={20} />
        Delete Course
      </button>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirmingDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            onClick={() => setIsConfirmingDelete(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm bg-white dark:bg-[#111111] rounded-[32px] p-8 space-y-6 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={32} />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-bold dark:text-[#F9FAFB]">Delete Course?</h2>
                <p className="text-[#8B95A1] text-base leading-relaxed">
                  Are you sure you want to delete <span className="font-bold text-[#191F28] dark:text-[#F9FAFB]">{course.name}</span>? All assessment data for this course will be lost.
                </p>
              </div>

              <div className="flex flex-col gap-4 pt-2">
                <button 
                  onClick={onDelete}
                  className="w-full py-5 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-colors text-lg"
                >
                  Yes, Delete Course
                </button>
                <button 
                  onClick={() => setIsConfirmingDelete(false)}
                  className="w-full py-5 bg-[#F2F4F6] dark:bg-[#202027] text-[#8B95A1] font-bold rounded-2xl hover:bg-[#E5E8EB] dark:hover:bg-[#2C2C34] transition-colors text-lg"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Assessment Modal */}
      <AnimatePresence>
        {(isAddingAssessment || editingAssessment) && (
          <AddAssessmentModal 
            type={isAddingAssessment || editingAssessment!.type}
            initialAssessment={editingAssessment || undefined}
            onClose={() => {
              setIsAddingAssessment(null);
              setEditingAssessment(null);
            }}
            onSave={(a) => {
              if (editingAssessment) {
                onUpdateAssessment(a);
              } else {
                onAddAssessment(a);
              }
              setIsAddingAssessment(null);
              setEditingAssessment(null);
            }}
            onDelete={editingAssessment ? () => {
              onDeleteAssessment(editingAssessment.id);
              setIsAddingAssessment(null);
              setEditingAssessment(null);
            } : undefined}
          />
        )}
      </AnimatePresence>

      {/* Edit Course Modal */}
      <AnimatePresence>
        {isEditingCourse && (
          <AddCourseModal 
            initialCourse={course}
            onClose={() => setIsEditingCourse(false)}
            onSave={(updated) => {
              onUpdateCourse(updated);
              setIsEditingCourse(false);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AddAssessmentModal({ 
  type, 
  initialAssessment,
  onClose, 
  onSave,
  onDelete
}: { 
  type: AssessmentType, 
  initialAssessment?: Assessment,
  onClose: () => void, 
  onSave: (a: Assessment) => void,
  onDelete?: () => void
}) {
  const [score, setScore] = useState(initialAssessment?.score.toString() || '');
  const [memo, setMemo] = useState(initialAssessment?.memo || '');
  const [isError, setIsError] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!score) return;
    
    const scoreVal = parseFloat(score);
    if (scoreVal < 0 || scoreVal > 100) {
      setIsError(true);
      setTimeout(() => setIsError(false), 800);
      return;
    }
    
    onSave({
      id: initialAssessment?.id || Date.now().toString(),
      type,
      score: scoreVal,
      memo: memo.trim() || 'Assessment'
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm bg-white dark:bg-[#111111] rounded-[32px] p-8 space-y-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold dark:text-[#F9FAFB]">{initialAssessment ? 'Edit' : 'Add'} {type} Score</h2>
          {onDelete && (
            <button 
              onClick={onDelete}
              className="p-2 text-[#8B95A1] hover:text-red-500 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-[#8B95A1] uppercase tracking-widest">Score (%)</label>
            <motion.input 
              autoFocus
              type="number" 
              inputMode="decimal"
              pattern="[0-9]*"
              step="any"
              value={score}
              onChange={e => {
                setScore(e.target.value);
                if (isError) setIsError(false);
              }}
              onFocus={e => e.target.select()}
              animate={isError ? { x: [-10, 10, -10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              placeholder="0-100"
              className={`w-full p-5 bg-[#F2F4F6] dark:bg-[#202027] dark:text-[#F9FAFB] rounded-2xl outline-none transition-all font-bold text-lg border-2 ${
                isError ? 'border-[#FF3B30] bg-[#FFF5F5] dark:bg-red-950/30' : 'border-transparent focus:ring-2 focus:ring-[#3182F6]'
              }`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-[#8B95A1] uppercase tracking-widest">Memo (Optional)</label>
            <input 
              type="text" 
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="Assessment"
              className="w-full p-5 bg-[#F2F4F6] dark:bg-[#202027] dark:text-[#F9FAFB] rounded-2xl outline-none focus:ring-2 focus:ring-[#3182F6] transition-all text-lg"
            />
          </div>
          <div className="flex gap-4 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-5 bg-[#F2F4F6] dark:bg-[#202027] text-[#8B95A1] font-bold rounded-2xl text-lg"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-5 bg-[#3182F6] text-white font-bold rounded-2xl text-lg"
            >
              {initialAssessment ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function AddCourseModal({ 
  initialCourse,
  onClose, 
  onSave,
  onAdd // For backward compatibility if needed, but we'll use onSave
}: { 
  initialCourse?: Course,
  onClose: () => void, 
  onSave?: (c: Course) => void,
  onAdd?: (c: Course) => void
}) {
  const [name, setName] = useState(initialCourse?.name || '');
  const [isAP, setIsAP] = useState(initialCourse?.isAP || false);
  const [credit, setCredit] = useState(initialCourse?.credit || 1.0);
  const [targetGrade, setTargetGrade] = useState<Grade | undefined>(initialCourse?.targetGrade);
  const [isError, setIsError] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(!!initialCourse);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    const query = name.trim().toLowerCase();
    if (!query) return [];
    
    // Check aliases
    let aliasMatches: string[] = [];
    for (const [alias, targets] of Object.entries(COURSE_ALIASES)) {
      if (query.includes(alias)) {
        aliasMatches = [...aliasMatches, ...targets];
      }
    }
    
    const matches = COMMON_COURSES.filter(c => 
      c.toLowerCase().includes(query) && 
      c.toLowerCase() !== query
    );
    
    // Combine and deduplicate
    return Array.from(new Set([...aliasMatches, ...matches]))
      .filter(c => c.toLowerCase() !== query)
      .slice(0, 10);
  }, [name]);

  const handleNameChange = (newName: string) => {
    setName(newName);
    if (isError) setIsError(false);
    
    // Auto-toggle AP weighting
    if (newName.trim().toUpperCase().startsWith('AP')) {
      setIsAP(true);
    } else if (newName.trim() === '') {
      setIsAP(false);
    }

    // Auto-set credit for Korean courses
    const lowerName = newName.toLowerCase();
    if (lowerName.includes('korean language') || lowerName.includes('korean social')) {
      setCredit(0.5);
    } else {
      setCredit(1.0);
    }
    setShowSuggestions(true);
  };

  const selectSuggestion = (suggestion: string) => {
    setName(suggestion);
    // Explicitly set AP weighting based on suggestion
    const lowerSuggestion = suggestion.toLowerCase();
    setIsAP(lowerSuggestion.startsWith('ap'));

    // Credit Logic
    if (lowerSuggestion.includes('korean language') || lowerSuggestion.includes('korean social')) {
      setCredit(0.5);
    } else {
      setCredit(1.0);
    }
    setShowSuggestions(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const courseData: Course = {
      id: initialCourse?.id || Date.now().toString(),
      name: name.trim() || 'Untitled Course',
      isAP,
      hasFinal: initialCourse?.hasFinal || false,
      assessments: initialCourse?.assessments || [],
      targetGrade,
      credit: credit
    };

    if (onSave) onSave(courseData);
    else if (onAdd) onAdd(courseData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-white dark:bg-[#111111] rounded-t-[32px] p-8 space-y-8"
        onClick={(e) => { e.stopPropagation(); setShowSuggestions(false); }}
      >
        <div className="w-12 h-1.5 bg-[#F2F4F6] dark:bg-[#2C2C34] rounded-full mx-auto mb-2" />
        
        <h2 className="text-2xl font-bold dark:text-[#F9FAFB]">{initialCourse ? 'Edit Course' : 'Add New Course'}</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3 relative z-30">
            <label className={`text-base font-bold uppercase tracking-wider transition-colors ${isError ? 'text-[#FF3B30]' : 'text-[#8B95A1]'}`}>
              Course Name (Optional)
            </label>
            <motion.input 
              autoFocus
              type="text" 
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              animate={isError ? { x: [-15, 15, -15, 15, -15, 15, 0] } : {}}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              placeholder="e.g. AP World History"
              onClick={e => { e.stopPropagation(); setShowSuggestions(true); }}
              className={`w-full p-5 bg-[#F2F4F6] dark:bg-[#202027] dark:text-[#F9FAFB] rounded-2xl outline-none transition-all border-2 text-lg ${
                isError ? 'border-[#FF3B30] bg-[#FFF5F5] dark:bg-red-950/30' : 'border-transparent focus:ring-2 focus:ring-[#3182F6]'
              }`}
            />
            
            {/* Suggestions */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 right-0 top-[calc(100%+8px)] bg-white dark:bg-[#2C2C34] border-2 border-[#E5E8EB] dark:border-[#333D4B] rounded-2xl shadow-2xl z-50 overflow-y-auto max-h-56 custom-scrollbar divide-y divide-[#F2F4F6] dark:divide-[#2C2C34] backdrop-blur-md"
                  onClick={e => e.stopPropagation()}
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => selectSuggestion(s)}
                      className="w-full p-3.5 text-left hover:bg-[#F2F4F6] dark:hover:bg-[#2C2C34] transition-colors font-bold text-sm flex items-center justify-between group"
                    >
                      <span className="dark:text-[#F9FAFB]">{s}</span>
                      <div className="w-8 h-8 bg-[#F2F4F6] dark:bg-[#333D4B] rounded-lg flex items-center justify-center transition-colors group-hover:bg-[#3182F6] group-hover:text-white">
                        <ChevronRight size={18} />
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between p-5 bg-[#F2F4F6] dark:bg-[#202027] rounded-2xl">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-lg dark:text-[#F9FAFB]">AP Weighting</span>
              <span className="text-sm text-[#8B95A1]">Enable +1.0 point extra value</span>
            </div>
            <button 
              type="button"
              onClick={() => setIsAP(!isAP)}
              className={`w-14 h-7 rounded-full transition-colors relative ${isAP ? 'bg-[#3182F6]' : 'bg-[#B0B8C1] dark:bg-[#333D4B]'}`}
            >
              <motion.div 
                animate={{ x: isAP ? 28 : 2 }}
                className="absolute top-1 left-0 w-5 h-5 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-base font-bold text-[#8B95A1] uppercase tracking-wider">Target Grade (Optional)</label>
            <div className="relative">
              <select 
                value={targetGrade || ''}
                onChange={e => setTargetGrade((e.target.value as Grade) || undefined)}
                className="w-full p-5 bg-[#F2F4F6] dark:bg-[#202027] dark:text-[#F9FAFB] rounded-2xl outline-none font-bold appearance-none cursor-pointer pr-12 text-lg"
              >
                <option value="">Not Set</option>
                {GRADE_SCALE.map(s => (
                  <option key={s.grade} value={s.grade}>{s.grade} (Min {s.minScore}%)</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#8B95A1] pointer-events-none" size={24} />
            </div>
          </div>

          <div className="pt-2">
            {!showAdvanced ? (
              <button 
                type="button"
                onClick={() => setShowAdvanced(true)}
                className="text-sm font-bold text-[#3182F6] hover:underline"
              >
                Advanced Settings
              </button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4 pt-2"
              >
                <div className="flex items-center justify-between p-5 bg-[#F2F4F6] dark:bg-[#202027] rounded-2xl">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-lg dark:text-[#F9FAFB]">Credits</span>
                    <span className="text-sm text-[#8B95A1]">
                      {credit === 0.5 ? 'Korean Course (0.5 Unit)' : 'Standard Course (1.0 Unit)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => setCredit(0.5)}
                      className={`px-4 py-2 rounded-xl font-bold transition-all ${credit === 0.5 ? 'bg-[#3182F6] text-white shadow-md' : 'bg-white dark:bg-[#333D4B] text-[#8B95A1]'}`}
                    >
                      0.5
                    </button>
                    <button 
                      type="button"
                      onClick={() => setCredit(1.0)}
                      className={`px-4 py-2 rounded-xl font-bold transition-all ${credit === 1.0 ? 'bg-[#3182F6] text-white shadow-md' : 'bg-white dark:bg-[#333D4B] text-[#8B95A1]'}`}
                    >
                      1.0
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <button 
            type="submit"
            className="w-full py-6 bg-[#3182F6] text-white font-bold rounded-2xl hover:bg-[#1B64DA] transition-colors text-xl"
          >
            {initialCourse ? 'Save Changes' : 'Add Course'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function ResetModal({ onClose, onConfirm }: { onClose: () => void, onConfirm: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-sm bg-white dark:bg-[#111111] rounded-[32px] p-8 space-y-6 text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle size={32} />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-2xl font-bold dark:text-[#F9FAFB]">Reset All Data?</h2>
          <p className="text-[#8B95A1] text-base leading-relaxed">
            This action will permanently delete all your courses and assessment data. This cannot be undone.
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-2">
          <button 
            onClick={onConfirm}
            className="w-full py-5 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-colors text-lg"
          >
            Yes, Reset Everything
          </button>
          <button 
            onClick={onClose}
            className="w-full py-5 bg-[#F2F4F6] dark:bg-[#202027] text-[#8B95A1] font-bold rounded-2xl hover:bg-[#E5E8EB] dark:hover:bg-[#2C2C34] transition-colors text-lg"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
