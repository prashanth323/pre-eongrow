import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Award,
  CheckCircle2,
  Sparkles,
  Briefcase,
  Play,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Check,
  Share2,
  ArrowLeft,
  Layers,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { formatCurrency } from '../../lib/utils';
import { DataService } from '../../services/dataService';
import type { CourseItem, CourseEnrollmentItem, CourseLesson, CourseModule } from '../../types/app.types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Pagination } from '../common/Pagination';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/Breadcrumb';
import { CourseCurriculumTree } from './CourseCurriculumTree';

interface CoursesViewProps {
  onNavigateToOpportunities?: () => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({ onNavigateToOpportunities }) => {
  const { profile } = useAuth();

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination for catalog
  const [catalogPage, setCatalogPage] = useState(1);
  const catalogPageSize = 6;

  // Active Course View (No more popups!)
  const [activeCourse, setActiveCourse] = useState<CourseItem | null>(null);
  const [activeLesson, setActiveLesson] = useState<{ module: CourseModule; lesson: CourseLesson } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'instructor' | 'certification'>('overview');

  // Certificate Purchase State
  const [certPurchaseCourse, setCertPurchaseCourse] = useState<{ course: CourseItem; enrollment: CourseEnrollmentItem } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const fetchedCourses = await DataService.getCourses();
    setCourses(fetchedCourses);

    if (profile?.id) {
      const fetchedEnrollments = await DataService.getUserCourseEnrollments(profile.id);
      setEnrollments(fetchedEnrollments);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [profile?.id]);

  const getEnrollmentForCourse = (courseId: string) => {
    return enrollments.find((e) => e.courseId === courseId);
  };

  const handleEnroll = async (course: CourseItem) => {
    setIsProcessing(true);
    setErrorMessage(null);

    const res = await DataService.enrollInCourse(course.id);
    if (res.success) {
      setSuccessMessage(`Successfully enrolled in "${course.title}" for free!`);
      await loadData();
      // Automatically open the course in the classroom view
      handleOpenCourse(course);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 2500);
    } else {
      setErrorMessage(res.error || 'Enrollment failed.');
    }
    setIsProcessing(false);
  };

