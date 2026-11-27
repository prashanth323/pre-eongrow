import React, { useState, useMemo } from 'react';
import {
  Play,
  Check,
  ChevronDown,
  ChevronRight,
  Search,
  FileText,
  ExternalLink,
  Clock,
  Layers,
} from 'lucide-react';
import type { CourseItem, CourseModule, CourseLesson } from '../../types/app.types';

interface CourseCurriculumTreeProps {
  course: CourseItem;
  completedLessonIds: string[];
  activeLessonId?: string;
  onSelectLesson: (module: CourseModule, lesson: CourseLesson) => void;
  onToggleLessonCompletion?: (lessonId: string) => void;
  isEnrolled?: boolean;
}

export const CourseCurriculumTree: React.FC<CourseCurriculumTreeProps> = ({
  course,
  completedLessonIds,
  activeLessonId,
  onSelectLesson,
  onToggleLessonCompletion,
  isEnrolled = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    // Expand all modules by default
    const initial: Record<string, boolean> = {};
    course.modules.forEach((_, idx) => {
      initial[`mod-${idx}`] = true;
    });
    return initial;
  });

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const totalLessons = useMemo(() => {
    return course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
  }, [course]);

  const completedCount = useMemo(() => {
    let count = 0;
    course.modules.forEach((mod) => {
      mod.lessons.forEach((l) => {
        if (completedLessonIds.includes(l.id)) count++;
      });
    });
    return count;
  }, [course, completedLessonIds]);

  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Filter modules & lessons based on search query
  const filteredModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return course.modules;

    return course.modules
      .map((mod) => {
        const matchesModule = mod.title.toLowerCase().includes(q) || (mod.description && mod.description.toLowerCase().includes(q));
        const matchedLessons = mod.lessons.filter(
          (l) => l.title.toLowerCase().includes(q) || (l.description && l.description.toLowerCase().includes(q))
        );

        if (matchesModule || matchedLessons.length > 0) {
          return {
            ...mod,
            lessons: matchesModule ? mod.lessons : matchedLessons,
          };
        }
        return null;
      })
      .filter(Boolean) as CourseModule[];
  }, [course.modules, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-black/[0.08] overflow-hidden shadow-xs">
      {/* Header with Clean Progress */}
      <div className="p-4 sm:p-5 border-b border-black/[0.06] space-y-3 bg-[#FAFCFA]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-black" />
            <h3 className="font-medium text-sm text-[#171C19]">Curriculum</h3>
          </div>
          <span className="text-xs text-[#525854] font-medium">
            {completedCount} of {totalLessons} completed ({progressPct}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/[0.05] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-black h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#818A84] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lessons or topics..."
            className="w-full pl-8 pr-7 py-2 bg-white border border-black/10 rounded-xl text-xs text-[#171C19] placeholder:text-[#818A84] focus:outline-none focus:ring-1 focus:ring-black transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#818A84] hover:text-black cursor-pointer"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Branched Curriculum Tree View */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[640px] space-y-4">
        {filteredModules.map((module, modIdx) => {
          const modKey = `mod-${modIdx}`;
          const isExpanded = expandedModules[modKey] ?? true;
          const completedInMod = module.lessons.filter((l) => completedLessonIds.includes(l.id)).length;
          const isAllCompleted = completedInMod === module.lessons.length && module.lessons.length > 0;

          return (
            <div key={modKey} className="space-y-1">
              {/* Chapter Node Header */}
              <button
                type="button"
                onClick={() => toggleModule(modKey)}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-black/[0.03] transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="w-5 h-5 rounded-md bg-black/[0.05] text-neutral-700 flex items-center justify-center flex-shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#171C19] truncate">
                      Chapter {module.chapterNumber || modIdx + 1}: {module.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 text-xs text-[#818A84]">
                  <span>
                    {completedInMod}/{module.lessons.length}
                  </span>
                  {isAllCompleted && (
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </button>

              {/* Branched Tree of Lessons */}
              {isExpanded && (
                <div className="relative ml-5 pl-4 border-l-2 border-neutral-200/80 space-y-1 py-1">
                  {module.lessons.map((lesson) => {
                    const isCompleted = completedLessonIds.includes(lesson.id);
                    const isActive = lesson.id === activeLessonId;

                    return (
                      <div
                        key={lesson.id}
                        className="relative group"
                      >
                        {/* Horizontal branch line connecting to tree */}
                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-[2px] bg-neutral-200/80" />

                        <div
                          onClick={() => onSelectLesson(module, lesson)}
                          className={`flex items-center justify-between gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
                            isActive
                              ? 'bg-black text-white shadow-xs font-medium'
                              : 'hover:bg-neutral-100 text-[#171C19]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {/* Toggle Completion */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isEnrolled && onToggleLessonCompletion) {
                                  onToggleLessonCompletion(lesson.id);
                                }
                              }}
                              className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all flex-shrink-0 cursor-pointer ${
                                isCompleted
                                  ? isActive
                                    ? 'bg-white text-black border-white'
                                    : 'bg-emerald-600 text-white border-emerald-600'
                                  : isActive
                                  ? 'border-white/40 hover:border-white'
                                  : 'border-neutral-300 hover:border-black'
                              }`}
                              title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                            >
                              {isCompleted && <Check className="w-2.5 h-2.5" />}
                            </button>

                            <span className="text-xs truncate">{lesson.title}</span>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 text-[11px]">
                            {lesson.durationMinutes && (
                              <span className={isActive ? 'text-white/70' : 'text-[#818A84]'}>
                                {lesson.durationMinutes}m
                              </span>
                            )}
                            {isActive && (
                              <Play className="w-3 h-3 fill-current text-white animate-pulse" />
                            )}
                          </div>
                        </div>

                        {/* Optional Lesson Resources Fork */}
                        {lesson.resources && lesson.resources.length > 0 && (
                          <div className="ml-6 pl-3 border-l border-neutral-200/70 space-y-1 py-1">
                            {lesson.resources.map((res, rIdx) => (
                              <a
                                key={rIdx}
                                href={res.url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-2 py-1 px-2 rounded-lg text-[11px] text-[#525854] hover:text-black hover:bg-black/[0.04] transition-colors"
                              >
                                <FileText className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{res.title}</span>
                                <ExternalLink className="w-2.5 h-2.5 ml-auto opacity-50" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
