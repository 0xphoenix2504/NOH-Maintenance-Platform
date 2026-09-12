import { useState } from 'react';
import type { Asset, DeviceStatus } from '../types';
import {
  Plus,
  Search,
  QrCode,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface AssetsViewProps {
  assets: Asset[];
  onNewAsset: () => void;
  onEditAsset: (asset: Asset) => void;
  onDeleteAsset: (assetId: string) => void;
  onSelectAsset: (asset: Asset) => void;
  onNewTicketForAsset: (assetId: string) => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({
  assets,
  onNewAsset,
  onEditAsset,
  onDeleteAsset,
  onSelectAsset,
  onNewTicketForAsset
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.currentUser.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: DeviceStatus) => {
    switch (status) {
      case 'operational': return <span className="badge badge-operational"><CheckCircle2 size={12} /> يعمل بكفاءة</span>;
      case 'in_maintenance': return <span className="badge badge-maintenance"><Clock size={12} /> تحت الصيانة</span>;
      case 'needs_parts': return <span className="badge badge-needs-parts"><AlertTriangle size={12} /> بانتظار قطع غيار</span>;
      case 'damaged': return <span className="badge badge-damaged">تالف / غير قابل للإصلاح</span>;
      case 'spare': return <span className="badge badge-spare">جهاز احتياطي</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>سجل وإدارة الأجهزة والعهد (IT Asset Registry)</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            قاعدة بيانات الأجهزة والمحطات الطبية والسيرفرات مع أكواد الـ QR وملصقات الفحص
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button onClick={onNewAsset} className="btn btn-primary">
            <Plus size={16} />
            إضافة جهاز جديد
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingRight: '2.4rem' }}
            placeholder="بحث بالكود، الرقم التسلسلي، الموقع، أو اسم المستخدم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ minWidth: '150px' }}>
          <select className="form-control" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">كافة أنواع الأجهزة</option>
            <option value="Laptop">Laptop (محمول)</option>
            <option value="Desktop">Desktop (مكتبي)</option>
            <option value="Medical Workstation">Medical WS (محطة طبية)</option>
            <option value="Server">Server (خادم)</option>
            <option value="Printer">Printer (طابعة)</option>
            <option value="Network Switch">Network Switch (سويتش)</option>
          </select>
        </div>

        <div style={{ minWidth: '150px' }}>
          <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">كافة الحالات</option>
            <option value="operational">يعمل بكفاءة</option>
            <option value="in_maintenance">تحت الصيانة</option>
            <option value="needs_parts">بانتظار قطع غيار</option>
            <option value="damaged">تالف</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '0.45rem 0.75rem',
              border: 'none',
              background: viewMode === 'grid' ? 'var(--primary)' : 'var(--bg-secondary)',
              color: viewMode === 'grid' ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem'
            }}
          >
            بطاقات
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              padding: '0.45rem 0.75rem',
              border: 'none',
              background: viewMode === 'table' ? 'var(--primary)' : 'var(--bg-secondary)',
              color: viewMode === 'table' ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem'
            }}
          >
            جدول
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {filteredAssets.map(asset => (
            <div
              key={asset.id}
              className="glass-panel"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
                    {asset.id}
                  </span>
                  {getStatusBadge(asset.status)}
                </div>

                <h3
                  onClick={() => onSelectAsset(asset)}
                  style={{ fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer', marginBottom: '4px', color: 'var(--text-primary)' }}
                  title="انقر لفتح التفاصيل والسجل"
                >
                  {asset.brand} {asset.model}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  S/N: <span style={{ fontFamily: 'var(--font-mono)' }}>{asset.serialNumber}</span>
                </p>

                <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>الموقع: </span>
                    <strong>{asset.department}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>العهدة: </span>
                    <strong>{asset.currentUser}</strong>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => onSelectAsset(asset)}
                    className="btn btn-secondary btn-sm"
                    title="فتح ملف الجهاز وتاريخ الصيانة وملصق QR"
                  >
                    <QrCode size={14} />
                    ملف الجهاز
                  </button>
                  <button
                    onClick={() => onNewTicketForAsset(asset.id)}
                    className="btn btn-primary btn-sm"
                    title="تسجيل بلاغ صيانة لهذا الجهاز"
                  >
                    صيانة
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => onEditAsset(asset)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.35rem 0.5rem' }}
                    title="تعديل"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`هل تريد حذف الجهاز ${asset.id}؟`)) {
                        onDeleteAsset(asset.id);
                      }
                    }}
                    className="btn btn-danger btn-sm"
                    style={{ padding: '0.35rem 0.5rem' }}
                    title="حذف"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>كود الجهاز</th>
                  <th>النوع والماركة</th>
                  <th>الرقم التسلسلي</th>
                  <th>الموقع / القسم</th>
                  <th>اسم المستخدم / العهدة</th>
                  <th>الحالة</th>
                  <th>عنوان IP</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map(asset => (
                  <tr key={asset.id}>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{asset.id}</strong>
                    </td>
                    <td>
                      <div onClick={() => onSelectAsset(asset)} style={{ cursor: 'pointer', fontWeight: 700 }}>
                        {asset.brand} {asset.model}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{asset.type}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{asset.serialNumber}</span>
                    </td>
                    <td>{asset.department}</td>
                    <td>{asset.currentUser}</td>
                    <td>{getStatusBadge(asset.status)}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{asset.ipAddress || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button onClick={() => onSelectAsset(asset)} className="btn btn-secondary btn-sm">
                          <QrCode size={14} />
                        </button>
                        <button onClick={() => onNewTicketForAsset(asset.id)} className="btn btn-primary btn-sm">
                          صيانة
                        </button>
                        <button onClick={() => onEditAsset(asset)} className="btn btn-secondary btn-sm">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => onDeleteAsset(asset.id)} className="btn btn-danger btn-sm">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredAssets.length === 0 && (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          لا توجد أجهزة مطابقة لمعايير البحث.
        </div>
      )}

    </div>
  );
};
