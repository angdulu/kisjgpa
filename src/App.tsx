/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, FormEvent, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import { 
  Minus,
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
  ShieldCheck,
  Menu,
  X,
  History,
  BarChart3,
  GripVertical
} from 'lucide-react';
import { Course, Grade, GRADE_SCALE, Assessment, AssessmentType, SemesterGPA, SemesterGradeCount } from './types';
import { 
  calculateCurrentPercentage, 
  getLetterGrade, 
  calculateGradePoint,
  calculateSemesterGPA, formatPercentage
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
  const [activeTab, setActiveTab] = useState<'current' | 'cumulative' | 'quick'>('current');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cumulativeGPAs, setCumulativeGPAs] = useState<SemesterGPA[]>(() => {
    const saved = localStorage.getItem('kisj-gpa-cumulative');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('kisj-gpa-courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('kisj-gpa-cumulative', JSON.stringify(cumulativeGPAs));
  }, [cumulativeGPAs]);

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
    setCourses(prev => [...prev, newCourse]);
    setIsAddingCourse(false);
  };

  const updateCourse = (updatedCourse: Course) => {
    setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };

  const deleteCourse = (id: string) => {
    setSelectedCourseId(null);
    setCourses(prev => prev.filter(c => c.id !== id));
  };
  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    setTimeout(() => setSelectedCourseId(null), 10);
  };

        ? { ...c, assessments: [...c.assessments, assessment] } 
        : c
    ));
  };

  const updateAssessment = (courseId: string, updatedAssessment: Assessment) => {
    setCourses(prev => prev.map(c => 
      c.id === courseId 
        ? { ...c, assessments: c.assessments.map(a => a.id === updatedAssessment.id ? updatedAssessment : a) } 
        : c
    ));
  };

  const deleteAssessment = (courseId: string, assessmentId: string) => {
    setCourses(prev => prev.map(c => 
      c.id === courseId 
        ? { ...c, assessments: c.assessments.filter(a => a.id !== assessmentId) } 
        : c
    ));
  };

  const resetData = () => {
    setCourses(INITIAL_COURSES);
    setIsResetting(false);
  };

    localStorage.removeItem('kisj-gpa-courses');
    localStorage.removeItem('kisj-gpa-cumulative');
    localStorage.removeItem('kisj-gpa-weighted');
    setIsResetting(false);
    setSelectedCourseId(null);
    setIsSidebarOpen(false);
  };

  const addSemesterGPA = (data: SemesterGPA) => {
    setCumulativeGPAs([...cumulativeGPAs, data]);
  };

  const updateSemesterGPA = (updated: SemesterGPA) => {
    setCumulativeGPAs(cumulativeGPAs.map(s => s.id === updated.id ? updated : s));
  };

  const deleteSemesterGPA = (id: string) => {
    setCumulativeGPAs(cumulativeGPAs.filter(s => s.id !== id));
  };

  const cumulativeGPAVal = useMemo(() => {
    if (cumulativeGPAs.length === 0) return "0.000";
    const sum = cumulativeGPAs.reduce((acc, s) => acc + s.gpa, 0);
    return (sum / cumulativeGPAs.length).toFixed(3);
  }, [cumulativeGPAs]);

  const displayGPA = activeTab === 'current' ? overallGPA : (activeTab === 'cumulative' ? cumulativeGPAVal : "Quick");

  return (
    <div className="app-shell font-sans">
      <div className="app-frame">
        <div className="ambient-orb left-[-4rem] top-[-3rem] h-40 w-40 bg-slate-900/5 dark:bg-white/3" />
        <div className="ambient-orb right-[-3rem] top-28 h-32 w-32 bg-slate-900/4 dark:bg-white/2" />
        <div className="ambient-orb bottom-24 left-[-2rem] h-32 w-32 bg-slate-900/5 dark:bg-white/3" />
        
        {/* Header */}
        <header className="glass-header px-6 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-5 flex items-center justify-between">
          {selectedCourseId ? (
            <div className="flex items-center justify-between w-full">
              <button 
                onClick={() => setSelectedCourseId(null)}
                className="icon-button h-11 w-11 -ml-1 text-[#64748B] dark:text-[#CBD5E1]"
              >
                <ArrowLeft size={28} />
              </button>
              <div className="flex items-center gap-2">
                {/* Course GPA removed as requested */}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="icon-button h-11 w-11 -ml-1 text-[#64748B] dark:text-[#CBD5E1]"
              >
                <Menu size={28} />
              </button>
              <div className="flex flex-col">
                <span className="section-kicker">Academic Planner</span>
                <h1 className="text-xl font-extrabold tracking-tight">KISJ GPA</h1>
              </div>
            </div>
          )}
          {!selectedCourseId && (
            <div className="flex items-center gap-5">
              <div className="segmented-shell flex items-center">
                <button 
                  onClick={() => setIsWeighted(false)}
                  className={`segmented-option ${!isWeighted ? 'segmented-option-active' : ''}`}
                >
                  UW
                </button>
                <button 
                  onClick={() => setIsWeighted(true)}
                  className={`segmented-option ${isWeighted ? 'segmented-option-active' : ''}`}
                >
                  W
                </button>
              </div>
              <div className="text-right">
                <div className="section-kicker">
                  {activeTab === 'cumulative' ? 'CGPA' : 'GPA'}
                </div>
                <div className="text-2xl font-black text-[#3182F6]">{displayGPA}</div>
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 pb-32">
            <AnimatePresence mode="wait">
              {selectedCourseId ? (
                <CourseDetail 
                  course={selectedCourse!} 
                  onDelete={() => deleteCourse(selectedCourse!.id)}
                  onUpdateCourse={updateCourse}
                  onAddAssessment={(a) => addAssessment(selectedCourse!.id, a)}
                  onUpdateAssessment={(a) => updateAssessment(selectedCourse!.id, a)}
                  onDeleteAssessment={(id) => deleteAssessment(selectedCourse!.id, id)}
                />
              ) : activeTab === 'current' ? (
                <CurrentTermView 
                  courses={courses} 
                  onSelectCourse={setSelectedCourseId} 
                  onReorder={setCourses}
                />
              ) : activeTab === 'cumulative' ? (
                <CumulativeView 
                  semesters={cumulativeGPAs} 
                  onAddSemester={addSemesterGPA}
                  onUpdateSemester={updateSemesterGPA}
                  onDeleteSemester={deleteSemesterGPA}
                  onReorder={setCumulativeGPAs}
                />
              ) : (
                <QuickGPAView />
              )}
            </AnimatePresence>
          </div>
        </main>

        {!selectedCourseId && (
          <div className="px-6 py-5 z-10">
            <div className="surface-card-muted p-4 rounded-[26px] flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-[#3182F6]">
                  <ShieldCheck size={18} />
                  <span className="text-[12px] font-bold uppercase tracking-wider">Privacy First</span>
                </div>
                <p className="text-[11px] text-[#8B95A1] leading-relaxed">Data is stored only on your device.</p>
              </div>
            </div>
            <footer className="mt-4 flex items-center justify-center gap-4 text-[11px] text-[#94A3B8] dark:text-[#64748B]">
              <span>KISJ Guidelines</span>
              <span className="w-px h-3 bg-slate-200/70 dark:bg-white/10" />
              <a href="mailto:jwookim27@kis.ac" className="text-[#3182F6] font-bold hover:underline">Support</a>
            </footer>
          </div>
        )}

        {/* FAB */}
        {!selectedCourseId && activeTab === 'current' && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddingCourse(true)}
            className="primary-button absolute bottom-[150px] right-6 z-30 flex h-16 w-16 items-center justify-center rounded-full text-white"
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

        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <Sidebar 
              onClose={() => setIsSidebarOpen(false)}
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setIsSidebarOpen(false);
              }}
              onReset={() => {
                setIsResetting(true);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Sidebar({ 
  onClose, 
  activeTab, 
  onTabChange,
  onReset
}: { 
  onClose: () => void, 
  activeTab: 'current' | 'cumulative' | 'quick',
  onTabChange: (tab: 'current' | 'cumulative' | 'quick') => void,
  onReset: () => void
}) {
  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 left-0 z-[70] flex w-72 flex-col p-6 sidebar-panel surface-card-strong border-r border-white/20"
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#3B82F6_0%,#2563EB_100%)] text-white shadow-lg shadow-blue-500/20">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg">Menu</span>
          </div>
          <button onClick={onClose} className="icon-button h-10 w-10 -mr-1 text-[#64748B] dark:text-[#CBD5E1]">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem 
            icon={<Calendar size={20} />} 
            label="Current Term" 
            isActive={activeTab === 'current'} 
            onClick={() => onTabChange('current')}
          />
          <SidebarItem 
            icon={<History size={20} />} 
            label="Cumulative GPA" 
            isActive={activeTab === 'cumulative'} 
            onClick={() => onTabChange('cumulative')}
          />
          <SidebarItem 
            icon={<Calculator size={20} />} 
            label="Quick GPA" 
            isActive={activeTab === 'quick'} 
            onClick={() => onTabChange('quick')}
          />
        </nav>

        <div className="pt-6 border-t border-slate-200/70 dark:border-white/8 space-y-2">
          <SidebarItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            onClick={() => {}}
          />
          <button 
            onClick={onReset}
            className="danger-button w-full p-4 flex items-center gap-4"
          >
            <Trash2 size={20} />
            Reset All Data
          </button>
        </div>
      </motion.div>
    </>
  );
}

function SidebarItem({ icon, label, isActive, onClick }: { 
  icon: React.ReactNode, 
  label: string, 
  isActive?: boolean, 
  onClick: () => void 
}) {
  return (
    <button 
      onClick={onClick}
      className={`w-full p-4 flex items-center gap-4 rounded-2xl transition-all ${
        isActive 
          ? 'surface-card text-[#3182F6] shadow-sm' 
          : 'text-[#8B95A1] hover:bg-white/70 dark:hover:bg-white/5'
      }`}
    >
      <div className={isActive ? 'text-[#3182F6]' : 'text-[#B0B8C1]'}>
        {icon}
      </div>
      <span className="font-bold">{label}</span>
    </button>
  );
}

function CourseReorderItem({
  course,
  onSelectCourse
}: {
  key?: React.Key,
  course: Course,
  onSelectCourse: (id: string) => void
}) {
  const percentage = calculateCurrentPercentage(course);
  const letterGrade = getLetterGrade(percentage);
  const dragControls = useDragControls();
  const isReorderingRef = useRef(false);

  return (
    <Reorder.Item
      value={course}
      dragListener={false}
      dragControls={dragControls}
      whileDrag={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      onDragStart={() => {
        isReorderingRef.current = true;
      }}
      onDragEnd={() => {
        window.setTimeout(() => {
          isReorderingRef.current = false;
        }, 0);
      }}
      onTap={() => {
        if (isReorderingRef.current) return;
        onSelectCourse(course.id);
      }}
      className="surface-card-strong p-5 rounded-[28px] cursor-pointer flex items-center justify-between group select-none relative z-10"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
            dragControls.start(e);
          }}
          className="flex items-center justify-center p-2 -ml-2 text-[#B0B8C1] hover:text-[#3182F6] cursor-grab active:cursor-grabbing touch-none transition-colors"
          aria-label="Reorder course"
        >
          <GripVertical size={20} />
        </button>
        <div className="flex flex-col gap-0.5">
          {course.isAP && (
            <span className="text-[10px] font-black text-orange-500 dark:text-orange-400 uppercase tracking-[0.15em] leading-none mb-0.5">AP</span>
          )}
          <span className="font-bold text-xl leading-tight dark:text-[#F9FAFB]">{course.name}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center justify-center min-w-[64px]">
          <div className="text-2xl font-black text-[#3182F6] leading-none mb-1.5">{letterGrade}</div>
          <div className="text-[12px] text-[#8B95A1] font-bold">{formatPercentage(percentage, 2)}%</div>
        </div>
        <ChevronRight size={22} className="text-[#B0B8C1] group-hover:text-[#3182F6] transition-colors shrink-0" />
      </div>
    </Reorder.Item>
  );
}

function CurrentTermView({ 
  courses, 
  onSelectCourse,
  onReorder 
}: { 
  courses: Course[], 
  onSelectCourse: (id: string) => void,
  onReorder: (newCourses: Course[]) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <section>
        <div className="grid gap-3.5">
          <Reorder.Group axis="y" values={courses} onReorder={onReorder} className="grid gap-3.5">
            {courses.map(course => (
              <CourseReorderItem key={course.id} course={course} onSelectCourse={onSelectCourse} />
            ))}
          </Reorder.Group>
          {courses.length === 0 && (
            <div className="surface-card-muted rounded-[30px] text-center py-12 text-[#8B95A1]">
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
  const isReorderingAssessmentsRef = useRef(false);

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
      <div className="surface-card-muted rounded-[32px] px-5 py-8 text-center space-y-3 relative">
        <div className="flex flex-col items-center justify-center gap-1.5">
          {course.isAP && (
            <span className="text-[11px] font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full uppercase">AP</span>
          )}
          <h2 className="text-4xl font-extrabold tracking-tight dark:text-[#F9FAFB] leading-tight px-4">{course.name}</h2>
          <button 
            onClick={() => setIsEditingCourse(true)}
            className="icon-button h-10 w-10 text-[#8B95A1] flex items-center justify-center"
          >
            <Settings size={20} />
          </button>
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
      <div className="surface-card-strong p-6 rounded-[32px] space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[11px] text-[#8B95A1] font-bold uppercase tracking-wider mb-1">Current Grade</p>
            <p className="text-5xl font-black text-[#3182F6]">{letterGrade}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[#8B95A1] font-bold uppercase tracking-wider mb-1">Percentage</p>
            <p className="text-2xl font-bold text-[#191F28] dark:text-[#F9FAFB]">{formatPercentage(percentage, 2)}%</p>
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
                : `${formatPercentage(targetMinScore - percentage, 2)}% more for ${course.targetGrade}`
              }
            </p>
          </div>
        ) : (
          <div 
            onClick={() => setIsEditingCourse(true)}
            className="surface-card-muted py-4 rounded-[24px] flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-white/80 dark:hover:bg-white/5 transition-colors border-2 border-dashed border-slate-200/80 dark:border-white/8"
          >
            <Target size={20} className="text-[#B0B8C1]" />
            <p className="text-[12px] font-bold text-[#8B95A1]">Tap to set your target grade</p>
          </div>
        )}
      </div>

      {/* Final Exam Mode Toggle */}
      <div className="surface-card p-5 rounded-[28px] flex items-center justify-between">
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

          const activeList = list.filter(a => a.enabled !== false);
          const average = activeList.length > 0 
            ? formatPercentage(activeList.reduce((acc, a) => acc + a.score, 0) / activeList.length, 2) 
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
                    className="icon-button h-8 w-8 text-[#3182F6]"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
              
              <Reorder.Group 
                axis="y" 
                values={list} 
                onReorder={(newList) => {
                  const otherTypes = course.assessments.filter(a => a.type !== type);
                  onUpdateCourse({ ...course, assessments: [...otherTypes, ...newList] });
                }}
                className="surface-card rounded-[30px] overflow-hidden divide-y divide-slate-200/70 dark:divide-white/8"
              >
                {list.map(a => (
                <Reorder.Item
                    key={a.id}
                    value={a}
                    onDragStart={() => {
                      isReorderingAssessmentsRef.current = true;
                    }}
                    onDragEnd={() => {
                      window.setTimeout(() => {
                        isReorderingAssessmentsRef.current = false;
                      }, 0);
                    }}
                    onTap={() => {
                      if (isFinalDisabled || isReorderingAssessmentsRef.current) return;
                      setEditingAssessment(a);
                    }}
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                    className={`p-4 flex items-center justify-between transition-colors group cursor-pointer select-none ${a.enabled === false ? 'opacity-80 bg-[#fbfbfb11]' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical size={18} className="text-[#B0B8C1] cursor-grab active:cursor-grabbing" />
                      <div className="surface-card-muted w-10 h-10 rounded-xl flex items-center justify-center text-[#8B95A1]">
                        <FileText size={20} />
                      </div>
                      <div className="flex items-center">
                        <p className="font-bold text-sm dark:text-[#F9FAFB]">{a.memo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onPointerDownCapture={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateAssessment({ ...a, enabled: a.enabled === false });
                        }}
                        className={`w-9 h-5 rounded-full relative transition-all duration-200 ${a.enabled !== false ? 'bg-[#3182F6]' : 'bg-[#B0B8C1] dark:bg-[#333D4B]'}`}
                      >
                        <motion.div 
                          animate={{ x: a.enabled !== false ? 18 : 2 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-sm"
                        />
                      </button>
                      <div className="text-right min-w-[3.5rem]">
                        <p className={`font-black text-lg transition-all ${a.enabled === false ? 'text-[#B0B8C1] line-through opacity-60' : 'dark:text-[#F9FAFB]'}`}>{a.score}%</p>
                      </div>
                      <button 
                        onPointerDownCapture={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteAssessment(a.id);
                        }}
                        className="p-2 text-[#B0B8C1] hover:text-red-500 opacity-40 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
              {list.length === 0 && (
                  <div className="surface-card-muted rounded-[26px] p-8 text-center text-[#8B95A1] text-base font-semibold leading-relaxed">
                    {isFinalDisabled ? 'Enable Final Exam Mode to add scores.' : `No ${type.toLowerCase()} scores yet.`}
                  </div>
                )}
            </div>
          );
        })}
      </section>

      <button 
        onClick={() => setIsConfirmingDelete(true)}
        className="danger-button w-full py-4 flex items-center justify-center gap-2"
      >
        <Trash2 size={20} />
        Delete Course
      </button>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirmingDelete && createPortal(
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
                  className="w-full py-4.5 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-colors text-lg"
                >
                  Yes, Delete Course
                </button>
                <button 
                  onClick={() => setIsConfirmingDelete(false)}
                  className="w-full py-4.5 bg-[#F2F4F6] dark:bg-[#202027] text-[#8B95A1] font-bold rounded-2xl hover:bg-[#E5E8EB] dark:hover:bg-[#2C2C34] transition-colors text-lg"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>,
          document.body
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
    if (!score || isNaN(parseFloat(score))) {
      if (isError) setIsError(false);
      setTimeout(() => setIsError(true), 10);
      setTimeout(() => setIsError(false), 800);
      return;
    }
    
    const scoreVal = parseFloat(score);
    if (scoreVal < 0 || scoreVal > 100) {
      if (isError) setIsError(false);
      setTimeout(() => setIsError(true), 10);
      setTimeout(() => setIsError(false), 800);
      return;
    }

    
    onSave({
      id: initialAssessment?.id || Date.now().toString(),
      type,
      score: scoreVal,
      memo: memo.trim() || 'Assessment',
      enabled: initialAssessment?.enabled ?? true
    });
  };

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-start overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6 pt-10 sm:pt-20"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="modal-panel space-y-6 w-full mb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center sticky top-0 bg-transparent backdrop-blur-xl -mt-2 pt-2 z-10">
          <h2 className="text-2xl font-bold dark:text-[#F9FAFB]">{initialAssessment ? 'Edit' : 'Add'} {type} Score</h2>
          {onDelete && (
            <button 
              onClick={onDelete}
              className="icon-button h-10 w-10 text-[#8B95A1] hover:text-red-500 transition-colors"
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
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
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
              className={`field-input w-full p-5 dark:text-[#F9FAFB] font-bold text-lg border-2 ${
                isError ? 'border-[#FF3B30] bg-[#FFF5F5] dark:bg-red-950/30' : 'border-transparent'
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
              className="field-input w-full p-5 dark:text-[#F9FAFB] text-lg"
            />
          </div>
          <div className="flex gap-4 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="secondary-button flex-1 py-5 text-lg"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="primary-button flex-1 py-5 text-lg"
            >
              {initialAssessment ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>,
    document.body
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
    if (!name.trim()) {
      if (isError) setIsError(false);
      setTimeout(() => setIsError(true), 10);
      setTimeout(() => setIsError(false), 800);
      return;
    }

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

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="sheet-panel space-y-8 max-h-[90dvh] overflow-y-auto custom-scrollbar"
        onClick={(e) => { e.stopPropagation(); setShowSuggestions(false); }}
      >
        <div className="sticky top-0 bg-transparent backdrop-blur-xl z-20 -mt-2 pt-2">
          <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-white/10" />
          <h2 className="text-2xl font-bold dark:text-[#F9FAFB]">{initialCourse ? 'Edit Course' : 'Add New Course'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-8">
          <div className="space-y-3 relative z-30">
            <label className={`text-base font-bold uppercase tracking-wider transition-colors ${isError ? 'text-[#FF3B30]' : 'text-[#8B95A1]'}`}>
              Course Name (Optional)
            </label>
            <motion.input 
              type="text" 
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              animate={isError ? { x: [-15, 15, -15, 15, -15, 15, 0] } : {}}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              placeholder="e.g. AP World History"
              onClick={e => { e.stopPropagation(); setShowSuggestions(true); }}
              className={`field-input w-full p-5 dark:text-[#F9FAFB] transition-all border-2 text-lg ${
                isError ? 'border-[#FF3B30] bg-[#FFF5F5] dark:bg-red-950/30' : 'border-transparent'
              }`}
            />
            
            {/* Suggestions */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 right-0 top-[calc(100%+8px)] surface-card-strong rounded-2xl z-50 overflow-y-auto max-h-56 custom-scrollbar divide-y divide-slate-200/70 dark:divide-white/8 backdrop-blur-md"
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
                          <div className="surface-card-muted w-8 h-8 rounded-lg flex items-center justify-center transition-colors group-hover:bg-[#3182F6] group-hover:text-white">
                            <ChevronRight size={18} />
                          </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="surface-card-muted flex items-center justify-between p-5 rounded-[26px]">
            <div className="flex flex-col gap-1">
              <span className="font-bold text-lg dark:text-[#F9FAFB]">AP Weighting</span>
              <span className="text-sm text-[#8B95A1]">Enable +1.0 point extra value</span>
            </div>
            <button 
              type="button"
              onClick={() => setIsAP(!isAP)}
                className={`w-14 h-7 rounded-full transition-colors relative ${isAP ? 'bg-[#3182F6]' : 'bg-[#B0B8C1] dark:bg-[#334155]'}`}
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
                className="field-input w-full p-5 dark:text-[#F9FAFB] font-bold appearance-none cursor-pointer pr-12 text-lg"
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
                <div className="surface-card-muted flex items-center justify-between p-5 rounded-[26px]">
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
                      className={`px-4 py-2 rounded-xl font-bold transition-all ${credit === 0.5 ? 'bg-[#3182F6] text-white shadow-md' : 'surface-card text-[#8B95A1]'}`}
                    >
                      0.5
                    </button>
                    <button 
                      type="button"
                      onClick={() => setCredit(1.0)}
                      className={`px-4 py-2 rounded-xl font-bold transition-all ${credit === 1.0 ? 'bg-[#3182F6] text-white shadow-md' : 'surface-card text-[#8B95A1]'}`}
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
            className="primary-button w-full py-5 text-xl"
          >
            {initialCourse ? 'Save Changes' : 'Add Course'}
          </button>
        </form>
      </motion.div>
    </motion.div>,
    document.body
  );
}
function ResetModal({ onClose, onConfirm }: { onClose: () => void, onConfirm: () => void }) {
  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="modal-panel space-y-6 text-center"
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
            className="w-full py-5 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-colors text-lg shadow-lg shadow-red-500/20"
          >
            Yes, Reset Everything
          </button>
          <button 
            onClick={onClose}
            className="secondary-button w-full py-5 text-lg"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

function QuickGPAView() {
  const [gradeCounts, setGradeCounts] = useState<SemesterGradeCount[]>(
    GRADE_SCALE.map(s => ({ grade: s.grade, count: 0 }))
  );
  const [showLowerGrades, setShowLowerGrades] = useState(false);

  const calculatedGPA = useMemo(() => calculateSemesterGPA(gradeCounts), [gradeCounts]);

  const priorityGrades: Grade[] = ['A+', 'A', 'A-', 'B+', 'B', 'B-'];
  const lowerGrades: Grade[] = ['C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];
  const gradeMap = useMemo(
    () => new Map(gradeCounts.map(gc => [gc.grade, gc])),
    [gradeCounts]
  );

  const handleUpdateCount = (grade: Grade, delta: number) => {
    setGradeCounts(prev => prev.map(gc => 
      gc.grade === grade ? { ...gc, count: Math.max(0, gc.count + delta) } : gc
    ));
  };

  const clearAll = () => {
    setGradeCounts(GRADE_SCALE.map(s => ({ grade: s.grade, count: 0 })));
  };

  const renderGradeRow = (grade: Grade) => {
    const count = gradeMap.get(grade)?.count ?? 0;
    const isActive = count > 0;

    return (
      <div
        key={grade}
        className={`grade-row grid h-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center rounded-[20px] px-3 py-2.5 ${
          isActive ? 'grade-row-active' : ''
        }`}
      >
        <div className="flex min-w-0 items-center">
          <div className="w-9 text-[15px] font-black tracking-[-0.02em] text-[#5F6977] dark:text-[#C8D0DD]">
            {grade}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleUpdateCount(grade, -1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF2F7] text-[#8B95A1] transition-colors hover:bg-[#E5E8EB] dark:bg-[#2C3440] dark:hover:bg-[#333D4B]"
          >
            <Minus size={14} />
          </button>
          <div className="min-w-[1.25rem] text-center text-[17px] font-black text-[#191F28] dark:text-[#F9FAFB]">
            {count}
          </div>
          <button
            type="button"
            onClick={() => handleUpdateCount(grade, 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3182F6] text-white shadow-sm transition-colors hover:bg-[#1B64DA]"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <section className="text-center space-y-1.5">
        <h2 className="text-2xl font-bold md:text-3xl dark:text-[#F9FAFB]">Quick GPA</h2>
        <p className="text-sm md:text-base text-[#8B95A1] font-medium">Instantly calculate your semester GPA</p>
      </section>

      <div className="surface-card p-5 md:p-8 rounded-[28px] md:rounded-[32px] space-y-5 md:space-y-8">
        <div className="surface-card-strong space-y-3 rounded-[24px] px-5 py-4 md:space-y-5 md:rounded-[28px] md:px-6 md:py-6">
          <div className="text-center space-y-0.5 md:space-y-1">
            <p className="text-[10px] text-[#8B95A1] font-bold uppercase tracking-[0.2em] opacity-80">Calculated GPA</p>
            <p className="text-4xl font-black text-[#3182F6] md:text-5xl">{calculatedGPA.toFixed(3)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 auto-rows-fr items-stretch gap-2 md:gap-3">
          {priorityGrades.map(renderGradeRow)}
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => setShowLowerGrades(prev => !prev)}
            className="grade-row flex w-full items-center justify-between gap-4 px-3 py-2.5 text-left"
            aria-label={showLowerGrades ? 'Hide lower grades' : 'Show lower grades'}
          >
            <span className="text-sm font-bold text-[#8B95A1]">More grades</span>
            <ChevronDown
              size={20}
              className={`shrink-0 text-[#8B95A1] transition-transform ${showLowerGrades ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence initial={false}>
            {showLowerGrades && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 auto-rows-fr items-stretch gap-2 pt-2.5">
                  {lowerGrades.map(renderGradeRow)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={clearAll}
          className="danger-button w-full py-3.5 flex items-center justify-center gap-2"
        >
          <Trash2 size={20} />
          Clear All Counts
        </button>
      </div>

      <div className="surface-card-muted p-4 md:p-6 rounded-[24px] border border-blue-100/80 dark:border-blue-900/20">
        <div className="flex gap-3">
          <AlertCircle className="text-[#3182F6] shrink-0" size={20} />
          <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
            <strong>Quick GPA</strong> is for instant calculations only. Your inputs here are not saved to your history. To keep a record of your GPA, use the <strong>Cumulative GPA</strong> section.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function CumulativeView({ 
  semesters, 
  onAddSemester, 
  onUpdateSemester,
  onDeleteSemester,
  onReorder
}: { 
  semesters: SemesterGPA[], 
  onAddSemester: (s: SemesterGPA) => void,
  onUpdateSemester: (s: SemesterGPA) => void,
  onDeleteSemester: (id: string) => void,
  onReorder: (newSemesters: SemesterGPA[]) => void
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingSemester, setEditingSemester] = useState<SemesterGPA | null>(null);

  const totalGPA = useMemo(() => {
    if (semesters.length === 0) return 0;
    return semesters.reduce((acc, s) => acc + s.gpa, 0) / semesters.length;
  }, [semesters]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <section className="text-center space-y-2">
        <h2 className="text-3xl font-bold dark:text-[#F9FAFB]">Cumulative GPA</h2>
        <p className="text-[#8B95A1] font-medium">Overall Average: <span className="text-[#3182F6] font-black">{totalGPA.toFixed(3)}</span></p>
      </section>

      <div className="grid gap-4">
        <Reorder.Group axis="y" values={semesters} onReorder={onReorder} className="grid gap-4">
          {semesters.map(s => (
            <Reorder.Item key={s.id} value={s}>
              <div 
                onClick={() => setEditingSemester(s)}
                className="surface-card p-5 rounded-[28px] flex items-center justify-between cursor-pointer group hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1E] transition-all"
              >
                <div className="flex items-center gap-4">
                  <GripVertical size={20} className="text-[#B0B8C1] cursor-grab active:cursor-grabbing" />
                  <div className="surface-card-muted w-12 h-12 rounded-xl flex items-center justify-center text-[#3182F6]">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg dark:text-[#F9FAFB]">{s.label}</h4>
                    <p className="text-sm text-[#8B95A1] font-medium">{s.semester}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-black text-[#3182F6]">{s.gpa.toFixed(3)}</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSemester(s.id);
                    }} 
                    className="icon-button h-10 w-10 text-[#B0B8C1] hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {semesters.length === 0 && (
          <div className="surface-card-muted text-center py-12 text-[#8B95A1] border-2 border-dashed border-slate-200/80 dark:border-white/8 rounded-[30px]">
            <History size={48} className="mx-auto mb-4 opacity-20" />
            <p>No historical data yet.</p>
            <p className="text-sm">Add your past semesters to track progress.</p>
          </div>
        )}

        <button 
          onClick={() => setIsAdding(true)}
          className="primary-button w-full py-5 flex items-center justify-center gap-3"
        >
          <Plus size={20} />
          Add Semester
        </button>
      </div>

      <AnimatePresence>
        {(isAdding || editingSemester) && (
          <AddSemesterModal 
            initialSemester={editingSemester || undefined}
            onClose={() => {
              setIsAdding(false);
              setEditingSemester(null);
            }}
            onSave={(s) => {
              if (editingSemester) {
                onUpdateSemester(s);
              } else {
                onAddSemester(s);
              }
              setIsAdding(false);
              setEditingSemester(null);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AddSemesterModal({ 
  onClose, 
  onSave,
  initialSemester
}: { 
  onClose: () => void, 
  onSave: (s: SemesterGPA) => void,
  initialSemester?: SemesterGPA
}) {
  const [label, setLabel] = useState(initialSemester?.label || '9th Grade');
  const [semester, setSemester] = useState(initialSemester?.semester || '1st Semester');
  const [gpa, setGpa] = useState(initialSemester?.gpa.toString() || '');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(!!initialSemester?.gradeCounts);
  const [gradeCounts, setGradeCounts] = useState<SemesterGradeCount[]>(
    initialSemester?.gradeCounts || GRADE_SCALE.map(s => ({ grade: s.grade, count: 0 }))
  );

  const calculatedGPA = useMemo(() => calculateSemesterGPA(gradeCounts), [gradeCounts]);

  const handleUpdateCount = (grade: Grade, delta: number) => {
    setGradeCounts(prev => prev.map(gc => 
      gc.grade === grade ? { ...gc, count: Math.max(0, gc.count + delta) } : gc
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalGPA = isCalculatorOpen ? calculatedGPA : parseFloat(gpa);
    if (isNaN(finalGPA)) return;

    onSave({
      id: initialSemester?.id || Date.now().toString(),
      label,
      semester,
      gpa: finalGPA,
      gradeCounts: isCalculatorOpen ? gradeCounts : undefined
    });
  };

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-start overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6 pt-10 sm:pt-20"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="modal-panel space-y-6 w-full mb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center sticky top-0 bg-transparent backdrop-blur-xl -mt-2 pt-2 z-10">
          <h2 className="text-2xl font-bold dark:text-[#F9FAFB]">Add Semester</h2>
          <button onClick={onClose} className="icon-button h-10 w-10 -mr-1 text-[#8B95A1]">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#8B95A1] uppercase tracking-widest">Grade</label>
              <select 
                value={label}
                onChange={e => setLabel(e.target.value)}
                className="field-input w-full p-4 dark:text-[#F9FAFB] font-bold"
              >
                {['9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#8B95A1] uppercase tracking-widest">Semester</label>
              <select 
                value={semester}
                onChange={e => setSemester(e.target.value)}
                className="field-input w-full p-4 dark:text-[#F9FAFB] font-bold"
              >
                  {['1st Semester', '2nd Semester'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="border-t border-slate-200/80 dark:border-white/8 pt-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold dark:text-[#F9FAFB]">GPA Input Method</span>
                <button 
                  type="button"
                  onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
                  className="text-sm font-bold text-[#3182F6] hover:underline"
                >
                  {isCalculatorOpen ? 'Switch to Direct Input' : 'Use Grade Assistant'}
                </button>
              </div>

              {isCalculatorOpen ? (
                <div className="surface-card-muted space-y-6 p-5 rounded-[28px]">
                   <div className="text-center">
                    <p className="text-xs text-[#8B95A1] font-bold uppercase mb-1">Calculated GPA</p>
                    <p className="text-4xl font-black text-[#3182F6]">{calculatedGPA.toFixed(3)}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {gradeCounts.map(gc => (
                      <div key={gc.grade} className="surface-card flex items-center justify-between p-3 rounded-2xl">
                        <span className="font-black text-sm dark:text-[#F9FAFB]">{gc.grade}</span>
                        <div className="flex items-center gap-3">
                          <button 
                            type="button"
                            onClick={() => handleUpdateCount(gc.grade, -1)}
                            className="surface-card-muted w-6 h-6 flex items-center justify-center rounded-lg text-[#8B95A1]"
                          >
                            -
                          </button>
                          <span className="font-bold text-sm min-w-[12px] text-center">{gc.count}</span>
                          <button 
                            type="button"
                            onClick={() => handleUpdateCount(gc.grade, 1)}
                            className="w-6 h-6 flex items-center justify-center bg-[#3182F6] rounded-lg text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-[#8B95A1] uppercase tracking-widest">Manual GPA</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    max="5"
                    value={gpa}
                    onChange={e => setGpa(e.target.value)}
                    placeholder="e.g. 3.5"
                    className="field-input w-full p-5 dark:text-[#F9FAFB] font-bold text-lg"
                  />
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit"
            className="primary-button w-full py-5 text-lg"
          >
            Save Semester
          </button>
        </form>
      </motion.div>
    </motion.div>,
    document.body
  );
}
