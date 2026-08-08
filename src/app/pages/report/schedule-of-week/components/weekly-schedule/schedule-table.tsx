import { cn } from '@/app/lib/utils';
import { Loader2 } from 'lucide-react';
import { Shift } from '../../use-schedule-of-week';
import { useFapData } from '@/app/providers/fap-data-provider';
import { useMemo, useRef, useEffect } from 'react';

interface ScheduleTableProps {
  isLoading: boolean;
  shifts?: (Shift | undefined)[][];
  days?: string[];
  onShiftClick: (activityId: number, status: number, time: string) => void;
}

const DAY_HEADERS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_LABELS_VI = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

const START_HOUR = 7;
const END_HOUR = 22;
const HOUR_HEIGHT = 60;
const TOTAL_HOURS = END_HOUR - START_HOUR;

const SLOT_DEFAULTS: Record<number, { start: string; end: string }> = {
  0: { start: '07:30', end: '09:50' },
  1: { start: '10:00', end: '12:20' },
  2: { start: '12:30', end: '14:45' },
  3: { start: '15:20', end: '17:40' },
  4: { start: '17:50', end: '20:10' },
  5: { start: '20:20', end: '22:00' },
  6: { start: '07:30', end: '09:50' },
  7: { start: '10:00', end: '12:20' },
};

