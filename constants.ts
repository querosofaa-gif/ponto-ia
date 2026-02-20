
import { User, UserRole, ContractType, VacationRequest, VacationStatus, Holiday, Announcement, WorkSchedule, CompanyDocument } from './types';

export const DEFAULT_WORK_SCHEDULE: WorkSchedule = {
  entry: '08:00',
  breakStart: '12:00',
  breakEnd: '13:00',
  exit: '17:00',
  workDays: [1, 2, 3, 4, 5] // Seg a Sex
};

export const COMPANY_CONFIG = {
  name: 'Sofa e cia',
  defaultRadius: 500,
  standardWorkHours: 8,
  defaultSchedule: DEFAULT_WORK_SCHEDULE,
  masterKey: 'ADMIN2025', 
  defaultUserPassword: '123' 
};

// LOGIN: admin@sofaecia.com.br | SENHA: admin123
export const MOCK_ADMIN: User = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Administrador Sofa e cia',
  email: 'admin@sofaecia.com.br',
  password: 'admin123',
  role: UserRole.ADMIN,
  contractType: ContractType.CLT,
  baseSalary: 15000,
  department: 'Diretoria',
  admissionDate: '2020-01-01',
  birthDate: '1985-05-15',
  phone: '(11) 99999-8888',
  vacationBalance: 30,
  workSchedule: DEFAULT_WORK_SCHEDULE
};

export const MOCK_USERS: User[] = [
  {
    id: 'emp-1',
    name: 'Ana Silva',
    email: 'ana@sofaecia.com.br',
    password: '123',
    role: UserRole.EMPLOYEE,
    contractType: ContractType.CLT,
    baseSalary: 4500,
    department: 'Vendas',
    admissionDate: '2022-03-10',
    birthDate: `1992-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-05`, // Aniversariante do mês atual
    phone: '(11) 98888-7777',
    vacationBalance: 15,
    workSchedule: DEFAULT_WORK_SCHEDULE,
    allowedLocation: { lat: -23.5505, lng: -46.6333, radius: 1000 }
  }
];

export const MOCK_DOCUMENTS: CompanyDocument[] = [];
export const MOCK_ANNOUNCEMENTS: Announcement[] = [];
export const MOCK_VACATIONS: VacationRequest[] = [];
export const MOCK_HOLIDAYS: Holiday[] = [
  { id: 'h-1', name: 'Confraternização Universal', date: '2024-01-01', isRecurring: true },
];
