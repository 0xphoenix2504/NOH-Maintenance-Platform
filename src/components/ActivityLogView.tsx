import { useState, useMemo } from 'react';
import type { AuditLog, LogActionType, LogTargetType, Asset, MaintenanceTicket, UserProfile } from '../types';
import {
  History,
  Search,
  Download,
  Trash2,
  PlusCircle,
  Edit3,
  RefreshCw,
  Package,
  Laptop,
  FileText,
  CalendarCheck,
  User,
  Clock,
  Eye,
  X,
  Sparkles,
  Layers
} from 'lucide-react';

interface ActivityLogViewProps {
  logs: AuditLog[];
  assets: Asset[];
  tickets: MaintenanceTicket[];
  users: UserProfile[];
  onSelectAsset?: (asset: Asset) => void;
  onViewTicketReport?: (ticket: MaintenanceTicket) => void;
  onClearLogs: () => void;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({
  logs,
  assets,
  tickets,
  users,
  onSelectAsset,
  onViewTicketReport,
  onClearLogs
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');
  const [selectedTargetType, setSelectedTargetType] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');

  const [inspectingLog, setInspectingLog] = useState<AuditLog | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Time formatting helpers
  const formatTimeAgo = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'الآن';
      if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      if (diffDays === 1) return 'أمس';
      if (diffDays < 30) return `منذ ${diffDays} يوم`;
      return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoDate;
    }
  };

