import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Laptop,
  Package,
  CalendarCheck,
  History,
  ShieldCheck,
  UserCheck,
  LogOut
} from 'lucide-react';
import type { UserAccount, UserProfile, PermissionKey } from '../types';

export type NavTab = 'dashboard' | 'tickets' | 'assets' | 'inventory' | 'preventive' | 'logs' | 'user_management';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  ticketCount: number;
  assetCount: number;
  lowStockCount: number;
  activePreventiveCount: number;
  logCount?: number;
  pendingUsersCount?: number;
  currentUser?: UserAccount | UserProfile;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  ticketCount,
  assetCount,
  lowStockCount,
  activePreventiveCount,
  logCount = 0,
  pendingUsersCount = 0,
  currentUser,
  onLogout
}) => {
  const userPerms: PermissionKey[] = currentUser?.permissions || [];
  const isAdmin = currentUser?.role === 'admin' || userPerms.includes('user_management');

  const allNavItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'لوحة التحكم والتحليلات',
      icon: LayoutDashboard,
      badge: null,
      requiredPerm: 'dashboard' as PermissionKey
    },
    {
      id: 'tickets' as NavTab,
      label: 'تقارير وتذاكر الصيانة',
      icon: FileText,
      badge: ticketCount,
      requiredPerm: 'tickets' as PermissionKey
    },
    {
      id: 'assets' as NavTab,
      label: 'سجل الأجهزة والعهد',
      icon: Laptop,
      badge: assetCount,
      requiredPerm: 'assets' as PermissionKey
    },
    {
      id: 'inventory' as NavTab,
      label: 'قطع الغيار والمخزون',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} ناقص` : null,
      badgeVariant: lowStockCount > 0 ? 'badge-damaged' : '',
      requiredPerm: 'inventory' as PermissionKey
    },
    {
      id: 'preventive' as NavTab,
      label: 'الصيانة الوقائية الدورية',
      icon: CalendarCheck,
      badge: activePreventiveCount > 0 ? activePreventiveCount : null,
      requiredPerm: 'preventive' as PermissionKey
    },
    {
      id: 'logs' as NavTab,
      label: 'سجل النشاطات والتعديلات',
      icon: History,
      badge: logCount > 0 ? logCount : null,
      requiredPerm: 'logs' as PermissionKey
    },
    {
      id: 'user_management' as NavTab,
      label: 'إدارة المستخدمين والصلاحيات',
      icon: ShieldCheck,
      badge: pendingUsersCount > 0 ? `${pendingUsersCount} جديد` : null,
      badgeVariant: pendingUsersCount > 0 ? 'badge-needs-parts' : '',
      requiredPerm: 'user_management' as PermissionKey
    }
  ];

  // Filter nav items based on user permissions
  const permittedNavItems = allNavItems.filter(item => {
    if (isAdmin) return true;
    return userPerms.includes(item.requiredPerm);
  });

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
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
          border: '1px solid var(--border-color)',
          padding: '3px',
          flexShrink: 0
        }}>
          <img src="/logo.png" alt="شعار مستشفى نيل الأمل" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
      <div style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0 0.5rem 0.4rem 0.5rem' }}>
          الأقسام المصرح بها
        </div>

        {permittedNavItems.map(item => {
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

        {permittedNavItems.length === 0 && (
          <div style={{ padding: '1.5rem 0.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            لا توجد أقسام مفعلة لحسابك حالياً
          </div>
        )}
      </div>

      {/* User Profile & Logout Footer */}
      <div style={{
        padding: '0.85rem 1rem',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-card-hover)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: isAdmin ? '#f5f3ff' : '#e0f2fe',
            color: isAdmin ? '#7c3aed' : '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {isAdmin ? <ShieldCheck size={18} /> : <UserCheck size={18} />}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser?.name || 'مستخدم النظام'}
            </div>
            <div style={{ fontSize: '0.7rem', color: isAdmin ? '#7c3aed' : 'var(--primary)', fontWeight: 700 }}>
              {isAdmin ? 'مدير النظام (Admin)' : (currentUser?.role || 'فني صيانة')}
            </div>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center', color: '#ef4444', padding: '0.35rem' }}
            title="تسجيل الخروج من الحساب"
          >
            <LogOut size={14} />
            <span>تسجيل الخروج</span>
          </button>
        )}
      </div>
    </aside>
  );
};
