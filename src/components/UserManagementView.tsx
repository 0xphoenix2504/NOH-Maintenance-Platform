import { useState, useMemo } from 'react';
import type { UserAccount, PermissionKey, UserRole, AccountStatus } from '../types';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
  Edit,
  Trash2,
  X,
  Check,
  Layers,
  Laptop,
  FileText,
  Package,
  CalendarCheck,
  History
} from 'lucide-react';

interface UserManagementViewProps {
  accounts: UserAccount[];
  currentUser: UserAccount;
  onUpdatePermissions: (userId: string, permissions: PermissionKey[], role: UserRole, status: AccountStatus) => void;
  onDeleteAccount: (userId: string) => void;
}

const ALL_PERMISSIONS: Array<{ key: PermissionKey; title: string; description: string; icon: any; color: string }> = [
  {
    key: 'dashboard',
    title: 'لوحة التحكم والتحليلات',
    description: 'الوصول للمؤشرات الرئيسية، الإحصائيات، وتوزيع الأعطال',
    icon: Layers,
    color: '#0284c7'
  },
  {
    key: 'tickets',
    title: 'تقارير وتذاكر الصيانة',
    description: 'تسجيل وتعديل تقارير الصيانة الرسمية وتصديرها PDF',
    icon: FileText,
    color: '#d97706'
  },
  {
    key: 'assets',
    title: 'سجل الأجهزة والعهد',
    description: 'إضافة وتعديل الأجهزة والباركود QR وتعيين العهد للأقسام',
    icon: Laptop,
    color: '#10b981'
  },
  {
    key: 'inventory',
    title: 'قطع الغيار والمخزون',
    description: 'إدارة رصيد قطع الغيار، حركات الصرف، وأسعار الشراء',
    icon: Package,
    color: '#8b5cf6'
  },
  {
    key: 'preventive',
    title: 'الصيانة الوقائية الدورية',
    description: 'متابعة وإنجاز بنود الفحص الوقائي لأجهزة العمليات والرعاية',
    icon: CalendarCheck,
    color: '#06b6d4'
  },
  {
    key: 'logs',
    title: 'سجل النشاطات والتعديلات',
    description: 'تتبع الحركات والعمليات التي تتم على النظام (Audit Log)',
    icon: History,
    color: '#64748b'
  },
  {
    key: 'user_management',
    title: 'إدارة المستخدمين والصلاحيات',
    description: 'اعتماد الحسابات الجديدة وتحديد صلاحيات كل مستخدم (Admin)',
    icon: ShieldCheck,
    color: '#dc2626'
  }
];

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  accounts,
  currentUser,
  onUpdatePermissions,
  onDeleteAccount
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Editing modal state
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole>('technician');
  const [selectedStatus, setSelectedStatus] = useState<AccountStatus>('active');

  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null);

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = acc.name.toLowerCase().includes(query);
        const matchUsername = acc.username.toLowerCase().includes(query);
        const matchDept = acc.department.toLowerCase().includes(query);
        const matchJob = acc.jobTitle.toLowerCase().includes(query);
        if (!matchName && !matchUsername && !matchDept && !matchJob) return false;
      }

      if (filterRole !== 'all' && acc.role !== filterRole) return false;
      if (filterStatus !== 'all' && acc.status !== filterStatus) return false;

      return true;
    });
  }, [accounts, searchTerm, filterRole, filterStatus]);

  // Statistics
  const totalCount = accounts.length;
  const pendingCount = accounts.filter(a => a.status === 'pending' || a.permissions.length === 0).length;
  const activeCount = accounts.filter(a => a.status === 'active' && a.permissions.length > 0).length;
  const adminCount = accounts.filter(a => a.role === 'admin').length;

  const handleOpenEditModal = (user: UserAccount) => {
    setEditingUser(user);
    setSelectedPermissions([...user.permissions]);
    setSelectedRole(user.role);
    setSelectedStatus(user.status);
  };

  const handleTogglePermission = (permKey: PermissionKey) => {
    if (selectedPermissions.includes(permKey)) {
      setSelectedPermissions(selectedPermissions.filter(k => k !== permKey));
    } else {
      setSelectedPermissions([...selectedPermissions, permKey]);
    }
  };

  // Preset role helpers
  const applyPreset = (presetType: 'admin' | 'tech' | 'viewer' | 'clear') => {
    if (presetType === 'admin') {
      setSelectedRole('admin');
      setSelectedPermissions(ALL_PERMISSIONS.map(p => p.key));
      setSelectedStatus('active');
    } else if (presetType === 'tech') {
      setSelectedRole('technician');
      setSelectedPermissions(['dashboard', 'tickets', 'assets', 'inventory', 'preventive', 'logs']);
      setSelectedStatus('active');
    } else if (presetType === 'viewer') {
      setSelectedRole('user');
      setSelectedPermissions(['dashboard', 'tickets', 'assets']);
      setSelectedStatus('active');
    } else if (presetType === 'clear') {
      setSelectedPermissions([]);
    }
  };

  const handleSavePermissions = () => {
    if (!editingUser) return;
    onUpdatePermissions(editingUser.id, selectedPermissions, selectedRole, selectedStatus);
    setEditingUser(null);
  };

  // Quick Approve Pending User
  const handleQuickApprove = (user: UserAccount) => {
    onUpdatePermissions(
      user.id,
      ['dashboard', 'tickets', 'assets', 'inventory', 'preventive', 'logs'],
      'technician',
      'active'
    );
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 900 }}>إدارة المستخدمين والصلاحيات (User Roles & Access Control)</h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                اعتماد الحسابات الجديدة وتحديد الصلاحيات والأقسام المسموح لكل مستخدم برؤيتها والتعديل عليها
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>إجمالي الحسابات</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900 }}>{totalCount} مستخدم</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>بانتظار الموافقة والاعتماد</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: pendingCount > 0 ? '#d97706' : 'var(--text-primary)' }}>
              {pendingCount} حسابات
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>حسابات نشطة ومفعلة</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#059669' }}>{activeCount} حساب</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>مدراء النظام (Admins)</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#7c3aed' }}>{adminCount}</div>
          </div>
        </div>
      </div>

      {/* Pending Approval Urgent Banner */}
      {pendingCount > 0 && (
        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(217, 119, 6, 0.4)', background: 'rgba(217, 119, 6, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} color="#d97706" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#d97706' }}>
                تنبيه: هناك {pendingCount} حسابات جديدة بانتظار تحديد الصلاحيات
              </h3>
            </div>
            <span className="badge badge-needs-parts">حسابات معلقة حالياً</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.75rem' }}>
            {accounts.filter(a => a.status === 'pending' || a.permissions.length === 0).map(pendingUser => (
              <div
                key={pendingUser.id}
                style={{
                  background: 'var(--bg-secondary)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {pendingUser.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {pendingUser.jobTitle} • {pendingUser.department}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    @{pendingUser.username}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => handleQuickApprove(pendingUser)}
                    className="btn btn-primary btn-sm"
                    title="اعتماد سريع كفني صيانة كامل"
                  >
                    <Check size={14} />
                    <span>اعتماد سريع</span>
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(pendingUser)}
                    className="btn btn-secondary btn-sm"
                    title="تحديد الصلاحيات المخصصة"
                  >
                    <Edit size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Bar: Search & Filters */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingRight: '2.4rem' }}
            placeholder="بحث بالاسم، اسم المستخدم، القسم، أو المسمى الوظيفي..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            className="form-control form-control-sm"
            style={{ minWidth: '130px' }}
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">كافة الأدوار</option>
            <option value="admin">مدير نظام (Admin)</option>
            <option value="technician">فني صيانة</option>
            <option value="user">مستخدم عادي</option>
          </select>

          <select
            className="form-control form-control-sm"
            style={{ minWidth: '130px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">كافة الحالات</option>
            <option value="active">نشط ومفعل</option>
            <option value="pending">بانتظار الموافقة</option>
            <option value="suspended">موقوف</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>سجل المستخدمين والصلاحيات الممنوحة</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            إجمالي المطابق: {filteredAccounts.length} مستخدم
          </span>
        </div>

        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>المستخدم</th>
                <th>اسم الحساب</th>
                <th>القسم / الوظيفة</th>
                <th>الدور</th>
                <th>الحالة</th>
                <th>الأقسام المصرح بها</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map(account => {
                const isAdmin = account.role === 'admin';
                const isPending = account.status === 'pending' || account.permissions.length === 0;
                const isSuspended = account.status === 'suspended';

                return (
                  <tr key={account.id}>
                    <td>
                      <strong>{account.name}</strong>
                      {account.id === currentUser.id && (
                        <span className="badge badge-spare" style={{ marginRight: '6px', fontSize: '0.7rem' }}>
                          أنت (الحساب الحالي)
                        </span>
                      )}
                    </td>

                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        @{account.username}
                      </span>
                    </td>

                    <td>
                      <div>{account.department}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{account.jobTitle}</div>
                    </td>

                    <td>
                      {isAdmin ? (
                        <span className="badge" style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid rgba(124, 58, 237, 0.3)' }}>
                          👑 مدير نظام
                        </span>
                      ) : account.role === 'technician' ? (
                        <span className="badge badge-spare">
                          🔧 فني صيانة
                        </span>
                      ) : (
                        <span className="badge">
                          👤 مستخدم
                        </span>
                      )}
                    </td>

                    <td>
                      {isSuspended ? (
                        <span className="badge badge-damaged">
                          <UserX size={12} /> موقوف
                        </span>
                      ) : isPending ? (
                        <span className="badge badge-needs-parts">
                          <Clock size={12} /> بانتظار الاعتماد
                        </span>
                      ) : (
                        <span className="badge badge-operational">
                          <CheckCircle2 size={12} /> نشط ({account.permissions.length})
                        </span>
                      )}
                    </td>

                    <td>
                      {account.permissions.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', maxWidth: '320px' }}>
                          {account.permissions.map(permKey => {
                            const pMeta = ALL_PERMISSIONS.find(p => p.key === permKey);
                            return (
                              <span
                                key={permKey}
                                style={{
                                  fontSize: '0.7rem',
                                  background: 'var(--bg-card-hover)',
                                  color: 'var(--text-primary)',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid var(--border-color)'
                                }}
                              >
                                {pMeta?.title.split(' ')[0] || permKey}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#ef4444', fontStyle: 'italic' }}>
                          ⚠️ لا توجد أي صلاحيات
                        </span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => handleOpenEditModal(account)}
                          className="btn btn-primary btn-sm"
                          title="تعديل الصلاحيات والأدوار"
                        >
                          <Edit size={14} />
                          <span>الصلاحيات</span>
                        </button>

                        {account.id !== currentUser.id && account.username !== 'admin' && (
                          <button
                            onClick={() => setDeletingUser(account)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.3rem 0.5rem' }}
                            title="حذف الحساب"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== EDIT PERMISSIONS MODAL ===================== */}
      {editingUser && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '8px' }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                    تحديد صلاحيات الحساب: {editingUser.name}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    @{editingUser.username} • {editingUser.department}
                  </p>
                </div>
              </div>
              <button onClick={() => setEditingUser(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Role & Status Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-card-hover)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">الدور الوظيفي (Role)</label>
                  <select
                    className="form-control"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  >
                    <option value="admin">👑 مدير نظام كامل (Admin)</option>
                    <option value="technician">🔧 مهندس صيانة (Technician)</option>
                    <option value="user">👤 مستخدم / مسؤول عهدة (User)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">حالة الحساب (Account Status)</label>
                  <select
                    className="form-control"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as AccountStatus)}
                  >
                    <option value="active">🟢 نشط ومفعل (Active)</option>
                    <option value="pending">🟡 بانتظار الاعتماد (Pending)</option>
                    <option value="suspended">🔴 موقوف (Suspended)</option>
                  </select>
                </div>
              </div>

              {/* Quick Presets Buttons */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.4rem' }}>
                  قوالب الصلاحيات السريعة (Quick Presets):
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  <button
                    type="button"
                    onClick={() => applyPreset('admin')}
                    className="btn btn-secondary btn-sm"
                  >
                    👑 مدير نظام (كامل الصلاحيات)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('tech')}
                    className="btn btn-secondary btn-sm"
                  >
                    🔧 فني صيانة (تشغيلية كاملة)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('viewer')}
                    className="btn btn-secondary btn-sm"
                  >
                    👁️ مشاهدة فقط (لوحة التحكم والأجهزة)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('clear')}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#ef4444' }}
                  >
                    🚫 تصفير الصلاحيات
                  </button>
                </div>
              </div>

              {/* Granular Permission Checkbox Cards */}
              <div>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
                  الأقسام المصرح له بالدخول إليها ({selectedPermissions.length} من {ALL_PERMISSIONS.length}):
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                  {ALL_PERMISSIONS.map(perm => {
                    const isChecked = selectedPermissions.includes(perm.key);
                    const Icon = perm.icon;

                    return (
                      <div
                        key={perm.key}
                        onClick={() => handleTogglePermission(perm.key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          border: isChecked ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          background: isChecked ? 'var(--primary-light)' : 'var(--bg-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            background: isChecked ? '#0284c7' : 'var(--bg-card-hover)',
                            color: isChecked ? 'white' : perm.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Icon size={18} />
                          </div>

                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: isChecked ? 'var(--primary)' : 'var(--text-primary)' }}>
                              {perm.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: isChecked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                              {perm.description}
                            </div>
                          </div>
                        </div>

                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          border: isChecked ? 'none' : '2px solid var(--border-color)',
                          background: isChecked ? 'var(--primary)' : 'transparent',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {isChecked && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="modal-footer">
              <button onClick={() => setEditingUser(null)} className="btn btn-secondary">
                إلغاء
              </button>
              <button onClick={handleSavePermissions} className="btn btn-primary btn-lg">
                <Check size={18} />
                حفظ واعتماد الصلاحيات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== DELETE CONFIRM MODAL ===================== */}
      {deletingUser && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444' }}>
                تأكيد حذف الحساب
              </h3>
              <button onClick={() => setDeletingUser(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                هل أنت متأكد من رغبتك في حذف حساب المستخدم <strong>{deletingUser.name}</strong> (@{deletingUser.username}) نهائياً؟
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeletingUser(null)} className="btn btn-secondary">
                إلغاء
              </button>
              <button
                onClick={() => {
                  onDeleteAccount(deletingUser.id);
                  setDeletingUser(null);
                }}
                className="btn btn-danger"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
