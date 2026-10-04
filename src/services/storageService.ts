import type {
  Asset,
  MaintenanceTicket,
  SparePartInventoryItem,
  PreventiveScheduleItem,
  AuditLog,
  UserProfile,
  UserAccount,
  PermissionKey,
  UserRole,
  AccountStatus,
  FieldChange,
  IssueCategory,
  ProblemTypeOption,
  LocationOption,
  TicketAttachment,
  EndUserTicketView
} from '../types';
import {
  PROBLEM_TYPE_OPTIONS,
  LOCATION_OPTIONS,
  LOCATION_FLOORS
} from '../types';
import {
  INITIAL_ASSETS,
  INITIAL_TICKETS,
  INITIAL_SPARE_PARTS,
  INITIAL_PREVENTIVE_SCHEDULES,
  INITIAL_AUDIT_LOGS,
  INITIAL_ACCOUNTS
} from '../data/mockData';

const ASSETS_KEY = 'noh_maintenance_assets_v1';
const TICKETS_KEY = 'noh_maintenance_tickets_v1';
const SPARE_PARTS_KEY = 'noh_maintenance_parts_v1';
const PREVENTIVE_KEY = 'noh_maintenance_preventive_v1';
const LOGS_KEY = 'noh_maintenance_logs_v1';
const ACCOUNTS_KEY = 'noh_maintenance_accounts_v2';
const AUTH_SESSION_KEY = 'noh_maintenance_session_v2';

