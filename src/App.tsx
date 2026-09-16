import { useState, useEffect, useMemo } from 'react';
import type {
  Asset,
  MaintenanceTicket,
  SparePartInventoryItem,
  PreventiveScheduleItem,
  AuditLog,
  UserAccount,
  PermissionKey,
  UserRole,
  AccountStatus
} from './types';
import { storageService } from './services/storageService';
import { Sidebar } from './components/Sidebar';
import type { NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TicketsView } from './components/TicketsView';
import { AssetsView } from './components/AssetsView';
import { InventoryView } from './components/InventoryView';
import { PreventiveView } from './components/PreventiveView';
import { ActivityLogView } from './components/ActivityLogView';
import { UserManagementView } from './components/UserManagementView';
import { AuthView } from './components/AuthView';
import { PendingApprovalView } from './components/PendingApprovalView';
import { OfficialReportModal } from './components/OfficialReportModal';
import { TicketFormModal } from './components/TicketFormModal';
import { AssetFormModal } from './components/AssetFormModal';
import { AssetDetailsModal } from './components/AssetDetailsModal';
import { QRScannerModal } from './components/QRScannerModal';
import { BatchQRPrintModal } from './components/BatchQRPrintModal';
import { DataManagementModal } from './components/DataManagementModal';

export const App: React.FC = () => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('noh_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('noh_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Authentication State
  const [authenticatedUser, setAuthenticatedUser] = useState<UserAccount | null>(() => storageService.getAuthenticatedUser());
  const [accounts, setAccounts] = useState<UserAccount[]>(() => storageService.getAccounts());

  // Main Navigation Tab
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');

  // Core Data States
  const [assets, setAssets] = useState<Asset[]>(() => storageService.getAssets());
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(() => storageService.getTickets());
  const [spareParts, setSpareParts] = useState<SparePartInventoryItem[]>(() => storageService.getSpareParts());
  const [preventiveSchedules, setPreventiveSchedules] = useState<PreventiveScheduleItem[]>(() => storageService.getPreventiveSchedules());
  const [logs, setLogs] = useState<AuditLog[]>(() => storageService.getLogs());

  // Modals States
  const [officialReportTicket, setOfficialReportTicket] = useState<MaintenanceTicket | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<MaintenanceTicket | null>(null);
  const [newTicketAssetId, setNewTicketAssetId] = useState<string | undefined>(undefined);

  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const [detailsAsset, setDetailsAsset] = useState<Asset | null>(null);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [batchQRModalOpen, setBatchQRModalOpen] = useState(false);
  const [dataModalOpen, setDataModalOpen] = useState(false);

  // Authentication Handlers
  const handleLoginSuccess = (user: UserAccount) => {
    setAuthenticatedUser(user);
    setAccounts(storageService.getAccounts());
    setLogs(storageService.getLogs());

    // Switch to first allowed tab
    if (user.role === 'admin' || user.permissions.includes('dashboard')) {
      setActiveTab('dashboard');
    } else if (user.permissions.length > 0) {
      setActiveTab(user.permissions[0] as NavTab);
    }
  };

  const handleLogout = () => {
    storageService.logout();
    setAuthenticatedUser(null);
    setLogs(storageService.getLogs());
  };

  const handleRefreshUser = (updatedUser: UserAccount) => {
    setAuthenticatedUser(updatedUser);
    setAccounts(storageService.getAccounts());
  };

  // User Permissions Management (Admin)
  const handleUpdatePermissions = (
    userId: string,
    permissions: PermissionKey[],
    role: UserRole,
    status: AccountStatus
  ) => {
    if (!authenticatedUser) return;
    const res = storageService.updateAccountPermissions(userId, permissions, role, status, authenticatedUser);
    setAccounts(res.accounts);
    setLogs(res.logs);

    // If current logged-in user modified their own account, update state
    if (authenticatedUser.id === userId) {
      const freshSelf = res.accounts.find(a => a.id === userId);
      if (freshSelf) setAuthenticatedUser(freshSelf);
    }
  };

  const handleDeleteAccount = (userId: string) => {
    if (!authenticatedUser) return;
    const res = storageService.deleteAccount(userId, authenticatedUser);
    setAccounts(res.accounts);
    setLogs(res.logs);
  };

  // Permitted Tabs Calculation & Auto-Guard
  const permittedTabs: NavTab[] = useMemo(() => {
    if (!authenticatedUser) return [];
    if (authenticatedUser.role === 'admin') {
      return ['dashboard', 'tickets', 'assets', 'inventory', 'preventive', 'logs', 'user_management'];
    }
    const perms: NavTab[] = [];
    if (authenticatedUser.permissions.includes('dashboard')) perms.push('dashboard');
    if (authenticatedUser.permissions.includes('tickets')) perms.push('tickets');
    if (authenticatedUser.permissions.includes('assets')) perms.push('assets');
    if (authenticatedUser.permissions.includes('inventory')) perms.push('inventory');
    if (authenticatedUser.permissions.includes('preventive')) perms.push('preventive');
    if (authenticatedUser.permissions.includes('logs')) perms.push('logs');
    if (authenticatedUser.permissions.includes('user_management')) perms.push('user_management');
    return perms;
  }, [authenticatedUser]);

  // Ensure active tab is allowed
  useEffect(() => {
    if (authenticatedUser && permittedTabs.length > 0) {
      if (!permittedTabs.includes(activeTab)) {
        setActiveTab(permittedTabs[0]);
      }
    }
  }, [permittedTabs, activeTab, authenticatedUser]);

  // Ticket Operations with Audit Logging and Inventory deduction
  const handleSaveTicket = (ticket: MaintenanceTicket) => {
    if (editingTicket) {
      const res = storageService.updateTicket(ticket, authenticatedUser || undefined);
      setTickets(res.tickets);
      setLogs(res.logs);
      setAssets(res.assets);
    } else {
      const res = storageService.addTicket(ticket, authenticatedUser || undefined);
      setTickets(res.tickets);
      setLogs(res.logs);
      setAssets(res.assets);
      if (res.parts) {
        setSpareParts(res.parts);
      }
    }
    setTicketModalOpen(false);
    setEditingTicket(null);
    setNewTicketAssetId(undefined);
  };

  const handleDeleteTicket = (ticketId: string) => {
    const res = storageService.deleteTicket(ticketId, authenticatedUser || undefined);
    setTickets(res.tickets);
    setLogs(res.logs);
  };

  const handleOpenNewTicket = (assetId?: string) => {
    setEditingTicket(null);
    setNewTicketAssetId(assetId);
    setTicketModalOpen(true);
  };

  const handleOpenEditTicket = (ticket: MaintenanceTicket) => {
    setEditingTicket(ticket);
    setTicketModalOpen(true);
  };

  // Asset Operations with Audit Logging
  const handleSaveAsset = (asset: Asset) => {
    if (editingAsset) {
      const res = storageService.updateAsset(asset, authenticatedUser || undefined);
      setAssets(res.assets);
      setLogs(res.logs);
    } else {
      const res = storageService.addAsset(asset, authenticatedUser || undefined);
      setAssets(res.assets);
      setLogs(res.logs);
    }
    setAssetModalOpen(false);
    setEditingAsset(null);
  };

  const handleDeleteAsset = (assetId: string) => {
    const res = storageService.deleteAsset(assetId, authenticatedUser || undefined);
    setAssets(res.assets);
    setLogs(res.logs);
  };

  const handleOpenNewAsset = () => {
    setEditingAsset(null);
    setAssetModalOpen(true);
  };

  const handleOpenEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setAssetModalOpen(true);
  };

  // Inventory Operations with Audit Logging
  const handleUpdateStock = (partId: string, delta: number) => {
    const res = storageService.updateSparePartStock(partId, delta, authenticatedUser || undefined);
    setSpareParts(res.parts);
    setLogs(res.logs);
  };

  const handleSaveNewPart = (newPart: SparePartInventoryItem) => {
    const res = storageService.addSparePart(newPart, authenticatedUser || undefined);
    setSpareParts(res.parts);
    setLogs(res.logs);
  };

  const handleUpdateSparePart = (part: SparePartInventoryItem) => {
    const res = storageService.updateSparePart(part, authenticatedUser || undefined);
    setSpareParts(res.parts);
    setLogs(res.logs);
  };

  const handleDeleteSparePart = (partId: string) => {
    const res = storageService.deleteSparePart(partId, authenticatedUser || undefined);
    setSpareParts(res.parts);
    setLogs(res.logs);
  };

  // Preventive Checklist & Schedule Operations with Audit Logging
  const handleToggleChecklist = (scheduleId: string, checkId: string) => {
    const res = storageService.toggleChecklistItem(scheduleId, checkId, authenticatedUser || undefined);
    setPreventiveSchedules(res.schedules);
    setLogs(res.logs);
  };

  const handleSavePreventiveSchedule = (schedule: PreventiveScheduleItem) => {
    const exists = preventiveSchedules.some(s => s.id === schedule.id);
    if (exists) {
      const res = storageService.updatePreventiveSchedule(schedule, authenticatedUser || undefined);
      setPreventiveSchedules(res.schedules);
      setLogs(res.logs);
    } else {
      const res = storageService.addPreventiveSchedule(schedule, authenticatedUser || undefined);
      setPreventiveSchedules(res.schedules);
      setLogs(res.logs);
    }
  };

  const handleDeletePreventiveSchedule = (scheduleId: string) => {
    const res = storageService.deletePreventiveSchedule(scheduleId, authenticatedUser || undefined);
    setPreventiveSchedules(res.schedules);
    setLogs(res.logs);
  };

  const handleCompletePreventiveCycle = (scheduleId: string) => {
    const res = storageService.completePreventiveCycle(scheduleId, authenticatedUser || undefined);
    setPreventiveSchedules(res.schedules);
    setLogs(res.logs);
  };

  // Data Restored from Backup
  const handleDataRestored = () => {
    setAssets(storageService.getAssets());
    setTickets(storageService.getTickets());
    setSpareParts(storageService.getSpareParts());
    setPreventiveSchedules(storageService.getPreventiveSchedules());
    setAccounts(storageService.getAccounts());
    setLogs(storageService.getLogs());
    setDataModalOpen(false);
  };

  // Clear Logs
  const handleClearLogs = () => {
    const updated = storageService.clearLogs();
    setLogs(updated);
  };

  // 1. IF NOT LOGGED IN -> RENDER AUTH VIEW
  if (!authenticatedUser) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. IF LOGGED IN BUT ZERO PERMISSIONS / PENDING -> RENDER PENDING APPROVAL SCREEN
  if (authenticatedUser.status === 'pending' || (authenticatedUser.permissions.length === 0 && authenticatedUser.role !== 'admin')) {
    return (
      <PendingApprovalView
        user={authenticatedUser}
        onRefreshUser={handleRefreshUser}
        onLogout={handleLogout}
      />
    );
  }

  // Counts for Sidebar
  const lowStockCount = spareParts.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock').length;
  const activePreventiveCount = preventiveSchedules.filter(s => s.status === 'due_today' || s.status === 'overdue').length;
  const pendingUsersCount = accounts.filter(a => a.status === 'pending' || a.permissions.length === 0).length;

  return (
    <div className="app-container">
      <div className="bg-ambient" />

      {/* Left / Right Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        ticketCount={tickets.length}
        assetCount={assets.length}
        lowStockCount={lowStockCount}
        activePreventiveCount={activePreventiveCount}
        logCount={logs.length}
        pendingUsersCount={pendingUsersCount}
        currentUser={authenticatedUser}
        onLogout={handleLogout}
      />

      {/* Main Area */}
      <div className="main-content">
        {/* Top Header Bar */}
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          onNewTicket={() => handleOpenNewTicket()}
          onNewAsset={handleOpenNewAsset}
          onOpenQRScanner={() => setQrScannerOpen(true)}
          onOpenBatchQR={() => setBatchQRModalOpen(true)}
          onOpenDataManagement={() => setDataModalOpen(true)}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          assets={assets}
          tickets={tickets}
          currentUser={authenticatedUser}
          onLogout={handleLogout}
        />

        {/* View Routing with Permission Guards */}
        {activeTab === 'dashboard' && permittedTabs.includes('dashboard') && (
          <DashboardView
            assets={assets}
            tickets={tickets}
            spareParts={spareParts}
            preventiveSchedules={preventiveSchedules}
            logs={logs}
            currentUser={authenticatedUser}
            onViewTicketReport={(ticket) => setOfficialReportTicket(ticket)}
            onEditTicket={handleOpenEditTicket}
            onSelectAsset={(asset) => setDetailsAsset(asset)}
            onNavigateToTab={setActiveTab}
            onNewTicket={() => handleOpenNewTicket()}
          />
        )}

        {activeTab === 'tickets' && permittedTabs.includes('tickets') && (
          <TicketsView
            tickets={tickets}
            assets={assets}
            onNewTicket={() => handleOpenNewTicket()}
            onEditTicket={handleOpenEditTicket}
            onDeleteTicket={handleDeleteTicket}
            onViewReport={(ticket) => setOfficialReportTicket(ticket)}
            onSelectAsset={(asset) => setDetailsAsset(asset)}
          />
        )}

        {activeTab === 'assets' && permittedTabs.includes('assets') && (
          <AssetsView
            assets={assets}
            onNewAsset={handleOpenNewAsset}
            onEditAsset={handleOpenEditAsset}
            onDeleteAsset={handleDeleteAsset}
            onSelectAsset={(asset) => setDetailsAsset(asset)}
            onNewTicketForAsset={(assetId) => handleOpenNewTicket(assetId)}
          />
        )}

        {activeTab === 'inventory' && permittedTabs.includes('inventory') && (
          <InventoryView
            spareParts={spareParts}
            onUpdateStock={handleUpdateStock}
            onSavePart={handleSaveNewPart}
            onUpdatePart={handleUpdateSparePart}
            onDeletePart={handleDeleteSparePart}
          />
        )}

        {activeTab === 'preventive' && permittedTabs.includes('preventive') && (
          <PreventiveView
            schedules={preventiveSchedules}
            onToggleCheckItem={handleToggleChecklist}
            onSaveSchedule={handleSavePreventiveSchedule}
            onDeleteSchedule={handleDeletePreventiveSchedule}
            onCompleteCycle={handleCompletePreventiveCycle}
          />
        )}

        {activeTab === 'logs' && permittedTabs.includes('logs') && (
          <ActivityLogView
            logs={logs}
            assets={assets}
            tickets={tickets}
            users={accounts.map(a => ({ id: a.id, name: a.name, role: a.jobTitle, department: a.department }))}
            onSelectAsset={(asset) => setDetailsAsset(asset)}
            onViewTicketReport={(ticket) => setOfficialReportTicket(ticket)}
            onClearLogs={handleClearLogs}
          />
        )}

        {activeTab === 'user_management' && permittedTabs.includes('user_management') && (
          <UserManagementView
            accounts={accounts}
            currentUser={authenticatedUser}
            onUpdatePermissions={handleUpdatePermissions}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
      </div>

      {/* ===================== MODALS ===================== */}

      {/* 1. Official Report Modal (2-Pages / Print / PDF Export) */}
      {officialReportTicket && (
        <OfficialReportModal
          ticket={officialReportTicket}
          asset={assets.find(a => a.id === officialReportTicket.assetId)}
          onClose={() => setOfficialReportTicket(null)}
        />
      )}

      {/* 2. New / Edit Ticket Modal */}
      {ticketModalOpen && (
        <TicketFormModal
          initialTicket={editingTicket}
          initialAssetId={newTicketAssetId}
          assets={assets}
          spareParts={spareParts}
          onSave={handleSaveTicket}
          onClose={() => {
            setTicketModalOpen(false);
            setEditingTicket(null);
            setNewTicketAssetId(undefined);
          }}
        />
      )}

      {/* 3. New / Edit Asset Modal */}
      {assetModalOpen && (
        <AssetFormModal
          initialAsset={editingAsset}
          onSave={handleSaveAsset}
          onClose={() => {
            setAssetModalOpen(false);
            setEditingAsset(null);
          }}
        />
      )}

      {/* 4. Asset Details & Maintenance Timeline Modal */}
      {detailsAsset && (
        <AssetDetailsModal
          asset={detailsAsset}
          tickets={tickets}
          logs={logs}
          onEditAsset={(asset) => {
            setDetailsAsset(null);
            handleOpenEditAsset(asset);
          }}
          onNewTicketForAsset={(assetId) => {
            setDetailsAsset(null);
            handleOpenNewTicket(assetId);
          }}
          onViewTicketReport={(ticket) => {
            setDetailsAsset(null);
            setOfficialReportTicket(ticket);
          }}
          onClose={() => setDetailsAsset(null)}
        />
      )}

      {/* 5. QR Scanner Modal */}
      {qrScannerOpen && (
        <QRScannerModal
          assets={assets}
          onSelectAsset={(asset) => {
            setQrScannerOpen(false);
            setDetailsAsset(asset);
          }}
          onClose={() => setQrScannerOpen(false)}
        />
      )}

      {/* 6. Batch QR Sticker Print Modal */}
      {batchQRModalOpen && (
        <BatchQRPrintModal
          assets={assets}
          onClose={() => setBatchQRModalOpen(false)}
        />
      )}

      {/* 7. Data Management & Backup/Restore Modal */}
      {dataModalOpen && (
        <DataManagementModal
          onDataRestored={handleDataRestored}
          onClose={() => setDataModalOpen(false)}
        />
      )}

    </div>
  );
};

export default App;

