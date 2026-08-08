import { Container } from '@/app/components/common/container';
import { Card, CardContent, CardHeader, CardTable, CardTitle, CardToolbar } from '@/app/components/ui/card';
import { cn } from '@/app/lib/utils';
import { useFapData } from '@/app/providers/fap-data-provider';
import { Loader2 } from 'lucide-react';
import { TermSelector } from '../view-attend-student/components';
import { useStudentGrade } from './use-student-grade';
import { ScrollBar, ScrollArea } from '@/app/components/ui/scroll-area';
import { Link } from 'react-router';
import { useIntl } from 'react-intl';
import { GradePieChart } from './components/GradePieChart';
import { GradeCardsGrid } from './components/GradeCardsGrid';

const StudentGradePage = () => {
  const intl = useIntl();
  const {
    gradeData,
    activeTerm,
    activeCourse,
    gradeComponents,
    parsedGradeItems,
    overallScore,
    result
  } = useStudentGrade();

  const { loading } = useFapData();

  const activeCourseObj = gradeData.courses.find((c) => c.active);

  return (
    <Container width="fluid" className="w-full max-w-full space-y-6">
      {/* Term Selector Header */}
      <div>
        <TermSelector terms={gradeData.terms} />
      </div>

      {/* Main Content Grid (100% Full Width) */}
      <div className="grid gap-6 lg:grid-cols-3 w-full">
        {/* Left Column - Course Selection List */}
        <div className="space-y-6">
          <Card className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="py-3 px-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle>
                <div className="flex flex-col">
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {intl.formatMessage({ id: 'GRADE.COURSE_SELECTOR.TITLE' })}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeTerm}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 relative">
              {loading && (
                <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center z-10 rounded-b-2xl">
                  <Loader2 className="size-6 text-blue-600 animate-spin" />
                </div>
              )}

              {!loading && gradeData.courses.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    {intl.formatMessage({ id: 'GRADE.COURSE_SELECTOR.EMPTY_TITLE' })}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {intl.formatMessage({ id: 'GRADE.COURSE_SELECTOR.EMPTY_MESSAGE' })}
                  </p>
                </div>
              )}

              <div className="grid gap-2.5">
                {gradeData.courses.map((course, index) => (
                  <Link
                    key={index}
                    to={course.link || '#'}
                    onClick={(e) => {
                      if (!course.link) e.preventDefault();
                    }}
                    className="block"
                  >
                    <div
                      className={cn(
                        "relative rounded-xl border p-3 transition-all duration-200",
                        course.active
                          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 font-semibold"
                          : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                      )}
                    >
                      {/* Active Indicator Bar */}
                      {course.active && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-600" />
                      )}

                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                          {course.code}
                        </span>
                        {course.active && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                            {intl.formatMessage({ id: 'GRADE.COURSE_SELECTOR.ACTIVE_STATUS' })}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-1 mb-1.5">
                        {course.name}
                      </h4>

                      <div className="flex items-center text-[11px] text-slate-500 dark:text-slate-400 gap-2">
                        <span className="font-medium">{course.group}</span>
                        <span>•</span>
                        <span className="truncate">
                          {course.date}
                          {course.endDate && ` - ${course.endDate}`}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Visual Combined Grade Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          {/* 🌟 1. Grade Metric Overview & Donut Chart */}
          <GradePieChart
            components={gradeComponents}
            courseCode={activeCourseObj?.code || 'Môn học'}
            overallScore={overallScore}
            statusText={result}
          />

          {/* 📋 2. Visual Component Score Cards Grid with Progress Bars */}
          <GradeCardsGrid items={parsedGradeItems} />

          {/* 📊 3. Detailed Mark Report Table Card */}
          <Card className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <CardTitle>
                <div className="flex flex-col">
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {intl.formatMessage({ id: 'GRADE.REPORT.TITLE' })}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeCourse}
                  </span>
                </div>
              </CardTitle>
              <CardToolbar>
                {result && (
                  <span
                    className={cn(
                      "text-xs font-extrabold px-3 py-1 rounded-full shadow-2xs",
                      result === "Passed" ? "bg-emerald-500 text-white" :
                      result === "Not Passed" ? "bg-rose-500 text-white" :
                      result === "Attendance Fail" ? "bg-rose-500 text-white" :
                      result === "Is Suspended" ? "bg-amber-500 text-white" :
                      "bg-slate-200 text-slate-800"
                    )}
                  >
                    {result}
                  </span>
                )}
              </CardToolbar>
            </CardHeader>

            <CardTable className="relative p-0">
              {loading && (
                <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center z-10">
                  <Loader2 className="size-6 text-blue-600 animate-spin" />
                </div>
              )}
              <ScrollArea className="w-full">
                <div
                  className="p-4 overflow-x-auto text-xs sm:text-sm"
                  dangerouslySetInnerHTML={{ __html: gradeData.markTable }}
                />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardTable>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export { StudentGradePage };