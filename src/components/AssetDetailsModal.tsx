import { useRef, useState } from 'react';
import type { Asset, MaintenanceTicket, AuditLog } from '../types';
import {
  X,
  Wrench,
  Printer,
  Edit,
  Clock,
  DollarSign,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  FileText,
  History
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface AssetDetailsModalProps {
  asset: Asset;
  tickets: MaintenanceTicket[];
  logs?: AuditLog[];
  onEditAsset: (asset: Asset) => void;
  onNewTicketForAsset: (assetId: string) => void;
  onViewTicketReport: (ticket: MaintenanceTicket) => void;
  onClose: () => void;
}

export const AssetDetailsModal: React.FC<AssetDetailsModalProps> = ({
  asset,
  tickets,
  logs = [],
  onEditAsset,
  onNewTicketForAsset,
  onViewTicketReport,
  onClose
}) => {
  const qrLabelRef = useRef<HTMLDivElement>(null);
  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'audit'>('timeline');

  // Filter tickets related to this asset
  const assetTickets = tickets.filter(t => t.assetId === asset.id);
  const totalCost = assetTickets.reduce((sum, t) => sum + (t.totalCost || 0), 0);
  const totalDowntimeHours = assetTickets.reduce((sum, t) => sum + (t.downtimeHours || 0), 0);

  // Filter logs related to this asset
  const assetLogs = logs.filter(l => l.targetId === asset.id || l.description?.includes(asset.id));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational': return <span className="badge badge-operational"><CheckCircle2 size={12} /> يعمل بكفاءة</span>;
      case 'in_maintenance': return <span className="badge badge-maintenance"><Clock size={12} /> تحت الصيانة</span>;
      case 'needs_parts': return <span className="badge badge-needs-parts"><AlertTriangle size={12} /> بانتظار قطع غيار</span>;
      case 'damaged': return <span className="badge badge-damaged">تالف / غير قابل للإصلاح</span>;
      case 'spare': return <span className="badge badge-spare">جهاز احتياطي</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const handlePrintQRLabel = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '920px', maxHeight: '92vh' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '8px' }}>
              <Cpu size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{asset.name}</h3>
                {getStatusBadge(asset.status)}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                كود الجهاز: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{asset.id}</strong> | S/N: <span style={{ fontFamily: 'var(--font-mono)' }}>{asset.serialNumber}</span>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => onNewTicketForAsset(asset.id)}
              className="btn btn-primary btn-sm"
            >
              <Wrench size={16} />
              تسجيل صيانة للجهاز
            </button>
            <button
              onClick={() => onEditAsset(asset)}
              className="btn btn-secondary btn-sm"
            >
              <Edit size={16} />
              تعديل
            </button>
            <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          
          {/* Top Grid: Asset Info Card + QR Code Sticker Card */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            
            {/* General Info */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                البيانات الأساسية والتشغيلية
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.88rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>نوع الجهاز:</span>
                  <strong>{asset.type}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>الماركة والموديل:</span>
                  <strong>{asset.brand} {asset.model}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>الموقع / القسم:</span>
                  <strong>{asset.department}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>اسم المستخدم / العهدة:</span>
                  <strong>{asset.currentUser}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>عنوان IP:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{asset.ipAddress || '—'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>المواصفات:</span>
                  <span>{asset.specifications?.cpu || '—'} | {asset.specifications?.ram || '—'}</span>
                </div>
              </div>

              {asset.notes && (
                <div style={{ marginTop: '0.75rem', padding: '0.6rem', background: 'var(--bg-card-hover)', borderRadius: '6px', fontSize: '0.82rem' }}>
                  <strong>ملاحظات:</strong> {asset.notes}
                </div>
              )}
            </div>

            {/* QR Sticker Card */}
            <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div ref={qrLabelRef} style={{ background: '#ffffff', padding: '12px', borderRadius: '12px', border: '2px solid #0284c7', width: '100%', maxWidth: '200px' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#0369a1', marginBottom: '4px' }}>
                  مستشفى نيل الأمل — IT Asset
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                  <QRCodeSVG value={`NOH-ASSET:${asset.id}`} size={110} level="M" />
                </div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                  {asset.id}
                </div>
                <div style={{ fontSize: '9px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {asset.department}
                </div>
              </div>

              <button
                onClick={handlePrintQRLabel}
                className="btn btn-secondary btn-sm no-print"
                style={{ marginTop: '0.75rem', width: '100%' }}
              >
                <Printer size={14} />
                طباعة ملصق الباركود
              </button>
            </div>

          </div>

          {/* Maintenance KPIs for this asset */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div className="glass-panel" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '8px' }}>
                <Wrench size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>عدد الصيانات السابقة</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{assetTickets.length} بلاغات</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: '#fffbeb', color: '#d97706', padding: '8px', borderRadius: '8px' }}>
                <Clock size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>إجمالي وقت التوقف (Downtime)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{totalDowntimeHours} ساعة</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: '#f5f3ff', color: '#7c3aed', padding: '8px', borderRadius: '8px' }}>
                <DollarSign size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>إجمالي تكلفة قطع الغيار</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{totalCost} ج.م</div>
              </div>
            </div>
          </div>

          {/* Sub Tab Switcher: Maintenance Timeline vs Audit History */}
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem', paddingBottom: '0.5rem' }}>
            <button
              onClick={() => setActiveSubTab('timeline')}
              className={`btn btn-sm ${activeSubTab === 'timeline' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Clock size={14} />
              <span>تقارير وتاريخ الصيانة ({assetTickets.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('audit')}
              className={`btn btn-sm ${activeSubTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <History size={14} />
              <span>سجل النشاطات والتعديلات للجهاز ({assetLogs.length})</span>
            </button>
          </div>

          {/* TAB 1: Maintenance Timeline */}
          {activeSubTab === 'timeline' && (
            <div>
              {assetTickets.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {assetTickets.map(ticket => (
                    <div
                      key={ticket.id}
                      className="glass-panel"
                      style={{ padding: '1rem', borderRight: '4px solid var(--primary)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>{ticket.id}</strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>| {ticket.reportDateTime}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                            الفني: {ticket.technicianName}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => onViewTicketReport(ticket)}
                            className="btn btn-primary btn-sm"
                          >
                            <FileText size={14} />
                            عرض التقرير الرسمي
                          </button>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.85rem', margin: '0.4rem 0', color: 'var(--text-secondary)' }}>
                        <strong>العطل:</strong> {ticket.userProblemDescription}
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-card-hover)', padding: '0.5rem', borderRadius: '6px' }}>
                        <strong>التشخيص والإجراء:</strong> {ticket.diagnosis} — {ticket.actionTaken}
                      </div>

                      {ticket.sparePartsUsed && ticket.sparePartsUsed.length > 0 && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <strong>قطع الغيار المستهلكة:</strong> {ticket.sparePartsUsed.map(p => `${p.name} (${p.totalCost} ج.م)`).join('، ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-md)' }}>
                  <CheckCircle2 size={36} color="var(--status-operational)" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ fontWeight: 700 }}>سجل الصيانة نظيف تماماً!</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>لم يتم تسجيل أي أعطال سابقة لهذا الجهاز.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Audit Logs Specific to this Asset */}
          {activeSubTab === 'audit' && (
            <div>
              {assetLogs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {assetLogs.map(log => (
                    <div
                      key={log.id}
                      style={{
                        background: 'var(--bg-card-hover)',
                        border: '1px solid var(--border-color)',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className={`badge ${log.actionType === 'create' ? 'badge-operational' : log.actionType === 'status_change' ? 'badge-needs-parts' : 'badge-spare'}`}>
                            {log.actionType === 'create' ? '➕ إضافة' : log.actionType === 'status_change' ? '🔄 تغيير حالة' : log.actionType === 'delete' ? '🗑️ حذف' : '✏️ تعديل'}
                          </span>
                          <strong style={{ fontSize: '0.85rem' }}>{log.userName}</strong>
                          {log.userRole && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({log.userRole})</span>}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', direction: 'ltr' }}>
                          {new Date(log.timestamp).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {log.description}
                      </div>

                      {log.details?.changes && log.details.changes.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '2px' }}>
                          {log.details.changes.map((c, idx) => (
                            <div key={idx} style={{ fontSize: '0.72rem', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                              <span style={{ color: 'var(--text-muted)' }}>{c.label}: </span>
                              {c.oldValue !== undefined && <span style={{ textDecoration: 'line-through', color: '#ef4444' }}>{String(c.oldValue)} ➔ </span>}
                              <strong style={{ color: '#10b981' }}>{String(c.newValue)}</strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-md)' }}>
                  <History size={36} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ fontWeight: 700 }}>لا توجد سجلات نشاط مسجلة لهذا الجهاز حتى الآن</p>
                </div>
              )}
            </div>
          )}

        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">إغلاق</button>
        </div>
      </div>
    </div>
  );
};
