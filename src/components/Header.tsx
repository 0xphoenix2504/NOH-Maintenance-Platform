import React from 'react';
import type { Asset, MaintenanceTicket, UserProfile } from '../types';
import { QrCode, Plus, Search, Sun, Moon, Bell, Laptop, UserCheck } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNewTicket: () => void;
  onNewAsset: () => void;
  onOpenQRScanner: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  assets?: Asset[];
  tickets: MaintenanceTicket[];
  currentUser?: UserProfile;
  onOpenUserSwitcher?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onNewTicket,
  onNewAsset,
  onOpenQRScanner,
  searchQuery,
  onSearchChange,
  tickets,
  currentUser,
  onOpenUserSwitcher
}) => {
  const pendingPartsCount = tickets.filter(t => t.statusAfterMaintenance === 'needs_parts' || t.status === 'pending_parts').length;

  return (
    <header className="glass-panel" style={{
      borderRadius: 0,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      padding: '0.85rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      {/* Search and Quick Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '480px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={17} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingRight: '2.4rem', borderRadius: 'var(--radius-full)' }}
            placeholder="بحث بالكود، السيريال، اسم الموظف، أو القسم..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        
        {/* QR Scanner Trigger */}
        <button
          onClick={onOpenQRScanner}
          className="btn btn-secondary btn-sm"
          title="مسح كود QR أو باركود الجهاز"
        >
          <QrCode size={16} />
          <span>مسح QR</span>
        </button>

        {/* New Asset Button */}
        <button
          onClick={onNewAsset}
          className="btn btn-secondary btn-sm"
          title="إضافة جهاز جديد إلى السجل"
        >
          <Laptop size={16} />
          <span>إضافة جهاز</span>
        </button>

        {/* New Ticket Button */}
        <button
          onClick={onNewTicket}
          className="btn btn-primary btn-sm"
          style={{ padding: '0.45rem 1rem' }}
        >
          <Plus size={16} />
          <span>تسجيل بلاغ صيانة</span>
        </button>

        {/* Active User Switcher Pill */}
        <button
          onClick={onOpenUserSwitcher}
          className="btn btn-secondary btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-color)',
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-full)'
          }}
          title="تبديل المستخدم النشط لتسجيل الإجراءات باسمه"
        >
          <div style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: '#0284c7',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 800
          }}>
            <UserCheck size={12} />
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>
            {currentUser?.name || 'ENG Abdelrahman'}
          </span>
        </button>

        {/* Notifications indicator */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.5rem', borderRadius: '50%', position: 'relative' }}
            title="التنبيهات والأجهزة المعلقة"
          >
            <Bell size={17} />
            {pendingPartsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: '#ef4444',
                color: 'white',
                fontSize: '10px',
                fontWeight: 900,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--bg-secondary)'
              }}>
                {pendingPartsCount}
              </span>
            )}
          </button>
        </div>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.5rem', borderRadius: '50%' }}
          title={theme === 'dark' ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
        >
          {theme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#0284c7" />}
        </button>

      </div>
    </header>
  );
};