  const handleOpenCourse = (course: CourseItem) => {
    setActiveCourse(course);
    // Find first lesson in the first module
    if (course.modules && course.modules.length > 0 && course.modules[0].lessons.length > 0) {
      setActiveLesson({
        module: course.modules[0],
        lesson: course.modules[0].lessons[0],
      });
    } else {
      setActiveLesson(null);
    }
    setActiveTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleLesson = async (course: CourseItem, lessonId: string) => {
    const enrollment = getEnrollmentForCourse(course.id);
    const currentCompleted = enrollment?.completedLessonIds || [];
    const isCompleted = currentCompleted.includes(lessonId);
    const newCompleted = isCompleted
      ? currentCompleted.filter((id) => id !== lessonId)
      : [...currentCompleted, lessonId];

    let totalLessons = 0;
    course.modules.forEach((m) => {
      totalLessons += m.lessons.length;
    });

    await DataService.updateCourseProgress(course.id, newCompleted, totalLessons);
    await loadData();
  };

  // Find next and previous lessons in the course curriculum
  const adjacentLessons = useMemo(() => {
    if (!activeCourse || !activeLesson) return { prev: null, next: null };
    const allLessons: Array<{ module: CourseModule; lesson: CourseLesson }> = [];
    activeCourse.modules.forEach((mod) => {
      mod.lessons.forEach((les) => {
        allLessons.push({ module: mod, lesson: les });
      });
    });

    const currentIndex = allLessons.findIndex((item) => item.lesson.id === activeLesson.lesson.id);
    const prev = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const next = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
    return { prev, next, currentIndex, total: allLessons.length };
  }, [activeCourse, activeLesson]);

  const handlePurchaseCertification = async () => {
    if (!certPurchaseCourse || !profile) return;
    setIsProcessing(true);
    setErrorMessage(null);

    const res = await DataService.purchaseCourseCertification({
      courseId: certPurchaseCourse.course.id,
      enrollmentId: certPurchaseCourse.enrollment.id,
      amount: certPurchaseCourse.course.certificationFee,
      userId: profile.id,
      attendeeName: profile.fullName,
      attendeeEmail: profile.email,
    });

    if (res.success) {
      setSuccessMessage(`Certificate verified and issued: #${res.certificateNumber}`);
      await loadData();
      setTimeout(() => {
        setCertPurchaseCourse(null);
        setSuccessMessage(null);
      }, 2000);
    } else {
      setErrorMessage(res.error || 'Failed to complete certification purchase.');
    }
    setIsProcessing(false);
  };

  const handleShareCourse = (course: CourseItem) => {
    const courseUrl = `${window.location.origin}/courses/${course.slug || course.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(courseUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  // -------------------------------------------------------------
  // VIEW 1: FULL COURSE CLASSROOM & CURRICULUM TREE WORKSPACE
  // (NO POP-UP! Real-world platform experience like Coursera / Udemy)
  // -------------------------------------------------------------
  if (activeCourse) {
    const enrollment = getEnrollmentForCourse(activeCourse.id);
    const isEnrolled = Boolean(enrollment);
    const completedList = enrollment?.completedLessonIds || [];
    const isCurrentLessonDone = activeLesson ? completedList.includes(activeLesson.lesson.id) : false;

    let totalLessonsCount = 0;
    activeCourse.modules.forEach((m) => {
      totalLessonsCount += m.lessons.length;
    });
    const progress = enrollment?.progressPercentage || 0;

    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200 overflow-x-hidden">
        {/* Top Breadcrumb & Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.08]">
          <div className="flex items-center gap-3 min-w-0">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => setActiveCourse(null)}>
                    Courses
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{activeCourse.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => handleShareCourse(activeCourse)}
              className="px-3 py-1.5 rounded-xl border border-black/10 hover:border-black/30 text-xs font-medium text-[#171C19] flex items-center gap-1.5 bg-white transition-all cursor-pointer shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedShare ? 'Copied Course Link!' : 'Share Course'}</span>
            </button>

            {enrollment ? (
              enrollment.certificateIssued ? (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Certified #{enrollment.certificateNumber}</span>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCertPurchaseCourse({ course: activeCourse, enrollment })}
                  className="apple-press text-xs font-semibold flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  Claim Certificate ({formatCurrency(activeCourse.certificationFee)})
                </Button>
              )
            ) : (
              <Button
                variant="primary"
                size="sm"
                isLoading={isProcessing}
                onClick={() => handleEnroll(activeCourse)}
                className="apple-press text-xs font-semibold"
              >
                Enroll Free
              </Button>
            )}
          </div>
        </div>

        {/* Global Alert Notification */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 2-Column Split Workspace: Player & Notes (Left) + Curriculum Tree (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Video Player, Controls, and Workspace Tabs (8 of 12 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* 16:9 Responsive HD Video Player */}
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-xl border border-black/10">
              {activeLesson?.lesson.youtubeId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeLesson.lesson.youtubeId}?rel=0&autoplay=1&modestbranding=1`}
                  title={activeLesson.lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/70 space-y-2 p-6 text-center">
                  <Play className="w-12 h-12 text-white/40 mb-2" />
                  <h4 className="text-base font-light text-white">Select a Lecture from the Curriculum Tree</h4>
                  <p className="text-xs text-white/60 max-w-md">
                    Click any video node in the curriculum tree on the right to start watching lectures immediately.
                  </p>
                </div>
              )}
            </div>

            {/* Video Control Toolbar */}
            {activeLesson && (
              <div className="p-4 rounded-2xl bg-white border border-black/[0.08] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[#525854]">
                    <span className="font-medium text-[#171C19]">{activeLesson.module.title}</span>
                    <span>·</span>
                    <span>{activeLesson.lesson.duration || `${activeLesson.lesson.durationMinutes} mins`}</span>
                  </div>
                  <h3 className="text-base font-semibold text-[#171C19]">{activeLesson.lesson.title}</h3>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {adjacentLessons.prev && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveLesson(adjacentLessons.prev)}
                      className="text-xs flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Prev
                    </Button>
                  )}

