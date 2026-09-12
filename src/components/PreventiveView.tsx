import type { PreventiveScheduleItem } from '../types';
import {
  CheckSquare,
  Square,
  UserCheck
} from 'lucide-react';

interface PreventiveViewProps {
  schedules: PreventiveScheduleItem[];
  onToggleCheckItem: (scheduleId: string, checkId: string) => void;
}

export const PreventiveView: React.FC<PreventiveViewProps> = ({
  schedules,
  onToggleCheckItem
}) => {
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
      </div>

      {/* Schedules Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {schedules.map(schedule => {
          const completedCount = schedule.checklist.filter(c => c.done).length;
          const totalCount = schedule.checklist.length;
          const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <div
              key={schedule.id}
              className="glass-panel"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge badge-spare">
                    {schedule.frequency === 'monthly' ? 'شهري' : schedule.frequency === 'weekly' ? 'أسبوعي' : 'ربع سنوي'}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: schedule.status === 'due_today' ? '#ea580c' : 'var(--text-muted)', fontWeight: 700 }}>
                    {schedule.status === 'due_today' ? '⚠️ مستحق اليوم' : `موعد الفحص: ${schedule.nextDueDate}`}
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

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <UserCheck size={14} />
                  <span>المسؤول: {schedule.assignedTechnician}</span>
                </div>
                {schedule.lastDoneDate && (
                  <span>آخر فحص: {schedule.lastDoneDate}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
