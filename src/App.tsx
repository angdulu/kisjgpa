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
  calculateGradePoint, 
  calculateNextScoreNeeded 
} from './utils/gpa';

// Mock Initial Data
const INITIAL_COURSES: Course[] = [
  {
    id: '1',
    name: 'AP Calculus BC',
    isAP: true,
    hasFinal: true,
    targetGrade: 'A',
    assessments: [
      { id: 'a1', type: 'Summative', score: 95, memo: 'Unit 1 Test', date: '2026-03-10' },
      { id: 'a2', type: 'Summative', score: 88, memo: 'Unit 2 Test', date: '2026-03-20' },
      { id: 'a3', type: 'Formative', score: 100, memo: 'Unit 1 Quiz', date: '2026-03-05' },
      { id: 'a4', type: 'Formative', score: 92, memo: 'Unit 2 Quiz', date: '2026-03-12' },
      { id: 'a5', type: 'Formative', score: 100, memo: 'Homework 1', date: '2026-03-15' }
    ]
  },
  {
    id: '2',
    name: 'English 10',
    isAP: false,
    hasFinal: false,
    targetGrade: 'A-',
    assessments: [
      { id: 'a5', type: 'Summative', score: 92, memo: 'Essay 1', date: '2026-03-08' },
      { id: 'a6', type: 'Formative', score: 95, memo: 'Participation', date: '2026-03-14' }
    ]
  }
];

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
    const sum = courses.reduce((acc, c) => acc + calculateGradePoint(c, isWeighted), 0);
    return (sum / courses.length).toFixed(3);
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
    <div className="min-h-screen bg-[#F2F4F6] dark:bg-[#111111] text-[#191F28] dark:text-[#F9FAFB] font-sans selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors duration-300">
      <div className="w-full max-w-md mx-auto bg-white dark:bg-[#111111] min-h-screen relative overflow-hidden flex flex-col">
        
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
          <span>Target Grade: {course.targetGrade}</span>
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
                      <div>
                        <p className="font-bold text-sm dark:text-[#F9FAFB]">{a.memo}</p>
                        <p className="text-[10px] text-[#B0B8C1] font-medium">{a.date}</p>
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
                        className="p-2 text-[#B0B8C1] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
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
        onClick={onDelete}
        className="w-full py-4 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl transition-colors"
      >
        <Trash2 size={20} />
        Delete Course
      </button>

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
  onSave 
}: { 
  type: AssessmentType, 
  initialAssessment?: Assessment,
  onClose: () => void, 
  onSave: (a: Assessment) => void 
}) {
  const [score, setScore] = useState(initialAssessment?.score.toString() || '');
  const [memo, setMemo] = useState(initialAssessment?.memo || '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!score) return;
    
    onSave({
      id: initialAssessment?.id || Date.now().toString(),
      type,
      score: parseFloat(score),
      memo: memo.trim() || 'Assessment',
      date: initialAssessment?.date || new Date().toISOString().split('T')[0]
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
        <h2 className="text-2xl font-bold dark:text-[#F9FAFB]">{initialAssessment ? 'Edit' : 'Add'} {type} Score</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-[#8B95A1] uppercase tracking-widest">Score (%)</label>
            <input 
              autoFocus
              type="number" 
              inputMode="decimal"
              pattern="[0-9]*"
              step="any"
              min="0"
              max="100"
              value={score}
              onChange={e => setScore(e.target.value)}
              onFocus={e => e.target.select()}
              placeholder="0-100"
              className="w-full p-5 bg-[#F2F4F6] dark:bg-[#202027] dark:text-[#F9FAFB] rounded-2xl outline-none focus:ring-2 focus:ring-[#3182F6] transition-all font-bold text-lg"
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
  const [targetGrade, setTargetGrade] = useState<Grade>(initialCourse?.targetGrade || 'A');
  const [isError, setIsError] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setIsError(true);
      setTimeout(() => setIsError(false), 800);
      return;
    }

    const courseData: Course = {
      id: initialCourse?.id || Date.now().toString(),
      name,
      isAP,
      hasFinal: initialCourse?.hasFinal || false,
      assessments: initialCourse?.assessments || [],
      targetGrade
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
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-[#F2F4F6] dark:bg-[#2C2C34] rounded-full mx-auto mb-2" />
        
        <h2 className="text-2xl font-bold dark:text-[#F9FAFB]">{initialCourse ? 'Edit Course' : 'Add New Course'}</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className={`text-base font-bold uppercase tracking-wider transition-colors ${isError ? 'text-[#FF3B30]' : 'text-[#8B95A1]'}`}>
              Course Name
            </label>
            <motion.input 
              autoFocus
              type="text" 
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (isError) setIsError(false);
              }}
              animate={isError ? { x: [-15, 15, -15, 15, -15, 15, 0] } : {}}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              placeholder="e.g. AP World History"
              className={`w-full p-5 bg-[#F2F4F6] dark:bg-[#202027] dark:text-[#F9FAFB] rounded-2xl outline-none transition-all border-2 text-lg ${
                isError ? 'border-[#FF3B30] bg-[#FFF5F5] dark:bg-red-950/30' : 'border-transparent focus:ring-2 focus:ring-[#3182F6]'
              }`}
            />
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
            <label className="text-base font-bold text-[#8B95A1] uppercase tracking-wider">Target Grade</label>
            <div className="relative">
              <select 
                value={targetGrade}
                onChange={e => setTargetGrade(e.target.value as Grade)}
                className="w-full p-5 bg-[#F2F4F6] dark:bg-[#202027] dark:text-[#F9FAFB] rounded-2xl outline-none font-bold appearance-none cursor-pointer pr-12 text-lg"
              >
                {GRADE_SCALE.map(s => (
                  <option key={s.grade} value={s.grade}>{s.grade} (Min {s.minScore}%)</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#8B95A1] pointer-events-none" size={24} />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-6 bg-[#3182F6] text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-[#1B64DA] transition-colors text-xl"
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