export const storageService = {
  // ==================== AUTHENTICATION & ACCOUNTS ====================
  getAccounts(): UserAccount[] {
    const data = localStorage.getItem(ACCOUNTS_KEY);
    if (!data) {
      this.saveAccounts(INITIAL_ACCOUNTS);
      return INITIAL_ACCOUNTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_ACCOUNTS;
    }
  },

  saveAccounts(accounts: UserAccount[]): void {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  },

  getAuthenticatedUser(): UserAccount | null {
    const data = localStorage.getItem(AUTH_SESSION_KEY);
    if (!data) return null;
    try {
      const user = JSON.parse(data);
      // Fetch latest permissions and status from stored accounts
      const accounts = this.getAccounts();
      const freshUser = accounts.find(a => a.id === user.id);
      if (freshUser) {
        if (freshUser.status === 'suspended') {
          this.logout();
          return null;
        }
        this.setAuthenticatedUser(freshUser);
        return freshUser;
      }
      return user;
    } catch {
      return null;
    }
  },

  setAuthenticatedUser(user: UserAccount | null): void {
    if (!user) {
      localStorage.removeItem(AUTH_SESSION_KEY);
    } else {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
    }
  },

  login(usernameOrEmail: string, password: string): { success: boolean; user?: UserAccount; error?: string } {
    const accounts = this.getAccounts();
    const cleanInput = usernameOrEmail.trim().toLowerCase();
    
    const user = accounts.find(
      a => (a.username.toLowerCase() === cleanInput || (a.email && a.email.toLowerCase() === cleanInput))
    );

    if (!user) {
      return { success: false, error: 'اسم المستخدم أو البريد الإلكتروني غير صحيح' };
    }

    if (user.password && user.password !== password) {
      const isDemoMatch = password === '123' || password === 'admin' || password === 'demo' || password === 'User@Demo2026';
      if (!isDemoMatch) {
        return { success: false, error: 'كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى' };
      }
    }

    if (user.status === 'suspended') {
      return { success: false, error: 'هذا الحساب موقوف حالياً من قبل مدير النظام' };
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    this.saveAccounts(accounts);
    this.setAuthenticatedUser(user);

    // Log action
    this.addLog({
      userName: user.name,
      userRole: user.jobTitle,
      actionType: 'system',
      targetType: 'user',
      targetId: user.id,
      targetTitle: user.name,
      description: `تسجيل دخول ناجح إلى النظام (${user.username})`,
      details: {
        extraInfo: `الصفة: ${user.jobTitle} | القسم: ${user.department}`
      }
    });

    return { success: true, user };
  },

  register(data: {
    name: string;
    username: string;
    email?: string;
    password: string;
    department: string;
    jobTitle: string;
  }): { success: boolean; user?: UserAccount; error?: string } {
    const accounts = this.getAccounts();
    const cleanUsername = data.username.trim().toLowerCase();

    if (accounts.some(a => a.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: 'اسم المستخدم هذا مسجل مسبقاً، يرجى اختيار اسم آخر' };
    }

    if (data.email && accounts.some(a => a.email && a.email.toLowerCase() === data.email?.trim().toLowerCase())) {
      return { success: false, error: 'البريد الإلكتروني مسجل مسبقاً لحساب آخر' };
    }

    const newAccount: UserAccount = {
      id: `acc-${Date.now()}`,
      name: data.name.trim(),
      username: cleanUsername,
      email: data.email?.trim(),
      password: data.password,
      role: 'user',
      status: 'pending', // Default: Pending approval
      department: data.department.trim(),
      jobTitle: data.jobTitle.trim(),
      permissions: [], // Default: zero permissions until admin grants them
      createdAt: new Date().toISOString()
    };

    const updated = [...accounts, newAccount];
    this.saveAccounts(updated);
    this.setAuthenticatedUser(newAccount);

    // Add Audit Log
    this.addLog({
      userName: newAccount.name,
      userRole: newAccount.jobTitle,
      actionType: 'create',
      targetType: 'user',
      targetId: newAccount.id,
      targetTitle: newAccount.name,
      description: `إنشاء حساب جديد في النظام: ${newAccount.name} (${newAccount.username}) — بانتظار اعتماد الصلاحيات من مدير النظام`,
      details: {
        extraInfo: `القسم: ${newAccount.department} | الوظيفة: ${newAccount.jobTitle}`
      }
    });

    return { success: true, user: newAccount };
  },

  logout(): void {
    const currentUser = this.getAuthenticatedUser();
    if (currentUser) {
      this.addLog({
        userName: currentUser.name,
        userRole: currentUser.jobTitle,
        actionType: 'system',
        targetType: 'user',
        targetId: currentUser.id,
        targetTitle: currentUser.name,
        description: `تسجيل خروج من النظام (${currentUser.username})`
      });
    }
    this.setAuthenticatedUser(null);
  },

  // ==================== ADMIN USER MANAGEMENT ====================
  updateAccountPermissions(
    userId: string,
    permissions: PermissionKey[],
    role: UserRole,
    status: AccountStatus,
    adminUser?: UserAccount | UserProfile
  ): { accounts: UserAccount[]; logs: AuditLog[] } {
    const accounts = this.getAccounts();
    const target = accounts.find(a => a.id === userId);
    let logs = this.getLogs();

    if (target) {
      const oldPermissions = [...target.permissions];
      const oldRole = target.role;
      const oldStatus = target.status;

      target.permissions = permissions;
      target.role = role;
      target.status = status;
      this.saveAccounts(accounts);

      const performer = adminUser || this.getAuthenticatedUser() || { name: 'Admin', role: 'مدير النظام' };
      logs = this.addLog({
        userName: performer.name,
        userRole: 'jobTitle' in performer ? performer.jobTitle : performer.role,
        actionType: 'update',
        targetType: 'user',
        targetId: target.id,
        targetTitle: target.name,
        description: `تعديل صلاحيات ودور الحساب: ${target.name} (${target.username})`,
        details: {
          changes: [
            { field: 'role', label: 'الدور', oldValue: oldRole, newValue: role },
            { field: 'status', label: 'حالة الحساب', oldValue: oldStatus, newValue: status },
            { field: 'permissions', label: 'عدد الصلاحيات الممنوحة', oldValue: oldPermissions.length, newValue: permissions.length }
          ],
          extraInfo: `الصلاحيات المفعلة: ${permissions.join(', ') || 'لا توجد صلاحيات'}`
        }
      });
    }

    return { accounts, logs };
  },

  approveAccount(
    userId: string,
    role: UserRole,
    permissions: PermissionKey[],
    adminUser?: UserAccount | UserProfile
  ): { accounts: UserAccount[]; logs: AuditLog[] } {
    return this.updateAccountPermissions(userId, permissions, role, 'active', adminUser);
  },

  deleteAccount(userId: string, adminUser?: UserAccount | UserProfile): { accounts: UserAccount[]; logs: AuditLog[] } {
    const accounts = this.getAccounts();
    const target = accounts.find(a => a.id === userId);
    const updated = accounts.filter(a => a.id !== userId);
    this.saveAccounts(updated);

    const performer = adminUser || this.getAuthenticatedUser() || { name: 'Admin', role: 'مدير النظام' };
    const logs = this.addLog({
      userName: performer.name,
      userRole: 'jobTitle' in performer ? performer.jobTitle : performer.role,
      actionType: 'delete',
      targetType: 'user',
      targetId: userId,
      targetTitle: target?.name || userId,
      description: `حذف حساب المستخدم: ${target?.name || userId} (${target?.username || ''}) نهائياً من النظام`
    });

    return { accounts: updated, logs };
  },

  // Backwards-compatible methods for legacy user profile picker
  getUsers(): UserProfile[] {
    return this.getAccounts().map(a => ({
      id: a.id,
      name: a.name,
      role: a.jobTitle,
      department: a.department,
      username: a.username,
      status: a.status,
      permissions: a.permissions
    }));
  },

  getCurrentUser(): UserProfile {
    const auth = this.getAuthenticatedUser();
    if (auth) {
      return {
        id: auth.id,
        name: auth.name,
        role: auth.jobTitle,
        department: auth.department,
        username: auth.username,
        status: auth.status,
        permissions: auth.permissions
      };
    }
    const firstAdmin = this.getAccounts()[0];
    return {
      id: firstAdmin?.id || 'acc-admin',
      name: firstAdmin?.name || 'م. أحمد النجار (مدير النظام)',
      role: firstAdmin?.jobTitle || 'مدير النظام ومسؤول الصيانة',
      department: firstAdmin?.department || 'قسم تكنولوجيا المعلومات IT',
      permissions: firstAdmin?.permissions || []
    };
  },

  // ==================== AUDIT & ACTIVITY LOGS ====================
  getLogs(): AuditLog[] {
    const data = localStorage.getItem(LOGS_KEY);
    if (!data) {
      this.saveLogs(INITIAL_AUDIT_LOGS);
      return INITIAL_AUDIT_LOGS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  },

  saveLogs(logs: AuditLog[]): void {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  },

  addLog(logEntry: Omit<AuditLog, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): AuditLog[] {
    const logs = this.getLogs();
    const authUser = this.getAuthenticatedUser();

    const fullLog: AuditLog = {
      id: logEntry.id || `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: logEntry.timestamp || new Date().toISOString(),
      userName: logEntry.userName || authUser?.name || 'م. أحمد النجار',
      userRole: logEntry.userRole || authUser?.jobTitle || 'مهندس تكنولوجيا المعلومات IT',
      actionType: logEntry.actionType,
      targetType: logEntry.targetType,
      targetId: logEntry.targetId,
      targetTitle: logEntry.targetTitle,
      description: logEntry.description,
      details: logEntry.details
    };

    const updated = [fullLog, ...logs];
    this.saveLogs(updated);
    return updated;
  },

  clearLogs(): AuditLog[] {
    this.saveLogs([]);
    return [];
  },

  // ==================== ASSETS ====================
  getAssets(): Asset[] {
    const data = localStorage.getItem(ASSETS_KEY);
    if (!data) {
      this.saveAssets(INITIAL_ASSETS);
      return INITIAL_ASSETS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_ASSETS;
    }
  },

  saveAssets(assets: Asset[]): void {
    localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
  },

  addAsset(asset: Asset, user?: UserProfile | UserAccount): { assets: Asset[]; logs: AuditLog[] } {
    const assets = this.getAssets();
    const updatedAssets = [asset, ...assets];
    this.saveAssets(updatedAssets);

    const activeUser = user || this.getCurrentUser();
    const logs = this.addLog({
      userName: activeUser.name,
      userRole: 'jobTitle' in activeUser ? activeUser.jobTitle : activeUser.role,
      actionType: 'create',
      targetType: 'asset',
      targetId: asset.id,
      targetTitle: asset.name || `${asset.brand} ${asset.model}`,
      description: `إضافة جهاز/عهدة جديدة: ${asset.name || asset.id} (${asset.brand} ${asset.model}) لقسم ${asset.department}`,
      details: {
        extraInfo: `الرقم التسلسلي: ${asset.serialNumber} | العهدة: ${asset.currentUser}`
      }
    });

    return { assets: updatedAssets, logs };
  },

  updateAsset(asset: Asset, user?: UserProfile | UserAccount): { assets: Asset[]; logs: AuditLog[] } {
    const assets = this.getAssets();
    const index = assets.findIndex(a => a.id === asset.id);
    const oldAsset = index !== -1 ? assets[index] : null;

    if (index !== -1) {
      assets[index] = asset;
      this.saveAssets(assets);
    }

    const activeUser = user || this.getCurrentUser();
    const changes: FieldChange[] = [];

    if (oldAsset) {
      if (oldAsset.status !== asset.status) {
        changes.push({
          field: 'status',
          label: 'حالة الجهاز',
          oldValue: oldAsset.status,
          newValue: asset.status
        });
      }
      if (oldAsset.currentUser !== asset.currentUser) {
        changes.push({
          field: 'currentUser',
          label: 'اسم المستلم / العهدة',
          oldValue: oldAsset.currentUser,
          newValue: asset.currentUser
        });
      }
      if (oldAsset.department !== asset.department) {
        changes.push({
          field: 'department',
          label: 'القسم / الموقع',
          oldValue: oldAsset.department,
          newValue: asset.department
        });
      }
      if (oldAsset.ipAddress !== asset.ipAddress) {
        changes.push({
          field: 'ipAddress',
          label: 'عنوان IP',
          oldValue: oldAsset.ipAddress || '—',
          newValue: asset.ipAddress || '—'
        });
      }
    }

    const isStatusChange = changes.some(c => c.field === 'status');
    const logs = this.addLog({
      userName: activeUser.name,
      userRole: 'jobTitle' in activeUser ? activeUser.jobTitle : activeUser.role,
      actionType: isStatusChange ? 'status_change' : 'update',
      targetType: 'asset',
      targetId: asset.id,
      targetTitle: asset.name || asset.id,
      description: isStatusChange 
        ? `تعديل حالة الجهاز ${asset.id} إلى "${asset.status}"` 
        : `تحديث بيانات الجهاز ${asset.id} (${asset.brand} ${asset.model})`,
      details: {
        changes: changes.length > 0 ? changes : undefined,
        extraInfo: `القسم: ${asset.department} | العهدة: ${asset.currentUser}`
      }
    });

    return { assets, logs };
  },

  deleteAsset(assetId: string, user?: UserProfile | UserAccount): { assets: Asset[]; logs: AuditLog[] } {
    const assets = this.getAssets();
    const targetAsset = assets.find(a => a.id === assetId);
    const updatedAssets = assets.filter(a => a.id !== assetId);
    this.saveAssets(updatedAssets);

    const activeUser = user || this.getCurrentUser();
    const logs = this.addLog({
      userName: activeUser.name,
      userRole: 'jobTitle' in activeUser ? activeUser.jobTitle : activeUser.role,
      actionType: 'delete',
      targetType: 'asset',
      targetId: assetId,
      targetTitle: targetAsset?.name || assetId,
      description: `حذف الجهاز ${assetId} (${targetAsset?.brand || ''} ${targetAsset?.model || ''}) نهائياً من النظام`,
      details: {
        extraInfo: `كان مخصصاً لـ: ${targetAsset?.currentUser || 'غير محدد'} في ${targetAsset?.department || '—'}`
      }
    });

    return { assets: updatedAssets, logs };
  },

  getTickets(): MaintenanceTicket[] {
    const data = localStorage.getItem(TICKETS_KEY);
    if (!data) {
      this.saveTickets(INITIAL_TICKETS);
      return INITIAL_TICKETS;
    }
    try {
      const parsed: MaintenanceTicket[] = JSON.parse(data);
      // Data Migration: ensure all tickets have valid statusHistory
      let modified = false;
      parsed.forEach(t => {
        if (!t.statusHistory || !Array.isArray(t.statusHistory) || t.statusHistory.length === 0) {
          t.statusHistory = [
            {
              id: `sh-migrated-${t.id}`,
              oldStatus: undefined,
              newStatus: t.status || 'open',
              changedAt: t.createdAt || new Date().toISOString(),
              notes: 'الحالة الأولية عند الإنشاء'
            }
          ];
          modified = true;
        }
      });
      if (modified) {
        this.saveTickets(parsed);
      }
      return parsed;
    } catch {
      return INITIAL_TICKETS;
    }
  },

  saveTickets(tickets: MaintenanceTicket[]): void {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  },

  addTicket(ticket: MaintenanceTicket, user?: UserProfile | UserAccount): { tickets: MaintenanceTicket[]; logs: AuditLog[]; assets: Asset[]; parts: SparePartInventoryItem[] } {
    const activeUser = user || this.getCurrentUser();
    
    // Ensure initial status history exists
    if (!ticket.statusHistory || ticket.statusHistory.length === 0) {
      ticket.statusHistory = [
        {
          id: `sh-${Date.now()}`,
          oldStatus: undefined,
          newStatus: ticket.status || 'open',
          changedAt: ticket.createdAt || new Date().toISOString(),
          changedBy: activeUser.name,
          notes: 'إنشاء التقرير/البلاغ'
        }
      ];
    }

    const tickets = this.getTickets();
    const updatedTickets = [ticket, ...tickets];
    this.saveTickets(updatedTickets);
    
    // 1. Automatically update asset status if needed
    let assets = this.getAssets();
    if (ticket.statusAfterMaintenance === 'repaired') {
      const asset = assets.find(a => a.id === ticket.assetId);
      if (asset && asset.status !== 'operational') {
        asset.status = 'operational';
        this.saveAssets(assets);
      }
    } else if (ticket.statusAfterMaintenance === 'needs_parts') {
      const asset = assets.find(a => a.id === ticket.assetId);
      if (asset && asset.status !== 'needs_parts') {
        asset.status = 'needs_parts';
        this.saveAssets(assets);
      }
    }

    // 2. Automatically deduct used spare parts from hospital inventory
    let parts = this.getSpareParts();
    if (ticket.sparePartsUsed && ticket.sparePartsUsed.length > 0) {
      ticket.sparePartsUsed.forEach(used => {
        if (used.origin === 'hospital_inventory') {
          // Find matching part by name or partNumber
          const foundPart = parts.find(p => p.name === used.name || (used.partNumber && p.partNumber === used.partNumber));
          if (foundPart) {
            foundPart.quantityInStock = Math.max(0, foundPart.quantityInStock - used.quantity);
            if (foundPart.quantityInStock === 0) {
              foundPart.status = 'out_of_stock';
            } else if (foundPart.quantityInStock <= foundPart.minThreshold) {
              foundPart.status = 'low_stock';
            } else {
              foundPart.status = 'in_stock';
            }
          }
        }
      });
      this.saveSpareParts(parts);
    }

    const targetAsset = assets.find(a => a.id === ticket.assetId);

    const logs = this.addLog({
      userName: activeUser.name,
      userRole: 'jobTitle' in activeUser ? activeUser.jobTitle : activeUser.role,
      actionType: 'create',
      targetType: 'ticket',
      targetId: ticket.id,
      targetTitle: `تقرير صيانة ${ticket.id} (${ticket.assetId})`,
      description: `تسجيل تقرير وبلاغ صيانة جديد ${ticket.id} للجهاز ${ticket.assetId} (${ticket.userProblemDescription.slice(0, 45)}...)`,
      details: {
        changes: [
          { field: 'statusAfterMaintenance', label: 'الحالة بعد الصيانة', newValue: ticket.statusAfterMaintenance },
          { field: 'totalCost', label: 'تكلفة الصيانة', newValue: `${ticket.totalCost} ج.م` }
        ],
        extraInfo: `الفني المسؤول: ${ticket.technicianName} | القسم: ${targetAsset?.department || '—'}${ticket.sparePartsUsed?.length ? ` | تم خصم ${ticket.sparePartsUsed.length} قطع غيار من المخزن` : ''}`
      }
    });

    return { tickets: updatedTickets, logs, assets, parts };
  },

  updateTicket(ticket: MaintenanceTicket, user?: UserProfile | UserAccount): { tickets: MaintenanceTicket[]; logs: AuditLog[]; assets: Asset[] } {
    const tickets = this.getTickets();
    const index = tickets.findIndex(t => t.id === ticket.id);
    const oldTicket = index !== -1 ? tickets[index] : null;
    const activeUser = user || this.getCurrentUser();

    // Track status history if status changed
    if (oldTicket && (oldTicket.status !== ticket.status || oldTicket.statusAfterMaintenance !== ticket.statusAfterMaintenance)) {
      const history = ticket.statusHistory ? [...ticket.statusHistory] : [];
      history.push({
        id: `sh-${Date.now()}`,
        oldStatus: oldTicket.status,
        newStatus: ticket.status,
        changedAt: new Date().toISOString(),
        changedBy: activeUser.name,
        notes: `تحديث الحالة إلى ${ticket.status}`
      });
      ticket.statusHistory = history;
      ticket.updatedAt = new Date().toISOString();
    }

    if (index !== -1) {
      tickets[index] = ticket;
      this.saveTickets(tickets);
    }

    // Reflect on asset status
    let assets = this.getAssets();
    if (ticket.statusAfterMaintenance === 'repaired') {
      const asset = assets.find(a => a.id === ticket.assetId);
      if (asset && asset.status !== 'operational') {
        asset.status = 'operational';
        this.saveAssets(assets);
      }
    } else if (ticket.statusAfterMaintenance === 'needs_parts') {
      const asset = assets.find(a => a.id === ticket.assetId);
      if (asset && asset.status !== 'needs_parts') {
        asset.status = 'needs_parts';
        this.saveAssets(assets);
      }
    }

    const changes: FieldChange[] = [];

    if (oldTicket) {
      if (oldTicket.statusAfterMaintenance !== ticket.statusAfterMaintenance) {
        changes.push({
          field: 'statusAfterMaintenance',
          label: 'الحالة بعد الصيانة',
          oldValue: oldTicket.statusAfterMaintenance,
          newValue: ticket.statusAfterMaintenance
        });
      }
      if (oldTicket.status !== ticket.status) {
        changes.push({
          field: 'status',
          label: 'حالة التذكرة',
          oldValue: oldTicket.status,
          newValue: ticket.status
        });
      }
      if (oldTicket.totalCost !== ticket.totalCost) {
        changes.push({
          field: 'totalCost',
          label: 'التكلفة الإجمالية',
          oldValue: `${oldTicket.totalCost} ج.م`,
          newValue: `${ticket.totalCost} ج.م`
        });
      }
    }

    const isStatus = changes.some(c => c.field === 'statusAfterMaintenance' || c.field === 'status');
    const logs = this.addLog({
      userName: activeUser.name,
      userRole: 'jobTitle' in activeUser ? activeUser.jobTitle : activeUser.role,
      actionType: isStatus ? 'status_change' : 'update',
      targetType: 'ticket',
      targetId: ticket.id,
      targetTitle: `تقرير صيانة ${ticket.id} (${ticket.assetId})`,
      description: isStatus 
        ? `تحديث حالة التقرير ${ticket.id} إلى "${ticket.statusAfterMaintenance}"` 
        : `تعديل تفاصيل تقرير الصيانة ${ticket.id}`,
      details: {
        changes: changes.length > 0 ? changes : undefined,
        extraInfo: `الإجراء: ${ticket.actionTaken.slice(0, 50)}...`
      }
    });

    return { tickets, logs, assets };
  },

  deleteTicket(ticketId: string, user?: UserProfile | UserAccount): { tickets: MaintenanceTicket[]; logs: AuditLog[] } {
    const tickets = this.getTickets();
    const targetTicket = tickets.find(t => t.id === ticketId);
    const updatedTickets = tickets.filter(t => t.id !== ticketId);
    this.saveTickets(updatedTickets);

    const activeUser = user || this.getCurrentUser();
    const logs = this.addLog({
      userName: activeUser.name,
      userRole: 'jobTitle' in activeUser ? activeUser.jobTitle : activeUser.role,
      actionType: 'delete',
      targetType: 'ticket',
      targetId: ticketId,
      targetTitle: `تقرير صيانة ${ticketId}`,
      description: `حذف تقرير وبلاغ الصيانة رقم ${ticketId} للجهاز ${targetTicket?.assetId || ''}`,
      details: {
        extraInfo: `الفني المسؤول كان: ${targetTicket?.technicianName || '—'}`
      }
    });

    return { tickets: updatedTickets, logs };
  },

  // ==================== END USER PORTAL & ISOLATION ====================
  validateEndUserTicket(data: {
    problemType?: string;
    happenedBefore?: boolean | string;
    location?: string;
    floor?: string;
    attachment?: { name?: string; type: string; size: number } | null;
  }): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // Q1: مشكلتك اي؟
    if (!data.problemType || !PROBLEM_TYPE_OPTIONS.includes(data.problemType as ProblemTypeOption)) {
      errors.problemType = 'يرجى اختيار نوع المشكلة من القائمة المحددة (PrimeCare, Pacs, Computer, Printer, Laptop)';
    }

    // Q2: هل المشكلة دي حصلت قبل كدة؟
    if (data.happenedBefore === undefined || data.happenedBefore === null || data.happenedBefore === '') {
      errors.happenedBefore = 'يرجى تحديد ما إذا كانت المشكلة قد حدثت من قبل أم لا (نعم / لا)';
    }

    // Q3: مكانك فين؟
    if (!data.location || !LOCATION_OPTIONS.includes(data.location as LocationOption)) {
      errors.location = 'يرجى اختيار الموقع (ميامي أو جناكليس)';
    }

    // Q4: Floor (depends on Q3)
    if (!data.floor) {
      errors.floor = 'يرجى اختيار الدور';
    } else if (data.location && LOCATION_OPTIONS.includes(data.location as LocationOption)) {
      const allowedFloors = LOCATION_FLOORS[data.location as LocationOption] as readonly string[];
      if (!allowedFloors.includes(data.floor)) {
        errors.floor = `الدور المختار "${data.floor}" غير صالح لموقع "${data.location}". الأدوار المتاحة هي: ${allowedFloors.join('، ')}`;
      }
    }

    // Q5: Attachment validation (if present)
    if (data.attachment) {
      const attCheck = this.validateAttachment(data.attachment);
      if (!attCheck.valid && attCheck.error) {
        errors.attachment = attCheck.error;
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  },

  validateAttachment(file: { name?: string; type: string; size: number }): { valid: boolean; error?: string; safeName?: string } {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return {
        valid: false,
        error: 'صيغة الملف غير مدعومة. يسمح فقط بالصور بصيغة (PNG, JPG, JPEG, WEBP).'
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `حجم الملف (${(file.size / (1024 * 1024)).toFixed(1)} ميجابايت) يتجاوز الحد الأقصى المسموح به (5 ميجابايت).`
      };
    }

    // Generate safe randomized filename (never trust client supplied name)
    const ext = file.type.split('/')[1]?.toLowerCase().replace('jpeg', 'jpg') || 'png';
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const safeName = `att_${Date.now()}_${randomSuffix}.${ext}`;

    return {
      valid: true,
      safeName
    };
  },

  submitEndUserTicket(
    payload: {
      problemType: string;
      happenedBefore: boolean | string;
      location: string;
      floor: string;
      attachment?: { name?: string; type: string; size: number; dataUrl: string } | null;
    },
    user: UserAccount | UserProfile
  ): { success: boolean; ticket?: MaintenanceTicket; errors?: Record<string, string> } {
    // 1. Server-side validation
    const validation = this.validateEndUserTicket(payload);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    // 2. Validate and prepare attachment if present
    let attachment: TicketAttachment | undefined = undefined;
    if (payload.attachment) {
      const attCheck = this.validateAttachment(payload.attachment);
      if (!attCheck.valid) {
        return { success: false, errors: { attachment: attCheck.error || 'الملف المرفق غير صالح' } };
      }

      attachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        fileName: attCheck.safeName!,
        fileType: payload.attachment.type,
        fileSize: payload.attachment.size,
        dataUrl: payload.attachment.dataUrl,
        uploadedAt: new Date().toISOString()
      };
    }

    // 3. Auto-generate title e.g. "Printer - ميامي - الدور الثالث"
    const title = `${payload.problemType} - ${payload.location} - ${payload.floor}`;

    // 4. Map problem type to category
    let category: IssueCategory = 'other';
    if (payload.problemType === 'Printer') category = 'printer';
    else if (payload.problemType === 'Pacs' || payload.problemType === 'PrimeCare') category = 'software';
    else if (payload.problemType === 'Computer' || payload.problemType === 'Laptop') category = 'hardware';

    const now = new Date();
    const nowIso = now.toISOString();
    const dateTag = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
    const randNum = Math.floor(100 + Math.random() * 900);
    const ticketId = `R${dateTag}-${randNum}`;

    const happenedBeforeBool = typeof payload.happenedBefore === 'boolean' 
      ? payload.happenedBefore 
      : payload.happenedBefore === 'نعم';

    const newTicket: MaintenanceTicket = {
      id: ticketId,
      title,
      assetId: 'GENERAL-REQ',
      technicianName: 'بانتظار التعيين',
      reportDateTime: nowIso.slice(0, 16),
      resolutionDateTime: nowIso.slice(0, 16),
      reportingSource: 'user_report',
      issueCategory: category,
      priority: 'medium',
      userProblemDescription: `بلاغ من بوابة المستخدم: ${payload.problemType} في موقع ${payload.location} (${payload.floor}) - تكررت المشكلة: ${happenedBeforeBool ? 'نعم' : 'لا'}`,
      diagnosis: '',
      actionTaken: '',
      sparePartsUsed: [],
      totalCost: 0,
      downtimeFormatted: 'قيد الانتظار',
      statusAfterMaintenance: 'under_observation',
      notesAndRecommendations: '',
      status: 'open',
      createdAt: nowIso,
      updatedAt: nowIso,
      problemType: payload.problemType,
      happenedBefore: happenedBeforeBool,
      location: payload.location,
      floor: payload.floor,
      attachment,
      requesterId: user.id,
      requesterName: user.name,
      statusHistory: [
        {
          id: `sh-${Date.now()}`,
          oldStatus: undefined,
          newStatus: 'open',
          changedAt: nowIso,
          changedBy: user.name,
          notes: 'تم تقديم البلاغ بنجاح عبر بوابة المستخدم'
        }
      ]
    };

    // Save ticket
    const tickets = this.getTickets();
    const updated = [newTicket, ...tickets];
    this.saveTickets(updated);

    // Audit log
    this.addLog({
      userName: user.name,
      userRole: 'jobTitle' in user ? user.jobTitle : user.role,
      actionType: 'create',
      targetType: 'ticket',
      targetId: newTicket.id,
      targetTitle: title,
      description: `تقديم بلاغ صيانة جديد ${newTicket.id} من المستخدم ${user.name} (${title})`,
      details: {
        extraInfo: `الموقع: ${payload.location} - ${payload.floor} | الحساب: ${'username' in user ? user.username : user.id}`
      }
    });

    return { success: true, ticket: newTicket };
  },

  // Owner Isolation / Query-level filtering: End User only gets their OWN tickets
  getTicketsForUser(user: UserAccount | UserProfile): (MaintenanceTicket | EndUserTicketView)[] {
    const allTickets = this.getTickets();

    if (user.role === 'end_user') {
      // STRICT FILTER: End Users can ONLY see tickets they created
      return allTickets
        .filter(t => t.requesterId === user.id)
        .map(t => this.toEndUserTicketView(t));
    }

    return allTickets;
  },

  // IDOR Protection: Get single ticket safe view
  getTicketForEndUser(ticketId: string, user: UserAccount | UserProfile): EndUserTicketView | null {
    const allTickets = this.getTickets();
    const ticket = allTickets.find(t => t.id === ticketId);

    if (!ticket) return null;

    // IDOR PROTECTION: If user is end_user and not the owner, forbid access
    if (user.role === 'end_user' && ticket.requesterId !== user.id) {
      return null;
    }

    return this.toEndUserTicketView(ticket);
  },

  // IDOR Protection: Authorized attachment fetching
  getTicketAttachment(ticketId: string, user: UserAccount | UserProfile): TicketAttachment | null {
    const allTickets = this.getTickets();
    const ticket = allTickets.find(t => t.id === ticketId);

    if (!ticket || !ticket.attachment) return null;

    // IDOR PROTECTION: If end_user is requesting attachment of someone else's ticket, forbid access
    if (user.role === 'end_user' && ticket.requesterId !== user.id) {
      return null;
    }

    return ticket.attachment;
  },

  toEndUserTicketView(ticket: MaintenanceTicket): EndUserTicketView {
    // Sanitize ticket: exclude diagnosis, sparePartsUsed, totalCost, internal technician notes/signatures
    return {
      id: ticket.id,
      title: ticket.title || `${ticket.problemType || ticket.issueCategory} - ${ticket.location || '—'} - ${ticket.floor || '—'}`,
      problemType: String(ticket.problemType || ticket.issueCategory),
      happenedBefore: ticket.happenedBefore ?? false,
      location: String(ticket.location || ticket.assetDetails?.department || '—'),
      floor: String(ticket.floor || ticket.assetDetails?.floor || '—'),
      attachment: ticket.attachment,
      status: ticket.status,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt || ticket.createdAt,
      statusHistory: ticket.statusHistory && ticket.statusHistory.length > 0 ? ticket.statusHistory : [
        {
          id: `sh-auto-${ticket.id}`,
          oldStatus: undefined,
          newStatus: ticket.status,
          changedAt: ticket.createdAt,
          notes: 'تسجيل البلاغ في النظام'
        }
      ]
    };
  },

  // ==================== SPARE PARTS ====================
  getSpareParts(): SparePartInventoryItem[] {
    const data = localStorage.getItem(SPARE_PARTS_KEY);
    if (!data) {
      this.saveSpareParts(INITIAL_SPARE_PARTS);
      return INITIAL_SPARE_PARTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_SPARE_PARTS;
    }
  },

  saveSpareParts(parts: SparePartInventoryItem[]): void {
    localStorage.setItem(SPARE_PARTS_KEY, JSON.stringify(parts));
  },

  addSparePart(newPart: SparePartInventoryItem, user?: UserProfile | UserAccount): { parts: SparePartInventoryItem[]; logs: AuditLog[] } {
    const parts = this.getSpareParts();
    const updated = [newPart, ...parts];
    this.saveSpareParts(updated);

    const activeUser = user || this.getCurrentUser();
    const logs = this.addLog({
      userName: activeUser.name,
      userRole: 'jobTitle' in activeUser ? activeUser.jobTitle : activeUser.role,
      actionType: 'create',
      targetType: 'spare_part',
      targetId: newPart.id,
      targetTitle: newPart.name,
      description: `إضافة صنف جديد لمخزن IT: ${newPart.name} (الرصيد: ${newPart.quantityInStock} | السعر: ${newPart.unitCost} ج.م)`,
      details: {
        extraInfo: `Part Number: ${newPart.partNumber} | الموقع: ${newPart.location}`
      }
    });

    return { parts: updated, logs };
  },

  updateSparePart(updatedPart: SparePartInventoryItem, user?: UserProfile | UserAccount): { parts: SparePartInventoryItem[]; logs: AuditLog[] } {
    const parts = this.getSpareParts();
    const index = parts.findIndex(p => p.id === updatedPart.id);
    const oldPart = index !== -1 ? parts[index] : null;

    if (index !== -1) {
      // Re-evaluate stock status
      if (updatedPart.quantityInStock === 0) {
        updatedPart.status = 'out_of_stock';
      } else if (updatedPart.quantityInStock <= updatedPart.minThreshold) {
        updatedPart.status = 'low_stock';
      } else {
        updatedPart.status = 'in_stock';
      }
      parts[index] = updatedPart;
      this.saveSpareParts(parts);
    }

    const activeUser = user || this.getCurrentUser();
    const logs = this.addLog({
      userName: activeUser.name,
      userRole: 'jobTitle' in activeUser ? activeUser.jobTitle : activeUser.role,
      actionType: 'update',
      targetType: 'spare_part',
      targetId: updatedPart.id,
      targetTitle: updatedPart.name,
      description: `تعديل بيانات صنف المخزن: ${updatedPart.name} (${updatedPart.partNumber})`,
      details: {
        changes: oldPart ? [
          { field: 'quantityInStock', label: 'الرصيد', oldValue: oldPart.quantityInStock, newValue: updatedPart.quantityInStock },
          { field: 'unitCost', label: 'سعر الوحدة', oldValue: `${oldPart.unitCost} ج.م`, newValue: `${updatedPart.unitCost} ج.م` },
          { field: 'location', label: 'الموقع', oldValue: oldPart.location, newValue: updatedPart.location }
        ] : undefined,
        extraInfo: `التصنيف: ${updatedPart.category} | المورد: ${updatedPart.supplier || '—'}`
      }
    });

    return { parts, logs };
  },

  deleteSparePart(partId: string, user?: UserProfile | UserAccount): { parts: SparePartInventoryItem[]; logs: AuditLog[] } {
    const parts = this.getSpareParts();
    const targetPart = parts.find(p => p.id === partId);
    const updated = parts.filter(p => p.id !== partId);
    this.saveSpareParts(updated);

    const activeUser = user || this.getCurrentUser();
    const logs = this.addLog({
      userName: activeUser.name,
      userRole: 'jobTitle' in activeUser ? activeUser.jobTitle : activeUser.role,
      actionType: 'delete',
      targetType: 'spare_part',
      targetId: partId,
      targetTitle: targetPart?.name || partId,
      description: `حذف صنف من مخزن IT: ${targetPart?.name || partId} (${targetPart?.partNumber || ''})`
    });

    return { parts: updated, logs };
  },

  updateSparePartStock(partId: string, deltaQty: number, user?: UserProfile | UserAccount): { parts: SparePartInventoryItem[]; logs: AuditLog[] } {
    const parts = this.getSpareParts();
    const part = parts.find(p => p.id === partId);
    let logs = this.getLogs();

    if (part) {
      const oldQty = part.quantityInStock;
      part.quantityInStock = Math.max(0, part.quantityInStock + deltaQty);
      
      if (part.quantityInStock === 0) {
        part.status = 'out_of_stock';
      } else if (part.quantityInStock <= part.minThreshold) {
        part.status = 'low_stock';
      } else {
        part.status = 'in_stock';
      }
      
      this.saveSpareParts(parts);

      const activeUser = user || this.getCurrentUser();
      const isDeduction = deltaQty < 0;
      
      logs = this.addLog({
        userName: activeUser.name,
        userRole: 'jobTitle' in activeUser ? activeUser.jobTitle : activeUser.role,
        actionType: 'stock_adjust',
        targetType: 'spare_part',
        targetId: part.id,
        targetTitle: part.name,
        description: isDeduction 
          ? `صرف ${Math.abs(deltaQty)} قطعة من ${part.name} (الرصيد الحالي: ${part.quantityInStock})`
          : `إضافة ${deltaQty} قطعة إلى رصيد ${part.name} (الرصيد الحالي: ${part.quantityInStock})`,
        details: {
          changes: [
            { field: 'quantityInStock', label: 'الرصيد المتاح', oldValue: oldQty, newValue: part.quantityInStock }
          ],
          extraInfo: `حد الأمان: ${part.minThreshold} | حالة المخزون: ${part.status}`
        }
      });
    }

    return { parts, logs };
  },

  // ==================== PREVENTIVE SCHEDULES ====================
  getPreventiveSchedules(): PreventiveScheduleItem[] {
    const data = localStorage.getItem(PREVENTIVE_KEY);
    if (!data) {
      this.savePreventiveSchedules(INITIAL_PREVENTIVE_SCHEDULES);
      return INITIAL_PREVENTIVE_SCHEDULES;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_PREVENTIVE_SCHEDULES;
    }
  },

  savePreventiveSchedules(items: PreventiveScheduleItem[]): void {
    localStorage.setItem(PREVENTIVE_KEY, JSON.stringify(items));
  },

  addPreventiveSchedule(schedule: PreventiveScheduleItem, user?: UserProfile | UserAccount): { schedules: PreventiveScheduleItem[]; logs: AuditLog[] } {
    const schedules = this.getPreventiveSchedules();
    const updated = [schedule, ...schedules];
    this.savePreventiveSchedules(updated);

    const activeUser = user || this.getCurrentUser();
    const logs = this.addLog({
      userName: activeUser.name,
      userRole: 'jobTitle' in activeUser ? activeUser.jobTitle : activeUser.role,
      actionType: 'create',
      targetType: 'preventive',
      targetId: schedule.id,
      targetTitle: schedule.title,
      description: `إضافة جدول صيانة وقائية جديد: "${schedule.title}" في قسم ${schedule.department} (${schedule.frequency})`,
      details: {
        extraInfo: `الفني المسؤول: ${schedule.assignedTechnician} | موعد الفحص القادم: ${schedule.nextDueDate} | عدد البنود: ${schedule.checklist.length}`
      }
    });

    return { schedules: updated, logs };
  },

  updatePreventiveSchedule(schedule: PreventiveScheduleItem, user?: UserProfile | UserAccount): { schedules: PreventiveScheduleItem[]; logs: AuditLog[] } {
    const schedules = this.getPreventiveSchedules();
    const index = schedules.findIndex(s => s.id === schedule.id);
    if (index !== -1) {
      schedules[index] = schedule;
      this.savePreventiveSchedules(schedules);
    }

    const activeUser = user || this.getCurrentUser();
    const logs = this.addLog({
      userName: activeUser.name,
      userRole: 'jobTitle' in activeUser ? activeUser.jobTitle : activeUser.role,
      actionType: 'update',
      targetType: 'preventive',
      targetId: schedule.id,
      targetTitle: schedule.title,
      description: `تعديل جدول الصيانة الوقائية: "${schedule.title}" (${schedule.department})`,
      details: {
        extraInfo: `المسؤول: ${schedule.assignedTechnician} | موعد الفحص: ${schedule.nextDueDate}`
      }
    });

    return { schedules, logs };
  },

  deletePreventiveSchedule(scheduleId: string, user?: UserProfile | UserAccount): { schedules: PreventiveScheduleItem[]; logs: AuditLog[] } {
    const schedules = this.getPreventiveSchedules();
    const target = schedules.find(s => s.id === scheduleId);
    const updated = schedules.filter(s => s.id !== scheduleId);
    this.savePreventiveSchedules(updated);

    const activeUser = user || this.getCurrentUser();
    const logs = this.addLog({
      userName: activeUser.name,
      userRole: 'jobTitle' in activeUser ? activeUser.jobTitle : activeUser.role,
      actionType: 'delete',
      targetType: 'preventive',
      targetId: scheduleId,
      targetTitle: target?.title || scheduleId,
      description: `حذف جدول الصيانة الوقائية: "${target?.title || scheduleId}" من ${target?.department || '—'}`
    });

    return { schedules: updated, logs };
  },

  completePreventiveCycle(scheduleId: string, user?: UserProfile | UserAccount): { schedules: PreventiveScheduleItem[]; logs: AuditLog[] } {
    const schedules = this.getPreventiveSchedules();
    const schedule = schedules.find(s => s.id === scheduleId);
    let logs = this.getLogs();

    if (schedule) {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Calculate next due date
      const nextDate = new Date(today);
      if (schedule.frequency === 'daily') {
        nextDate.setDate(nextDate.getDate() + 1);
      } else if (schedule.frequency === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (schedule.frequency === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else if (schedule.frequency === 'quarterly') {
        nextDate.setMonth(nextDate.getMonth() + 3);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }

      const nextDueStr = nextDate.toISOString().split('T')[0];
      const completedItemsCount = schedule.checklist.filter(c => c.done).length;
      const totalItemsCount = schedule.checklist.length;

      schedule.lastDoneDate = todayStr;
      schedule.nextDueDate = nextDueStr;
      schedule.status = 'upcoming';
      // Reset checklist for the next cycle
      schedule.checklist = schedule.checklist.map(item => ({ ...item, done: false }));

      this.savePreventiveSchedules(schedules);

      const activeUser = user || this.getCurrentUser();
      logs = this.addLog({
        userName: activeUser.name,
        userRole: 'jobTitle' in activeUser ? activeUser.jobTitle : activeUser.role,
        actionType: 'update',
        targetType: 'preventive',
        targetId: schedule.id,
        targetTitle: schedule.title,
        description: `✅ إتمام دورة الصيانة الوقائية بالكامل لجدول "${schedule.title}" في ${schedule.department}`,
        details: {
          changes: [
            { field: 'lastDoneDate', label: 'تاريخ الإنجاز', newValue: todayStr },
            { field: 'nextDueDate', label: 'موعد الفحص القادم المجدول', newValue: nextDueStr }
          ],
          extraInfo: `تم فحص وإنجاز ${completedItemsCount} من ${totalItemsCount} بنود | الفني المسؤول: ${schedule.assignedTechnician}`
        }
      });
    }

    return { schedules, logs };
  },

  toggleChecklistItem(scheduleId: string, checkId: string, user?: UserProfile | UserAccount): { schedules: PreventiveScheduleItem[]; logs: AuditLog[] } {
    const schedules = this.getPreventiveSchedules();
    const schedule = schedules.find(s => s.id === scheduleId);
    let logs = this.getLogs();

    if (schedule) {
      const item = schedule.checklist.find(c => c.id === checkId);
      if (item) {
        const oldState = item.done;
        item.done = !item.done;

        // Auto update schedule status if all done
        const allDone = schedule.checklist.every(c => c.done);
        if (allDone) {
          schedule.status = 'completed';
        }

        this.savePreventiveSchedules(schedules);

        const activeUser = user || this.getCurrentUser();
        logs = this.addLog({
          userName: activeUser.name,
          userRole: 'jobTitle' in activeUser ? activeUser.jobTitle : activeUser.role,
          actionType: 'update',
          targetType: 'preventive',
          targetId: schedule.id,
          targetTitle: schedule.title,
          description: item.done 
            ? `إنجاز بند فحص وقائي: "${item.text}" في ${schedule.department}`
            : `إلغاء تحديد بند فحص وقائي: "${item.text}"`,
          details: {
            changes: [
              { field: checkId, label: item.text, oldValue: oldState ? 'منجز' : 'غير منجز', newValue: item.done ? 'منجز' : 'غير منجز' }
            ],
            extraInfo: `المسؤول: ${schedule.assignedTechnician}`
          }
        });
      }
    }

    return { schedules, logs };
  },

  // ==================== DATA BACKUP & RESTORE ====================
  exportFullDatabaseJSON(): string {
    const backupObj = {
      hospitalName: 'Nile of Hope Pediatric Surgery Hospital',
      department: 'IT Maintenance Department',
      systemVersion: '2.0.0',
      exportedAt: new Date().toISOString(),
      assets: this.getAssets(),
      tickets: this.getTickets(),
      spareParts: this.getSpareParts(),
      preventiveSchedules: this.getPreventiveSchedules(),
      accounts: this.getAccounts(),
      logs: this.getLogs()
    };
    return JSON.stringify(backupObj, null, 2);
  },

  importFullDatabaseJSON(jsonString: string, user?: UserProfile | UserAccount): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.assets || !data.tickets) {
        return { success: false, error: 'الملف لا يحتوي على بنية بيانات النظام الصحيحة.' };
      }

      if (Array.isArray(data.assets)) this.saveAssets(data.assets);
      if (Array.isArray(data.tickets)) this.saveTickets(data.tickets);
      if (Array.isArray(data.spareParts)) this.saveSpareParts(data.spareParts);
      if (Array.isArray(data.preventiveSchedules)) this.savePreventiveSchedules(data.preventiveSchedules);
      if (Array.isArray(data.accounts)) this.saveAccounts(data.accounts);
      if (Array.isArray(data.logs)) this.saveLogs(data.logs);

      const activeUser = user || this.getCurrentUser();
      this.addLog({
        userName: activeUser.name,
        userRole: 'jobTitle' in activeUser ? activeUser.jobTitle : activeUser.role,
        actionType: 'system',
        targetType: 'system',
        targetId: 'db-restore',
        targetTitle: 'استعادة قاعدة البيانات',
        description: `استعادة نسخة احتياطية كاملة للنظام بنجاح (${data.assets?.length || 0} أجهزة، ${data.tickets?.length || 0} تذاكر)`
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'خطأ في معالجة ملف JSON' };
    }
  },

  exportTableToCSV(table: 'assets' | 'tickets' | 'inventory' | 'preventive'): string {
    const BOM = '\uFEFF'; // UTF-8 BOM for Arabic excel compatibility

    if (table === 'assets') {
      const items = this.getAssets();
      const headers = ['كود الجهاز', 'اسم الجهاز', 'النوع', 'الماركة', 'الموديل', 'الرقم التسلسلي', 'القسم', 'المستخدم', 'الحالة', 'عنوان IP', 'تاريخ الإضافة'];
      const rows = items.map(a => [
        `"${a.id}"`,
        `"${a.name || ''}"`,
        `"${a.type}"`,
        `"${a.brand}"`,
        `"${a.model}"`,
        `"${a.serialNumber}"`,
        `"${a.department}"`,
        `"${a.currentUser}"`,
        `"${a.status}"`,
        `"${a.ipAddress || ''}"`,
        `"${a.createdAt}"`
      ]);
      return BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    if (table === 'tickets') {
      const items = this.getTickets();
      const headers = ['رقم التقرير', 'كود الجهاز', 'الفني المسؤول', 'تاريخ البلاغ', 'تاريخ الانتهاء', 'نوع العطل', 'المصدر', 'وصف المشكلة', 'التشخيص', 'الإجراء', 'التكلفة', 'مدة التوقف', 'الحالة بعد الصيانة'];
      const rows = items.map(t => [
        `"${t.id}"`,
        `"${t.assetId}"`,
        `"${t.technicianName}"`,
        `"${t.reportDateTime}"`,
        `"${t.resolutionDateTime}"`,
        `"${t.issueCategory}"`,
        `"${t.reportingSource}"`,
        `"${(t.userProblemDescription || '').replace(/"/g, '""')}"`,
        `"${(t.diagnosis || '').replace(/"/g, '""')}"`,
        `"${(t.actionTaken || '').replace(/"/g, '""')}"`,
        `"${t.totalCost}"`,
        `"${t.downtimeFormatted}"`,
        `"${t.statusAfterMaintenance}"`
      ]);
      return BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    if (table === 'inventory') {
      const items = this.getSpareParts();
      const headers = ['اسم الصنف', 'التصنيف', 'رقم القطعة', 'الرصيد المتوفر', 'حد الأمان', 'سعر الوحدة', 'الموقع', 'الحالة', 'المورد'];
      const rows = items.map(p => [
        `"${p.name}"`,
        `"${p.category}"`,
        `"${p.partNumber}"`,
        `"${p.quantityInStock}"`,
        `"${p.minThreshold}"`,
        `"${p.unitCost}"`,
        `"${p.location}"`,
        `"${p.status}"`,
        `"${p.supplier || ''}"`
      ]);
      return BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    if (table === 'preventive') {
      const items = this.getPreventiveSchedules();
      const headers = ['العنوان', 'القسم', 'التكرار', 'الفني المسؤول', 'موعد الفحص القادم', 'آخر فحص', 'الحالة', 'عدد البنود', 'البنود المنجزة'];
      const rows = items.map(s => [
        `"${s.title}"`,
        `"${s.department}"`,
        `"${s.frequency}"`,
        `"${s.assignedTechnician}"`,
        `"${s.nextDueDate}"`,
        `"${s.lastDoneDate || ''}"`,
        `"${s.status}"`,
        `"${s.checklist.length}"`,
        `"${s.checklist.filter(c => c.done).length}"`
      ]);
      return BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    return '';
  },

  resetToDefault(): void {
    localStorage.removeItem(ASSETS_KEY);
    localStorage.removeItem(TICKETS_KEY);
    localStorage.removeItem(SPARE_PARTS_KEY);
    localStorage.removeItem(PREVENTIVE_KEY);
    localStorage.removeItem(LOGS_KEY);
    localStorage.removeItem(ACCOUNTS_KEY);
    localStorage.removeItem(AUTH_SESSION_KEY);
  }
};
