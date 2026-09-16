import { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  FileSpreadsheet,
  RotateCcw,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Laptop,
  Package,
  CalendarCheck
} from 'lucide-react';
import { storageService } from '../services/storageService';
import confetti from 'canvas-confetti';

interface DataManagementModalProps {
  onDataRestored: () => void;
  onClose: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  onDataRestored,
  onClose
}) => {
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Export JSON Backup
  const handleDownloadBackup = () => {
    const jsonStr = storageService.exportFullDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    link.setAttribute('download', `NileOfHope_IT_Backup_${dateStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setMsg({ type: 'success', text: 'تم تحميل ملف النسخة الاحتياطية الكاملة بنجاح!' });
  };

  // 2. Import JSON Backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const res = storageService.importFullDatabaseJSON(content);
      if (res.success) {
        setMsg({ type: 'success', text: 'تمت استعادة البيانات بنجاح وتحديث النظام!' });
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
        setTimeout(() => {
          onDataRestored();
        }, 1200);
      } else {
        setMsg({ type: 'error', text: `فشلت الاستعادة: ${res.error}` });
      }
    };
    reader.readAsText(file);
    // Reset file input value so user can upload same file if needed
    e.target.value = '';
  };

  // 3. Export CSV Table
  const handleExportCSV = (table: 'assets' | 'tickets' | 'inventory' | 'preventive', label: string) => {
    const csvContent = storageService.exportTableToCSV(table);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    link.setAttribute('download', `NileOfHope_${table}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setMsg({ type: 'success', text: `تم تصدير ملف ${label} بنجاح!` });
  };

  // 4. Reset Default
  const handleResetToDefault = () => {
    if (confirm('هل أنت متأكد تماماً من رغبتك في إعادة تعيين كافة البيانات إلى الحالة الافتراضية؟ سيتم حذف أي بيانات مخصصة تم إدخالها مؤخراً.')) {
      storageService.resetToDefault();
      setMsg({ type: 'success', text: 'تمت إعادة ضبط النظام إلى البيانات الافتراضية لمستشفى نيل الأمل.' });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '680px' }}>
        
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '8px' }}>
              <Database size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>إدارة البيانات والنسخ الاحتياطي (Backup & Restore)</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                تصدير واستعادة بيانات الأجهزة، التذاكر، المخزون، والصيانة الوقائية
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Notification Msg */}
          {msg && (
            <div style={{
              padding: '0.75rem 1rem',
              background: msg.type === 'success' ? '#ecfdf5' : '#fef2f2',
              color: msg.type === 'success' ? '#059669' : '#dc2626',
              border: `1px solid ${msg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Section 1: Full System Backup & Restore */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} color="var(--primary)" />
              النسخة الاحتياطية الكاملة للنظام (Full JSON Backup)
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              حفظ نسخة كاملة من قاعدة البيانات المحلية تشمل كافة الأجهزة، التذاكر، المخزون، الجداول الوقائية، والمستخدمين في ملف واحد.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <button
                onClick={handleDownloadBackup}
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
              >
                <Download size={16} />
                <span>تحميل نسخة احتياطية (JSON)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary"
                style={{ justifyContent: 'center' }}
              >
                <Upload size={16} />
                <span>استعادة نسخة سابقة (JSON)</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Section 2: CSV / Excel Export per Module */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileSpreadsheet size={16} color="#059669" />
              تصدير الجداول إلى ملفات Excel / CSV جاهزة للطباعة والتقارير
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              تصدير البيانات بصيغة CSV المتوافقة تماماً مع برامج Excel وتدعم اللغة العربية بترميز UTF-8.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem' }}>
              <button
                onClick={() => handleExportCSV('tickets', 'تذاكر وتقارير الصيانة')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
              >
                <FileText size={16} color="#0284c7" />
                <span>تصدير تقارير الصيانة (Tickets)</span>
              </button>

              <button
                onClick={() => handleExportCSV('assets', 'سجل الأجهزة والعهد')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
              >
                <Laptop size={16} color="#10b981" />
                <span>تصدير سجل الأجهزة (Assets)</span>
              </button>

              <button
                onClick={() => handleExportCSV('inventory', 'قطع الغيار والمخزون')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
              >
                <Package size={16} color="#8b5cf6" />
                <span>تصدير رصيد المخزن (Inventory)</span>
              </button>

              <button
                onClick={() => handleExportCSV('preventive', 'الصيانة الوقائية')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
              >
                <CalendarCheck size={16} color="#06b6d4" />
                <span>تصدير الصيانة الوقائية (Preventive)</span>
              </button>
            </div>
          </div>

          {/* Section 3: Reset to Default Data */}
          <div className="glass-panel" style={{ padding: '1rem 1.25rem', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#dc2626' }}>
                إعادة تعيين قاعدة البيانات الافتراضية
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                استرجاع بيانات التقرير الأصلي وأجهزة المستشفى التجريبية المعتمدة
              </div>
            </div>

            <button
              onClick={handleResetToDefault}
              className="btn btn-danger btn-sm"
            >
              <RotateCcw size={14} />
              <span>إعادة ضبط افتراضي</span>
            </button>
          </div>

        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">إغلاق</button>
        </div>

      </div>
    </div>
  );
};
