import { useState } from 'react';
import type { PreventiveScheduleItem } from '../types';
import { X, Plus, Trash2, CalendarCheck, Check } from 'lucide-react';

interface PreventiveFormModalProps {
  initialSchedule?: PreventiveScheduleItem | null;
  onSave: (schedule: PreventiveScheduleItem) => void;
  onClose: () => void;
}

export const PreventiveFormModal: React.FC<PreventiveFormModalProps> = ({
  initialSchedule,
  onSave,
  onClose
}) => {
  const [title, setTitle] = useState(initialSchedule?.title || '');
  const [department, setDepartment] = useState(initialSchedule?.department || 'الدور الثالث - جناح العمليات الكبرى');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>(initialSchedule?.frequency || 'monthly');
  const [assignedTechnician, setAssignedTechnician] = useState(initialSchedule?.assignedTechnician || 'ENG Abdelrahman');
  
  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };

  const [nextDueDate, setNextDueDate] = useState(initialSchedule?.nextDueDate || defaultDueDate());
  const [status, setStatus] = useState<'upcoming' | 'due_today' | 'overdue' | 'completed'>(initialSchedule?.status || 'upcoming');
  
  // Checklist items
  const [checklist, setChecklist] = useState<Array<{ id: string; text: string; done: boolean }>>(
    initialSchedule?.checklist || [
      { id: `c-1`, text: 'فحص درجات حرارة الأجهزة والتهوية', done: false },
      { id: `c-2`, text: 'التأكد من سلامة كابلات الشبكة والطاقة والتأريض', done: false },
      { id: `c-3`, text: 'تحديث مكافح الفيروسات وتفحص استقرار النظام', done: false }
    ]
  );
  const [newItemText, setNewItemText] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    setChecklist([
      ...checklist,
      { id: `chk-${Date.now()}`, text: newItemText.trim(), done: false }
    ]);
    setNewItemText('');
  };

  const handleRemoveItem = (index: number) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('يرجى إدخال عنوان جدول الفحص الوقائي');
      return;
    }

    if (checklist.length === 0) {
      alert('يرجى إضافة بند فحص واحد على الأقل في قائمة Checklist');
      return;
    }

    const schedule: PreventiveScheduleItem = {
      id: initialSchedule?.id || `prev-${Date.now()}`,
      title: title.trim(),
      department: department.trim(),
      frequency,
      assignedTechnician: assignedTechnician.trim(),
      nextDueDate,
      lastDoneDate: initialSchedule?.lastDoneDate,
      status,
      checklist
    };

    onSave(schedule);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#ecfeff', color: '#0891b2', padding: '8px', borderRadius: '8px' }}>
              <CalendarCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {initialSchedule ? 'تعديل جدول الصيانة الوقائية' : 'إضافة جدول صيانة وقائية وفحص دوري جديد'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                جدولة الفحص الوقائي لأجهزة العمليات، العناية، والسيرفرات
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div className="modal-body">
            
            <div className="form-group">
              <label className="form-label">عنوان جدول الفحص الوقائي *</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: الفحص الوقائي الدوري لمحطات التمريض في ICU"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">الموقع / القسم المستهدف *</label>
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
                <label className="form-label">دورية الفحص (Frequency) *</label>
                <select
                  className="form-control"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                >
                  <option value="daily">يومي (Daily)</option>
                  <option value="weekly">أسبوعي (Weekly)</option>
                  <option value="monthly">شهري (Monthly)</option>
                  <option value="quarterly">ربع سنوي (Quarterly)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">الفني / المهندس المسؤول *</label>
                <input
                  type="text"
                  className="form-control"
                  value={assignedTechnician}
                  onChange={(e) => setAssignedTechnician(e.target.value)}
                  placeholder="ENG Abdelrahman"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">موعد الفحص القادم *</label>
                <input
                  type="date"
                  className="form-control form-control-mono"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">حالة الجدول الحالية</label>
              <select
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="upcoming">قادم (Upcoming)</option>
                <option value="due_today">مستحق اليوم (Due Today)</option>
                <option value="overdue">متأخر (Overdue)</option>
                <option value="completed">مكتمل (Completed)</option>
              </select>
            </div>

            {/* Checklist Editor Section */}
            <div style={{ marginTop: '0.5rem', background: 'var(--bg-card-hover)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label className="form-label" style={{ marginBottom: 0, fontWeight: 800 }}>
                  قائمة بنود الفحص الدوري (Checklist Items) *
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{checklist.length} بنود محددة</span>
              </div>

              {/* Add New Check Item Input */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  className="form-control"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="أدخل بند فحص جديد (مثال: تنظيف مراوح التبريد وإزالة الأتربة)..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddItem(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="btn btn-primary"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Plus size={16} />
                  إضافة بند
                </button>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '180px', overflowY: 'auto' }}>
                {checklist.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--bg-secondary)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.78rem' }}>#{idx + 1}</span>
                      <span>{item.text}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="btn btn-danger btn-sm"
                      style={{ padding: '0.2rem 0.45rem' }}
                      title="حذف البند"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary btn-lg">
              <Check size={18} />
              {initialSchedule ? 'حفظ التعديلات' : 'إنشاء جدول الصيانة الوقائية'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
