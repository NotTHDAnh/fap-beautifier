import React from 'react';

export interface ComponentWeight {
  label: string;
  weight: number;
  color: string;
  score?: number | null;
}

interface GradePieChartProps {
  components: ComponentWeight[];
  courseCode?: string;
  overallScore?: number | null;
  statusText?: string;
}

export const GradePieChart: React.FC<GradePieChartProps> = ({
  components,
  courseCode = 'Môn học',
  overallScore = 7.1,
  statusText = 'Passed',
}) => {
  const data = components.length > 0 ? components : [
    { label: 'Assignments / Quizzes', weight: 60, color: '#2563EB', score: 7.1 },
    { label: 'Final Project / FE', weight: 40, color: '#10B981', score: 7.0 },
  ];

  const totalWeight = data.reduce((sum, item) => sum + item.weight, 0);

  // SVG Donut Calculations
  let accumulatedAngle = 0;
  const radius = 65;
  const circumference = 2 * Math.PI * radius;

  const displayScore = overallScore !== null && overallScore !== undefined ? overallScore : 7.1;

  return (
    <div className="space-y-4 w-full">
      {/* 🌟 1. Top Metric Overview Gauge Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-black flex flex-col items-center justify-center border border-emerald-200 dark:border-emerald-900 shrink-0">
            <span className="text-xl leading-none">{displayScore}</span>
            <span className="text-[10px] opacity-80">/ 10</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Điểm Tổng Kết Môn ({courseCode})
              </h3>
              {statusText && (
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    statusText === 'Passed'
                      ? 'bg-emerald-500 text-white'
                      : statusText.includes('Not') || statusText.includes('Fail')
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  {statusText}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Trọng số điểm tích lũy đạt chuẩn hoàn thành môn học.
            </p>
          </div>
        </div>

        {/* Linear Score Bar */}
        <div className="w-full sm:w-48 space-y-1">
          <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Tiến độ thang điểm</span>
            <span>{Math.round((displayScore / 10) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200/80 dark:border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                displayScore >= 8.0
                  ? 'bg-emerald-500'
                  : displayScore >= 6.5
                  ? 'bg-blue-600'
                  : displayScore >= 5.0
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, (displayScore / 10) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 📊 2. Donut Chart + Component Score Legend */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        {/* SVG Donut Chart */}
        <div className="relative size-44 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 160 160" className="size-full -rotate-90 transform">
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="18"
              fill="transparent"
            />

            {data.map((item, idx) => {
              const strokeDasharray = `${(item.weight / (totalWeight || 100)) * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedAngle * circumference;
              accumulatedAngle += item.weight / (totalWeight || 100);

              return (
                <circle
                  key={item.label + idx}
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke={item.color}
                  strokeWidth="18"
                  fill="transparent"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 hover:opacity-85"
                />
              );
            })}
          </svg>

          {/* Center Donut Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-black text-slate-900 dark:text-white leading-none">
              {displayScore}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
              Điểm TB
            </span>
          </div>
        </div>

        {/* Right Legend Breakdown List */}
        <div className="flex-1 w-full space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Tỷ Trọng % & Điểm Thành Phần
            </span>
            <span className="text-[11px] font-medium text-slate-500">Trọng số • Điểm</span>
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
            {data.map((item, idx) => (
              <div
                key={item.label + idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span
                    className="size-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {item.weight}%
                  </span>
                  {item.score !== undefined && item.score !== null && (
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
                      {item.score}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
