import { useState } from 'react';
import { useFapData, useFapDataCustom } from '@/app/providers/fap-data-provider';

export interface Shift {
  activityId: number;
  courseName: string;
  className?: string;
  room: string;
  time: string;
  dateTime: {
    start: string;
    end: string;
  };
  meetingURL?: string;
  materialURL?: string;
  status: number; // 0 = Not yet, 1 = Attended, 2 = Absent
  online?: boolean;
}

function findTimetableTable(original: Element): HTMLTableElement | undefined {
  if (!original) return undefined;
  const tables = Array.from(original.querySelectorAll('table'));
  
  // 1. First priority: Table with actual activity links or attendance text AND enough rows
  for (const table of tables) {
    if (!table.rows || table.rows.length < 3) continue; // Skip wrapper tables
    const text = table.textContent || '';
    if (text.includes('ActivityDetail') || text.includes('attended') || text.includes('absent') || text.includes('View Materials')) {
      return table as HTMLTableElement;
    }
  }

  // 2. Second priority: Table with Slot AND enough rows
  for (const table of tables) {
    if (!table.rows || table.rows.length < 3) continue;
    const text = table.textContent || '';
    if (text.includes('Slot') || /mon|tue|wed|thu|fri|sat|sun/i.test(text)) {
      return table as HTMLTableElement;
    }
  }

  // 3. Fallback to largest table
  const sorted = [...tables].filter(t => t.rows && t.rows.length >= 3).sort((a, b) => b.rows.length - a.rows.length);
  return (sorted[0] || tables[2] || tables[0]) as HTMLTableElement | undefined;
}

