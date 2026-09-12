import type { Asset, MaintenanceTicket, SparePartInventoryItem, PreventiveScheduleItem } from '../types';
import { INITIAL_ASSETS, INITIAL_TICKETS, INITIAL_SPARE_PARTS, INITIAL_PREVENTIVE_SCHEDULES } from '../data/mockData';

const ASSETS_KEY = 'noh_maintenance_assets_v1';
const TICKETS_KEY = 'noh_maintenance_tickets_v1';
const SPARE_PARTS_KEY = 'noh_maintenance_parts_v1';
const PREVENTIVE_KEY = 'noh_maintenance_preventive_v1';

export const storageService = {
  // Assets
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

  addAsset(asset: Asset): Asset[] {
    const assets = this.getAssets();
    const updated = [asset, ...assets];
    this.saveAssets(updated);
    return updated;
  },

  updateAsset(asset: Asset): Asset[] {
    const assets = this.getAssets();
    const index = assets.findIndex(a => a.id === asset.id);
    if (index !== -1) {
      assets[index] = asset;
      this.saveAssets(assets);
    }
    return assets;
  },

  deleteAsset(assetId: string): Asset[] {
    const assets = this.getAssets().filter(a => a.id !== assetId);
    this.saveAssets(assets);
    return assets;
  },

  // Tickets
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

  addTicket(ticket: MaintenanceTicket): MaintenanceTicket[] {
    const tickets = this.getTickets();
    const updated = [ticket, ...tickets];
    this.saveTickets(updated);
    
    // Automatically update asset status if needed
    if (ticket.statusAfterMaintenance === 'repaired') {
      const assets = this.getAssets();
      const asset = assets.find(a => a.id === ticket.assetId);
      if (asset) {
        asset.status = 'operational';
        this.saveAssets(assets);
      }
    } else if (ticket.statusAfterMaintenance === 'needs_parts') {
      const assets = this.getAssets();
      const asset = assets.find(a => a.id === ticket.assetId);
      if (asset) {
        asset.status = 'needs_parts';
        this.saveAssets(assets);
      }
    }

    return updated;
  },

  updateTicket(ticket: MaintenanceTicket): MaintenanceTicket[] {
    const tickets = this.getTickets();
    const index = tickets.findIndex(t => t.id === ticket.id);
    if (index !== -1) {
      tickets[index] = ticket;
      this.saveTickets(tickets);

      // Reflect on asset status
      if (ticket.statusAfterMaintenance === 'repaired') {
        const assets = this.getAssets();
        const asset = assets.find(a => a.id === ticket.assetId);
        if (asset) {
          asset.status = 'operational';
          this.saveAssets(assets);
        }
      } else if (ticket.statusAfterMaintenance === 'needs_parts') {
        const assets = this.getAssets();
        const asset = assets.find(a => a.id === ticket.assetId);
        if (asset) {
          asset.status = 'needs_parts';
          this.saveAssets(assets);
        }
      }
    }
    return tickets;
  },

  deleteTicket(ticketId: string): MaintenanceTicket[] {
    const tickets = this.getTickets().filter(t => t.id !== ticketId);
    this.saveTickets(tickets);
    return tickets;
  },

  // Spare Parts
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

  updateSparePartStock(partId: string, deltaQty: number): SparePartInventoryItem[] {
    const parts = this.getSpareParts();
    const part = parts.find(p => p.id === partId);
    if (part) {
      part.quantityInStock = Math.max(0, part.quantityInStock + deltaQty);
      if (part.quantityInStock === 0) {
        part.status = 'out_of_stock';
      } else if (part.quantityInStock <= part.minThreshold) {
        part.status = 'low_stock';
      } else {
        part.status = 'in_stock';
      }
      this.saveSpareParts(parts);
    }
    return parts;
  },

  // Preventive Schedules
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

  toggleChecklistItem(scheduleId: string, checkId: string): PreventiveScheduleItem[] {
    const schedules = this.getPreventiveSchedules();
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule) {
      const item = schedule.checklist.find(c => c.id === checkId);
      if (item) {
        item.done = !item.done;
        this.savePreventiveSchedules(schedules);
      }
    }
    return schedules;
  },

  resetToDefault(): void {
    localStorage.removeItem(ASSETS_KEY);
    localStorage.removeItem(TICKETS_KEY);
    localStorage.removeItem(SPARE_PARTS_KEY);
    localStorage.removeItem(PREVENTIVE_KEY);
  }
};
