import { useState } from 'react';
import type { Asset } from '../types';
import { X, QrCode, Camera, Search, Laptop } from 'lucide-react';

interface QRScannerModalProps {
  assets: Asset[];
  onSelectAsset: (asset: Asset) => void;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ assets, onSelectAsset, onClose }) => {
  const [manualCode, setManualCode] = useState('');

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    // Search by ID or Serial Number
    const found = assets.find(a => 
      a.id.toLowerCase() === manualCode.trim().toLowerCase() ||
      a.serialNumber.toLowerCase() === manualCode.trim().toLowerCase() ||
      `noh-asset:${a.id.toLowerCase()}` === manualCode.trim().toLowerCase()
    );

    if (found) {
      onSelectAsset(found);
    } else {
      alert(`لم يتم العثور على جهاز بالكود أو السيريال: ${manualCode}`);
    }
  };

  const sampleAssets = assets.slice(0, 6);

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '8px' }}>
              <QrCode size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>ماسح الباركود و QR Code السريع</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                فحص أجهزة مستشفى نيل الأمل بالكاميرا أو الكود المباشر
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          
          {/* Simulated Camera Scanner Viewfinder */}
          <div style={{
            position: 'relative',
            background: '#090d16',
            borderRadius: 'var(--radius-md)',
            height: '220px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            overflow: 'hidden',
            border: '2px dashed #0284c7',
            marginBottom: '1.25rem'
          }}>
            {/* Animated Laser Scanning Line */}
            <div style={{
              position: 'absolute',
              top: '20%',
              left: '10%',
              right: '10%',
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
              boxShadow: '0 0 15px #38bdf8',
              animation: 'slideUp 2s infinite alternate ease-in-out'
            }} />

            <div style={{
              width: '140px',
              height: '140px',
              border: '2px solid rgba(56, 189, 248, 0.6)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(2, 132, 199, 0.1)'
            }}>
              <Camera size={38} color="#38bdf8" />
              <span style={{ fontSize: '0.75rem', marginTop: '6px', color: '#cbd5e1' }}>وجه الكاميرا نحو الملصق</span>
            </div>
          </div>

          {/* Quick Code Input */}
          <form onSubmit={handleManualSearch} style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">إدخال كود الجهاز أو الرقم التسلسلي يدوياً:</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-control form-control-mono"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="مثال: 4th-PCCU-LPTP02 أو BNLMVD2"
                autoFocus
              />
              <button type="submit" className="btn btn-primary">
                <Search size={16} />
                بحث وفتح
              </button>
            </div>
          </form>

          {/* Quick Select Simulated Tags */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>أو اختر جهازاً مسجلاً للفحص السريع:</label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{assets.length} أجهزة متوفرة</span>
            </div>

            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {sampleAssets.map(asset => (
                <div
                  key={asset.id}
                  onClick={() => onSelectAsset(asset)}
                  className="glass-panel"
                  style={{
                    padding: '0.6rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Laptop size={16} color="var(--primary)" />
                    <div>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>{asset.id}</strong>
                      <span style={{ margin: '0 6px', color: 'var(--text-muted)' }}>•</span>
                      <span>{asset.brand} {asset.model}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{asset.department}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">إلغاء</button>
        </div>
      </div>
    </div>
  );
};