function convertToScheduler(original: Element): (Shift | undefined)[][] {
  if (!original) return [];
  try {
    const table = findTimetableTable(original);
    if (!table || !table.rows || table.rows.length < 2) return [];

    const headerRow = table.rows[0];
    const headerCells = Array.from(headerRow?.cells || []);
    
    // Day cells for MON-SUN start from index 2 if cell 0 is Year & cell 1 is Week, or index 1 if cell 0 is Slot
    const dayCells = headerCells.length >= 9 ? headerCells.slice(2) : headerCells.slice(1);
    const dates = dayCells.map((cell) => cell?.textContent?.trim() || '');

    const yearElement = original.querySelector('#ctl00_mainContent_drpYear') as HTMLSelectElement | null;
    const currentYear = yearElement?.options
      ? Array.from(yearElement.options).find((option) => option.hasAttribute('selected') || option.selected)?.value || new Date().getFullYear().toString()
      : new Date().getFullYear().toString();

    const startRowIdx = 1;
    const totalSlots = Math.max(8, table.rows.length - startRowIdx);

    const shifts: (Shift | undefined)[][] = Array.from({ length: totalSlots }, () =>
      Array.from({ length: 7 }, (): Shift | undefined => undefined)
    );

    for (let i = startRowIdx; i < table.rows.length; i++) {
      const row = table.rows[i];
      if (!row || !row.cells) continue;

      const slotText = row.cells[0]?.textContent?.trim() || '';
      const slotMatch = slotText.match(/Slot\s*(\d+)/i);
      const slotIndex = slotMatch ? parseInt(slotMatch[1]) - 1 : i - startRowIdx;

      for (let j = 1; j < row.cells.length; j++) {
        const cell = row.cells[j];
        const dayIndex = j - 1;
        if (!cell || !cell.textContent?.trim() || cell.textContent.trim() === '-') {
          continue;
        }

        try {
          const links = Array.from(cell.querySelectorAll('a'));
          const activityLink = links.find((a) => a.href.includes('ActivityDetail.aspx')) || links[0];
          
          let activityIdNum = 0;
          if (activityLink?.href?.includes('id=')) {
            const parsedId = parseInt(activityLink.href.split('id=')[1]?.split('&')[0]);
            if (!isNaN(parsedId)) activityIdNum = parsedId;
          }
          
          const rawCourseName = activityLink?.textContent?.trim() || cell.textContent?.trim().split('-')[0]?.trim() || 'Môn học';
          const courseName = rawCourseName.replace(/^-+|-+$/g, '').trim() || 'Môn học';
          
          // Try to extract class name (e.g. SE1808, IA1601, K16, etc.)
          const cellContent = cell.textContent || '';
          let className = '';
          const classMatch = cellContent.match(/\b([A-Z]{2,3}\d{4}[a-zA-Z]?|K\d{2,3}[a-zA-Z]?)\b/i);
          if (classMatch) {
            className = classMatch[1].toUpperCase();
          } else if (cellContent.includes('-')) {
            const parts = cellContent.split('-');
            if (parts.length > 1 && parts[1].trim().length > 0) {
              className = parts[1].trim().split(/\s+/)[0];
            }
          }
          if (/\d{1,2}\/\d{1,2}/.test(courseName)) continue;
          if (/^[\d\/\s]+$/.test(courseName)) continue;
          if (/^(mon|tue|wed|thu|fri|sat|sun|year|week|to)$/i.test(courseName)) continue;
          if (!/[a-zA-Z]/.test(courseName)) continue;
          
          // Extract room (e.g. "NVH 602()")
          const roomMatch = cellContent.match(/at\s+([^\n\r(]+(?:\(\))?)/i);
          const room = roomMatch ? roomMatch[1].trim() : 'NVH';

          const timeMatch = cellContent.match(/\((\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})\)/);
          const time = timeMatch ? timeMatch[1] : '';

          const isAttended = /attended/i.test(cellContent);
          const isAbsent = /absent/i.test(cellContent);
          const status = isAttended ? 1 : isAbsent ? 2 : 0;

          const syllabusLink = links.find((a) => a.classList.contains('label-warning') || a.textContent?.includes('Materials'));
          const syllabusURL = syllabusLink?.getAttribute('href') || undefined;

          const meetLink = links.find((a) => a.classList.contains('label-default') || a.textContent?.includes('Meet'));
          const meetURL = meetLink?.getAttribute('href') || undefined;

          const onlineText = cell.querySelector('.online-text') || cellContent.includes('online');

          const date = dates[dayIndex] || '';
          const dateMatch = date.match(/(\d{1,2})\/(\d{1,2})/);
          const day = dateMatch ? dateMatch[1] : '01';
          const month = dateMatch ? dateMatch[2] : '01';

          const timeParts = time.split(/[-:]/);
          const startHour = timeParts[0] || '07';
          const startMinute = timeParts[1] || '30';
          const endHour = timeParts[2] || '09';
          const endMinute = timeParts[3] || '50';

          let startIso = new Date().toISOString();
          let endIso = new Date().toISOString();

          try {
            const pYr = parseInt(currentYear || '2026');
            const pMo = parseInt(month) - 1;
            const pDy = parseInt(day);
            const pSh = parseInt(startHour);
            const pSm = parseInt(startMinute);
            const pEh = parseInt(endHour);
            const pEm = parseInt(endMinute);

            if (!isNaN(pYr) && !isNaN(pMo) && !isNaN(pDy) && !isNaN(pSh) && !isNaN(pSm)) {
              const sDate = new Date(pYr, pMo, pDy, pSh, pSm);
              const eDate = new Date(pYr, pMo, pDy, isNaN(pEh) ? pSh + 2 : pEh, isNaN(pEm) ? pSm : pEm);
              if (!isNaN(sDate.getTime())) startIso = sDate.toISOString();
              if (!isNaN(eDate.getTime())) endIso = eDate.toISOString();
            }
          } catch (dateErr) {
            // Ignore date parsing exception safely
          }

          if (slotIndex >= 0 && slotIndex < totalSlots && dayIndex >= 0 && dayIndex < 7) {
            shifts[slotIndex][dayIndex] = {
              activityId: activityIdNum,
              courseName,
              className,
              room,
              time: time || 'Ca học',
              dateTime: {
                start: startIso,
                end: endIso,
              },
              materialURL: syllabusURL,
              meetingURL: meetURL,
              status,
              online: !!onlineText,
            };
          }
        } catch (error) {
          console.error('Error parsing schedule cell:', error);
        }
      }
    }
    return shifts;
  } catch (err) {
    console.error('Error in convertToScheduler:', err);
    return [];
  }
}

export interface SelectOption {
  value: string;
  label: string;
  selected: boolean;
}