  const formatExactDate = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      return date.toLocaleString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return isoDate;
    }
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchDesc = log.description?.toLowerCase().includes(query);
        const matchUser = log.userName?.toLowerCase().includes(query);
        const matchTargetId = log.targetId?.toLowerCase().includes(query);
        const matchTargetTitle = log.targetTitle?.toLowerCase().includes(query);
        const matchExtra = log.details?.extraInfo?.toLowerCase().includes(query);
        if (!matchDesc && !matchUser && !matchTargetId && !matchTargetTitle && !matchExtra) {
          return false;
        }
      }

      // Action type
      if (selectedActionType !== 'all' && log.actionType !== selectedActionType) {
        return false;
      }

      // Target type
      if (selectedTargetType !== 'all' && log.targetType !== selectedTargetType) {
        return false;
      }

      // User filter
      if (selectedUser !== 'all' && log.userName !== selectedUser) {
        return false;
      }

      // Time range filter
      if (selectedTimeRange !== 'all') {
        const logDate = new Date(log.timestamp).getTime();
        const now = new Date().getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;

        if (selectedTimeRange === 'today') {
          if (now - logDate > oneDayMs) return false;
        } else if (selectedTimeRange === 'week') {
          if (now - logDate > 7 * oneDayMs) return false;
        } else if (selectedTimeRange === 'month') {
          if (now - logDate > 30 * oneDayMs) return false;
        }
      }

      return true;
    });
  }, [logs, searchTerm, selectedActionType, selectedTargetType, selectedUser, selectedTimeRange]);

  // Statistics
  const totalLogsCount = logs.length;
  const createsCount = logs.filter(l => l.actionType === 'create').length;
  const updatesCount = logs.filter(l => l.actionType === 'update' || l.actionType === 'status_change').length;
  const stockCount = logs.filter(l => l.actionType === 'stock_adjust').length;
  const deletesCount = logs.filter(l => l.actionType === 'delete').length;

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['التوقيت', 'المستخدم', 'الوظيفة', 'نوع العملية', 'نوع الهدف', 'كود الهدف', 'العنوان', 'الوصف', 'ملاحظات إضافية'];
    const rows = filteredLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      `"${l.userRole || ''}"`,
      `"${l.actionType}"`,
      `"${l.targetType}"`,
      `"${l.targetId}"`,
      `"${l.targetTitle.replace(/"/g, '""')}"`,
      `"${l.description.replace(/"/g, '""')}"`,
      `"${(l.details?.extraInfo || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `noh_maintenance_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `noh_maintenance_audit_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper styles based on action & target
  const getActionBadge = (actionType: LogActionType) => {
    switch (actionType) {
      case 'create':
        return {
          label: 'إضافة جديدة',
          bg: '#ecfdf5',
          color: '#059669',
          border: 'rgba(16, 185, 129, 0.3)',
          icon: PlusCircle
        };
      case 'update':
        return {
          label: 'تعديل بيانات',
          bg: '#eff6ff',
          color: '#2563eb',
          border: 'rgba(37, 99, 235, 0.3)',
          icon: Edit3
        };
      case 'status_change':
        return {
          label: 'تغيير حالة',
          bg: '#f5f3ff',
          color: '#7c3aed',
          border: 'rgba(124, 58, 237, 0.3)',
          icon: RefreshCw
        };
      case 'stock_adjust':
        return {
          label: 'حركة مخزون',
          bg: '#fffbeb',
          color: '#d97706',
          border: 'rgba(217, 119, 6, 0.3)',
          icon: Layers
        };
      case 'delete':
        return {
          label: 'حذف',
          bg: '#fef2f2',
          color: '#dc2626',
          border: 'rgba(220, 38, 38, 0.3)',
          icon: Trash2
        };
      default:
        return {
          label: 'إجراء نظام',
          bg: '#f1f5f9',
          color: '#475569',
          border: '#e2e8f0',
          icon: History
        };
    }
  };

  const getTargetIcon = (targetType: LogTargetType) => {
    switch (targetType) {
      case 'asset':
        return { icon: Laptop, label: 'أصل / جهاز', color: '#0284c7' };
      case 'ticket':
        return { icon: FileText, label: 'تقرير صيانة', color: '#d97706' };
      case 'spare_part':
        return { icon: Package, label: 'قطعة غيار', color: '#059669' };
      case 'preventive':
        return { icon: CalendarCheck, label: 'صيانة وقائية', color: '#7c3aed' };
      default:
        return { icon: History, label: 'نظام', color: '#64748b' };
    }
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <History size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 900 }}>سجل النشاطات والتعديلات (System Audit Trail)</h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                تتبع فوري ودقيق لكافة التغييرات: من أضاف، عدل، حذف، أو غيّر حالة الأجهزة والتذاكر وقطع الغيار
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary btn-sm"
            title="تصدير السجل الحالي إلى ملف Excel / CSV"
          >
            <Download size={15} />
            <span>تصدير CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="btn btn-secondary btn-sm"
            title="تصدير البيانات بصيغة JSON"
          >
            <span>JSON</span>
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="btn btn-secondary btn-sm"
            style={{ color: '#ef4444' }}
            title="مسح سجل النشاطات"
          >
            <Trash2 size={15} />
            <span>مسح السجل</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
        
        {/* Total */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <History size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>إجمالي العمليات</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)' }}>{totalLogsCount} عملية</div>
          </div>
        </div>

        {/* Creates */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlusCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>عمليات إضافة جديدة</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#059669' }}>{createsCount}</div>
          </div>
        </div>

        {/* Updates & Status Changes */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Edit3 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>تعديلات وتغيير حالة</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#2563eb' }}>{updatesCount}</div>
          </div>
        </div>

        {/* Stock Movements */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>حركات وصرف مخزون</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#d97706' }}>{stockCount}</div>
          </div>
        </div>

        {/* Deletions */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>عمليات حذف</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#dc2626' }}>{deletesCount}</div>
          </div>
        </div>

      </div>

      {/* Filters & Search Control Bar */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        
        {/* Search Row */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingRight: '2.4rem' }}
              placeholder="بحث بالوصف، اسم المهندس، كود الجهاز، أو رقم التقرير..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {(searchTerm || selectedActionType !== 'all' || selectedTargetType !== 'all' || selectedUser !== 'all' || selectedTimeRange !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedActionType('all');
                setSelectedTargetType('all');
                setSelectedUser('all');
                setSelectedTimeRange('all');
              }}
              className="btn btn-secondary btn-sm"
              style={{ flexShrink: 0 }}
            >
              إلغاء الفلاتر
            </button>
          )}
        </div>

        {/* Filters Selectors Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.65rem' }}>
          
          {/* Action Filter */}
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>
              نوع العملية (Action):
            </label>
            <select
              className="form-control form-control-sm"
              value={selectedActionType}
              onChange={(e) => setSelectedActionType(e.target.value)}
            >
              <option value="all">كافة العمليات</option>
              <option value="create">➕ إضافة جديدة</option>
              <option value="update">✏️ تعديل بيانات</option>
              <option value="status_change">🔄 تغيير حالة</option>
              <option value="stock_adjust">📦 حركة مخزون</option>
              <option value="delete">🗑️ حذف</option>
            </select>
          </div>

          {/* Target Filter */}
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>
              القسم المستهدف (Target):
            </label>
            <select
              className="form-control form-control-sm"
              value={selectedTargetType}
              onChange={(e) => setSelectedTargetType(e.target.value)}
            >
              <option value="all">كافة الأقسام</option>
              <option value="asset">💻 الأجهزة والعهد</option>
              <option value="ticket">📄 تقارير وتذاكر الصيانة</option>
              <option value="spare_part">📦 قطع الغيار والمخزون</option>
              <option value="preventive">📅 الصيانة الوقائية</option>
            </select>
          </div>

          {/* User Filter */}
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>
              القائم بالعمل (User / Performer):
            </label>
            <select
              className="form-control form-control-sm"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="all">كافة المهندسين والمستخدمين</option>
              {Array.from(new Set([...users.map(u => u.name), ...logs.map(l => l.userName)])).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Time Range Filter */}
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>
              النطاق الزمني:
            </label>
            <select
              className="form-control form-control-sm"
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
            >
              <option value="all">كافة الأوقات</option>
              <option value="today">اليوم (آخر 24 ساعة)</option>
              <option value="week">آخر 7 أيام</option>
              <option value="month">هذا الشهر (آخر 30 يوماً)</option>
            </select>
          </div>

        </div>

      </div>

      {/* Main Activity Timeline Stream */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--primary)" />
            شريط التدفق الزمني للأحداث ({filteredLogs.length} حركة مطابقة)
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            مرتب من الأحدث إلى الأقدم
          </span>
        </div>

        {filteredLogs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredLogs.map((log) => {
              const actionMeta = getActionBadge(log.actionType);
              const ActionIcon = actionMeta.icon;
              const targetMeta = getTargetIcon(log.targetType);
              const TargetIcon = targetMeta.icon;

              // Check if matching asset or ticket exists
              const matchedAsset = log.targetType === 'asset' ? assets.find(a => a.id === log.targetId) : null;
              const matchedTicket = log.targetType === 'ticket' ? tickets.find(t => t.id === log.targetId) : null;

              return (
                <div
                  key={log.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Top Row: User + Action Badge + Timestamp */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    
                    {/* User info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#e0f2fe',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.8rem'
                      }}>
                        <User size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {log.userName}
                        </div>
                        {log.userRole && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {log.userRole}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action & Target Badges + Time */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          background: actionMeta.bg,
                          color: actionMeta.color,
                          border: `1px solid ${actionMeta.border}`,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <ActionIcon size={13} />
                        {actionMeta.label}
                      </span>

                      <span
                        style={{
                          background: 'var(--bg-card-hover)',
                          color: targetMeta.color,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <TargetIcon size={13} />
                        {targetMeta.label}
                      </span>

                      <span
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--text-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          direction: 'ltr',
                          fontFamily: 'var(--font-mono)'
                        }}
                        title={formatExactDate(log.timestamp)}
                      >
                        <Clock size={13} />
                        {formatTimeAgo(log.timestamp)}
                      </span>
                    </div>

                  </div>

                  {/* Middle Row: Action Description */}
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {log.description}
                  </div>

                  {/* Target Reference & Quick Navigation */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', background: 'var(--bg-card-hover)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                        {log.targetId}
                      </strong>
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{log.targetTitle}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {matchedAsset && onSelectAsset && (
                        <button
                          onClick={() => onSelectAsset(matchedAsset)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem' }}
                        >
                          <Eye size={13} />
                          عرض ملف الجهاز
                        </button>
                      )}

                      {matchedTicket && onViewTicketReport && (
                        <button
                          onClick={() => onViewTicketReport(matchedTicket)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem' }}
                        >
                          <Eye size={13} />
                          عرض تقرير الصيانة
                        </button>
                      )}

                      <button
                        onClick={() => setInspectingLog(log)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem' }}
                      >
                        تفاصيل التغيير
                      </button>
                    </div>
                  </div>

                  {/* Changes Diff Chips (if present) */}
                  {log.details?.changes && log.details.changes.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.2rem' }}>
                      {log.details.changes.map((c, idx) => (
                        <div
                          key={idx}
                          style={{
                            fontSize: '0.75rem',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{c.label}:</span>
                          {c.oldValue !== undefined && (
                            <span style={{ textDecoration: 'line-through', color: '#ef4444' }}>
                              {String(c.oldValue)}
                            </span>
                          )}
                          {c.oldValue !== undefined && <span style={{ color: 'var(--text-muted)' }}>➔</span>}
                          <strong style={{ color: '#10b981' }}>{String(c.newValue)}</strong>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Extra info */}
                  {log.details?.extraInfo && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      ℹ️ {log.details.extraInfo}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-md)' }}>
            <History size={40} color="var(--text-muted)" style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
            <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px' }}>لا توجد سجلات مطابقة للبحث أو الفلتر</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              جرب تغيير معايير البحث أو اختيار "كافة العمليات" لعرض جميع الأنشطة المسجلة.
            </p>
          </div>
        )}

      </div>

      {/* ===================== CHANGE INSPECTOR MODAL ===================== */}
      {inspectingLog && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '8px' }}>
                  <History size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>تفاصيل التغيير والنشاط</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Log ID: {inspectingLog.id}
                  </p>
                </div>
              </div>
              <button onClick={() => setInspectingLog(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Meta Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', background: 'var(--bg-card-hover)', padding: '1rem', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>القائم بالعمل:</span>
                  <strong>{inspectingLog.userName}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{inspectingLog.userRole}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>التوقيت الدقيق:</span>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{formatExactDate(inspectingLog.timestamp)}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{inspectingLog.timestamp}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>نوع الإجراء والهدف:</span>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                    <span className="badge badge-spare">{inspectingLog.actionType}</span>
                    <span className="badge badge-operational">{inspectingLog.targetType}</span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>المعرف المستهدف:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{inspectingLog.targetId}</strong>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>الوصف الكامل:</label>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  {inspectingLog.description}
                </div>
              </div>

              {/* Changes Table if any */}
              {inspectingLog.details?.changes && inspectingLog.details.changes.length > 0 && (
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>الحقول المعدلة (Field Diff):</label>
                  <div className="custom-table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>الحقل</th>
                          <th>القيمة السابقة</th>
                          <th>القيمة الجديدة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inspectingLog.details.changes.map((c, idx) => (
                          <tr key={idx}>
                            <td><strong>{c.label}</strong> ({c.field})</td>
                            <td style={{ color: '#ef4444', textDecoration: 'line-through' }}>
                              {String(c.oldValue ?? '—')}
                            </td>
                            <td style={{ color: '#10b981', fontWeight: 800 }}>
                              {String(c.newValue ?? '—')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Extra Info */}
              {inspectingLog.details?.extraInfo && (
                <div style={{ padding: '0.75rem', background: '#e0f2fe', borderRadius: '6px', color: '#0369a1', fontSize: '0.82rem' }}>
                  <strong>ملاحظات النظام:</strong> {inspectingLog.details.extraInfo}
                </div>
              )}

            </div>

            <div className="modal-footer">
              <button onClick={() => setInspectingLog(null)} className="btn btn-secondary">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== CLEAR LOGS CONFIRMATION MODAL ===================== */}
      {showClearConfirm && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444' }}>تأكيد مسح سجل النشاطات</h3>
              <button onClick={() => setShowClearConfirm(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                هل أنت متأكد من رغبتك في مسح كافة سجلات النشاطات؟ لا يمكن التراجع عن هذا الإجراء وسيتم إعادة ضبط السجل.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowClearConfirm(false)} className="btn btn-secondary">
                إلغاء
              </button>
              <button
                onClick={() => {
                  onClearLogs();
                  setShowClearConfirm(false);
                }}
                className="btn btn-danger"
              >
                تأكيد المسح
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
