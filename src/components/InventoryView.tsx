import { useState } from 'react';
import type { SparePartInventoryItem } from '../types';
import {
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Warehouse
} from 'lucide-react';

interface InventoryViewProps {
  spareParts: SparePartInventoryItem[];
  onUpdateStock: (partId: string, deltaQty: number) => void;
  onSavePart: (part: SparePartInventoryItem) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  spareParts,
  onUpdateStock,
  onSavePart
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New Part Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Storage');
  const [partNumber, setPartNumber] = useState('');
  const [quantityInStock, setQuantityInStock] = useState<number>(5);
  const [minThreshold, setMinThreshold] = useState<number>(2);
  const [unitCost, setUnitCost] = useState<number>(500);
  const [location, setLocation] = useState('مخزن تكنولوجيا المعلومات - خزانة 1');
  const [supplier, setSupplier] = useState('');

  const filteredParts = spareParts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInventoryValue = spareParts.reduce((acc, p) => acc + (p.quantityInStock * p.unitCost), 0);
  const lowStockCount = spareParts.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock').length;

  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: SparePartInventoryItem = {
      id: `sp-${Date.now()}`,
      name: name.trim(),
      category,
      partNumber: partNumber.trim() || `PN-${Date.now().toString().slice(-4)}`,
      quantityInStock: Number(quantityInStock),
      minThreshold: Number(minThreshold),
      unitCost: Number(unitCost),
      location,
      status: Number(quantityInStock) === 0 ? 'out_of_stock' : Number(quantityInStock) <= Number(minThreshold) ? 'low_stock' : 'in_stock',
      supplier
    };

    onSavePart(newItem);
    setIsAddingNew(false);
    setName('');
    setPartNumber('');
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>مخزن وقطع غيار تكنولوجيا المعلومات (IT Spare Parts)</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            إدارة رصيد الهاردات، الرامات، كابلات الشبكة، ورولات الطابعات وتكاليف الشراء
          </p>
        </div>

        <button onClick={() => setIsAddingNew(true)} className="btn btn-primary">
          <Plus size={16} />
          إضافة صنف جديد للمخزن
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Warehouse size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>إجمالي الأصناف المسجلة</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{spareParts.length} صنف</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>القيمة الإجمالية للمخزون</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#059669', fontFamily: 'var(--font-mono)' }}>{totalInventoryValue} ج.م</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>أصناف تحت حد الأمان</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ef4444' }}>{lowStockCount} أصناف</div>
          </div>
        </div>
      </div>

      {/* Add New Part Modal */}
      {isAddingNew && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>إضافة صنف جديد إلى مخزن IT</h3>
              <button onClick={() => setIsAddingNew(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
                ✕
              </button>
            </div>
            <form onSubmit={handleAddNewSubmit} style={{ display: 'contents' }}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">اسم القطعة / الصنف *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: SSD Hard Drive M.2 NVMe 500GB"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">التصنيف</label>
                    <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Storage">وحدات تخزين (Storage / SSD)</option>
                      <option value="RAM Memory">ذواكر (RAM)</option>
                      <option value="Printer Parts">قطع طابعات (Rollers / Toners)</option>
                      <option value="Power Adapters">شواحن ومحولات (Adapters)</option>
                      <option value="Network Cables">كابلات شبكة وأسلاك</option>
                      <option value="Consumables">مستهلكات وصيانة (Thermal Paste)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">رقم القطعة (Part Number)</label>
                    <input
                      type="text"
                      className="form-control form-control-mono"
                      value={partNumber}
                      onChange={(e) => setPartNumber(e.target.value)}
                      placeholder="NVME-500-WD"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">الكمية المتوفرة</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control form-control-mono"
                      value={quantityInStock}
                      onChange={(e) => setQuantityInStock(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">حد الأمان (Min)</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control form-control-mono"
                      value={minThreshold}
                      onChange={(e) => setMinThreshold(parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">سعر الوحدة (ج.م)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control form-control-mono"
                      value={unitCost}
                      onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">مكان التخزين / الرف</label>
                  <input
                    type="text"
                    className="form-control"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="مخزن تكنولوجيا المعلومات - خزانة 1 رف B"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">المورد / الشركة</label>
                  <input
                    type="text"
                    className="form-control"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="اسم المورد المعتمد..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsAddingNew(false)} className="btn btn-secondary">
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  إضافة للمخزن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingRight: '2.4rem' }}
              placeholder="بحث باسم الصنف أو البارت نمبر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>اسم الصنف</th>
                <th>التصنيف</th>
                <th>Part Number</th>
                <th>الرصيد المتاح</th>
                <th>سعر القطعة</th>
                <th>مكان الحفظ</th>
                <th>الحالة</th>
                <th>تعديل الرصيد السريع</th>
              </tr>
            </thead>
            <tbody>
              {filteredParts.map(part => (
                <tr key={part.id}>
                  <td>
                    <strong>{part.name}</strong>
                    {part.supplier && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>المورد: {part.supplier}</div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-spare">{part.category}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{part.partNumber}</span>
                  </td>
                  <td>
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', color: part.quantityInStock <= part.minThreshold ? '#ef4444' : 'var(--text-primary)' }}>
                      {part.quantityInStock}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginRight: '4px' }}>
                      (حد الأمان: {part.minThreshold})
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {part.unitCost} ج.م
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{part.location}</td>
                  <td>
                    {part.quantityInStock === 0 ? (
                      <span className="badge badge-damaged">نافد من المخزن</span>
                    ) : part.quantityInStock <= part.minThreshold ? (
                      <span className="badge badge-maintenance"><AlertTriangle size={12} /> أوشك على النفاد</span>
                    ) : (
                      <span className="badge badge-operational"><CheckCircle2 size={12} /> متوفر</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        onClick={() => onUpdateStock(part.id, 1)}
                        className="btn btn-secondary btn-sm"
                        title="إضافة 1 للمخزن (+1)"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => onUpdateStock(part.id, -1)}
                        className="btn btn-secondary btn-sm"
                        disabled={part.quantityInStock <= 0}
                        title="صرف 1 من المخزن (-1)"
                      >
                        -1
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
