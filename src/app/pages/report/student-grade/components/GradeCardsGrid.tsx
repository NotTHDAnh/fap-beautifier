import React from 'react';
import { ParsedGradeItem } from '../use-student-grade';

interface GradeCardsGridProps {
  items: ParsedGradeItem[];
}

export const GradeCardsGrid: React.FC<GradeCardsGridProps> = ({ items }) => {
  // Filter out total rows to show individual test score cards
  const testItems = items.filter((item) => !item.isTotal && item.score !== null);

  if (testItems.length === 0) return null;

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
          Chi Tiết Điểm Các Bài Kiểm Tra & Thi
        </h3>
        <span className="text-xs font-semibold text-slate-500">
          {testItems.length} đầu điểm
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {testItems.map((item, idx) => {
          const score = item.score ?? 0;
          const scoreColor =
            score >= 8.0
              ? 'bg-emerald-500 text-white'
              : score >= 6.5
              ? 'bg-blue-600 text-white'
              : score >= 5.0
              ? 'bg-amber-500 text-white'
              : 'bg-rose-500 text-white';

          const barColor =
            score >= 8.0
              ? 'bg-emerald-500'
              : score >= 6.5
              ? 'bg-blue-600'
              : score >= 5.0
              ? 'bg-amber-500'
              : 'bg-rose-500';

          return (
            <div
              key={item.itemName + idx}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 pr-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                    {item.category || 'Môn học'}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate mt-0.5">
                    {item.itemName}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.weight > 0 && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {item.weight}%
                    </span>
                  )}
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full shadow-2xs ${scoreColor}`}>
                    {score}
                  </span>
                </div>
              </div>

              {/* Individual Score Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                  <span>Điểm bài thi</span>
                  <span>{score} / 10.0</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.min(100, Math.max(0, (score / 10) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
