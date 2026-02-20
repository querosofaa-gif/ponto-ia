
export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export enum ContractType {
  CLT = 'CLT',
  PJ = 'PJ',
  HORISTA = 'HORISTA'
}

export enum VacationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface WorkSchedule {
  entry: string;
  breakStart: string;
  breakEnd: string;
  exit: string;
  workDays: number[]; // 0 (Dom) a 6 (Sáb)
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  cpf?: string;
  phone?: string;
  birthDate?: string; // Novo campo
  role: UserRole;
  contractType: ContractType;
  baseSalary: number;
  department: string;
  admissionDate: string;
  profilePic?: string;
  faceReference?: string; 
  workSchedule?: WorkSchedule;
  vacationBalance?: number;
  allowedLocation?: {
    lat: number;
    lng: number;
    radius: number;
  };
}

export interface TimeRecord {
  id: string;
  userId: string;
  timestamp: string;
  type: 'IN' | 'BREAK_START' | 'BREAK_END' | 'OUT';
  location: {
    lat: number;
    lng: number;
  };
  faceVerified: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  photoUrl?: string;
  isAdjustment?: boolean;
}

export interface PointAdjustmentRequest {
  id: string;
  userId: string;
  userName?: string;
  date: string;
  time: string;
  type: 'IN' | 'OUT' | 'BREAK_START' | 'BREAK_END';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface VacationRequest {
  id: string;
  userId: string;
  userName: string;
  department: string;
  startDate: string;
  endDate: string;
  status: VacationStatus;
  requestDate: string;
  comment?: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  isRecurring: boolean;
}

export interface CompanyDocument {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  status: 'Verificado' | 'Pendente';
  userId?: string;
  userName?: string;
  fileUrl?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'GERAL' | 'RH' | 'EVENTO';
  date: string;
  author: string;
}

export interface AuditEntry {
  id: string;
  adminId: string;
  adminName: string;
  timestamp: string;
  category: 'USER' | 'POINT' | 'VACATION' | 'HOLIDAY' | 'SYSTEM';
  action: string;
  targetId: string;
  targetName: string;
  details: string;
}

export interface Notification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
}
