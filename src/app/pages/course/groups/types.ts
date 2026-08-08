export interface GroupMember {
  id: number;
  rollNumber: string;
  surname: string;
  middleName: string;
  givenName: string;
  fullName: string;
  avatarUrl?: string;
}

export interface GroupData {
  courseName: string;
  groupName: string;
  members: GroupMember[];
  currentRollNumber: string;
} 