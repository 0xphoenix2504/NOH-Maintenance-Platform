// Automated Tests for End User Role, Form Validation, and Ownership Isolation
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// In-memory localStorage polyfill for Node.js test environment
const storageMap = new Map<string, string>();
globalThis.localStorage = {
  getItem: (key: string) => storageMap.get(key) || null,
  setItem: (key: string, value: string) => storageMap.set(key, String(value)),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
  key: (index: number) => Array.from(storageMap.keys())[index] || null,
  length: 0
} as any;

// Import storageService and constants
import { storageService } from '../services/storageService.ts';
import type { UserAccount } from '../types/index.ts';

// Test Users
const userA: UserAccount = {
  id: 'acc-test-user-a',
  name: 'User A',
  username: 'user_a',
  role: 'end_user',
  status: 'active',
  department: 'Operations',
  jobTitle: 'Coordinator',
  permissions: [],
  createdAt: new Date().toISOString(),
  authSource: 'local'
};

const userB: UserAccount = {
  id: 'acc-test-user-b',
  name: 'User B',
  username: 'user_b',
  role: 'end_user',
  status: 'active',
  department: 'Pharmacy',
  jobTitle: 'Specialist',
  permissions: [],
  createdAt: new Date().toISOString(),
  authSource: 'local'
};

const techUser: UserAccount = {
  id: 'acc-test-tech',
  name: 'Technician User',
  username: 'tech_user',
  role: 'technician',
  status: 'active',
  department: 'IT Department',
  jobTitle: 'IT Engineer',
  permissions: ['dashboard', 'tickets', 'assets', 'logs'],
  createdAt: new Date().toISOString()
};