                  {adjacentLessons.next && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveLesson(adjacentLessons.next)}
                      className="text-xs flex items-center gap-1"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  )}

                  {isEnrolled ? (
                    <Button
                      variant={isCurrentLessonDone ? 'outline' : 'primary'}
                      size="sm"
                      onClick={async () => {
                        await handleToggleLesson(activeCourse, activeLesson.lesson.id);
                        if (!isCurrentLessonDone && adjacentLessons.next) {
                          setActiveLesson(adjacentLessons.next);
                        }
                      }}
                      className="text-xs flex items-center gap-1.5 font-semibold"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      {isCurrentLessonDone ? 'Completed' : 'Mark Complete & Continue'}
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleEnroll(activeCourse)}
                      className="text-xs font-semibold"
                    >
                      Enroll to Save Progress
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Workspace Content Tabs */}
            <div className="rounded-3xl bg-white border border-black/[0.08] shadow-xs overflow-hidden">
              <div className="border-b border-black/[0.06] px-5 bg-neutral-50/70 flex items-center gap-2 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-3 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'border-black text-[#171C19] font-semibold'
                      : 'border-transparent text-[#818A84] hover:text-black'
                  }`}
                >
                  Lesson Overview & Notes
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`py-3 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'resources'
                      ? 'border-black text-[#171C19] font-semibold'
                      : 'border-transparent text-[#818A84] hover:text-black'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Code & Resources ({activeLesson?.lesson.resources?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('instructor')}
                  className={`py-3 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'instructor'
                      ? 'border-black text-[#171C19] font-semibold'
                      : 'border-transparent text-[#818A84] hover:text-black'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Instructor & Course Info
                </button>
                <button
                  onClick={() => setActiveTab('certification')}
                  className={`py-3 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'certification'
                      ? 'border-black text-[#171C19] font-semibold'
                      : 'border-transparent text-[#818A84] hover:text-black'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  Accreditation & CV Certificate
                </button>
              </div>

              <div className="p-6">
                {/* TAB 1: OVERVIEW & NOTES */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {activeLesson ? (
                      <>
                        <div>
                          <h4 className="font-semibold text-sm text-[#171C19]">Lecture Summary</h4>
                          <p className="text-xs sm:text-sm text-[#525854] mt-1.5 leading-relaxed">
                            {activeLesson.lesson.description || 'Watch the video lecture above for practical code walkthroughs and architectural design patterns.'}
                          </p>
                        </div>

                        {activeLesson.module.description && (
                          <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] space-y-1">
                            <h5 className="text-xs font-semibold text-[#171C19]">Chapter Objectives</h5>
                            <p className="text-xs text-[#525854] leading-relaxed">
                              {activeLesson.module.description}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-[#818A84]">Select a lecture to view details.</p>
                    )}
                  </div>
                )}

                {/* TAB 2: RESOURCES & DOWNLOADS */}
                {activeTab === 'resources' && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-[#171C19]">Starter Code & Documentation</h4>
                    {activeLesson?.lesson.resources && activeLesson.lesson.resources.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {activeLesson.lesson.resources.map((res, ri) => (
                          <a
                            key={ri}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3.5 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-black/[0.06] transition-all flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <FileText className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
                              <span className="text-xs font-medium text-[#171C19] truncate">{res.title}</span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-[#818A84] flex-shrink-0 ml-2" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#818A84]">
                        No external repository attachments for this specific lecture. Refer to the overall course repository.
                      </p>
                    )}
                  </div>
                )}

                {/* TAB 3: INSTRUCTOR & COURSE INFO */}
                {activeTab === 'instructor' && (
                  <div className="space-y-5">
                    {/* Instructor Card */}
                    <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/[0.06] flex items-start gap-4">
                      <img
                        src={activeCourse.instructorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                        alt={activeCourse.instructorName || 'Instructor'}
                        className="w-14 h-14 rounded-full object-cover border border-black/10 flex-shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-sm text-[#171C19]">{activeCourse.instructorName}</h5>
                        </div>
                        <p className="text-xs text-[#818A84]">{activeCourse.instructorRole || 'Senior Industry Mentor'}</p>
                        {activeCourse.instructorBio && (
                          <p className="text-xs text-[#525854] pt-1 leading-relaxed">
                            {activeCourse.instructorBio}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Skills & Prerequisites */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {activeCourse.skillsGained && activeCourse.skillsGained.length > 0 && (
                        <div className="p-4 rounded-2xl bg-neutral-50 border border-black/[0.06] space-y-2">
                          <span className="font-semibold text-[#171C19] text-xs block">
                            Skills You Will Master
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {activeCourse.skillsGained.map((sk) => (
                              <span key={sk} className="px-2.5 py-1 rounded-lg bg-white text-[#171C19] border border-black/[0.08] text-[11px] font-medium shadow-2xs">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeCourse.prerequisites && activeCourse.prerequisites.length > 0 && (
                        <div className="p-4 rounded-2xl bg-neutral-50 border border-black/[0.06] space-y-2">
                          <span className="font-semibold text-[#171C19] text-xs block">
                            Prerequisites
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {activeCourse.prerequisites.map((pr) => (
                              <span key={pr} className="px-2.5 py-1 rounded-lg bg-white text-[#525854] border border-black/[0.08] text-[11px] shadow-2xs">
                                {pr}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: CERTIFICATION */}
                {activeTab === 'certification' && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white border border-emerald-500/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-800 flex items-center justify-center">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-emerald-950">Accredited Industry Credential</h4>
                            <p className="text-xs text-emerald-800">Add to your LinkedIn profile and verified developer portfolio</p>
                          </div>
                        </div>
                        <span className="text-base font-bold text-emerald-900 font-mono">
                          {formatCurrency(activeCourse.certificationFee)}
                        </span>
                      </div>

                      <p className="text-xs text-[#525854] leading-relaxed">
                        Course modules, video lectures, and syllabus materials are 100% free forever for all college students. The optional certification fee covers cryptographic credential verification, mentor capstone review, and permanent blockchain verification registry.
                      </p>

                      {enrollment && (
                        <div className="pt-2 flex justify-end">
                          {enrollment.certificateIssued ? (
                            <div className="text-xs font-semibold text-emerald-800">
                              ✓ Issued on #{enrollment.certificateNumber}
                            </div>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setCertPurchaseCourse({ course: activeCourse, enrollment })}
                              className="text-xs font-semibold"
                            >
                              Get Certified Now ({formatCurrency(activeCourse.certificationFee)})
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Course Curriculum Tree Sidebar (4 of 12 cols) */}
          <div className="lg:col-span-4 sticky top-6 space-y-4">
            <CourseCurriculumTree
              course={activeCourse}
              completedLessonIds={completedList}
              activeLessonId={activeLesson?.lesson.id}
              onSelectLesson={(module, lesson) => {
                setActiveLesson({ module, lesson });
              }}
              onToggleLessonCompletion={(lessonId) => {
                handleToggleLesson(activeCourse, lessonId);
              }}
              isEnrolled={isEnrolled}
            />
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: COURSE CATALOG & GRID VIEW
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extralight text-[#171C19] tracking-tight">
          Student Courses & Industry Certifications
        </h2>
        <p className="text-sm text-[#818A84] mt-1">
          Master deep-tech engineering, artificial intelligence, and startup ventures with zero course fees.
        </p>
      </div>

      {/* Free Course Access & Internship Opportunities Banner */}
      <div className="relative overflow-hidden p-6 rounded-[24px] bg-white border border-black/[0.08] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 apple-card">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-black/[0.04] flex items-center justify-center flex-shrink-0 text-[#171C19]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-base text-[#171C19]">100% Free Course Access & Internship Board</h3>
            <p className="text-xs text-[#818A84] max-w-2xl leading-relaxed">
              Every student can enroll, study all modules, watch full video lectures, and apply for verified corporate internships completely free.
              Official industry certifications require a separate verification and issuance fee.
            </p>
          </div>
        </div>

        {onNavigateToOpportunities && (
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToOpportunities}
            className="self-start md:self-center font-medium cursor-pointer flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4 text-black" />
            Browse Free Internships
          </Button>
        )}
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* Courses Grid */}
      {loading ? (
        <div className="py-12 text-center text-sm text-[#818A84]">Loading available courses...</div>
      ) : courses.length === 0 ? (
        <div className="py-12 text-center text-sm text-[#818A84]">No courses published yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses
            .slice((catalogPage - 1) * catalogPageSize, catalogPage * catalogPageSize)
            .map((course) => {
            const enrollment = getEnrollmentForCourse(course.id);
            const isEnrolled = Boolean(enrollment);
            const completedCount = enrollment?.completedLessonIds?.length || 0;
            let totalLessons = 0;
            course.modules.forEach((m) => {
              totalLessons += m.lessons.length;
            });
            const progress = enrollment?.progressPercentage || 0;

            return (
              <div
                key={course.id}
                className="apple-card p-0 overflow-hidden flex flex-col justify-between border border-black/[0.06] transition-all hover:border-black/20"
              >
                {/* Course Banner */}
                <div
                  onClick={() => handleOpenCourse(course)}
                  className="relative h-44 overflow-hidden bg-neutral-900 group cursor-pointer"
                >
                  <img
                    src={course.bannerUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-white/90 text-xs">
                    <span>{course.durationHours} Hours Practical</span>
                    <span className="text-white/60">·</span>
                    <span>{course.modules.length} Chapters</span>
                    <span className="text-white/60">·</span>
                    <span>{totalLessons} Lessons</span>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <h4
                        onClick={() => handleOpenCourse(course)}
                        className="text-lg font-light text-[#171C19] tracking-tight hover:text-black cursor-pointer transition-colors"
                      >
                        {course.title}
                      </h4>
                      <p className="text-xs text-[#818A84] mt-1.5 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    {/* Instructor Info */}
                    <div className="flex items-center gap-3 pt-2 border-t border-black/[0.04]">
                      <img
                        src={course.instructorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt={course.instructorName || 'Instructor'}
                        className="w-8 h-8 rounded-full object-cover border border-black/10 flex-shrink-0"
                      />
                      <div className="text-xs truncate">
                        <span className="font-medium text-[#171C19] block truncate">{course.instructorName}</span>
                        <span className="text-[11px] text-[#818A84] truncate block">{course.instructorRole || 'Lead Mentor'}</span>
                      </div>
                    </div>

                    {/* Enrollment & Progress Section */}
                    {isEnrolled ? (
                      <div className="pt-3 border-t border-[#E8ECE9] space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#818A84]">Course Progress</span>
                          <span className="font-semibold text-black">{progress}%</span>
                        </div>
                        <div className="w-full bg-black/[0.06] rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-black h-full transition-all duration-300 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#818A84]">
                          <span>{completedCount} of {totalLessons} completed</span>
                          <button
                            onClick={() => handleOpenCourse(course)}
                            className="font-medium text-black hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Layers className="w-3 h-3" />
                            Curriculum Tree →
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-[#E8ECE9] space-y-2">
                        <div className="flex items-center justify-between text-xs text-[#818A84]">
                          <span>Curriculum & Video Access:</span>
                          <strong className="text-emerald-700 font-semibold">100% Free</strong>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#818A84]">
                          <span>Optional Certificate:</span>
                          <strong className="text-[#171C19] font-medium">{formatCurrency(course.certificationFee)}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#E8ECE9] flex items-center gap-2">
                    <Button
                      variant={isEnrolled ? 'primary' : 'outline'}
                      size="sm"
                      className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer"
                      onClick={() => handleOpenCourse(course)}
                    >
                      <Play className="w-3.5 h-3.5" />
                      {isEnrolled ? 'Open Classroom' : 'Explore Course & Tree'}
                    </Button>
                    {!isEnrolled && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full text-xs font-semibold cursor-pointer"
                        isLoading={isProcessing}
                        onClick={() => handleEnroll(course)}
                      >
                        Enroll Free
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Courses Pagination */}
      {!loading && courses.length > catalogPageSize && (
        <div className="pt-4 border-t border-black/[0.06]">
          <Pagination
            currentPage={catalogPage}
            totalItems={courses.length}
            pageSize={catalogPageSize}
            onPageChange={setCatalogPage}
          />
        </div>
      )}

      {/* Certification Purchase Modal (Only for payment confirmation) */}
      {certPurchaseCourse && (
        <Modal
          isOpen={Boolean(certPurchaseCourse)}
          onClose={() => setCertPurchaseCourse(null)}
          title="Official Verified Certification"
          description={`Purchase accredited certification for "${certPurchaseCourse.course.title}".`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-[#FAFCFA] rounded-xl border border-[#E8ECE9] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#818A84]">Course Title:</span>
                <strong className="text-[#171C19]">{certPurchaseCourse.course.title}</strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#818A84]">Learning Status:</span>
                <span className="text-emerald-700 font-semibold">100% Free Lifetime Access</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#818A84]">Progress Recorded:</span>
                <span className="font-semibold text-black">{certPurchaseCourse.enrollment.progressPercentage}%</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-[#E8ECE9]">
                <span className="font-bold text-[#171C19]">Certification Fee:</span>
                <strong className="text-base font-semibold text-black">
                  {formatCurrency(certPurchaseCourse.course.certificationFee)}
                </strong>
              </div>
            </div>

            <div className="p-3 bg-black/[0.02] rounded-xl border border-black/[0.06] text-xs text-[#818A84] space-y-1">
              <p className="font-semibold text-[#171C19] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-black" />
                Accredited Blockchain Verification
              </p>
              <p>
                Course modules, syllabus access, and YouTube video lectures are completely free for students. The fee covers identity verification, blockchain-signed credentials, and issuing the official certificate for your resume and LinkedIn.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setCertPurchaseCourse(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={isProcessing}
                onClick={handlePurchaseCertification}
              >
                Pay {formatCurrency(certPurchaseCourse.course.certificationFee)} & Issue Certificate
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
