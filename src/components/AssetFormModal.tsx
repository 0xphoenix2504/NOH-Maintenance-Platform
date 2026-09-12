import { useState } from 'react';
import type { Asset, DeviceType, DeviceStatus } from '../types';
import { X, Check, Laptop } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface AssetFormModalProps {
  initialAsset?: Asset | null;
  onSave: (asset: Asset) => void;
  onClose: () => void;
}

export const AssetFormModal: React.FC<AssetFormModalProps> = ({ initialAsset, onSave, onClose }) => {
  const [id, setId] = useState(initialAsset?.id || '');
  const [name, setName] = useState(initialAsset?.name || '');
  const [type, setType] = useState<DeviceType>(initialAsset?.type || 'Laptop');
  const [brand, setBrand] = useState(initialAsset?.brand || 'Dell');
  const [model, setModel] = useState(initialAsset?.model || 'Latitude E5470');
  const [serialNumber, setSerialNumber] = useState(initialAsset?.serialNumber || '');
  const [department, setDepartment] = useState(initialAsset?.department || 'الدور الرابع - PICCU');
  const [floor, setFloor] = useState(initialAsset?.floor || 'الدور الرابع');
  const [currentUser, setCurrentUser] = useState(initialAsset?.currentUser || '');
  const [status, setStatus] = useState<DeviceStatus>(initialAsset?.status || 'operational');
  const [ipAddress, setIpAddress] = useState(initialAsset?.ipAddress || '');
  const [cpu, setCpu] = useState(initialAsset?.specifications?.cpu || '');
  const [ram, setRam] = useState(initialAsset?.specifications?.ram || '');
  const [storage, setStorage] = useState(initialAsset?.specifications?.storage || '');
  const [notes, setNotes] = useState(initialAsset?.notes || '');

  // Smart ID generation helper
  const handleAutoGenerateId = () => {
    let floorCode = 'GF';
    if (floor.includes('أول') || floor.includes('1')) floorCode = '1st';
    else if (floor.includes('ثاني') || floor.includes('2')) floorCode = '2nd';
    else if (floor.includes('ثالث') || floor.includes('3')) floorCode = '3rd';
    else if (floor.includes('رابع') || floor.includes('4')) floorCode = '4th';

    let typeCode = 'PC';
    if (type === 'Laptop') typeCode = 'LPTP';
    else if (type === 'Printer') typeCode = 'PRN';
    else if (type === 'Server') typeCode = 'SRV';
    else if (type === 'Network Switch') typeCode = 'SW';
    else if (type === 'Medical Workstation') typeCode = 'WS';

    const randNum = Math.floor(10 + Math.random() * 89);
    setId(`${floorCode}-PICCU-${typeCode}${randNum}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !brand.trim() || !serialNumber.trim()) {
      alert('يرجى تعبئة كود الجهاز والماركة والرقم التسلسلي.');
      return;
    }

    const newAsset: Asset = {
      id: id.trim(),
      name: name.trim() || `${brand} ${model} - ${department}`,
      type,
      brand,
      model,
      serialNumber: serialNumber.trim(),
      department,
      floor,
      roomOrUnit: initialAsset?.roomOrUnit || 'القسم المخصص',
      currentUser: currentUser.trim() || 'قسم تكنولوجيا المعلومات',
      userRole: initialAsset?.userRole || 'موظف',
      status,
      ipAddress,
      specifications: { cpu, ram, storage, os: initialAsset?.specifications?.os || 'Windows 10 Pro' },
      notes,
      createdAt: initialAsset?.createdAt || new Date().toISOString(),
      qrCodeData: `ASSET:${id.trim()}|SN:${serialNumber.trim()}|LOC:${department}`
    };

    onSave(newAsset);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '8px' }}>
              <Laptop size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {initialAsset ? 'تعديل بيانات الجهاز / العهدة' : 'إضافة جهاز أو أصل جديد'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                سجل الأصول والمعدات — مستشفى نيل الأمل
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div className="modal-body">
            
            {/* Row 1: Code, Type, Brand, Model */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">كود الجهاز (Asset ID) *</label>
                  {!initialAsset && (
                    <button
                      type="button"
                      onClick={handleAutoGenerateId}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
                    >
                      توليد تلقائي
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  className="form-control form-control-mono"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="مثال: 4th-PCCU-LPTP02"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">نوع الجهاز *</label>
                <select className="form-control" value={type} onChange={(e) => setType(e.target.value as DeviceType)}>
                  <option value="Laptop">Laptop (حاسوب محمول)</option>
                  <option value="Desktop">Desktop PC (كمبيوتر مكتبي)</option>
                  <option value="Medical Workstation">Medical Workstation (محطة عمل طبية)</option>
                  <option value="Server">Server (خادم مركزي)</option>
                  <option value="Printer">Printer / Scanner (طابعة/ماسح)</option>
                  <option value="Network Switch">Network Switch / Router (شبكات)</option>
                  <option value="Monitor">Monitor (شاشة عرض طبية)</option>
                  <option value="UPS">UPS (وحدة عدم انقطاع التيار)</option>
                  <option value="Other">أخرى</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">الماركة (Brand) *</label>
                <input
                  type="text"
                  className="form-control"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Dell / HP / Lenovo / Cisco"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">الموديل (Model) *</label>
                <input
                  type="text"
                  className="form-control"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Latitude E5470"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">اسم / وصف الجهاز</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: محطة أطباء الرعاية المركزة 2"
                />
              </div>

              <div className="form-group">
                <label className="form-label">الدور / الطابق</label>
                <select className="form-control" value={floor} onChange={(e) => setFloor(e.target.value)}>
                  <option value="الدور الأرضي">الدور الأرضي</option>
                  <option value="الدور الأول">الدور الأول</option>
                  <option value="الدور الثاني">الدور الثاني</option>
                  <option value="الدور الثالث">الدور الثالث</option>
                  <option value="الدور الرابع">الدور الرابع</option>
                  <option value="الدور الخامس">الدور الخامس</option>
                </select>
              </div>
            </div>

            {/* Row 2: Serial Number, Location, User */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">الرقم التسلسلي (Serial Number) *</label>
                <input
                  type="text"
                  className="form-control form-control-mono"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="مثال: BNLMVD2"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">الموقع والقسم (Department) *</label>
                <input
                  type="text"
                  className="form-control"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="مثال: الدور الرابع - PICCU"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">اسم المستخدم / العهدة *</label>
                <input
                  type="text"
                  className="form-control"
                  value={currentUser}
                  onChange={(e) => setCurrentUser(e.target.value)}
                  placeholder="مثال: عبدالرحمن فتحي"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">حالة الجهاز الحالية</label>
                <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value as DeviceStatus)}>
                  <option value="operational">يعمل بكفاءة (Operational)</option>
                  <option value="in_maintenance">تحت الصيانة (In Maintenance)</option>
                  <option value="needs_parts">بانتظار قطع غيار (Needs Parts)</option>
                  <option value="damaged">تالف غير قابل للإصلاح (Damaged)</option>
                  <option value="spare">جهاز احتياطي (Spare Pool)</option>
                </select>
              </div>
            </div>

            {/* Technical Specifications */}
            <div style={{ background: 'var(--bg-card-hover)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
                المواصفات التقنية والشبكة
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">المعالج CPU</label>
                  <input type="text" className="form-control" value={cpu} onChange={(e) => setCpu(e.target.value)} placeholder="Core i5-6300U" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">الذاكرة RAM</label>
                  <input type="text" className="form-control" value={ram} onChange={(e) => setRam(e.target.value)} placeholder="8 GB DDR4" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">وحدة التخزين Storage</label>
                  <input type="text" className="form-control" value={storage} onChange={(e) => setStorage(e.target.value)} placeholder="256GB NVMe SSD" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">عنوان IP</label>
                  <input type="text" className="form-control form-control-mono" value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} placeholder="192.168.4.42" />
                </div>
              </div>
            </div>

            {/* QR preview & Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">ملاحظات إضافية حول الجهاز</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات حول البرامج الطبية المثبتة أو الاستخدام الخاص..."
                />
              </div>

              {id && (
                <div style={{ textAlign: 'center', background: '#ffffff', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <QRCodeSVG value={`NOH-ASSET:${id}`} size={64} />
                  <div style={{ fontSize: '9px', fontWeight: 700, marginTop: '2px', color: '#0f172a' }}>{id}</div>
                </div>
              )}
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">إلغاء</button>
            <button type="submit" className="btn btn-primary btn-lg">
              <Check size={18} />
              حفظ بيانات الجهاز
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