describe('End User Ticket Validation & Ownership Isolation', () => {

  beforeEach(() => {
    storageMap.clear();
  });

  describe('1. Q3 -> Q4 Dependency Validation', () => {
    it('should ACCEPT valid floor for جناكليس (Floors 1-3)', () => {
      const result = storageService.validateEndUserTicket({
        problemType: 'Printer',
        happenedBefore: true,
        location: 'جناكليس',
        floor: 'الدور الثاني'
      });
      assert.equal(result.valid, true);
      assert.equal(result.errors.floor, undefined);
    });

    it('should REJECT floor 5 for جناكليس (only 1-3 allowed)', () => {
      const result = storageService.validateEndUserTicket({
        problemType: 'Printer',
        happenedBefore: true,
        location: 'جناكليس',
        floor: 'الدور الخامس'
      });
      assert.equal(result.valid, false);
      assert.ok(result.errors.floor, 'Expected floor error for floor 5 in جناكليس');
    });

    it('should REJECT الأداري for جناكليس', () => {
      const result = storageService.validateEndUserTicket({
        problemType: 'Printer',
        happenedBefore: false,
        location: 'جناكليس',
        floor: 'الأداري'
      });
      assert.equal(result.valid, false);
      assert.ok(result.errors.floor, 'Expected floor error for الأداري in جناكليس');
    });

    it('should ACCEPT floor 7 for ميامي (Floors 1-7 + الأداري)', () => {
      const result = storageService.validateEndUserTicket({
        problemType: 'Computer',
        happenedBefore: false,
        location: 'ميامي',
        floor: 'الدور السابع'
      });
      assert.equal(result.valid, true);
    });

    it('should ACCEPT الأداري for ميامي', () => {
      const result = storageService.validateEndUserTicket({
        problemType: 'Laptop',
        happenedBefore: true,
        location: 'ميامي',
        floor: 'الأداري'
      });
      assert.equal(result.valid, true);
    });

    it('should REJECT invalid floor 10 for ميامي', () => {
      const result = storageService.validateEndUserTicket({
        problemType: 'Pacs',
        happenedBefore: true,
        location: 'ميامي',
        floor: 'الدور العاشر'
      });
      assert.equal(result.valid, false);
      assert.ok(result.errors.floor);
    });
  });

  describe('2. Attachment Validation', () => {
    it('should ACCEPT valid image types <= 5MB and assign randomized safe name', () => {
      const val = storageService.validateAttachment({
        name: '../../../etc/passwd.png',
        type: 'image/png',
        size: 2 * 1024 * 1024 // 2 MB
      });
      assert.equal(val.valid, true);
      assert.ok(val.safeName?.startsWith('att_'));
      assert.ok(val.safeName?.endsWith('.png'));
      assert.ok(!val.safeName?.includes('..'), 'Path traversal removed');
    });

    it('should REJECT file exceeding 5MB', () => {
      const val = storageService.validateAttachment({
        name: 'huge_screenshot.png',
        type: 'image/png',
        size: 6 * 1024 * 1024 // 6 MB
      });
      assert.equal(val.valid, false);
      assert.ok(val.error?.includes('الحد الأقصى'));
    });

    it('should REJECT non-image MIME types (e.g. PDF, executable)', () => {
      const pdfVal = storageService.validateAttachment({
        name: 'document.pdf',
        type: 'application/pdf',
        size: 100 * 1024
      });
      assert.equal(pdfVal.valid, false);

      const exeVal = storageService.validateAttachment({
        name: 'malware.exe',
        type: 'application/x-msdownload',
        size: 100 * 1024
      });
      assert.equal(exeVal.valid, false);
    });
  });

  describe('3. Ownership Isolation & IDOR Protection', () => {
    it('should isolate tickets between User A and User B', () => {
      // User A submits a ticket
      const resA = storageService.submitEndUserTicket({
        problemType: 'Printer',
        happenedBefore: false,
        location: 'ميامي',
        floor: 'الدور الثالث',
        attachment: {
          name: 'error.png',
          type: 'image/png',
          size: 1024,
          dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        }
      }, userA);

      assert.equal(resA.success, true);
      const ticketA = resA.ticket!;

      // User B submits a ticket
      const resB = storageService.submitEndUserTicket({
        problemType: 'Computer',
        happenedBefore: true,
        location: 'جناكليس',
        floor: 'الدور الأول'
      }, userB);

      assert.equal(resB.success, true);
      const ticketB = resB.ticket!;

      // User A queries tickets: should ONLY see Ticket A
      const userATickets = storageService.getTicketsForUser(userA);
      assert.equal(userATickets.length, 1);
      assert.equal(userATickets[0].id, ticketA.id);

      // User B queries tickets: should ONLY see Ticket B
      const userBTickets = storageService.getTicketsForUser(userB);
      assert.equal(userBTickets.length, 1);
      assert.equal(userBTickets[0].id, ticketB.id);

      // IDOR Test: User B attempts to access Ticket A directly by ID
      const userBAttemptTicketA = storageService.getTicketForEndUser(ticketA.id, userB);
      assert.equal(userBAttemptTicketA, null, 'IDOR prevented: User B cannot fetch Ticket A');

      // IDOR Test: User B attempts to access Ticket A attachment directly by ID
      const userBAttemptAttachment = storageService.getTicketAttachment(ticketA.id, userB);
      assert.equal(userBAttemptAttachment, null, 'IDOR prevented: User B cannot fetch Ticket A attachment');

      // Owner User A CAN access their own ticket and attachment
      const ownerTicket = storageService.getTicketForEndUser(ticketA.id, userA);
      assert.ok(ownerTicket);
      assert.equal(ownerTicket?.id, ticketA.id);

      const ownerAttachment = storageService.getTicketAttachment(ticketA.id, userA);
      assert.ok(ownerAttachment);
      assert.equal(ownerAttachment?.fileType, 'image/png');

      // Technician CAN view all tickets
      const techTickets = storageService.getTicketsForUser(techUser);
      assert.ok(techTickets.length >= 2, 'Technician sees all system tickets');
    });

    it('should sanitize tickets and hide internal technician notes from End User view', () => {
      const res = storageService.submitEndUserTicket({
        problemType: 'Laptop',
        happenedBefore: false,
        location: 'ميامي',
        floor: 'الدور الخامس'
      }, userA);

      const ticket = res.ticket!;
      // Simulate technician adding internal notes
      ticket.diagnosis = 'INTERNAL: Motherboard power rail damaged';
      ticket.actionTaken = 'INTERNAL: Micro-soldering resistor';
      ticket.totalCost = 5000;
      storageService.saveTickets([ticket]);

      // When fetched by End User: safe view must NOT contain internal fields
      const safeView = storageService.getTicketForEndUser(ticket.id, userA);
      assert.ok(safeView);
      assert.equal((safeView as any).diagnosis, undefined);
      assert.equal((safeView as any).actionTaken, undefined);
      assert.equal((safeView as any).totalCost, undefined);
      assert.equal((safeView as any).sparePartsUsed, undefined);
    });
  });

  describe('4. Status History Tracking', () => {
    it('should record initial status and log subsequent status updates without breaking', () => {
      const res = storageService.submitEndUserTicket({
        problemType: 'PrimeCare',
        happenedBefore: true,
        location: 'ميامي',
        floor: 'الدور الأول'
      }, userA);

      const ticket = res.ticket!;
      assert.ok(ticket.statusHistory);
      assert.equal(ticket.statusHistory?.length, 1);
      assert.equal(ticket.statusHistory?.[0].newStatus, 'open');

      // Technician updates status to in_progress
      ticket.status = 'in_progress';
      const updated = storageService.updateTicket(ticket, techUser);
      const freshTicket = updated.tickets.find(t => t.id === ticket.id)!;

      assert.equal(freshTicket.statusHistory?.length, 2);
      assert.equal(freshTicket.statusHistory?.[1].oldStatus, 'open');
      assert.equal(freshTicket.statusHistory?.[1].newStatus, 'in_progress');
    });
  });

  describe('5. Role Access Restrictions (Backend Protection)', () => {
    it('should prevent End User from deleting tickets', () => {
      const res = storageService.submitEndUserTicket({
        problemType: 'Computer',
        happenedBefore: false,
        location: 'ميامي',
        floor: 'الدور الأول'
      }, userA);

      const ticket = res.ticket!;
      assert.throws(() => {
        storageService.deleteTicket(ticket.id, userA);
      }, /غير مصرح للمستخدم النهائي/);
    });

    it('should prevent End User from performing direct technician ticket updates', () => {
      const res = storageService.submitEndUserTicket({
        problemType: 'Laptop',
        happenedBefore: true,
        location: 'ميامي',
        floor: 'الدور الثاني'
      }, userA);

      const ticket = res.ticket!;
      ticket.status = 'closed';
      assert.throws(() => {
        storageService.updateTicket(ticket, userA);
      }, /غير مصرح للمستخدم النهائي/);
    });

    it('should prevent End User from directly creating technician work orders (addTicket)', () => {
      assert.throws(() => {
        storageService.addTicket({
          id: 'TECH-100',
          assetId: 'TEST-01',
          technicianName: 'Tech',
          reportDateTime: '2026-10-04T10:00',
          resolutionDateTime: '2026-10-04T10:00',
          reportingSource: 'routine_inspection',
          issueCategory: 'hardware',
          priority: 'high',
          userProblemDescription: 'Broken screen',
          diagnosis: 'Test',
          actionTaken: 'Test',
          sparePartsUsed: [],
          totalCost: 0,
          downtimeFormatted: '0',
          statusAfterMaintenance: 'repaired',
          notesAndRecommendations: '',
          status: 'resolved',
          createdAt: new Date().toISOString()
        }, userA);
      }, /غير مصرح للمستخدم النهائي/);
    });
  });
});
