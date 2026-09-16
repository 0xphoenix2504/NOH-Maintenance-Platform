import { useRef, useState } from 'react';
import type { MaintenanceTicket, Asset } from '../types';
import { Printer, Download, X, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface OfficialReportModalProps {
  ticket: MaintenanceTicket;
  asset?: Asset;
  onClose: () => void;
}

export const OfficialReportModal: React.FC<OfficialReportModalProps> = ({ ticket, asset, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Helper translations
  const getReportingSourceText = (source: string) => {
    switch (source) {
      case 'user_report': return 'بلاغ مستخدم';
      case 'periodic_check': return 'فحص دوري وقائي';
      case 'network_alert': return 'إنذار شبكة ومراقبة';
      case 'management': return 'توجيه إدارة';
      default: return source;
    }
  };

  const getIssueCategoryText = (cat: string) => {
    switch (cat) {
      case 'hardware': return 'هاردوير';
      case 'software': return 'سوفت وير';
      case 'network': return 'شبكات';
      case 'os': return 'نظام التشغيل';
      case 'preventive': return 'صيانة وقائية';
      default: return cat;
    }
  };

  const getStatusAfterText = (status: string) => {
    switch (status) {
      case 'repaired': return 'تم الإصلاح بنجاح';
      case 'needs_parts': return 'يحتاج قطعة غيار';
      case 'under_observation': return 'قيد الملاحظة';
      case 'unrepairable': return 'تالف غير قابل للإصلاح';
      default: return status;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsExporting(true);

    try {
      const element = printRef.current;
      const pages = element.querySelectorAll<HTMLElement>('.official-report-sheet');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`NileOfHope_Maintenance_Report_${ticket.id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ أثناء إنشاء ملف الـ PDF. يرجى تجربة خيار الطباعة المباشرة.');
    } finally {
      setIsExporting(false);
    }
  };

  // Resolved Asset info
  const assetData = asset || {
    id: ticket.assetId,
    type: 'Laptop',
    brand: 'Dell',
    model: 'Latitude E5470',
    serialNumber: 'BNLMVD2',
    department: 'الدور الرابع - PICCU',
    currentUser: 'عبدالرحمن فتحي'
  };

  const sparePartsListText = ticket.sparePartsUsed && ticket.sparePartsUsed.length > 0
    ? ticket.sparePartsUsed.map(p => `${p.name} (x${p.quantity})`).join(', ')
    : 'لا يوجد';

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '980px', maxHeight: '95vh' }}>
        {/* Top Control Bar (Hidden when printing) */}
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '6px', borderRadius: '8px' }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>التقرير الرسمي للصيانة (معتمد)</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                رقم التقرير: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{ticket.id}</span>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="btn btn-emerald btn-sm"
              title="تصدير ملف PDF عالي الدقة"
            >
              <Download size={16} />
              {isExporting ? 'جاري التصدير...' : 'تصدير PDF'}
            </button>
            <button onClick={handlePrint} className="btn btn-primary btn-sm" title="طباعة فورية">
              <Printer size={16} />
              طباعة
            </button>
            <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="modal-body" style={{ background: '#64748b20', padding: '1.5rem', overflowY: 'auto' }}>
          <div ref={printRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* =================== PAGE 1 =================== */}
            <div className="official-report-sheet">
              {/* Header */}
              <div className="report-header-banner">
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0369a1' }}>Nile of Hope Hospital</h3>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>IT Department — Maintenance Report</p>
                </div>

                {/* Hospital Logo Emblem */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0284c7' }}>مستشفى نيل الأمل</div>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>Pediatric Surgeries & Congenital Anomalies</div>
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: '#ffffff',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #cbd5e1',
                    padding: '2px',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)'
                  }}>
                    <img src="/logo.png" alt="مستشفى نيل الأمل" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                </div>
              </div>

              {/* Title Box */}
              <div className="report-title-box">
                <h1>تقرير صيانة أجهزة</h1>
                <p>قسم تكنولوجيا المعلومات</p>
              </div>

              {/* Section 1: بيانات التقرير */}
              <div className="report-section">
                <div className="report-section-title">بيانات التقرير</div>
                <div className="report-grid-2">
                  <div className="report-field">
                    <div className="report-field-label">رقم التقرير</div>
                    <div className="report-field-value" style={{ fontFamily: 'var(--font-mono)' }}>{ticket.id}</div>
                  </div>
                  <div className="report-field">
                    <div className="report-field-label">اسم الفني المسؤول</div>
                    <div className="report-field-value">{ticket.technicianName}</div>
                  </div>
                  <div className="report-field">
                    <div className="report-field-label">تاريخ ووقت البلاغ</div>
                    <div className="report-field-value" style={{ fontFamily: 'var(--font-mono)' }}>{ticket.reportDateTime}</div>
                  </div>
                  <div className="report-field">
                    <div className="report-field-label">تاريخ ووقت انتهاء الصيانة</div>
                    <div className="report-field-value" style={{ fontFamily: 'var(--font-mono)' }}>{ticket.resolutionDateTime || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Section 2: بيانات الجهاز */}
              <div className="report-section">
                <div className="report-section-title">بيانات الجهاز</div>
                <div className="report-grid-2">
                  <div className="report-field">
                    <div className="report-field-label">كود الجهاز (Asset ID)</div>
                    <div className="report-field-value" style={{ fontFamily: 'var(--font-mono)', color: '#0369a1' }}>{ticket.assetId}</div>
                  </div>
                  <div className="report-field">
                    <div className="report-field-label">نوع الجهاز</div>
                    <div className="report-field-value">{assetData.type}</div>
                  </div>
                  <div className="report-field">
                    <div className="report-field-label">الماركة والموديل</div>
                    <div className="report-field-value">{assetData.brand} {assetData.model}</div>
                  </div>
                  <div className="report-field">
                    <div className="report-field-label">الرقم التسلسلي (Serial Number)</div>
                    <div className="report-field-value" style={{ fontFamily: 'var(--font-mono)' }}>{assetData.serialNumber}</div>
                  </div>
                  <div className="report-field">
                    <div className="report-field-label">الموقع / القسم</div>
                    <div className="report-field-value">{assetData.department}</div>
                  </div>
                  <div className="report-field">
                    <div className="report-field-label">اسم المستخدم</div>
                    <div className="report-field-value">{assetData.currentUser}</div>
                  </div>
                </div>
              </div>

              {/* Section 3: مصدر البلاغ ووصف المشكلة */}
              <div className="report-section">
                <div className="report-section-title">مصدر البلاغ ووصف المشكلة</div>
                <div className="report-grid-2" style={{ marginBottom: '10px' }}>
                  <div className="report-field">
                    <div className="report-field-label">مصدر البلاغ</div>
                    <div className="report-field-value">{getReportingSourceText(ticket.reportingSource)}</div>
                  </div>
                  <div className="report-field">
                    <div className="report-field-label">نوع العطل</div>
                    <div className="report-field-value">{getIssueCategoryText(ticket.issueCategory)}</div>
                  </div>
                </div>
                <div className="report-field">
                  <div className="report-field-label">وصف المستخدم للمشكلة</div>
                  <div className="report-textarea-box">
                    {ticket.userProblemDescription || 'لا يوجد وصف مدخل'}
                  </div>
                </div>
              </div>

              {/* Page 1 Footer */}
              <div className="report-footer-banner">
                Nile of Hope Hospital — Pediatric Surgeries & Congenital Anomalies — IT Maintenance Report — Page 1 of 2
              </div>
            </div>

            {/* =================== PAGE 2 =================== */}
            <div className="official-report-sheet">
              {/* Header */}
              <div className="report-header-banner">
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0369a1' }}>Nile of Hope Hospital</h3>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>IT Department — Maintenance Report (Continued)</p>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                  رقم التقرير: <strong>{ticket.id}</strong>
                </div>
              </div>

              {/* Section 4: التشخيص والإجراء المتخذ */}
              <div className="report-section">
                <div className="report-section-title">التشخيص والإجراء المتخذ</div>
                <div className="report-field" style={{ marginBottom: '12px' }}>
                  <div className="report-field-label">التشخيص (السبب الجذري)</div>
                  <div className="report-textarea-box">
                    {ticket.diagnosis || 'قيد الفحص والتشخيص'}
                  </div>
                </div>
                <div className="report-field">
                  <div className="report-field-label">الإجراء المتخذ</div>
                  <div className="report-textarea-box">
                    {ticket.actionTaken || 'قيد اتخاذ الإجراء اللازم'}
                  </div>
                </div>
              </div>

              {/* Section 5: قطع الغيار ووقت التوقف */}
              <div className="report-section">
                <div className="report-section-title">قطع الغيار ووقت التوقف</div>
                <div className="report-grid-2">
                  <div className="report-field">
                    <div className="report-field-label">قطع الغيار المستخدمة</div>
                    <div className="report-field-value">{sparePartsListText}</div>
                  </div>
                  <div className="report-field">
                    <div className="report-field-label">التكلفة (إن وجدت)</div>
                    <div className="report-field-value" style={{ fontFamily: 'var(--font-mono)' }}>
                      {ticket.totalCost > 0 ? `${ticket.totalCost} ج.م` : 'بدون تكلفة إضافية'}
                    </div>
                  </div>
                  <div className="report-field">
                    <div className="report-field-label">مدة التوقف (Downtime)</div>
                    <div className="report-field-value" style={{ color: '#ea580c' }}>{ticket.downtimeFormatted || '—'}</div>
                  </div>
                  <div className="report-field">
                    <div className="report-field-label">الحالة بعد الصيانة</div>
                    <div className="report-field-value" style={{ color: ticket.statusAfterMaintenance === 'repaired' ? '#16a34a' : '#7c3aed' }}>
                      {getStatusAfterText(ticket.statusAfterMaintenance)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 6: ملاحظات وتوصيات */}
              <div className="report-section">
                <div className="report-section-title">ملاحظات وتوصيات</div>
                <div className="report-field">
                  <div className="report-textarea-box" style={{ minHeight: '80px' }}>
                    {ticket.notesAndRecommendations || 'لا توجد ملاحظات إضافية.'}
                  </div>
                </div>
              </div>

              {/* Section 7: التوقيعات والاعتماد */}
              <div className="report-section" style={{ marginTop: '25px' }}>
                <div className="report-grid-2" style={{ gap: '24px' }}>
                  <div>
                    <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      توقيع الفني المسؤول
                    </div>
                    <div className="signature-box">
                      <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '13px', color: '#0369a1' }}>
                        {ticket.technicianSignature || ticket.technicianName}
                      </div>
                      <div style={{ textAlign: 'center', fontSize: '10px', color: '#94a3b8' }}>قسم تكنولوجيا المعلومات IT</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      توقيع المستخدم / المسؤول
                    </div>
                    <div className="signature-box">
                      <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                        {ticket.userSignature || assetData.currentUser}
                      </div>
                      <div style={{ textAlign: 'center', fontSize: '10px', color: '#94a3b8' }}>القسم المستفيد / العهدة</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Page 2 Footer */}
              <div className="report-footer-banner">
                Nile of Hope Hospital — Pediatric Surgeries & Congenital Anomalies — IT Maintenance Report — Page 2 of 2
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
