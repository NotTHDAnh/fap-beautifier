import { useFapDataCustom } from '@/app/providers/fap-data-provider';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Course, GradeData, Term } from './types';

export interface ComponentWeight {
  label: string;
  weight: number;
  color: string;
  score?: number | null;
}

export interface ParsedGradeItem {
  category: string;
  itemName: string;
  weight: number;
  score: number | null;
  scoreText: string;
  isTotal: boolean;
  isCourseTotal: boolean;
}

function addClasses(el: Element, ...classes: string[]) {
  classes.forEach((cls) => {
    if (cls) {
      cls.split(/\s+/).filter(Boolean).forEach((token) => el.classList.add(token));
    }
  });
}

export function filterResitGradeItems(items: ParsedGradeItem[]): ParsedGradeItem[] {
  const resitItemsWithScore = items.filter(
    (item) => /resit/i.test(item.itemName) || /resit/i.test(item.category)
  ).filter((item) => item.score !== null && !isNaN(item.score));

  return items.filter((item) => {
    const isResit = /resit/i.test(item.itemName) || /resit/i.test(item.category);

    if (isResit && (item.score === null || isNaN(item.score))) {
      return false;
    }

    const isFinalOriginal = !isResit && (/final/i.test(item.itemName) || /fe/i.test(item.itemName));
    if (isFinalOriginal && resitItemsWithScore.length > 0) {
      const cleanName = item.itemName.toLowerCase().trim();
      const hasResitOverride = resitItemsWithScore.some(
        (resit) => resit.itemName.toLowerCase().includes(cleanName) || cleanName.includes(resit.itemName.toLowerCase().replace(/resit/i, '').trim())
      );
      if (hasResitOverride) {
        return false;
      }
    }

    return true;
  });
}