const EVENT_COLORS = [
  { bg: 'bg-blue-100 dark:bg-blue-900/40', border: 'border-l-blue-500', text: 'text-blue-900 dark:text-blue-100', sub: 'text-blue-700 dark:text-blue-300' },
  { bg: 'bg-emerald-100 dark:bg-emerald-900/40', border: 'border-l-emerald-500', text: 'text-emerald-900 dark:text-emerald-100', sub: 'text-emerald-700 dark:text-emerald-300' },
  { bg: 'bg-violet-100 dark:bg-violet-900/40', border: 'border-l-violet-500', text: 'text-violet-900 dark:text-violet-100', sub: 'text-violet-700 dark:text-violet-300' },
  { bg: 'bg-amber-100 dark:bg-amber-900/40', border: 'border-l-amber-500', text: 'text-amber-900 dark:text-amber-100', sub: 'text-amber-700 dark:text-amber-300' },
  { bg: 'bg-rose-100 dark:bg-rose-900/40', border: 'border-l-rose-500', text: 'text-rose-900 dark:text-rose-100', sub: 'text-rose-700 dark:text-rose-300' },
  { bg: 'bg-cyan-100 dark:bg-cyan-900/40', border: 'border-l-cyan-500', text: 'text-cyan-900 dark:text-cyan-100', sub: 'text-cyan-700 dark:text-cyan-300' },
  { bg: 'bg-pink-100 dark:bg-pink-900/40', border: 'border-l-pink-500', text: 'text-pink-900 dark:text-pink-100', sub: 'text-pink-700 dark:text-pink-300' },
  { bg: 'bg-indigo-100 dark:bg-indigo-900/40', border: 'border-l-indigo-500', text: 'text-indigo-900 dark:text-indigo-100', sub: 'text-indigo-700 dark:text-indigo-300' },
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function parseTime(timeStr: string): number {
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  return parseInt(match[1]) + parseInt(match[2]) / 60;
}

interface CalendarEvent {
  courseName: string;
  className?: string;
  room: string;
  time: string;
  startHour: number;
  endHour: number;
  status: 'attended' | 'absent' | 'upcoming';
  online: boolean;
  dayIndex: number;
  slotIndex: number;
  activityId: number;
}

// ── Find timetable table - AGGRESSIVE search ────────────────────────
function findTimetableTable(el: Element): HTMLTableElement | null {
  if (!el) return null;
  
  // Get ALL tables in the entire element tree
  const tables = Array.from(el.querySelectorAll('table'));
  
  console.log('[Schedule] Total tables found:', tables.length);
  tables.forEach((t, i) => {
    const txt = (t.textContent || '').substring(0, 200);
    console.log(`[Schedule] Table ${i}: rows=${t.rows?.length}, text="${txt}..."`);
  });

  // Strategy 1: Table with Slot rows, course content, AND enough rows (skip wrapper tables)
  for (const t of tables) {
    if (!t.rows || t.rows.length < 3) continue; // Must have at least 3 rows (header + slots)
    const txt = t.textContent || '';
    const hasSlots = /slot\s*1/i.test(txt) && /slot\s*2/i.test(txt);
    const hasCourseContent = /ActivityDetail|View\s*Materials|attended|absent|EduNext/i.test(txt);
    if (hasSlots && hasCourseContent) {
      console.log(`[Schedule] Found table via Strategy 1 (slots + course content), rows=${t.rows.length}`);
      return t as HTMLTableElement;
    }
  }

  // Strategy 2: Table with slots only AND enough rows
  for (const t of tables) {
    if (!t.rows || t.rows.length < 3) continue;
    const txt = t.textContent || '';
    if (/slot\s*1/i.test(txt) && /slot\s*2/i.test(txt)) {
      console.log(`[Schedule] Found table via Strategy 2 (slots only), rows=${t.rows.length}`);
      return t as HTMLTableElement;
    }
  }

  // Strategy 3: Table with many rows and date-like content
  for (const t of tables) {
    if (t.rows && t.rows.length >= 5) {
      const txt = t.textContent || '';
      if (/\d{1,2}\/\d{1,2}/.test(txt) && (/mon|tue|wed/i.test(txt) || /slot/i.test(txt))) {
        console.log('[Schedule] Found table via Strategy 3 (large table with dates)');
        return t as HTMLTableElement;
      }
    }
  }

  // Strategy 4: Largest table with >= 8 columns and >= 5 rows (likely a grid)
  let bestTable: HTMLTableElement | null = null;
  let bestScore = 0;
  for (const t of tables) {
    if (t.rows && t.rows.length >= 3) {
      const maxCols = Math.max(...Array.from(t.rows).map(r => r.cells?.length || 0));
      const score = t.rows.length * maxCols;
      if (maxCols >= 7 && score > bestScore) {
        bestScore = score;
        bestTable = t as HTMLTableElement;
      }
    }
  }
  if (bestTable) {
    console.log('[Schedule] Found table via Strategy 4 (largest grid table)');
    return bestTable;
  }

  console.log('[Schedule] No timetable table found!');
  return null;
}

// ── Parse events from raw DOM ───────────────────────────────────────
function parseRawEvents(rawElement: Element): { events: CalendarEvent[]; dates: string[] } {
  const table = findTimetableTable(rawElement);
  if (!table || !table.rows || table.rows.length < 2) {
    console.log('[Schedule] No valid table for parsing');
    return { events: [], dates: [] };
  }

  console.log('[Schedule] Parsing table with', table.rows.length, 'rows');

  // Extract dates from ALL rows (search broadly)
  let dates: string[] = [];
  for (let i = 0; i < Math.min(table.rows.length, 4); i++) {
    const rowDates: string[] = [];
    const cells = Array.from(table.rows[i].cells);
    for (const cell of cells) {
      const m = (cell.textContent || '').match(/(\d{1,2}\/\d{1,2})/);
      if (m) rowDates.push(m[1]);
    }
    if (rowDates.length >= 5 && rowDates.length > dates.length) {
      dates = rowDates;
    }
  }
  while (dates.length < 7) dates.push('');
  console.log('[Schedule] Extracted dates:', dates);

  // Find slot rows
  const events: CalendarEvent[] = [];
  let slotCounter = 0;

  for (let i = 0; i < table.rows.length; i++) {
    const row = table.rows[i];
    const rowText = (row.textContent || '').trim();

    // Stop at notes section
    if (/more\s*note/i.test(rowText) || /chú\s*thích\s*thêm/i.test(rowText)) break;

    // Must be a slot row
    const slotMatch = rowText.match(/slot\s*(\d+)/i);
    if (!slotMatch) continue;

    const slotNum = parseInt(slotMatch[1]) - 1;
    const cells = Array.from(row.cells);
    
    console.log(`[Schedule] Processing Slot ${slotNum + 1}, cells: ${cells.length}`);

    // Determine which cells are day cells
    // Skip the first cell (Slot label), take last 7 or remaining cells
    let dayCells: Element[];
    if (cells.length >= 8) {
      dayCells = cells.slice(cells.length - 7);
    } else if (cells.length >= 2) {
      dayCells = cells.slice(1); // skip Slot label
    } else {
      continue;
    }

    for (let d = 0; d < Math.min(7, dayCells.length); d++) {
      const cell = dayCells[d];
      const text = (cell?.textContent || '').trim();
      if (!text || text === '-') continue;

      // Course name extraction
      const links = Array.from(cell.querySelectorAll('a'));
      let courseName = '';
      for (const link of links) {
        const lt = (link.textContent || '').trim();
        if (lt && lt.length > 1 && !/^View\s*Materials$/i.test(lt) && !/^Meet$/i.test(lt) && !/^-?EduNext$/i.test(lt) && !/^Online$/i.test(lt)) {
          courseName = lt.replace(/-?View\s*Materials?/i, '').replace(/^-+|-+$/g, '').trim();
          if (courseName) break;
        }
      }
      
      if (!courseName) {
        // Try first meaningful line
        const lines = text.split('\n').map(l => l.trim()).filter(l => l && l !== '-');
        for (const line of lines) {
          const clean = line
            .replace(/-?View\s*Materials?/i, '')
            .replace(/\(attended\)|\(absent\)/gi, '')
            .replace(/\(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\)/g, '')
            .replace(/-?EduNext/i, '')
            .replace(/^at\s+.*/i, '')
            .replace(/^-+|-+$/g, '')
            .trim();
          if (clean && clean.length >= 2 && !/^at\s/i.test(clean) && !/^\(/.test(clean)) {
            courseName = clean.split(/\s+at\s+/i)[0].trim();
            break;
          }
        }
      }

      // Try to extract className
      let className = '';
      const classMatch = text.match(/\b([A-Z]{2,3}\d{4}[a-zA-Z]?|K\d{2,3}[a-zA-Z]?)\b/i);
      if (classMatch) {
        className = classMatch[1].toUpperCase();
      } else if (text.includes('-')) {
        const parts = text.split('-');
        if (parts.length > 1 && parts[1].trim().length > 0) {
          className = parts[1].trim().split(/\s+/)[0];
        }
      }

      if (!courseName || courseName.length < 2) continue;

      // Filter out ghost entries: anything containing date patterns (dd/dd), 
      // pure numbers, header labels, or only digits+slashes
      // Real course codes (PRN212, SWP391, WDU203c) never contain "/"
      if (/\d{1,2}\/\d{1,2}/.test(courseName)) continue;
      if (/^[\d\/\s]+$/.test(courseName.trim())) continue;
      if (/^(mon|tue|wed|thu|fri|sat|sun|year|week|to)$/i.test(courseName.trim())) continue;
      // Must contain at least one letter to be a valid course name
      if (!/[a-zA-Z]/.test(courseName)) continue;

      // Must have either a time pattern or attendance status to be a real course entry
      const hasTime = /\d{1,2}:\d{2}/.test(text);
      const hasAttendance = /attended|absent/i.test(text);
      const hasLink = cell.querySelector('a') !== null;
      if (!hasTime && !hasAttendance && !hasLink) continue;

      console.log(`[Schedule] Found course: "${courseName}" at day ${d}, slot ${slotNum + 1}`);

      // Room (e.g. "NVH 602()")
      const roomMatch = text.match(/at\s+([^\n\r(]+(?:\(\))?)/i);
      const room = roomMatch ? roomMatch[1].trim().replace(/\s*-?\s*$/, '') : '';

      // Time
      const timeMatch = text.match(/\((\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\)/);
      const timeStr = timeMatch ? `${timeMatch[1]} - ${timeMatch[2]}` : '';
      
      const defaults = SLOT_DEFAULTS[slotNum] || SLOT_DEFAULTS[0];
      const startHour = timeMatch ? parseTime(timeMatch[1]) : parseTime(defaults.start);
      const endHour = timeMatch ? parseTime(timeMatch[2]) : parseTime(defaults.end);

      const status: 'attended' | 'absent' | 'upcoming' = 
        /attended/i.test(text) ? 'attended' : /absent/i.test(text) ? 'absent' : 'upcoming';
      const online = /online/i.test(text);

      events.push({
        courseName, className, room, time: timeStr, startHour, endHour, status, online,
        dayIndex: d, slotIndex: slotNum, activityId: 0,
      });
    }
    slotCounter++;
  }

  console.log('[Schedule] Total events parsed:', events.length);
  return { events, dates };
}

function shiftsToEvents(shifts: (Shift | undefined)[][]): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  shifts.forEach((row, slotIndex) => {
    row.forEach((shift, dayIndex) => {
      if (!shift) return;
      const timeMatch = shift.time?.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
      const defaults = SLOT_DEFAULTS[slotIndex] || SLOT_DEFAULTS[0];
      events.push({
        courseName: shift.courseName,
        className: shift.className,
        room: shift.room,
        time: shift.time,
        startHour: timeMatch ? parseTime(timeMatch[1]) : parseTime(defaults.start),
        endHour: timeMatch ? parseTime(timeMatch[2]) : parseTime(defaults.end),
        status: shift.status === 1 ? 'attended' : shift.status === 2 ? 'absent' : 'upcoming',
        online: !!shift.online,
        dayIndex, slotIndex, activityId: shift.activityId,
      });
    });
  });
  return events;
}

function useCurrentTimePosition() {
  const now = new Date();
  const h = now.getHours() + now.getMinutes() / 60;
  if (h < START_HOUR || h > END_HOUR) return null;
  return ((h - START_HOUR) / TOTAL_HOURS) * 100;
}

// ── Event Card ──────────────────────────────────────────────────────
const EventCard = ({ event, onClick }: { event: CalendarEvent; onClick?: () => void }) => {
  const color = EVENT_COLORS[hashCode(event.courseName) % EVENT_COLORS.length];
  const statusDot = event.status === 'attended' ? 'bg-emerald-500' : event.status === 'absent' ? 'bg-rose-500' : 'bg-blue-500';
  const dur = event.endHour - event.startHour;
  const compact = dur < 1.5;

  return (
    <div
      className={cn(
        "absolute left-0.5 right-0.5 rounded-lg border-l-[3px] px-2 overflow-hidden cursor-pointer",
        "transition-all duration-150 hover:shadow-lg hover:z-30 hover:scale-[1.02]",
        color.bg, color.border, compact ? "py-0.5" : "py-1.5"
      )}
      style={{
        top: `${((event.startHour - START_HOUR) / TOTAL_HOURS) * 100}%`,
        height: `${Math.max(dur, 0.5) / TOTAL_HOURS * 100}%`,
        minHeight: '22px',
      }}
      onClick={onClick}
    >
      <div className="flex items-center gap-1.5">
        <div className={cn("size-1.5 rounded-full shrink-0", statusDot)} />
        <span className={cn("font-bold truncate leading-tight", color.text, compact ? "text-[10px]" : "text-[11px]")}>
          {event.courseName}
        </span>
      </div>
      {event.className && (
        <div className={cn("font-semibold pl-3 leading-tight opacity-90", color.text, compact ? "text-[9px]" : "text-[10px] mt-0.5")}>
          {event.className}
        </div>
      )}
      {!compact && (
        <>
          {event.room && <p className={cn("text-[10px] font-medium truncate mt-0.5 pl-3", color.sub)}>{event.room}</p>}
          {event.time && <p className={cn("text-[9px] font-semibold mt-0.5 pl-3 opacity-70", color.sub)}>{event.time}</p>}
        </>
      )}
    </div>
  );
};

// ── Styled raw HTML fallback ────────────────────────────────────────
function RawTableFallback({ rawElement }: { rawElement: Element }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || !rawElement) return;
    const table = findTimetableTable(rawElement);
    if (!table) return;
    const clone = table.cloneNode(true) as HTMLTableElement;
    clone.style.cssText = 'width:100%;border-collapse:collapse;font-size:11px;';
    Array.from(clone.rows).forEach((row, i) => {
      Array.from(row.cells).forEach(cell => {
        cell.style.cssText = 'padding:6px 4px;border:1px solid rgba(148,163,184,0.15);vertical-align:top;';
        if (i === 0) cell.style.cssText += 'font-weight:800;text-align:center;background:rgba(241,245,249,0.8);font-size:10px;';
        const links = cell.querySelectorAll('a');
        links.forEach(l => { (l as HTMLElement).style.cssText = 'color:#2563eb;font-weight:700;text-decoration:none;'; });
      });
    });
    ref.current.innerHTML = '';
    ref.current.appendChild(clone);
  }, [rawElement]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div ref={ref} className="overflow-x-auto p-3 text-slate-800 dark:text-slate-200" />
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────
const ScheduleTable = ({ isLoading, shifts, days, onShiftClick }: ScheduleTableProps) => {
  const { getData } = useFapData();
  const rawElement = getData();
  const currentDay = new Date().getDay() - 1;
  const currentTimePos = useCurrentTimePosition();

  const hasCustomShifts = shifts?.some(row => row?.some(cell => cell !== undefined));

  // Build events
  const { events, effectiveDays } = useMemo(() => {
    if (hasCustomShifts && shifts) {
      return { events: shiftsToEvents(shifts), effectiveDays: days || [] };
    }
    if (rawElement) {
      const parsed = parseRawEvents(rawElement);
      return { events: parsed.events, effectiveDays: parsed.dates };
    }
    return { events: [], effectiveDays: days || [] };
  }, [shifts, hasCustomShifts, rawElement, days]);

  const hasAnyData = events.length > 0;

  // Check if raw table exists for HTML fallback
  const hasRawTable = useMemo(() => {
    if (hasAnyData || !rawElement) return false;
    const t = findTimetableTable(rawElement);
    return t !== null && (t.textContent || '').length > 100;
  }, [rawElement, hasAnyData]);

  const eventsByDay = useMemo(() => {
    const g: CalendarEvent[][] = Array.from({ length: 7 }, () => []);
    events.forEach(e => { if (e.dayIndex >= 0 && e.dayIndex < 7) g[e.dayIndex].push(e); });
    return g;
  }, [events]);

  // If parsers failed but raw table exists → show styled raw HTML
  if (!isLoading && !hasAnyData && hasRawTable && rawElement) {
    return <RawTableFallback rawElement={rawElement} />;
  }

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-30 backdrop-blur-sm">
          <Loader2 className="size-8 animate-spin text-blue-600" />
        </div>
      )}

      {!isLoading && !hasAnyData && !hasRawTable && (
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center size-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
            <svg className="size-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tuần này không có lịch học</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Dùng nút ← → để chuyển tuần</p>
        </div>
      )}

      {(hasAnyData || isLoading) && (
        <div className="w-full overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Day Headers */}
            <div className="flex border-b-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-20">
              <div className="w-14 shrink-0 border-r border-slate-200 dark:border-slate-700" />
              {DAY_HEADERS.map((dh, i) => (
                <div key={i} className={cn(
                  "flex-1 text-center py-3 border-r border-slate-100 dark:border-slate-800 last:border-r-0",
                  i === currentDay ? "bg-blue-50/60 dark:bg-blue-950/30" : ""
                )}>
                  <div className={cn("text-[10px] font-bold uppercase tracking-widest",
                    i === currentDay ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
                  )}>{DAY_LABELS_VI[i]}</div>
                  <div className={cn("text-lg font-black mt-0.5",
                    i === currentDay ? "text-blue-600 dark:text-blue-400" : "text-slate-800 dark:text-slate-200"
                  )}>{effectiveDays[i] || dh}</div>
                </div>
              ))}
            </div>

            {/* Time Grid */}
            <div className="flex relative" style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}>
              <div className="w-14 shrink-0 relative border-r border-slate-200 dark:border-slate-700">
                {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
                  <div key={i} className="absolute right-2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 tabular-nums"
                    style={{ top: `${(i / TOTAL_HOURS) * 100}%` }}>
                    {String(START_HOUR + i).padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {Array.from({ length: 7 }).map((_, di) => (
                <div key={di} className={cn(
                  "flex-1 relative border-r border-slate-100 dark:border-slate-800/50 last:border-r-0",
                  di === currentDay ? "bg-blue-50/20 dark:bg-blue-950/10" : ""
                )}>
                  {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
                    <div key={i} className="absolute left-0 right-0 border-t border-slate-100 dark:border-slate-800/40"
                      style={{ top: `${(i / TOTAL_HOURS) * 100}%` }} />
                  ))}
                  {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
                    <div key={`h-${i}`} className="absolute left-0 right-0 border-t border-dashed border-slate-50 dark:border-slate-800/20"
                      style={{ top: `${((i + 0.5) / TOTAL_HOURS) * 100}%` }} />
                  ))}
                  {eventsByDay[di]?.map((ev, ei) => (
                    <EventCard key={ei} event={ev}
                      onClick={ev.activityId ? () => onShiftClick(ev.activityId, ev.status === 'attended' ? 1 : ev.status === 'absent' ? 2 : 0, ev.time) : undefined}
                    />
                  ))}
                </div>
              ))}

              {currentTimePos !== null && (
                <div className="absolute left-14 right-0 z-20 pointer-events-none flex items-center" style={{ top: `${currentTimePos}%` }}>
                  <div className="size-2 rounded-full bg-red-500 -ml-1 shadow-sm" />
                  <div className="flex-1 h-[1.5px] bg-red-500/70" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {hasAnyData && (
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-emerald-500" /><span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Có mặt</span></div>
          <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-rose-500" /><span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Vắng</span></div>
          <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-blue-500" /><span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Sắp tới</span></div>
        </div>
      )}
    </div>
  );
};

export { ScheduleTable };