import type { Asset, MaintenanceTicket, SparePartInventoryItem, PreventiveScheduleItem, AuditLog, UserProfile } from '../types';
import {
  Laptop,
  Wrench,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  FileText,
  CheckCircle2,
  Activity,
  ArrowRight,
  History,
  PlusCircle,
  Edit3,
  RefreshCw,
  Layers,
  Trash2
} from 'lucide-react';

interface DashboardViewProps {
  assets: Asset[];
  tickets: MaintenanceTicket[];
  spareParts: SparePartInventoryItem[];
  preventiveSchedules?: PreventiveScheduleItem[];
  logs?: AuditLog[];
  currentUser?: UserProfile;
  onViewTicketReport: (ticket: MaintenanceTicket) => void;
  onEditTicket: (ticket: MaintenanceTicket) => void;
  onSelectAsset: (asset: Asset) => void;
  onNavigateToTab: (tab: any) => void;
  onNewTicket: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  assets,
  tickets,
  spareParts,
  preventiveSchedules: _preventiveSchedules,
  logs = [],
  currentUser,
  onViewTicketReport,
  onEditTicket,
  onSelectAsset,
  onNavigateToTab,
  onNewTicket
}) => {
  // Compute KPIs
  const totalAssets = assets.length;
  const activeTickets = tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved');
  const needsPartsTickets = tickets.filter(t => t.statusAfterMaintenance === 'needs_parts' || t.status === 'pending_parts');
  
  const totalDowntimeHours = tickets.reduce((acc, t) => acc + (t.downtimeHours || 0), 0);
  const avgDowntimeHours = tickets.length > 0 ? (totalDowntimeHours / tickets.length).toFixed(1) : '0';
  const totalPartsCost = tickets.reduce((acc, t) => acc + (t.totalCost || 0), 0);
  const lowStockParts = spareParts.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock');

  // Breakdown by Department
  const deptCount: Record<string, number> = {};
  tickets.forEach(t => {
    const asset = assets.find(a => a.id === t.assetId);
    const dept = asset ? asset.department.split('-')[1]?.trim() || asset.department : 'أخرى';
    deptCount[dept] = (deptCount[dept] || 0) + 1;
  });

  // Breakdown by Issue Category
  const categoryCount: Record<string, number> = {
    'هاردوير': 0,
    'سوفت وير': 0,
    'شبكات': 0,
    'طابعات': 0,
    'وقائية': 0,
    'أخرى': 0
  };
  tickets.forEach(t => {
    if (t.issueCategory === 'hardware') categoryCount['هاردوير']++;
    else if (t.issueCategory === 'software' || t.issueCategory === 'os') categoryCount['سوفت وير']++;
    else if (t.issueCategory === 'network') categoryCount['شبكات']++;
    else if (t.issueCategory === 'printer') categoryCount['طابعات']++;
    else if (t.issueCategory === 'preventive') categoryCount['وقائية']++;
    else categoryCount['أخرى']++;
  });

  // Time format helper
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
      return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    } catch {
      return isoDate;
    }
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(139, 92, 246, 0.06) 100%)',
        border: '1px solid rgba(2, 132, 199, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px' }}>
              نظام إدارة صيانة تكنولوجيا المعلومات
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>مستشفى نيل الأمل لجراحات الأطفال</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            مرحباً بك، {currentUser?.name || 'ENG Abdelrahman'} 👨‍💻
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            لديك <strong style={{ color: '#ef4444' }}>{activeTickets.length} بلاغات قيد المتابعة</strong> و <strong style={{ color: '#8b5cf6' }}>{needsPartsTickets.length} جهاز بانتظار قطع غيار</strong> من المخزن.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button onClick={onNewTicket} className="btn btn-primary">
            <Wrench size={16} />
            تسجيل بلاغ صيانة جديد
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        
        {/* Card 1: Total Assets */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => onNavigateToTab('assets')}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Laptop size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>إجمالي الأجهزة المسجلة</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>{totalAssets} جهاز</div>
            <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>• جميع الأقسام والعيادات</div>
          </div>
        </div>

        {/* Card 2: Active Tickets */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => onNavigateToTab('tickets')}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>بلاغات جاري العمل عليها</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#d97706' }}>{activeTickets.length} بلاغ</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>من أصل {tickets.length} إجمالي</div>
          </div>
        </div>

        {/* Card 3: Pending Parts */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => onNavigateToTab('tickets')}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>بانتظار قطع غيار</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#7c3aed' }}>{needsPartsTickets.length} أجهزة</div>
            <div style={{ fontSize: '0.72rem', color: '#8b5cf6' }}>تتطلب توريد من المخزن</div>
          </div>
        </div>

        {/* Card 4: Mean Downtime */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfeff', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>متوسط وقت الإصلاح MTTR</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0891b2' }}>{avgDowntimeHours} س</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>إجمالي التوقف: {totalDowntimeHours} س</div>
          </div>
        </div>

        {/* Card 5: Spare Parts Cost */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => onNavigateToTab('inventory')}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>إجمالي تكلفة الصيانة</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669', fontFamily: 'var(--font-mono)' }}>{totalPartsCost} ج.م</div>
            <div style={{ fontSize: '0.72rem', color: lowStockParts.length > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
              {lowStockParts.length > 0 ? `⚠️ ${lowStockParts.length} أصناف أوشكت على النفاد` : 'المخزون متزن'}
            </div>
          </div>
        </div>

      </div>

      {/* Visual Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Chart 1: Issue Categories */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--primary)" />
            توزيع الأعطال حسب النوع (Issue Breakdown)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(categoryCount).map(([category, count]) => {
              const percentage = tickets.length > 0 ? Math.round((count / tickets.length) * 100) : 0;
              return (
                <div key={category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600 }}>{category}</span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{count} بلاغات ({percentage}%)</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: category === 'هاردوير' ? '#ef4444' : category === 'سوفت وير' ? '#3b82f6' : category === 'شبكات' ? '#8b5cf6' : category === 'طابعات' ? '#f59e0b' : '#10b981',
                      borderRadius: '4px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Department Outages */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--primary)" />
            الأقسام الأكثر تسجيلاً للصيانة (By Department)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(deptCount).map(([dept, count]) => {
              const maxVal = Math.max(...Object.values(deptCount), 1);
              const percentage = Math.round((count / maxVal) * 100);
              return (
                <div key={dept}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 700 }}>{dept}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{count} طلب</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Critical / Urgent Section (Pending Parts & Overdue) */}
      {needsPartsTickets.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(139, 92, 246, 0.4)', background: 'rgba(139, 92, 246, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} color="#8b5cf6" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7c3aed' }}>
                تنبيهات هامة: أجهزة بانتظار توفير قطع غيار
              </h3>
            </div>
            <span className="badge badge-needs-parts">{needsPartsTickets.length} أجهزة متأثرة</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
            {needsPartsTickets.map(ticket => {
              const asset = assets.find(a => a.id === ticket.assetId);
              return (
                <div
                  key={ticket.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.65rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{ticket.assetId}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 700 }}>توقف: {ticket.downtimeFormatted}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{asset?.name || ticket.assetId}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{asset?.department} | العهدة: {asset?.currentUser}</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '4px', color: 'var(--text-secondary)' }}>
                      <strong>التشخيص:</strong> {ticket.diagnosis}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => onViewTicketReport(ticket)}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                    >
                      <FileText size={14} />
                      عرض التقرير
                    </button>
                    <button
                      onClick={() => onEditTicket(ticket)}
                      className="btn btn-secondary btn-sm"
                    >
                      تحديث الإجراء
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RECENT AUDIT ACTIVITY FEED WIDGET */}
      {logs.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} color="var(--primary)" />
                سجل أحدث النشاطات والتعديلات الأخيرة في النظام (Recent Audit Trail)
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                تتبع لحظي لمن قام بإضافة أو تعديل أي جهاز، تقرير صيانة، أو حركة مخزون
              </p>
            </div>

            <button
              onClick={() => onNavigateToTab('logs')}
              className="btn btn-secondary btn-sm"
            >
              عرض السجل الكامل ({logs.length})
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {logs.slice(0, 5).map(log => {
              return (
                <div
                  key={log.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.65rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: log.actionType === 'create' ? '#ecfdf5' : log.actionType === 'status_change' ? '#f5f3ff' : log.actionType === 'stock_adjust' ? '#fffbeb' : log.actionType === 'delete' ? '#fef2f2' : '#eff6ff',
                      color: log.actionType === 'create' ? '#059669' : log.actionType === 'status_change' ? '#7c3aed' : log.actionType === 'stock_adjust' ? '#d97706' : log.actionType === 'delete' ? '#dc2626' : '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {log.actionType === 'create' ? <PlusCircle size={16} /> : log.actionType === 'status_change' ? <RefreshCw size={16} /> : log.actionType === 'stock_adjust' ? <Layers size={16} /> : log.actionType === 'delete' ? <Trash2 size={16} /> : <Edit3 size={16} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {log.description}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        بواسطة: <strong style={{ color: 'var(--primary)' }}>{log.userName}</strong> ({log.userRole || 'فني IT'}) • الهدف: <span style={{ fontFamily: 'var(--font-mono)' }}>{log.targetId}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', direction: 'ltr' }}>
                    {formatTimeAgo(log.timestamp)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Maintenance Tickets Table */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>أحدث تقارير وبلاغات الصيانة المسجلة</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>سجل شامل لجميع الإجراءات وقطع الغيار والتوقيعات</p>
          </div>

          <button onClick={() => onNavigateToTab('tickets')} className="btn btn-secondary btn-sm">
            عرض كافة التذاكر ({tickets.length})
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>رقم التقرير</th>
                <th>الجهاز / الأصل</th>
                <th>القسم / المستخدم</th>
                <th>نوع العطل</th>
                <th>الفني المسؤول</th>
                <th>مدة التوقف</th>
                <th>الحالة بعد الصيانة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {tickets.slice(0, 5).map(ticket => {
                const asset = assets.find(a => a.id === ticket.assetId);
                return (
                  <tr key={ticket.id}>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{ticket.id}</strong>
                    </td>
                    <td>
                      <div
                        onClick={() => asset && onSelectAsset(asset)}
                        style={{ cursor: 'pointer', fontWeight: 700 }}
                        title="انقر لفتح ملف الجهاز"
                      >
                        {ticket.assetId}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{asset?.brand} {asset?.model}</div>
                    </td>
                    <td>
                      <div>{asset?.department || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{asset?.currentUser}</div>
                    </td>
                    <td>
                      <span className="badge badge-spare">
                        {ticket.issueCategory === 'hardware' ? 'هاردوير' : ticket.issueCategory === 'software' ? 'سوفت وير' : ticket.issueCategory === 'printer' ? 'طابعة' : 'وقائية'}
                      </span>
                    </td>
                    <td>
                      <strong>{ticket.technicianName}</strong>
                    </td>
                    <td>
                      <span style={{ color: '#ea580c', fontWeight: 600, fontSize: '0.82rem' }}>
                        {ticket.downtimeFormatted}
                      </span>
                    </td>
                    <td>
                      {ticket.statusAfterMaintenance === 'repaired' ? (
                        <span className="badge badge-operational"><CheckCircle2 size={12} /> تم الإصلاح</span>
                      ) : ticket.statusAfterMaintenance === 'needs_parts' ? (
                        <span className="badge badge-needs-parts"><AlertTriangle size={12} /> يحتاج قطعة غيار</span>
                      ) : (
                        <span className="badge badge-maintenance">قيد الملاحظة</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => onViewTicketReport(ticket)}
                          className="btn btn-primary btn-sm"
                          title="عرض التقرير الرسمي المعتمد وطباعته وتصديره PDF"
                        >
                          <FileText size={14} />
                          التقرير الرسمي
                        </button>
                        <button
                          onClick={() => onEditTicket(ticket)}
                          className="btn btn-secondary btn-sm"
                          title="تعديل"
                        >
                          تعديل
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