export const useStudentGrade = () => {
  const intl = useIntl();
  
  const { terms, courses, markTable, resultText, rawParsedGradeItems, overallScore } = useFapDataCustom({
    terms: (original) => {
      if (!original) return [];
      const terms: Term[] = [];
      const table = original.querySelector("#ctl00_mainContent_divTerm table") as HTMLTableElement;
      if (table) {
        Array.from(table.rows).forEach((row) => {
          const rowA = row.cells[0].querySelector("a");
          const fullText = row ? row.innerText : "";
          const year = fullText.slice(-4);
          const season = fullText.slice(0, -4);
          const link = rowA ? rowA.href.replace("https://fap.fpt.edu.vn", "") : "";
          terms.push({ year, season, link, active: !rowA });
        });
      }
      return terms.reverse();
    },
    courses: (original) => {
      if (!original) return [];
      const courses: Course[] = [];
      const table = original.querySelector("#ctl00_mainContent_divCourse table") as HTMLTableElement;
      if (table) {
        Array.from(table.rows).forEach((row) => {
          const rowA = row.cells[0].querySelector("a");
          const fullText = row ? row.innerText : "";
          const pattern = /^(.*?) \((.*?)\) \((.*?), from (.*?) - (.*?)\)$/;
          const match = fullText.match(pattern);

          if (match) {
            courses.push({
              name: match[1].trim(),
              code: match[2].trim(),
              group: match[3].trim(),
              date: match[4].trim(),
              endDate: match[5] ? match[5].trim() : undefined,
              link: rowA ? rowA.href.replace("https://fap.fpt.edu.vn", "") : "",
              active: !rowA,
            });
          } else {
            const altPattern = /^(.*?) \((.*?)\) \((.*?), from (.*?)\)$/;
            const altMatch = fullText.match(altPattern);
            if (altMatch) {
              courses.push({
                name: altMatch[1].trim(),
                code: altMatch[2].trim(),
                group: altMatch[3].trim(),
                date: altMatch[4].trim(),
                link: rowA ? rowA.href.replace("https://fap.fpt.edu.vn", "") : "",
                active: !rowA,
              });
            }
          }
        });
      }
      return courses;
    },
    markTable: (original) => {
      const html = original?.querySelector("#ctl00_mainContent_divGrade");
      if (!html) return "";
      
      const clone = html.cloneNode(true) as HTMLElement;
      
      const tables = clone.querySelectorAll("table");
      tables.forEach((table) => {
        addClasses(table, "w-full border-collapse my-2");
        table.setAttribute("style", "");
        
        const rows = table.querySelectorAll("tr");
        let currentCategory = "";

        rows.forEach((row, rowIndex) => {
          if (rowIndex === 0) {
            addClasses(row, "bg-slate-50 dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700");
            const headerCells = row.querySelectorAll("th, td");
            headerCells.forEach(cell => {
              addClasses(cell, "px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider");
            });
            return;
          }

          const cells = Array.from(row.querySelectorAll("td"));
          if (cells.length === 0) return;

          let catCell: HTMLTableCellElement | null = null;
          let itemCell: HTMLTableCellElement | null = null;
          let weightCell: HTMLTableCellElement | null = null;
          let valueCell: HTMLTableCellElement | null = null;

          if (cells.length >= 5) {
            catCell = cells[0];
            itemCell = cells[1];
            weightCell = cells[2];
            valueCell = cells[3];
          } else if (cells.length === 4) {
            const firstText = cells[0]?.textContent?.trim() || "";
            if (/course total/i.test(firstText)) {
              catCell = cells[0];
              itemCell = cells[1];
              weightCell = null;
              valueCell = cells[2];
            } else {
              catCell = null;
              itemCell = cells[0];
              weightCell = cells[1];
              valueCell = cells[2];
            }
          } else if (cells.length === 3) {
            catCell = cells[0];
            itemCell = cells[1];
            weightCell = null;
            valueCell = cells[2];
          }

          if (catCell && catCell.textContent?.trim()) {
            currentCategory = catCell.textContent.trim();
          }

          const catText = currentCategory;
          const itemText = itemCell?.textContent?.trim() || "";

          const isFinal = /final|fe|eos|resit/i.test(catText) || /final|fe|eos|resit/i.test(itemText);
          const isProgress = /progress|pt|quiz|lab|assignment/i.test(catText) || /progress|pt|quiz|lab|assignment/i.test(itemText);
          const isCourseTotal = /course total/i.test(catText) || /course total/i.test(itemText);
          const isTotalRow = itemText.toLowerCase() === "total" || isCourseTotal;

          if (isCourseTotal) {
            addClasses(row, "bg-emerald-500/10 dark:bg-emerald-950/30 font-bold border-t-2 border-emerald-500/40");
          } else if (isTotalRow) {
            addClasses(row, "bg-slate-100/60 dark:bg-slate-800/60 font-semibold border-t border-slate-200 dark:border-slate-700");
          } else {
            addClasses(row, rowIndex % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-800/30", "hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors");
          }

          cells.forEach(cell => addClasses(cell, "px-4 py-2.5 text-sm align-middle"));

          // 1. Category Cell Badge
          if (catCell && catCell.textContent?.trim()) {
            const text = catCell.textContent.trim();
            if (/course total/i.test(text)) {
              catCell.innerHTML = `<span class="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold text-xs shadow-xs">${text}</span>`;
            } else {
              catCell.innerHTML = `<span class="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700 text-xs shadow-2xs">${text}</span>`;
            }
          }

          // 2. Item Cell
          if (itemCell && itemCell.textContent?.trim()) {
            const text = itemCell.textContent.trim();
            if (text.toLowerCase() === "total") {
              itemCell.innerHTML = `<span class="text-xs font-bold text-slate-500 uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Total</span>`;
            } else if (isFinal) {
              itemCell.innerHTML = `<span class="font-bold text-slate-900 dark:text-white">${text}</span>`;
            } else if (isProgress) {
              itemCell.innerHTML = `<span class="font-medium text-slate-900 dark:text-white">${text}</span>`;
            } else if (text.toLowerCase() === "average") {
              itemCell.innerHTML = `<span class="font-bold text-emerald-700 dark:text-emerald-300 text-base">Average Grade</span>`;
            } else if (text.toLowerCase() === "status") {
              itemCell.innerHTML = `<span class="font-bold text-slate-900 dark:text-white">Course Status</span>`;
            }
          }

          // 3. Weight Cell (%)
          if (weightCell && weightCell.textContent?.trim()) {
            const weightStr = weightCell.textContent.trim();
            const weightVal = parseFloat(weightStr);
            if (!isNaN(weightVal)) {
              weightCell.innerHTML = `<span class="inline-block px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700">${weightStr}</span>`;
            }
          }

          // 4. Value Cell (Grade Score)
          if (valueCell) {
            const rawStr = valueCell.textContent?.trim() || "";
            const val = parseFloat(rawStr);

            if (rawStr === "Passed") {
              valueCell.innerHTML = `<span class="inline-flex items-center px-3.5 py-1 rounded-full bg-emerald-500 text-white font-extrabold text-xs shadow-xs">Passed</span>`;
            } else if (rawStr === "Not Passed" || rawStr === "Attendance Fail") {
              valueCell.innerHTML = `<span class="inline-flex items-center px-3.5 py-1 rounded-full bg-rose-500 text-white font-extrabold text-xs shadow-xs">${rawStr}</span>`;
            } else if (!isNaN(val)) {
              if (isCourseTotal || itemText.toLowerCase() === "average") {
                valueCell.innerHTML = `<span class="inline-block font-black text-base px-3 py-1 rounded-md bg-emerald-500 text-white shadow-xs">${val}</span>`;
              } else if (val >= 5.0) {
                valueCell.innerHTML = `<span class="inline-block font-bold text-sm px-2.5 py-0.5 rounded-md bg-blue-600 text-white shadow-xs">${val}</span>`;
              } else {
                valueCell.innerHTML = `<span class="inline-block font-bold text-sm px-2.5 py-0.5 rounded-md bg-rose-500 text-white shadow-xs">${val}</span>`;
              }
            }
          }
        });
      });
      
      clone.querySelector("caption")?.remove();
      return clone.innerHTML;
    },
    rawParsedGradeItems: (original) => {
      const html = original?.querySelector("#ctl00_mainContent_divGrade");
      if (!html) return [];
      const table = html.querySelector("table");
      if (!table) return [];
      
      const items: ParsedGradeItem[] = [];
      const rows = Array.from(table.rows);
      let currentCat = "";

      rows.forEach((row, idx) => {
        if (idx === 0) return;
        const cells = Array.from(row.cells);
        if (cells.length === 0) return;

        let catCell: HTMLTableCellElement | null = null;
        let itemCell: HTMLTableCellElement | null = null;
        let weightCell: HTMLTableCellElement | null = null;
        let valueCell: HTMLTableCellElement | null = null;

        if (cells.length >= 5) {
          catCell = cells[0];
          itemCell = cells[1];
          weightCell = cells[2];
          valueCell = cells[3];
        } else if (cells.length === 4) {
          const firstText = cells[0]?.textContent?.trim() || "";
          if (/course total/i.test(firstText)) {
            catCell = cells[0];
            itemCell = cells[1];
            valueCell = cells[2];
          } else {
            itemCell = cells[0];
            weightCell = cells[1];
            valueCell = cells[2];
          }
        } else if (cells.length === 3) {
          catCell = cells[0];
          itemCell = cells[1];
          valueCell = cells[2];
        }

        if (catCell && catCell.textContent?.trim()) {
          currentCat = catCell.textContent.trim();
        }

        const itemName = itemCell?.textContent?.trim() || "";
        const weightText = weightCell?.textContent?.trim() || "";
        const scoreText = valueCell?.textContent?.trim() || "";
        
        const weightVal = parseFloat(weightText);
        const scoreVal = parseFloat(scoreText);

        const isCourseTotal = /course total/i.test(currentCat) || /course total/i.test(itemName);
        const isTotal = itemName.toLowerCase() === 'total' || isCourseTotal;

        if (itemName && scoreText) {
          items.push({
            category: currentCat,
            itemName,
            weight: !isNaN(weightVal) ? weightVal : 0,
            score: !isNaN(scoreVal) ? scoreVal : null,
            scoreText,
            isTotal,
            isCourseTotal,
          });
        }
      });
      return items;
    },
    overallScore: (original) => {
      const html = original?.querySelector("#ctl00_mainContent_divGrade");
      if (!html) return null;
      const fullText = html.textContent || "";
      const match = fullText.match(/course total[^\d]*(\d+(\.\d+)?)/i) || fullText.match(/average[^\d]*(\d+(\.\d+)?)/i);
      if (match) {
        const val = parseFloat(match[1]);
        return !isNaN(val) ? val : null;
      }
      return null;
    },
    resultText: (original) => {
      const html = original?.querySelector("#ctl00_mainContent_divGrade");
      if (!html) return "";
      const fullText = html.textContent || "";
      
      if (fullText.includes("Attendance Fail")) {
        return "Attendance Fail";
      } else if (fullText.includes("Not Passed")) {
        return "Not Passed";
      } else if (fullText.includes("Suspended")) {
        return "Is Suspended";
      } else if (fullText.includes("Passed")) {
        return "Passed";
      }
      
      return "";
    },
  });

  const gradeData: GradeData = {
    terms: terms || [],
    courses: courses || [],
    markTable: markTable || ""
  };

  const activeTerm = useMemo(() => {
    const term = gradeData.terms.find(term => term.active);
    return term ? `${term.season} ${term.year}` : intl.formatMessage({ id: 'COMMON.LOADING' });
  }, [gradeData.terms, intl]);

  const activeCourse = useMemo(() => {
    const course = gradeData.courses.find(course => course.active);
    return course ? `${course.name} (${course.code})` : intl.formatMessage({ id: 'GRADE.REPORT.SELECT_COURSE_MESSAGE' });
  }, [gradeData.courses, intl]);

  const parsedGradeItems = useMemo(() => {
    return filterResitGradeItems(rawParsedGradeItems || []);
  }, [rawParsedGradeItems]);

  // Donut chart components mapped directly to individual test items (Lab, Assignment, Progress Test 1/2/3, PE, TE)
  const gradeComponents = useMemo(() => {
    const items = parsedGradeItems.filter((item) => !item.isTotal && item.weight > 0);
    const colors = [
      '#2563EB', // Blue
      '#10B981', // Emerald
      '#F59E0B', // Amber
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#6366F1', // Indigo
      '#06B6D4', // Cyan
      '#14B8A6', // Teal
    ];

    return items.map((item, idx) => ({
      label: item.itemName,
      weight: item.weight,
      color: colors[idx % colors.length],
      score: item.score,
    }));
  }, [parsedGradeItems]);

  return {
    gradeData,
    activeTerm,
    activeCourse,
    gradeComponents,
    parsedGradeItems,
    overallScore,
    result: resultText
  };
};