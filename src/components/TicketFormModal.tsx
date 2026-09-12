import { useState, useEffect } from 'react';
import type { MaintenanceTicket, Asset, SparePartInventoryItem, UsedSparePart, ReportingSource, IssueCategory, PriorityLevel, PostMaintenanceStatus } from '../types';
import { X, Plus, Trash2, Wrench, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TicketFormModalProps {
  initialTicket?: MaintenanceTicket | null;
  initialAssetId?: string;
  assets: Asset[];
  spareParts: SparePartInventoryItem[];
  onSave: (ticket: MaintenanceTicket) => void;
  onClose: () => void;
}

export const TicketFormModal: React.FC<TicketFormModalProps> = ({
  initialTicket,
  initialAssetId,
  assets,
  spareParts,
  onSave,
  onClose
}) => {
  // Generate random default report ID if new
  const now = new Date();
  const defaultReportId = `R${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
  const defaultDateTime = now.toISOString().slice(0, 16);

  const [id, setId] = useState(initialTicket?.id || defaultReportId);
  const [assetId, setAssetId] = useState(initialTicket?.assetId || initialAssetId || (assets[0]?.id || ''));
  const [technicianName, setTechnicianName] = useState(initialTicket?.technicianName || 'ENG Abdelrahman');
  
  const [reportDateTime, setReportDateTime] = useState(initialTicket?.reportDateTime || defaultDateTime);
  const [resolutionDateTime, setResolutionDateTime] = useState(initialTicket?.resolutionDateTime || defaultDateTime);
  
  const [reportingSource, setReportingSource] = useState<ReportingSource>(initialTicket?.reportingSource || 'user_report');
  const [issueCategory, setIssueCategory] = useState<IssueCategory>(initialTicket?.issueCategory || 'hardware');
  const [priority, setPriority] = useState<PriorityLevel>(initialTicket?.priority || 'medium');
  
  const [userProblemDescription, setUserProblemDescription] = useState(initialTicket?.userProblemDescription || '');
  const [diagnosis, setDiagnosis] = useState(initialTicket?.diagnosis || '');
  const [actionTaken, setActionTaken] = useState(initialTicket?.actionTaken || '');
  
  const [statusAfterMaintenance, setStatusAfterMaintenance] = useState<PostMaintenanceStatus>(initialTicket?.statusAfterMaintenance || 'repaired');
  
  const [notesAndRecommendations, setNotesAndRecommendations] = useState(initialTicket?.notesAndRecommendations || '');
  const [technicianSignature, setTechnicianSignature] = useState(initialTicket?.technicianSignature || 'ENG Abdelrahman (IT Dept)');
  const [userSignature, setUserSignature] = useState(initialTicket?.userSignature || '');

  // Spare Parts state
  const [usedParts, setUsedParts] = useState<UsedSparePart[]>(initialTicket?.sparePartsUsed || []);
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [selectedPartQty, setSelectedPartQty] = useState<number>(1);
  const [selectedPartOrigin, setSelectedPartOrigin] = useState<'hospital_inventory' | 'external_emergency' | 'under_warranty'>('hospital_inventory');

  // Selected Asset Details
  const selectedAsset = assets.find(a => a.id === assetId);

  useEffect(() => {
    if (selectedAsset && !userSignature) {
      setUserSignature(`${selectedAsset.currentUser} (${selectedAsset.department.split('-')[1] || selectedAsset.department})`);
    }
  }, [selectedAsset, userSignature]);

  // Calculate downtime helper
  const calculateDowntime = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return { text: '—', hours: 0 };
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) return { text: 'أقل من ساعة', hours: 0 };

    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffHours / 24);
    const hours = diffHours % 24;

    if (days > 0) {
      return { text: `${days} أيام ${hours > 0 ? `و ${hours} ساعة` : ''}`, hours: diffHours };
    }
    return { text: `${hours} ساعة`, hours: diffHours };
  };

  const handleAddPart = () => {
    if (!selectedPartId) return;
    const invItem = spareParts.find(p => p.id === selectedPartId);
    if (!invItem) return;

    const newPart: UsedSparePart = {
      id: `sp-${Date.now()}`,
      name: invItem.name,
      partNumber: invItem.partNumber,
      quantity: Number(selectedPartQty),
      unitCost: invItem.unitCost,
      totalCost: invItem.unitCost * Number(selectedPartQty),
      origin: selectedPartOrigin
    };

    setUsedParts([...usedParts, newPart]);
    setSelectedPartId('');
    setSelectedPartQty(1);
  };

  const handleRemovePart = (index: number) => {
    setUsedParts(usedParts.filter((_: UsedSparePart, i: number) => i !== index));
  };

  const totalPartsCost = usedParts.reduce((acc: number, curr: UsedSparePart) => acc + curr.totalCost, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !assetId) {
      alert('يرجى التأكد من إدخال رقم التقرير واختيار الجهاز.');
      return;
    }

    const dt = calculateDowntime(reportDateTime, resolutionDateTime);

    const updatedTicket: MaintenanceTicket = {
      id: id.trim(),
      assetId,
      technicianName,
      reportDateTime,
      resolutionDateTime,
      reportingSource,
      issueCategory,
      priority,
      userProblemDescription,
      diagnosis,
      actionTaken,
      sparePartsUsed: usedParts,
      totalCost: totalPartsCost,
      downtimeFormatted: dt.text,
      downtimeHours: dt.hours,
      statusAfterMaintenance,
      notesAndRecommendations,
      technicianSignature,
      userSignature,
      status: statusAfterMaintenance === 'repaired' ? 'resolved' : statusAfterMaintenance === 'needs_parts' ? 'pending_parts' : 'in_progress',
      createdAt: initialTicket?.createdAt || new Date().toISOString()
    };

    onSave(updatedTicket);

    // Trigger celebration if solved
    if (statusAfterMaintenance === 'repaired') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // ignore
      }
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '850px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '8px' }}>
              <Wrench size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {initialTicket ? 'تعديل تقرير صيانة' : 'تسجيل بلاغ وتقرير صيانة جديد'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                قسم تكنولوجيا المعلومات — مستشفى نيل الأمل
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div className="modal-body">
            
            {/* Step 1: بيانات التقرير */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                1. بيانات التقرير الأساسية
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">رقم التقرير (Report ID) *</label>
                  <input
                    type="text"
                    className="form-control form-control-mono"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    required
                    placeholder="مثال: R10-9-2026"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">اسم الفني المسؤول *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    required
                    placeholder="ENG Abdelrahman"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">تاريخ ووقت البلاغ *</label>
                  <input
                    type="datetime-local"
                    className="form-control form-control-mono"
                    value={reportDateTime}
                    onChange={(e) => setReportDateTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">تاريخ ووقت انتهاء الصيانة</label>
                  <input
                    type="datetime-local"
                    className="form-control form-control-mono"
                    value={resolutionDateTime}
                    onChange={(e) => setResolutionDateTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: بيانات الجهاز المستهدف */}
            <div style={{ marginBottom: '1.5rem', background: 'var(--bg-card-hover)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                2. بيانات الجهاز والعهدة
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">اختر الجهاز من السجل (Asset Selection) *</label>
                  <select
                    className="form-control"
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    required
                  >
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.id} — {a.brand} {a.model} ({a.department} | {a.currentUser})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedAsset && (
                  <>
                    <div className="form-group">
                      <label className="form-label">النوع والماركة</label>
                      <input
                        type="text"
                        className="form-control"
                        value={`${selectedAsset.type} - ${selectedAsset.brand} ${selectedAsset.model}`}
                        disabled
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">الرقم التسلسلي (S/N)</label>
                      <input
                        type="text"
                        className="form-control form-control-mono"
                        value={selectedAsset.serialNumber}
                        disabled
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">الموقع / القسم</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedAsset.department}
                        disabled
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">اسم المستخدم / العهدة</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedAsset.currentUser}
                        disabled
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Step 3: تفاصيل البلاغ والتشخيص */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                3. وصف المشكلة والتشخيص الفني
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">مصدر البلاغ</label>
                  <select
                    className="form-control"
                    value={reportingSource}
                    onChange={(e) => setReportingSource(e.target.value as ReportingSource)}
                  >
                    <option value="user_report">بلاغ مستخدم</option>
                    <option value="periodic_check">فحص دوري وقائي</option>
                    <option value="network_alert">إنذار شبكة ومراقبة</option>
                    <option value="management">توجيه إدارة المستشفى</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">نوع العطل</label>
                  <select
                    className="form-control"
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value as IssueCategory)}
                  >
                    <option value="hardware">هاردوير (Hardware)</option>
                    <option value="software">سوفت وير (Software)</option>
                    <option value="network">شبكات وانترنت (Network)</option>
                    <option value="os">نظام التشغيل (OS / Windows)</option>
                    <option value="printer">طابعة أو ماسح ضوئي</option>
                    <option value="preventive">صيانة وقائية دورية</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">مستوى الأولوية</label>
                  <select
                    className="form-control"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  >
                    <option value="low">منخفض (Low)</option>
                    <option value="medium">متوسط (Medium)</option>
                    <option value="high">عالي (High)</option>
                    <option value="critical">حرج جداً (Critical - طوارئ/عمليات)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">وصف المستخدم للمشكلة *</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={userProblemDescription}
                  onChange={(e) => setUserProblemDescription(e.target.value)}
                  placeholder="مثال: الويندوز مش شغال و فيه شاشة سودا"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">التشخيص (السبب الجذري للمشكلة) *</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="مثال: عطل في الهارد ديسك SSD بسبب انتهاء العمر الافتراضي"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">الإجراء المتخذ لحل المشكلة *</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="مثال: تم تغيير الهارد بهارد جديد وتثبيت نظام التشغيل والبرامج الطبية اللازمة"
                  required
                />
              </div>
            </div>

            {/* Step 4: قطع الغيار والتكاليف */}
            <div style={{ marginBottom: '1.5rem', background: 'var(--bg-card-hover)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                4. قطع الغيار المستهلكة والتكاليف
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr auto', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">اختر قطعة الغيار</label>
                  <select
                    className="form-control"
                    value={selectedPartId}
                    onChange={(e) => setSelectedPartId(e.target.value)}
                  >
                    <option value="">-- اختر من مخزن IT --</option>
                    {spareParts.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.unitCost} ج.م | المتوفر: {p.quantityInStock})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">الكمية</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control form-control-mono"
                    value={selectedPartQty}
                    onChange={(e) => setSelectedPartQty(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">مصدر القطعة</label>
                  <select
                    className="form-control"
                    value={selectedPartOrigin}
                    onChange={(e) => setSelectedPartOrigin(e.target.value as any)}
                  >
                    <option value="hospital_inventory">مخزن المستشفى</option>
                    <option value="external_emergency">خارجي (ضرورة قصوى)</option>
                    <option value="under_warranty">تحت الضمان / توكيل</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleAddPart}
                  className="btn btn-primary"
                  style={{ height: '40px' }}
                >
                  <Plus size={16} />
                  إضافة
                </button>
              </div>

              {usedParts.length > 0 ? (
                <div className="custom-table-container" style={{ marginTop: '0.75rem' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>القطعة</th>
                        <th>الكمية</th>
                        <th>سعر الوحدة</th>
                        <th>الإجمالي</th>
                        <th>المصدر</th>
                        <th>حذف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usedParts.map((part: UsedSparePart, idx: number) => (
                        <tr key={idx}>
                          <td><strong>{part.name}</strong></td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{part.quantity}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{part.unitCost} ج.م</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{part.totalCost} ج.م</td>
                          <td>
                            <span className="badge badge-spare">
                              {part.origin === 'hospital_inventory' ? 'مخزن المستشفى' : part.origin === 'external_emergency' ? 'خارجي طارئ' : 'ضمان'}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleRemovePart(idx)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: '0.2rem 0.5rem' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                    إجمالي تكلفة قطع الغيار: {totalPartsCost} ج.م
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.5rem' }}>
                  لم يتم إضافة قطع غيار مستهلكة لهذا التقرير حتى الآن.
                </p>
              )}
            </div>

            {/* Step 5: الحالة النهائية والتوصيات والتوقيعات */}
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                5. الحالة بعد الصيانة والاعتماد
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">الحالة بعد الصيانة *</label>
                  <select
                    className="form-control"
                    value={statusAfterMaintenance}
                    onChange={(e) => setStatusAfterMaintenance(e.target.value as PostMaintenanceStatus)}
                  >
                    <option value="repaired">تم الإصلاح بنجاح (Repaired)</option>
                    <option value="needs_parts">يحتاج قطعة غيار (Pending Parts)</option>
                    <option value="under_observation">قيد الملاحظة (Under Observation)</option>
                    <option value="unrepairable">تالف غير قابل للإصلاح (Damaged/Scrap)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">توقيع الفني المسؤول</label>
                  <input
                    type="text"
                    className="form-control"
                    value={technicianSignature}
                    onChange={(e) => setTechnicianSignature(e.target.value)}
                    placeholder="ENG Abdelrahman"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">توقيع المستخدم / المستلم</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userSignature}
                    onChange={(e) => setUserSignature(e.target.value)}
                    placeholder="اسم المستخدم والقسم"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">ملاحظات وتوصيات للمستقبل</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={notesAndRecommendations}
                  onChange={(e) => setNotesAndRecommendations(e.target.value)}
                  placeholder="مثال: يوصى بتوفير هارد NVMe أصلي من مخزن المستشفى وفحص دوري لدرجات الحرارة"
                />
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary btn-lg">
              <Check size={18} />
              حفظ واعتماد التقرير
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
