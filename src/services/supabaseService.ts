import { getSupabaseClient } from './supabaseClient';
import type {
  Asset,
  MaintenanceTicket,
  SparePartInventoryItem,
  PreventiveScheduleItem,
  AuditLog,
  UserAccount
} from '../types';

export const supabaseService = {
  // ==================== MAPPERS ====================

  accountToRow(acc: UserAccount) {
    return {
      id: acc.id,
      name: acc.name,
      username: acc.username,
      email: acc.email || null,
      password: acc.password,
      role: acc.role,
      status: acc.status,
      department: acc.department || null,
      job_title: acc.jobTitle || null,
      permissions: acc.permissions || [],
      created_at: acc.createdAt || new Date().toISOString(),
      last_login: acc.lastLogin || null
    };
  },

  rowToAccount(row: any): UserAccount {
    return {
      id: row.id,
      name: row.name,
      username: row.username,
      email: row.email || '',
      password: row.password || '',
      role: row.role || 'user',
      status: row.status || 'pending',
      department: row.department || '',
      jobTitle: row.job_title || '',
      permissions: Array.isArray(row.permissions) ? row.permissions : [],
      createdAt: row.created_at || new Date().toISOString(),
      lastLogin: row.last_login
    };
  },

  assetToRow(asset: Asset) {
    return {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      brand: asset.brand,
      model: asset.model,
      serial_number: asset.serialNumber || null,
      department: asset.department,
      floor: asset.floor || null,
      room_or_unit: asset.roomOrUnit || null,
      assigned_user: asset.currentUser || null,
      user_role: asset.userRole || null,
      status: asset.status,
      purchase_date: asset.purchaseDate || null,
      warranty_expiry: asset.warrantyExpiry || null,
      ip_address: asset.ipAddress || null,
      mac_address: asset.macAddress || null,
      specifications: asset.specifications || {},
      notes: asset.notes || null,
      created_at: asset.createdAt || new Date().toISOString(),
      qr_code_data: asset.qrCodeData || null
    };
  },

  rowToAsset(row: any): Asset {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      brand: row.brand,
      model: row.model,
      serialNumber: row.serial_number || '',
      department: row.department,
      floor: row.floor || '',
      roomOrUnit: row.room_or_unit || '',
      currentUser: row.assigned_user || row.current_user || '',
      userRole: row.user_role || '',
      status: row.status || 'operational',
      purchaseDate: row.purchase_date,
      warrantyExpiry: row.warranty_expiry,
      ipAddress: row.ip_address,
      macAddress: row.mac_address,
      specifications: row.specifications || {},
      notes: row.notes,
      createdAt: row.created_at || new Date().toISOString(),
      qrCodeData: row.qr_code_data
    };
  },

  ticketToRow(ticket: MaintenanceTicket) {
    return {
      id: ticket.id,
      asset_id: ticket.assetId || null,
      technician_name: ticket.technicianName || '—',
      technician_id: ticket.technicianId || null,
      report_date_time: ticket.reportDateTime || new Date().toISOString(),
      resolution_date_time: ticket.resolutionDateTime || new Date().toISOString(),
      reporting_source: ticket.reportingSource || 'user_report',
      issue_category: ticket.issueCategory || 'hardware',
      priority: ticket.priority || 'medium',
      user_problem_description: ticket.userProblemDescription || '',
      diagnosis: ticket.diagnosis || '',
      action_taken: ticket.actionTaken || '',
      spare_parts_used: ticket.sparePartsUsed || [],
      total_cost: ticket.totalCost || 0,
      downtime_formatted: ticket.downtimeFormatted || '0 دقيقة',
      downtime_hours: ticket.downtimeHours || 0,
      status_after_maintenance: ticket.statusAfterMaintenance || 'repaired',
      notes_and_recommendations: ticket.notesAndRecommendations || null,
      technician_signature: ticket.technicianSignature || null,
      user_signature: ticket.userSignature || null,
      status: ticket.status || 'open',
      created_at: ticket.createdAt || new Date().toISOString(),
      title: ticket.title || null,
      problem_type: ticket.problemType || null,
      happened_before: ticket.happenedBefore ?? null,
      location: ticket.location || null,
      floor: ticket.floor || null,
      requester_id: ticket.requesterId || null,
      requester_name: ticket.requesterName || null,
      status_history: ticket.statusHistory || [],
      attachment: ticket.attachment || null
    };
  },

  rowToTicket(row: any): MaintenanceTicket {
    return {
      id: row.id,
      assetId: row.asset_id || '',
      technicianName: row.technician_name || '',
      technicianId: row.technician_id,
      reportDateTime: row.report_date_time || new Date().toISOString(),
      resolutionDateTime: row.resolution_date_time || new Date().toISOString(),
      reportingSource: row.reporting_source || 'user_report',
      issueCategory: row.issue_category || 'hardware',
      priority: row.priority || 'medium',
      userProblemDescription: row.user_problem_description || '',
      diagnosis: row.diagnosis || '',
      actionTaken: row.action_taken || '',
      sparePartsUsed: Array.isArray(row.spare_parts_used) ? row.spare_parts_used : [],
      totalCost: Number(row.total_cost) || 0,
      downtimeFormatted: row.downtime_formatted || '0 دقيقة',
      downtimeHours: Number(row.downtime_hours) || 0,
      statusAfterMaintenance: row.status_after_maintenance || 'repaired',
      notesAndRecommendations: row.notes_and_recommendations || '',
      technicianSignature: row.technician_signature,
      userSignature: row.user_signature,
      status: row.status || 'open',
      createdAt: row.created_at || new Date().toISOString(),
      title: row.title || undefined,
      problemType: row.problem_type || undefined,
      happenedBefore: typeof row.happened_before === 'boolean' ? row.happened_before : undefined,
      location: row.location || undefined,
      floor: row.floor || undefined,
      requesterId: row.requester_id || undefined,
      requesterName: row.requester_name || undefined,
      statusHistory: Array.isArray(row.status_history) ? row.status_history : undefined,
      attachment: row.attachment || undefined
    };
  },

  inventoryToRow(item: SparePartInventoryItem) {
    return {
      id: item.id,
      name: item.name,
      category: item.category || 'General',
      part_number: item.partNumber || null,
      quantity_in_stock: item.quantityInStock || 0,
      min_threshold: item.minThreshold || 0,
      unit_cost: item.unitCost || 0,
      location: item.location || null,
      status: item.status || 'in_stock',
      supplier: item.supplier || null,
      compatible_models: item.compatibleModels || [],
      last_restocked: item.lastRestocked || null,
      created_at: item.createdAt || new Date().toISOString()
    };
  },

  rowToInventory(row: any): SparePartInventoryItem {
    return {
      id: row.id,
      name: row.name,
      category: row.category || 'General',
      partNumber: row.part_number || '',
      quantityInStock: Number(row.quantity_in_stock) || 0,
      minThreshold: Number(row.min_threshold) || 0,
      unitCost: Number(row.unit_cost) || 0,
      location: row.location || '',
      status: row.status || 'in_stock',
      supplier: row.supplier,
      compatibleModels: Array.isArray(row.compatible_models) ? row.compatible_models : [],
      lastRestocked: row.last_restocked,
      createdAt: row.created_at || new Date().toISOString()
    };
  },

  preventiveToRow(prev: PreventiveScheduleItem) {
    return {
      id: prev.id,
      title: prev.title,
      department: prev.department,
      frequency: prev.frequency || 'monthly',
      assigned_technician: prev.assignedTechnician,
      next_due_date: prev.nextDueDate,
      last_done_date: prev.lastDoneDate || null,
      status: prev.status || 'upcoming',
      checklist: prev.checklist || [],
      created_at: prev.createdAt || new Date().toISOString()
    };
  },

  rowToPreventive(row: any): PreventiveScheduleItem {
    return {
      id: row.id,
      title: row.title,
      department: row.department || '',
      frequency: row.frequency || 'monthly',
      assignedTechnician: row.assigned_technician || '',
      nextDueDate: row.next_due_date || new Date().toISOString(),
      lastDoneDate: row.last_done_date,
      status: row.status || 'upcoming',
      checklist: Array.isArray(row.checklist) ? row.checklist : [],
      createdAt: row.created_at || new Date().toISOString()
    };
  },

  logToRow(log: AuditLog) {
    return {
      id: log.id,
      timestamp: log.timestamp || new Date().toISOString(),
      user_name: log.userName || null,
      user_role: log.userRole || null,
      action_type: log.actionType,
      target_type: log.targetType,
      target_id: log.targetId || null,
      target_title: log.targetTitle || null,
      description: log.description,
      details: log.details || {}
    };
  },

  rowToLog(row: any): AuditLog {
    return {
      id: row.id,
      timestamp: row.timestamp || new Date().toISOString(),
      userName: row.user_name || 'System',
      userRole: row.user_role || 'System',
      actionType: row.action_type,
      targetType: row.target_type,
      targetId: row.target_id || '',
      targetTitle: row.target_title || '',
      description: row.description,
      details: row.details
    };
  },

  // ==================== ASYNC CLOUD QUERIES ====================

  async fetchAll(): Promise<{
    accounts: UserAccount[];
    assets: Asset[];
    tickets: MaintenanceTicket[];
    inventory: SparePartInventoryItem[];
    preventive: PreventiveScheduleItem[];
    logs: AuditLog[];
  } | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const [accRes, astRes, tktRes, invRes, prvRes, logRes] = await Promise.all([
        client.from('noh_accounts').select('*'),
        client.from('noh_assets').select('*').order('created_at', { ascending: false }),
        client.from('noh_tickets').select('*').order('created_at', { ascending: false }),
        client.from('noh_inventory').select('*').order('name', { ascending: true }),
        client.from('noh_preventive').select('*').order('created_at', { ascending: false }),
        client.from('noh_logs').select('*').order('timestamp', { ascending: false }).limit(200)
      ]);

      if (accRes.error || astRes.error || tktRes.error || invRes.error || prvRes.error || logRes.error) {
        console.error('Supabase fetchAll error:', {
          acc: accRes.error,
          ast: astRes.error,
          tkt: tktRes.error,
          inv: invRes.error,
          prv: prvRes.error,
          log: logRes.error
        });
        return null;
      }

      return {
        accounts: (accRes.data || []).map(this.rowToAccount),
        assets: (astRes.data || []).map(this.rowToAsset),
        tickets: (tktRes.data || []).map(this.rowToTicket),
        inventory: (invRes.data || []).map(this.rowToInventory),
        preventive: (prvRes.data || []).map(this.rowToPreventive),
        logs: (logRes.data || []).map(this.rowToLog)
      };
    } catch (err) {
      console.error('Supabase fetchAll exception:', err);
      return null;
    }
  },

  // Upsert Individual Item Helpers
  async upsertAccount(acc: UserAccount): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('noh_accounts').upsert(this.accountToRow(acc));
      if (error) console.error('Supabase upsertAccount error:', error);
      return !error;
    } catch {
      return false;
    }
  },

  async deleteAccount(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('noh_accounts').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  async upsertAsset(asset: Asset): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('noh_assets').upsert(this.assetToRow(asset));
      if (error) console.error('Supabase upsertAsset error:', error);
      return !error;
    } catch {
      return false;
    }
  },

  async deleteAsset(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('noh_assets').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  async upsertTicket(ticket: MaintenanceTicket): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('noh_tickets').upsert(this.ticketToRow(ticket));
      if (error) console.error('Supabase upsertTicket error:', error);
      return !error;
    } catch {
      return false;
    }
  },

  async deleteTicket(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('noh_tickets').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  async upsertInventoryItem(item: SparePartInventoryItem): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('noh_inventory').upsert(this.inventoryToRow(item));
      if (error) console.error('Supabase upsertInventoryItem error:', error);
      return !error;
    } catch {
      return false;
    }
  },

  async deleteInventoryItem(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('noh_inventory').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  async upsertPreventive(prev: PreventiveScheduleItem): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('noh_preventive').upsert(this.preventiveToRow(prev));
      if (error) console.error('Supabase upsertPreventive error:', error);
      return !error;
    } catch {
      return false;
    }
  },

  async deletePreventive(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('noh_preventive').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  async insertLog(log: AuditLog): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('noh_logs').insert(this.logToRow(log));
      return !error;
    } catch {
      return false;
    }
  },

  // ==================== BATCH LOCAL -> CLOUD UPLOAD ====================
  async uploadLocalDataToSupabase(localData: {
    accounts: UserAccount[];
    assets: Asset[];
    tickets: MaintenanceTicket[];
    inventory: SparePartInventoryItem[];
    preventive: PreventiveScheduleItem[];
    logs: AuditLog[];
  }): Promise<{ success: boolean; message: string; counts?: any }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'لم يتم ضبط إعدادات الاتصال بـ Supabase بعد.' };
    }

    try {
      const accountRows = localData.accounts.map(this.accountToRow);
      const assetRows = localData.assets.map(this.assetToRow);
      const ticketRows = localData.tickets.map(this.ticketToRow);
      const inventoryRows = localData.inventory.map(this.inventoryToRow);
      const preventiveRows = localData.preventive.map(this.preventiveToRow);
      const logRows = localData.logs.map(this.logToRow);

      if (accountRows.length > 0) {
        const { error } = await client.from('noh_accounts').upsert(accountRows);
        if (error) throw new Error(`خطأ في رفع المستخدمين: ${error.message}`);
      }

      if (assetRows.length > 0) {
        const { error } = await client.from('noh_assets').upsert(assetRows);
        if (error) throw new Error(`خطأ في رفع الأجهزة: ${error.message}`);
      }

      if (ticketRows.length > 0) {
        const { error } = await client.from('noh_tickets').upsert(ticketRows);
        if (error) throw new Error(`خطأ في رفع التذاكر: ${error.message}`);
      }

      if (inventoryRows.length > 0) {
        const { error } = await client.from('noh_inventory').upsert(inventoryRows);
        if (error) throw new Error(`خطأ في رفع المخزون: ${error.message}`);
      }

      if (preventiveRows.length > 0) {
        const { error } = await client.from('noh_preventive').upsert(preventiveRows);
        if (error) throw new Error(`خطأ في رفع الصيانة الوقائية: ${error.message}`);
      }

      if (logRows.length > 0) {
        const { error } = await client.from('noh_logs').upsert(logRows);
        if (error) throw new Error(`خطأ في رفع سجلات النشاط: ${error.message}`);
      }

      return {
        success: true,
        message: 'تم رفع ومزامنة جميع البيانات المحلية إلى قاعدة بيانات Supabase السحابية بنجاح!',
        counts: {
          accounts: accountRows.length,
          assets: assetRows.length,
          tickets: ticketRows.length,
          inventory: inventoryRows.length,
          preventive: preventiveRows.length,
          logs: logRows.length
        }
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'حدث خطأ أثناء رفع البيانات إلى Supabase'
      };
    }
  }
};
