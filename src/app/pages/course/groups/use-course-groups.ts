import { useFapDataCustom } from '@/app/providers/fap-data-provider';
import { GroupMember } from './types';

export const useCourseGroups = () => {
  return useFapDataCustom({
    groupName: (original) => {
      return original?.querySelector("#ctl00_mainContent_divGroup")?.querySelector('b')?.textContent?.trim() ?? '';
    },
    courseName: (original) => {
      return original?.querySelector("#ctl00_mainContent_divCourse")?.querySelector('b')?.textContent?.trim() ?? '';
    },
    members: (original) => {
      const table = original?.querySelector("#ctl00_mainContent_divStudents table") as HTMLTableElement;
      const members: GroupMember[] = [];
      
      if (table) {
        // Skip header row, start from index 1
        for (let i = 1; i < table.rows.length; i++) {
          const row = table.rows[i];
          
          if (row.cells.length >= 6) {
            const rollNumber = row.cells[2].textContent?.trim() ?? '';
            const surname = row.cells[3].textContent?.trim() ?? '';
            const middleName = row.cells[4].textContent?.trim() ?? '';
            const givenName = row.cells[5].textContent?.trim() ?? '';
            const fullName = `${surname} ${middleName} ${givenName}`.trim();
            
            // Check if there is an img tag in row cells or build standard FAP student avatar URL
            const img = row.querySelector('img');
            const avatarUrl = img?.src ? img.src : (rollNumber ? `https://fap.fpt.edu.vn/user/image.aspx?id=${rollNumber}` : undefined);

            members.push({
              id: i,
              rollNumber,
              surname,
              middleName,
              givenName,
              fullName,
              avatarUrl
            });
          }
        }
      }
      
      return members;
    },
    currentRollNumber: (original) => {
      // Extract the roll number from the login text
      const loginText = original?.querySelector("#ctl00_lblLogIn")?.textContent ?? '';
      // The pattern is usually "You are logged in as: YourName(RollNumber)"
      const match = loginText.match(/\(([^)]+)\)/);
      return match ? match[1].toLowerCase() : '';
    }
  });
}; 