import { useState } from 'react';
import type { PreventiveScheduleItem } from '../types';
import {
  CheckSquare,
  Square,
  UserCheck,
  Plus,
  Search,
  CheckCircle2,
  Edit,
  Trash2,
  Download,
  CalendarCheck
} from 'lucide-react';
import { PreventiveFormModal } from './PreventiveFormModal';
import { storageService } from '../services/storageService';
import confetti from 'canvas-confetti';

interface PreventiveViewProps {
  schedules: PreventiveScheduleItem[];
  onToggleCheckItem: (scheduleId: string, checkId: string) => void;
  onSaveSchedule: (schedule: PreventiveScheduleItem) => void;
  onDeleteSchedule: (scheduleId: string) => void;
  onCompleteCycle: (scheduleId: string) => void;
}

export const PreventiveView: React.FC<PreventiveViewProps> = ({
  schedules,
  onToggleCheckItem,
  onSaveSchedule,
  onDeleteSchedule,
  onCompleteCycle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [frequencyFilter, setFrequencyFilter] = useState<string>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<PreventiveScheduleItem | null>(null);

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch =
      schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.assignedTechnician.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
    const matchesFreq = frequencyFilter === 'all' || schedule.frequency === frequencyFilter;

    return matchesSearch && matchesStatus && matchesFreq;
  });

  const handleOpenNew = () => {
    setEditingSchedule(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (schedule: PreventiveScheduleItem) => {
    setEditingSchedule(schedule);
    setModalOpen(true);
  };

  const handleCompleteWithCelebration = (scheduleId: string) => {
    onCompleteCycle(scheduleId);
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const handleExportCSV = () => {
    const csvContent = storageService.exportTableToCSV('preventive');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NileOfHope_Preventive_Schedules_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>برنامج الصيانة الوقائية والفحص الدوري</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            جداول الفحص الدوري المجدولة لأجهزة غرف العمليات، العناية المركزة، ووحدة السيرفرات
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary btn-sm" title="تصدير جدول الفحص إلى ملف Excel / CSV">
            <Download size={16} />
            تصدير CSV
          </button>
          <button onClick={handleOpenNew} className="btn btn-primary">
            <Plus size={16} />
            إضافة جدول فحص وقائي جديد
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingRight: '2.4rem' }}
            placeholder="بحث بالعنوان، القسم، أو الفني المسؤول..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ minWidth: '150px' }}>
          <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">كافة الحالات</option>
            <option value="due_today">مستحق اليوم (Due Today)</option>
            <option value="overdue">متأخر (Overdue)</option>
            <option value="upcoming">قادم (Upcoming)</option>
            <option value="completed">مكتمل (Completed)</option>
          </select>
        </div>

        <div style={{ minWidth: '150px' }}>
          <select className="form-control" value={frequencyFilter} onChange={(e) => setFrequencyFilter(e.target.value)}>
            <option value="all">كافة التكرارات</option>
            <option value="daily">يومي</option>
            <option value="weekly">أسبوعي</option>
            <option value="monthly">شهري</option>
            <option value="quarterly">ربع سنوي</option>
          </select>
        </div>
      </div>

      {/* Schedules Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {filteredSchedules.map(schedule => {
          const completedCount = schedule.checklist.filter(c => c.done).length;
          const totalCount = schedule.checklist.length;
          const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
          const isAllDone = totalCount > 0 && completedCount === totalCount;

          return (
            <div
              key={schedule.id}
              className="glass-panel"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                borderTop: schedule.status === 'due_today' ? '3px solid #ea580c' : schedule.status === 'overdue' ? '3px solid #ef4444' : isAllDone ? '3px solid #10b981' : '1px solid var(--border-color)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge badge-spare">
                    {schedule.frequency === 'monthly' ? 'شهري' : schedule.frequency === 'weekly' ? 'أسبوعي' : schedule.frequency === 'daily' ? 'يومي' : 'ربع سنوي'}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: schedule.status === 'due_today' ? '#ea580c' : schedule.status === 'overdue' ? '#ef4444' : 'var(--text-muted)', fontWeight: 700 }}>
                    {schedule.status === 'due_today' ? '⚠️ مستحق اليوم' : schedule.status === 'overdue' ? '🚨 متأخر' : `موعد الفحص: ${schedule.nextDueDate}`}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '4px' }}>
                  {schedule.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  📍 {schedule.department}
                </p>

                {/* Progress Bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                    <span>نسبة إنجاز الفحص</span>
                    <strong>{completedCount} من {totalCount} ({progressPercent}%)</strong>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${progressPercent}%`,
                      height: '100%',
                      background: progressPercent === 100 ? '#10b981' : 'var(--primary)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                {/* Checklist items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    قائمة بنود الفحص (Checklist):
                  </div>
                  {schedule.checklist.map(item => (
                    <div
                      key={item.id}
                      onClick={() => onToggleCheckItem(schedule.id, item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        background: item.done ? 'var(--bg-card-hover)' : 'transparent',
                        cursor: 'pointer',
                        fontSize: '0.82rem'
                      }}
                    >
                      {item.done ? (
                        <CheckSquare size={17} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      ) : (
                        <Square size={17} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      )}
                      <span style={{
                        color: item.done ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: item.done ? 'line-through' : 'none'
                      }}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {/* Complete Cycle Button */}
                <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                  <button
                    onClick={() => handleCompleteWithCelebration(schedule.id)}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                    title="توثيق إتمام هذه الدورة وحساب موعد الفحص القادم وإعادة جدولة البنود"
                  >
                    <CheckCircle2 size={15} />
                    <span>إتمام الدورة وتحديث الجدولة القادمة</span>
                  </button>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <UserCheck size={14} />
                    <span>المسؤول: {schedule.assignedTechnician}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      onClick={() => handleOpenEdit(schedule)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.5rem' }}
                      title="تعديل الجدول"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف جدول "${schedule.title}"؟`)) {
                          onDeleteSchedule(schedule.id);
                        }
                      }}
                      className="btn btn-danger btn-sm"
                      style={{ padding: '0.25rem 0.5rem' }}
                      title="حذف الجدول"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {schedule.lastDoneDate && (
                  <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                    ✓ آخر إتمام معتمد: {schedule.lastDoneDate}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredSchedules.length === 0 && (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <CalendarCheck size={36} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
          <p style={{ fontWeight: 700 }}>لا توجد جداول صيانة وقائية مطابقة للبحث</p>
        </div>
      )}

      {/* Add / Edit Schedule Modal */}
      {modalOpen && (
        <PreventiveFormModal
          initialSchedule={editingSchedule}
          onSave={(schedule) => {
            onSaveSchedule(schedule);
            setModalOpen(false);
            setEditingSchedule(null);
          }}
          onClose={() => {
            setModalOpen(false);
            setEditingSchedule(null);
          }}
        />
      )}

    </div>
  );
};

