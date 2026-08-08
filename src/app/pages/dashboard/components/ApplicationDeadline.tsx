import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { useIntl } from 'react-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';

interface DeadlineGroup {
  deadline: string;
  badgeStyle: string;
  procedures: string[];
}

export const ApplicationDeadlineTable = () => {
  const intl = useIntl();
  const [filterQuery, setFilterQuery] = useState('');

  const deadlineData: DeadlineGroup[] = [
    {
      deadline: 'DASHBOARD.APPLICATION_DEADLINE.DEADLINE_4_WEEKS_BEFORE_NEW_SEMESTER',
      badgeStyle: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
      procedures: [
        'DASHBOARD.APPLICATION_DEADLINE.PROC_CHANGING_MAJOR',
        'DASHBOARD.APPLICATION_DEADLINE.PROC_CHANGING_CAMPUS',
      ],
    },
    {
      deadline: 'DASHBOARD.APPLICATION_DEADLINE.DEADLINE_10_DAYS_BEFORE_NEW_SEMESTER',
      badgeStyle: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
      procedures: [
        'DASHBOARD.APPLICATION_DEADLINE.PROC_REJOIN',
      ],
    },
    {
      deadline: 'DASHBOARD.APPLICATION_DEADLINE.DEADLINE_1_WEEK_BEFORE_NEW_SEMESTER',
      badgeStyle: 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900',
      procedures: [
        'DASHBOARD.APPLICATION_DEADLINE.PROC_SUSPEND_ONE_SEMESTER',
        'DASHBOARD.APPLICATION_DEADLINE.PROC_SUSPEND_ONE_SEMESTER_REPEAT',
        'DASHBOARD.APPLICATION_DEADLINE.PROC_SUSPEND_SUBJECT',
        'DASHBOARD.APPLICATION_DEADLINE.PROC_REGISTER_REPEAT_COURSE',
        'DASHBOARD.APPLICATION_DEADLINE.PROC_REGISTER_EXTRA_COURSES',
        'DASHBOARD.APPLICATION_DEADLINE.PROC_REGISTER_IMPROVE_MARK',
        'DASHBOARD.APPLICATION_DEADLINE.PROC_MOVE_OUT_CLASS',
        'DASHBOARD.APPLICATION_DEADLINE.PROC_REQUEST_DROP_OUT',
      ],
    },
    {
      deadline: 'DASHBOARD.APPLICATION_DEADLINE.DEADLINE_12H_BEFORE_FINAL_EXAM_RESIT',
      badgeStyle: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
      procedures: [
        'DASHBOARD.APPLICATION_DEADLINE.PROC_RETAKE_IMPROVE_MARK',
      ],
    },
    {
      deadline: 'DASHBOARD.APPLICATION_DEADLINE.DEADLINE_3_DAYS_AFTER_RESULT_PUBLIC',
      badgeStyle: 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900',
      procedures: [
        'DASHBOARD.APPLICATION_DEADLINE.PROC_RE_EXAMINATION',
      ],
    },
    {
      deadline: 'DASHBOARD.APPLICATION_DEADLINE.DEADLINE_BEFORE_SEMESTER_START',
      badgeStyle: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
      procedures: [
        'DASHBOARD.APPLICATION_DEADLINE.PROC_FREE_OF_ATTENDANCE',
      ],
    },
    {
      deadline: 'DASHBOARD.APPLICATION_DEADLINE.DEADLINE_5_WORKING_DAYS_BEFORE_NEW_SEMESTER',
      badgeStyle: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      procedures: [
        'DASHBOARD.APPLICATION_DEADLINE.PROC_PAY_SPECIALIZED_TUITION',
      ],
    },
    {
      deadline: 'DASHBOARD.APPLICATION_DEADLINE.DEADLINE_3_WORKING_DAYS_BEFORE_NEW_COURSE',
      badgeStyle: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      procedures: [
        'DASHBOARD.APPLICATION_DEADLINE.PROC_PAY_PREPARATION_ENGLISH_TUITION',
      ],
    },
    {
      deadline: 'DASHBOARD.APPLICATION_DEADLINE.DEADLINE_12H_FRIDAY_WEEK9',
      badgeStyle: 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900',
      procedures: [
        'DASHBOARD.APPLICATION_DEADLINE.PROC_REGISTER_FINAL_EXAM_ONLINE',
      ],
    },
  ];

  const filteredGroups = deadlineData.map((group) => {
    if (!filterQuery.trim()) return group;
    const q = filterQuery.toLowerCase();
    const matchingProcs = group.procedures.filter((proc) => {
      const procName = intl.formatMessage({ id: proc }).toLowerCase();
      const deadlineName = intl.formatMessage({ id: group.deadline }).toLowerCase();
      return procName.includes(q) || deadlineName.includes(q);
    });
    return { ...group, procedures: matchingProcs };
  }).filter((group) => group.procedures.length > 0);

  return (
    <div className="space-y-4 w-full">
      {/* Search Input Filter in Modal */}
      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Lọc thủ tục (chuyển ngành, tạm nghỉ, học lại...)"
          className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <Table className="w-full text-xs sm:text-sm border-collapse border border-slate-200 dark:border-slate-800">
          <TableHeader>
            <TableRow className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <TableHead className="w-7/12 font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200 py-3 pl-4 border-r border-slate-200 dark:border-slate-800">
                Loại Thủ Tục Hành Chính
              </TableHead>
              <TableHead className="w-5/12 font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200 py-3 pr-4">
                Thời Hạn Nộp Đơn Quy Định
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGroups.map((group, groupIndex) =>
              group.procedures.map((procedure, procIndex) => (
                <TableRow
                  key={`${groupIndex}-${procIndex}`}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                    procIndex === group.procedures.length - 1
                      ? 'border-b-2 border-slate-300 dark:border-slate-700'
                      : 'border-b border-slate-200/80 dark:border-slate-800/80'
                  }`}
                >
                  <TableCell className="font-medium py-3 pl-4 align-middle text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-slate-500 shrink-0" />
                      <span>{intl.formatMessage({ id: procedure })}</span>
                    </div>
                  </TableCell>
                  {procIndex === 0 ? (
                    <TableCell
                      className="py-3 px-4 align-middle bg-slate-50/50 dark:bg-slate-950/40"
                      rowSpan={group.procedures.length}
                    >
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs border shadow-2xs ${group.badgeStyle}`}
                      >
                        <span>{intl.formatMessage({ id: group.deadline })}</span>
                      </span>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export const ApplicationDeadlineModalTrigger: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs">
            <span>Thời hạn nộp đơn & thủ tục</span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        className="fixed z-50 max-w-3xl w-[calc(100%-2rem)] max-h-[85vh] overflow-y-auto p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
      >
        <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center justify-between">
            <span>Thời Hạn Nộp Đơn & Quy Định Thủ Tục</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Quy chế FAP
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="pt-4">
          <ApplicationDeadlineTable />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ApplicationDeadline = () => {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <ApplicationDeadlineTable />
    </div>
  );
};

export { ApplicationDeadline };
