export type MemberCategory = 'Full Member' | 'Communicant' | 'Catechumen' | 'Adherant' | 'Junior Member';
export type Gender = 'Male' | 'Female';
export type MaritalStatus = 'Single' | 'Married' | 'Widowed' | 'Divorced';
export type UserRole = 'Admin' | 'Leader' | 'Member';

export interface Member {
  id?: string;
  memberId: string; // KMC-XXXX
  fullName: string;
  gender: Gender;
  dateOfBirth: string;
  phoneNumber: string;
  email?: string;
  homeAddress: string;
  occupation: string;
  maritalStatus: MaritalStatus;
  baptismStatus: boolean;
  confirmationStatus: boolean;
  dateJoined: string;
  category: MemberCategory;
  groups: string[];
  classes: string[];
  emergencyContact: string;
  photoUrl?: string;
  createdAt: string;
}

export interface ChurchClass {
  id?: string;
  name: string;
  type: 'Traditional' | 'Ministry/Fellowship';
  leaderId?: string;
  description?: string;
}

export interface AttendanceRecord {
  id?: string;
  date: string;
  memberId: string;
  classId?: string;
  status: 'Present' | 'Absent';
  serviceType: 'Sunday Service' | 'Prayer Meeting' | 'Bible Study' | 'Class Meeting' | 'Special Service';
  recordedBy: string;
}

export interface WelfareRecord {
  id?: string;
  memberId: string;
  type: string;
  description: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Completed';
  amount?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  memberId?: string;
}

export interface DashboardStats {
  totalMembers: number;
  fullMembers: number;
  communicants: number;
  catechumen: number;
  adherants: number;
  juniorMembers: number;
  baptized: number;
  confirmed: number;
  attendanceRate: number;
  welfareTotal: number;
}
