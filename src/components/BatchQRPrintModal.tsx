import { useState, useRef } from 'react';
import type { Asset } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, X, Filter } from 'lucide-react';

interface BatchQRPrintModalProps {
  assets: Asset[];
  onClose: () => void;
}

export const BatchQRPrintModal: React.FC<BatchQRPrintModalProps> = ({ assets, onClose }) => {
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Departments list
  const departments = Array.from(new Set(assets.map(a => a.department)));
  const types = Array.from(new Set(assets.map(a => a.type)));

  const filteredAssets = assets.filter(a => {
    const matchDept = departmentFilter === 'all' || a.department === departmentFilter;
    const matchType = typeFilter === 'all' || a.type === typeFilter;
    return matchDept && matchType;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '1000px', maxHeight: '95vh' }}>
        
        {/* Modal Header */}
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '8px' }}>
              <Printer size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>طباعة ملصقات الباركود والـ QR المجمعة (A4 Sticker Sheet)</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                تجهيز ملصقات الأجهزة للطباعة على ورق لاصق مقاس A4 للتعليق على أجهزة المستشفى
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer size={16} />
              <span>طباعة الملصقات ({filteredAssets.length})</span>
            </button>
            <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar (Hidden in Print) */}
        <div className="no-print" style={{ padding: '0.75rem 1.5rem', background: 'var(--bg-card-hover)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            <Filter size={15} />
            <span>تصفية الأجهزة للطباعة:</span>
          </div>

          <div>
            <select
              className="form-control"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
            >
              <option value="all">كافة الأقسام ({assets.length} جهاز)</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="form-control"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
            >
              <option value="all">كافة أنواع الأجهزة</option>
              {types.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginRight: 'auto' }}>
            سيتم طباعة <strong>{filteredAssets.length}</strong> ملصق
          </span>
        </div>

        {/* Printable Grid Area */}
        <div className="modal-body" style={{ padding: '1.5rem', overflowY: 'auto' }}>
          <div
            ref={printContainerRef}
            className="batch-qr-print-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: '12px'
            }}
          >
            {filteredAssets.map(asset => (
              <div
                key={asset.id}
                className="qr-sticker-card"
                style={{
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1.5px solid #0284c7',
                  borderRadius: '10px',
                  padding: '10px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  pageBreakInside: 'avoid',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}
              >
                {/* Header */}
                <div style={{ width: '100%', borderBottom: '1px dashed #cbd5e1', paddingBottom: '4px', marginBottom: '6px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#0369a1' }}>
                    Nile of Hope Hospital
                  </div>
                  <div style={{ fontSize: '8px', color: '#64748b' }}>
                    IT Asset Tag — قسم تكنولوجيا المعلومات
                  </div>
                </div>

                {/* QR Code */}
                <div style={{ margin: '4px 0' }}>
                  <QRCodeSVG value={`NOH-ASSET:${asset.id}`} size={96} level="M" />
                </div>

                {/* Asset Details */}
                <div style={{ width: '100%', marginTop: '4px', borderTop: '1px dashed #cbd5e1', paddingTop: '4px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
                    {asset.id}
                  </div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#0284c7' }}>
                    {asset.brand} {asset.model}
                  </div>
                  <div style={{ fontSize: '8px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    S/N: {asset.serialNumber}
                  </div>
                  <div style={{ fontSize: '8px', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {asset.department}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAssets.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              لا توجد أجهزة مطابقة للتصفية المختارة.
            </div>
          )}
        </div>

        <div className="modal-footer no-print">
          <button onClick={onClose} className="btn btn-secondary">إغلاق</button>
          <button onClick={handlePrint} className="btn btn-primary">
            <Printer size={16} />
            طباعة ملصقات الـ QR
          </button>
        </div>

      </div>
    </div>
  );
};
