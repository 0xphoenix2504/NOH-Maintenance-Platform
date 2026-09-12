import { useState, useEffect } from 'react';
import type { Asset, MaintenanceTicket, SparePartInventoryItem, PreventiveScheduleItem } from './types';
import { storageService } from './services/storageService';
import { Sidebar } from './components/Sidebar';
import type { NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TicketsView } from './components/TicketsView';
import { AssetsView } from './components/AssetsView';
import { InventoryView } from './components/InventoryView';
import { PreventiveView } from './components/PreventiveView';
import { OfficialReportModal } from './components/OfficialReportModal';
import { TicketFormModal } from './components/TicketFormModal';
import { AssetFormModal } from './components/AssetFormModal';
import { AssetDetailsModal } from './components/AssetDetailsModal';
import { QRScannerModal } from './components/QRScannerModal';

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

  // Main Navigation Tab
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');

  // Core Data States
  const [assets, setAssets] = useState<Asset[]>(() => storageService.getAssets());
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(() => storageService.getTickets());
  const [spareParts, setSpareParts] = useState<SparePartInventoryItem[]>(() => storageService.getSpareParts());
  const [preventiveSchedules, setPreventiveSchedules] = useState<PreventiveScheduleItem[]>(() => storageService.getPreventiveSchedules());

  // Modals States
  const [officialReportTicket, setOfficialReportTicket] = useState<MaintenanceTicket | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<MaintenanceTicket | null>(null);
  const [newTicketAssetId, setNewTicketAssetId] = useState<string | undefined>(undefined);

  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const [detailsAsset, setDetailsAsset] = useState<Asset | null>(null);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  // Ticket Operations
  const handleSaveTicket = (ticket: MaintenanceTicket) => {
    if (editingTicket) {
      const updated = storageService.updateTicket(ticket);
      setTickets(updated);
    } else {
      const updated = storageService.addTicket(ticket);
      setTickets(updated);
    }
    // Refresh assets in case status changed
    setAssets(storageService.getAssets());
    setTicketModalOpen(false);
    setEditingTicket(null);
    setNewTicketAssetId(undefined);
  };

  const handleDeleteTicket = (ticketId: string) => {
    const updated = storageService.deleteTicket(ticketId);
    setTickets(updated);
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

  // Asset Operations
  const handleSaveAsset = (asset: Asset) => {
    if (editingAsset) {
      const updated = storageService.updateAsset(asset);
      setAssets(updated);
    } else {
      const updated = storageService.addAsset(asset);
      setAssets(updated);
    }
    setAssetModalOpen(false);
    setEditingAsset(null);
  };

  const handleDeleteAsset = (assetId: string) => {
    const updated = storageService.deleteAsset(assetId);
    setAssets(updated);
  };

  const handleOpenNewAsset = () => {
    setEditingAsset(null);
    setAssetModalOpen(true);
  };

  const handleOpenEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setAssetModalOpen(true);
  };

  // Inventory Operations
  const handleUpdateStock = (partId: string, delta: number) => {
    const updated = storageService.updateSparePartStock(partId, delta);
    setSpareParts(updated);
  };

  const handleSaveNewPart = (newPart: SparePartInventoryItem) => {
    const current = storageService.getSpareParts();
    const updated = [newPart, ...current];
    storageService.saveSpareParts(updated);
    setSpareParts(updated);
  };

  // Preventive Checklist Operations
  const handleToggleChecklist = (scheduleId: string, checkId: string) => {
    const updated = storageService.toggleChecklistItem(scheduleId, checkId);
    setPreventiveSchedules(updated);
  };

  // Counts for Sidebar
  const lowStockCount = spareParts.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock').length;
  const activePreventiveCount = preventiveSchedules.filter(s => s.status === 'due_today' || s.status === 'overdue').length;

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
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          assets={assets}
          tickets={tickets}
        />

        {/* View Routing */}
        {activeTab === 'dashboard' && (
          <DashboardView
            assets={assets}
            tickets={tickets}
            spareParts={spareParts}
            preventiveSchedules={preventiveSchedules}
            onViewTicketReport={(ticket) => setOfficialReportTicket(ticket)}
            onEditTicket={handleOpenEditTicket}
            onSelectAsset={(asset) => setDetailsAsset(asset)}
            onNavigateToTab={setActiveTab}
            onNewTicket={() => handleOpenNewTicket()}
          />
        )}

        {activeTab === 'tickets' && (
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

        {activeTab === 'assets' && (
          <AssetsView
            assets={assets}
            onNewAsset={handleOpenNewAsset}
            onEditAsset={handleOpenEditAsset}
            onDeleteAsset={handleDeleteAsset}
            onSelectAsset={(asset) => setDetailsAsset(asset)}
            onNewTicketForAsset={(assetId) => handleOpenNewTicket(assetId)}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            spareParts={spareParts}
            onUpdateStock={handleUpdateStock}
            onSavePart={handleSaveNewPart}
          />
        )}

        {activeTab === 'preventive' && (
          <PreventiveView
            schedules={preventiveSchedules}
            onToggleCheckItem={handleToggleChecklist}
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

    </div>
  );
};

export default App;