export const useScheduleOfWeek = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setData } = useFapData();

  const {
    shifts,
    days,
    yearOptions,
    weekOptions,
    viewStateValue,
    viewStateGeneratorValue,
    eventValidationValue,
    currentWeekValue,
  } = useFapDataCustom({
    shifts: (original) => {
      if (!original) return [];
      return convertToScheduler(original);
    },
    days: (original) => {
      if (!original) return [];
      try {
        const table = findTimetableTable(original);
        if (!table || !table.rows || table.rows.length < 1) return [];
        const headerRow = table.rows[0];
        const headerCells = Array.from(headerRow?.cells || []);
        const dayCells = headerCells.length >= 9 ? headerCells.slice(2) : headerCells.slice(1);
        return dayCells.map((cell) => {
          const text = cell?.textContent?.trim() || '';
          const dateMatch = text.match(/(\d{1,2}\/\d{1,2})/);
          return dateMatch ? dateMatch[1] : '';
        });
      } catch (e) {
        return [];
      }
    },
    yearOptions: (original) => {
      if (!original) return [];
      try {
        const year = original.querySelector('#ctl00_mainContent_drpYear') as HTMLSelectElement | null;
        if (!year || !year.options) return [];
        return Array.from(year.options).map((option) => ({
          value: option.value,
          label: option.text?.trim() || option.value,
          selected: option.hasAttribute('selected') || option.selected,
        }));
      } catch (e) {
        return [];
      }
    },
    weekOptions: (original) => {
      if (!original) return [];
      try {
        const week = original.querySelector('#ctl00_mainContent_drpSelectWeek') as HTMLSelectElement | null;
        if (!week || !week.options) return [];
        return Array.from(week.options).map((option) => ({
          value: option.value,
          label: option.text?.trim()?.replace('To', '-') || option.value,
          selected: option.hasAttribute('selected') || option.selected,
        }));
      } catch (e) {
        return [];
      }
    },
    currentWeekValue: (original) => {
      if (!original) return '0';
      try {
        const week = original.querySelector('#ctl00_mainContent_drpSelectWeek') as HTMLSelectElement | null;
        if (!week || !week.options) return '0';
        const currentWeekOption = Array.from(week.options).find((option) => option.hasAttribute('selected') || option.selected);
        return currentWeekOption ? currentWeekOption.value : week.options[0]?.value || '0';
      } catch (e) {
        return '0';
      }
    },
    viewStateValue: (original) => {
      if (!original) return '';
      const viewState = original.querySelector('#__VIEWSTATE') as HTMLInputElement | null;
      return viewState ? viewState.value : '';
    },
    viewStateGeneratorValue: (original) => {
      if (!original) return '';
      const viewStateGenerator = original.querySelector('#__VIEWSTATEGENERATOR') as HTMLInputElement | null;
      return viewStateGenerator ? viewStateGenerator.value : '';
    },
    eventValidationValue: (original) => {
      if (!original) return '';
      const eventValidation = original.querySelector('#__EVENTVALIDATION') as HTMLInputElement | null;
      return eventValidation ? eventValidation.value : '';
    },
  });

  const fetchScheduleData = async (year: string, week: string) => {
    if (!year || !week) return;

    setIsLoading(true);
    try {
      const response = await fetch('/Report/ScheduleOfWeek.aspx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          __EVENTTARGET: 'ctl00$mainContent$drpSelectWeek',
          __EVENTARGUMENT: '',
          __LASTFOCUS: '',
          __VIEWSTATE: viewStateValue || '',
          __VIEWSTATEGENERATOR: viewStateGeneratorValue || '',
          __EVENTVALIDATION: eventValidationValue || '',
          'ctl00$mainContent$drpYear': year,
          'ctl00$mainContent$drpSelectWeek': week,
        }).toString(),
      });

      const data = await response.text();
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(data, 'text/html');
      const container = htmlDoc.querySelector('.container') as Element;

      if (container) {
        setData(container);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const futureShifts = shifts
    ?.flat()
    ?.filter((shift) => shift && shift.dateTime && new Date(shift.dateTime.start) > new Date())
    ?.map((shift) => shift as Shift) || [];

  return {
    shifts,
    futureShifts,
    days,
    yearOptions,
    weekOptions,
    isLoading,
    fetchScheduleData,
    currentWeekValue,
  };
};