export type TranscriptStatus = 'Passed' | 'Not passed' | 'Studying' | 'Not started' | 'Not included in GPA' | 'Attendance Fail' | 'Suspended' | 'Other';

export interface TranscriptCourse {
  term: string;
  semester: { session: string; year: string };
  subjectCode: string;
  subjectName: string;
  prerequisite: string;
  replacedSubject: string;
  credit: number;
  grade: number;
  grade4: number;
  status: TranscriptStatus;
}

export interface GPAGroup {
  term: string;
  semester: { session: string; year: string };
  gpa: number;
  gpa4: number;
  totalCredit: number;
  courses: TranscriptCourse[];
}

export interface TranscriptSummary {
  averageGPA: number;
  averageGPA4: number;
  totalCredit: number;
  gpaList: GPAGroup[];
} 