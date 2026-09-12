import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Laptop,
  Package,
  CalendarCheck,
  UserCheck
} from 'lucide-react';

export type NavTab = 'dashboard' | 'tickets' | 'assets' | 'inventory' | 'preventive';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  ticketCount: number;
  assetCount: number;
  lowStockCount: number;
  activePreventiveCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  ticketCount,
  assetCount,
  lowStockCount,
  activePreventiveCount
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'لوحة التحكم والتحليلات',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'tickets' as NavTab,
      label: 'تقارير وتذاكر الصيانة',
      icon: FileText,
      badge: ticketCount
    },
    {
      id: 'assets' as NavTab,
      label: 'سجل الأجهزة والعهد',
      icon: Laptop,
      badge: assetCount
    },
    {
      id: 'inventory' as NavTab,
      label: 'قطع الغيار والمخزون',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} ناقص` : null,
      badgeVariant: lowStockCount > 0 ? 'badge-damaged' : ''
    },
    {
      id: 'preventive' as NavTab,
      label: 'الصيانة الوقائية الدورية',
      icon: CalendarCheck,
      badge: activePreventiveCount > 0 ? activePreventiveCount : null
    }
  ];

  return (
    <aside className="sidebar-wrapper">
      {/* Brand Header */}
      <div style={{
        padding: '1.25rem 1.25rem 1rem 1.25rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 900,
          fontSize: '1.2rem',
          boxShadow: '0 4px 12px var(--primary-glow)',
          flexShrink: 0
        }}>
          NH
        </div>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            مستشفى نيل الأمل
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
            قسم تكنولوجيا المعلومات IT
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <div style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0 0.5rem 0.4rem 0.5rem' }}>
          القائمة الرئيسية
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.7rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'right',
                width: '100%'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Icon size={18} color={isActive ? 'var(--primary)' : 'currentColor'} />
                <span>{item.label}</span>
              </div>

              {item.badge !== null && (
                <span className={`badge ${item.badgeVariant || (isActive ? 'badge-spare' : '')}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Technician / System Badge Footer */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-card-hover)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: '#e0f2fe',
          color: '#0284c7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <UserCheck size={18} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            ENG Abdelrahman
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            مهندس الصيانة المسؤول
          </div>
        </div>
      </div>
    </aside>
  );
};
