import { useState } from 'react';
import type { MaintenanceTicket, Asset } from '../types';
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface TicketsViewProps {
  tickets: MaintenanceTicket[];
  assets: Asset[];
  onNewTicket: () => void;
  onEditTicket: (ticket: MaintenanceTicket) => void;
  onDeleteTicket: (ticketId: string) => void;
  onViewReport: (ticket: MaintenanceTicket) => void;
  onSelectAsset: (asset: Asset) => void;
}

export const TicketsView: React.FC<TicketsViewProps> = ({
  tickets,
  assets,
  onNewTicket,
  onEditTicket,
  onDeleteTicket,
  onViewReport,
  onSelectAsset
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTickets = tickets.filter(ticket => {
    const asset = assets.find(a => a.id === ticket.assetId);
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.technicianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.userProblemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset && (asset.currentUser.toLowerCase().includes(searchTerm.toLowerCase()) || asset.department.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesCategory = categoryFilter === 'all' || ticket.issueCategory === categoryFilter;
    const matchesStatus = statusFilter === 'all' || ticket.statusAfterMaintenance === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>سجل تذاكر وتقارير الصيانة</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            إدارة كافة بلاغات الصيانة الطارئة والوقائية وتصدير التقارير المعتمدة
          </p>
        </div>

        <button onClick={onNewTicket} className="btn btn-primary">
          <Plus size={16} />
          تسجيل بلاغ صيانة جديد
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingRight: '2.4rem' }}
            placeholder="بحث برقم التقرير، كود الجهاز، الفني، أو الموظف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ minWidth: '160px' }}>
          <select
            className="form-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">كافة أنواع الأعطال</option>
            <option value="hardware">هاردوير (Hardware)</option>
            <option value="software">سوفت وير (Software)</option>
            <option value="network">شبكات (Network)</option>
            <option value="printer">طابعات (Printers)</option>
            <option value="preventive">صيانة وقائية</option>
          </select>
        </div>

        <div style={{ minWidth: '170px' }}>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">كافة الحالات</option>
            <option value="repaired">تم الإصلاح بنجاح</option>
            <option value="needs_parts">يحتاج قطعة غيار</option>
            <option value="under_observation">قيد الملاحظة</option>
            <option value="unrepairable">تالف</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>رقم التقرير</th>
                <th>كود الجهاز</th>
                <th>الموقع / القسم</th>
                <th>المستخدم / العهدة</th>
                <th>نوع العطل</th>
                <th>الفني المسؤول</th>
                <th>وقت البلاغ</th>
                <th>مدة التوقف</th>
                <th>الحالة بعد الصيانة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => {
                const asset = assets.find(a => a.id === ticket.assetId);
                return (
                  <tr key={ticket.id}>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{ticket.id}</strong>
                    </td>
                    <td>
                      <div
                        onClick={() => asset && onSelectAsset(asset)}
                        style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--text-primary)' }}
                        title="انقر لفتح ملف وسجل الجهاز"
                      >
                        {ticket.assetId}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{asset?.brand} {asset?.model}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{asset?.department || '—'}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{asset?.currentUser || '—'}</div>
                    </td>
                    <td>
                      <span className="badge badge-spare">
                        {ticket.issueCategory === 'hardware' ? 'هاردوير' : ticket.issueCategory === 'software' ? 'سوفت وير' : ticket.issueCategory === 'printer' ? 'طابعة' : 'وقائية'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.85rem' }}>{ticket.technicianName}</strong>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>{ticket.reportDateTime}</div>
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
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => onViewReport(ticket)}
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
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف التقرير ${ticket.id}؟`)) {
                              onDeleteTicket(ticket.id);
                            }
                          }}
                          className="btn btn-danger btn-sm"
                          title="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    لا توجد بلاغات تطابق معايير البحث المحددة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
