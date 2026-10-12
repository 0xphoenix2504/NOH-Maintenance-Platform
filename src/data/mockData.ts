import type { Asset, MaintenanceTicket, SparePartInventoryItem, PreventiveScheduleItem, AuditLog, UserProfile, UserAccount } from '../types';

// ==================== CLEAN INITIAL DATA (PRODUCTION READY) ====================

// Assets Start Clean and Empty
export const INITIAL_ASSETS: Asset[] = [];

// Tickets Start Clean and Empty
export const INITIAL_TICKETS: MaintenanceTicket[] = [];

// Spare Parts Start Clean and Empty
export const INITIAL_SPARE_PARTS: SparePartInventoryItem[] = [];

// Preventive Schedules Start Clean and Empty
export const INITIAL_PREVENTIVE_SCHEDULES: PreventiveScheduleItem[] = [];

// Audit Logs Start Clean and Empty
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

// System Accounts (Master Admin, Technicians, Users)
export const INITIAL_ACCOUNTS: UserAccount[] = [
  {
    id: 'acc-admin-master',
    name: 'ENG Abdelrahman Yasser',
    username: 'admin',
    email: 'abdelrahman@nileofhope.org',
    password: 'admin',
    role: 'admin',
    status: 'active',
    department: 'قسم تكنولوجيا المعلومات IT',
    jobTitle: 'مدير تكنولوجيا المعلومات والنظم',
    permissions: [
      'dashboard',
      'tickets',
      'assets',
      'inventory',
      'preventive',
      'analytics',
      'logs',
      'user_management',
      'reports_export'
    ],
    createdAt: '2026-09-01T08:00:00',
    lastLogin: new Date().toISOString()
  },
  {
    id: 'acc-admin-secondary',
    name: 'ENG Abdelrahman',
    username: 'abdelrahman',
    email: 'a.yasser@nileofhope.org',
    password: '123',
    role: 'admin',
    status: 'active',
    department: 'قسم تكنولوجيا المعلومات IT',
    jobTitle: 'مهندس صيانة ودعم فني IT',
    permissions: [
      'dashboard',
      'tickets',
      'assets',
      'inventory',
      'preventive',
      'analytics',
      'logs',
      'user_management',
      'reports_export'
    ],
    createdAt: '2026-09-01T08:00:00',
    lastLogin: new Date().toISOString()
  },
  {
    id: 'acc-tech-01',
    name: 'ENG Mohamed Tarek',
    username: 'mohamed',
    email: 'm.tarek@noh.local',
    password: 'Tech@Demo2026',
    role: 'technician',
    status: 'active',
    department: 'قسم تكنولوجيا المعلومات IT',
    jobTitle: 'مهندس شبكات وبنية تحتية',
    permissions: ['dashboard', 'tickets', 'assets', 'inventory', 'preventive', 'logs'],
    createdAt: '2026-08-05T09:00:00',
    lastLogin: '2026-09-15T11:00:00'
  },
  {
    id: 'acc-tech-02',
    name: 'ENG Hossam IT',
    username: 'hossam',
    email: 'hossam@noh.local',
    password: 'Tech@Demo2026',
    role: 'technician',
    status: 'active',
    department: 'قسم تكنولوجيا المعلومات IT',
    jobTitle: 'مهندس صيانة ودعم فني',
    permissions: ['dashboard', 'tickets', 'assets', 'logs'],
    createdAt: '2026-08-10T10:00:00'
  },
  {
    id: 'acc-pending-01',
    name: 'م. سارة أحمد',
    username: 'sara',
    email: 'sara.ahmed@noh.local',
    password: 'User@Demo2026',
    role: 'user',
    status: 'pending',
    department: 'شؤون الأجهزة والعهد',
    jobTitle: 'مسؤولة العهد وقواعد البيانات',
    permissions: [],
    createdAt: '2026-09-15T16:30:00',
    authSource: 'local'
  },
  {
    id: 'acc-enduser-01',
    name: 'أ. سامي يوسف (مستخدم نهائي)',
    username: 'enduser',
    email: 'sami.youssef@noh.local',
    password: 'User@Demo2026',
    role: 'end_user',
    status: 'active',
    department: 'قسم العمليات الجراحية',
    jobTitle: 'منسق إداري بالقسم',
    permissions: [],
    createdAt: '2026-09-18T10:00:00',
    authSource: 'local'
  }
];

export const INITIAL_USERS: UserProfile[] = INITIAL_ACCOUNTS.map(a => ({
  id: a.id,
  name: a.name,
  role: a.jobTitle,
  department: a.department,
  username: a.username,
  status: a.status,
  permissions: a.permissions
}));
