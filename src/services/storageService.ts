import type { Asset, MaintenanceTicket, SparePartInventoryItem, PreventiveScheduleItem, AuditLog, UserProfile, FieldChange } from '../types';
import { INITIAL_ASSETS, INITIAL_TICKETS, INITIAL_SPARE_PARTS, INITIAL_PREVENTIVE_SCHEDULES, INITIAL_AUDIT_LOGS, INITIAL_USERS } from '../data/mockData';

const ASSETS_KEY = 'noh_maintenance_assets_v1';
const TICKETS_KEY = 'noh_maintenance_tickets_v1';
const SPARE_PARTS_KEY = 'noh_maintenance_parts_v1';
const PREVENTIVE_KEY = 'noh_maintenance_preventive_v1';
const LOGS_KEY = 'noh_maintenance_logs_v1';
const USERS_KEY = 'noh_maintenance_users_v1';
const CURRENT_USER_KEY = 'noh_maintenance_current_user_v1';

export const storageService = {
  // ==================== USERS & ACTIVE PERFORMER ====================
  getUsers(): UserProfile[] {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
      this.saveUsers(INITIAL_USERS);
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUsers(users: UserProfile[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  getCurrentUser(): UserProfile {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (!data) {
      const defaultUser = INITIAL_USERS[0];
      this.setCurrentUser(defaultUser);
      return defaultUser;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS[0];
    }
  },

  setCurrentUser(user: UserProfile): void {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  addUser(newUser: UserProfile): UserProfile[] {
    const users = this.getUsers();
    const exists = users.find(u => u.name.toLowerCase() === newUser.name.toLowerCase());
    if (exists) return users;
    const updated = [...users, newUser];
    this.saveUsers(updated);
    return updated;
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
    const currentUser = this.getCurrentUser();

    const fullLog: AuditLog = {
      id: logEntry.id || `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: logEntry.timestamp || new Date().toISOString(),
      userName: logEntry.userName || currentUser.name,
      userRole: logEntry.userRole || currentUser.role,
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

  addAsset(asset: Asset, user?: UserProfile): { assets: Asset[]; logs: AuditLog[] } {
    const assets = this.getAssets();
    const updatedAssets = [asset, ...assets];
    this.saveAssets(updatedAssets);

    const activeUser = user || this.getCurrentUser();
    const logs = this.addLog({
      userName: activeUser.name,
      userRole: activeUser.role,
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

  updateAsset(asset: Asset, user?: UserProfile): { assets: Asset[]; logs: AuditLog[] } {
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
      userRole: activeUser.role,
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

  deleteAsset(assetId: string, user?: UserProfile): { assets: Asset[]; logs: AuditLog[] } {
    const assets = this.getAssets();
    const targetAsset = assets.find(a => a.id === assetId);
    const updatedAssets = assets.filter(a => a.id !== assetId);
    this.saveAssets(updatedAssets);

    const activeUser = user || this.getCurrentUser();
    const logs = this.addLog({
      userName: activeUser.name,
      userRole: activeUser.role,
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

  // ==================== TICKETS ====================
  getTickets(): MaintenanceTicket[] {
    const data = localStorage.getItem(TICKETS_KEY);
    if (!data) {
      this.saveTickets(INITIAL_TICKETS);
      return INITIAL_TICKETS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_TICKETS;
    }
  },

  saveTickets(tickets: MaintenanceTicket[]): void {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  },

  addTicket(ticket: MaintenanceTicket, user?: UserProfile): { tickets: MaintenanceTicket[]; logs: AuditLog[]; assets: Asset[] } {
    const tickets = this.getTickets();
    const updatedTickets = [ticket, ...tickets];
    this.saveTickets(updatedTickets);
    
    // Automatically update asset status if needed
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

    const activeUser = user || this.getCurrentUser();
    const targetAsset = assets.find(a => a.id === ticket.assetId);

    const logs = this.addLog({
      userName: activeUser.name,
      userRole: activeUser.role,
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
        extraInfo: `الفني المسؤول: ${ticket.technicianName} | القسم: ${targetAsset?.department || '—'}`
      }
    });

    return { tickets: updatedTickets, logs, assets };
  },

  updateTicket(ticket: MaintenanceTicket, user?: UserProfile): { tickets: MaintenanceTicket[]; logs: AuditLog[]; assets: Asset[] } {
    const tickets = this.getTickets();
    const index = tickets.findIndex(t => t.id === ticket.id);
    const oldTicket = index !== -1 ? tickets[index] : null;

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

    const activeUser = user || this.getCurrentUser();
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
      userRole: activeUser.role,
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

  deleteTicket(ticketId: string, user?: UserProfile): { tickets: MaintenanceTicket[]; logs: AuditLog[] } {
    const tickets = this.getTickets();
    const targetTicket = tickets.find(t => t.id === ticketId);
    const updatedTickets = tickets.filter(t => t.id !== ticketId);
    this.saveTickets(updatedTickets);

    const activeUser = user || this.getCurrentUser();
    const logs = this.addLog({
      userName: activeUser.name,
      userRole: activeUser.role,
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

  addSparePart(newPart: SparePartInventoryItem, user?: UserProfile): { parts: SparePartInventoryItem[]; logs: AuditLog[] } {
    const parts = this.getSpareParts();
    const updated = [newPart, ...parts];
    this.saveSpareParts(updated);

    const activeUser = user || this.getCurrentUser();
    const logs = this.addLog({
      userName: activeUser.name,
      userRole: activeUser.role,
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

  updateSparePartStock(partId: string, deltaQty: number, user?: UserProfile): { parts: SparePartInventoryItem[]; logs: AuditLog[] } {
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
        userRole: activeUser.role,
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

  toggleChecklistItem(scheduleId: string, checkId: string, user?: UserProfile): { schedules: PreventiveScheduleItem[]; logs: AuditLog[] } {
    const schedules = this.getPreventiveSchedules();
    const schedule = schedules.find(s => s.id === scheduleId);
    let logs = this.getLogs();

    if (schedule) {
      const item = schedule.checklist.find(c => c.id === checkId);
      if (item) {
        const oldState = item.done;
        item.done = !item.done;
        this.savePreventiveSchedules(schedules);

        const activeUser = user || this.getCurrentUser();
        logs = this.addLog({
          userName: activeUser.name,
          userRole: activeUser.role,
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

  resetToDefault(): void {
    localStorage.removeItem(ASSETS_KEY);
    localStorage.removeItem(TICKETS_KEY);
    localStorage.removeItem(SPARE_PARTS_KEY);
    localStorage.removeItem(PREVENTIVE_KEY);
    localStorage.removeItem(LOGS_KEY);
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};
