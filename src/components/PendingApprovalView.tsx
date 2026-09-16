import { useState } from 'react';
import type { UserAccount } from '../types';
import { storageService } from '../services/storageService';
import {
  Clock,
  LogOut,
  RefreshCw
} from 'lucide-react';

interface PendingApprovalViewProps {
  user: UserAccount;
  onRefreshUser: (updatedUser: UserAccount) => void;
  onLogout: () => void;
}

export const PendingApprovalView: React.FC<PendingApprovalViewProps> = ({
  user,
  onRefreshUser,
  onLogout
}) => {
  const [checking, setChecking] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleCheckApproval = () => {
    setChecking(true);
    setMsg(null);
    setTimeout(() => {
      const accounts = storageService.getAccounts();
      const current = accounts.find(a => a.id === user.id);
      setChecking(false);
      if (current && current.status === 'active' && current.permissions.length > 0) {
        onRefreshUser(current);
      } else {
        setMsg('لا يزال حسابك بانتظار اعتماد الصلاحيات من مدير النظام. يرجى التواصل مع مسؤول قسم تكنولوجيا المعلومات.');
      }
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'var(--bg-primary)',
      position: 'relative'
    }}>
      <div className="bg-ambient" />

      <div style={{ width: '100%', maxWidth: '520px', position: 'relative', zIndex: 10 }}>
        
        {/* Card */}
        <div className="glass-panel" style={{
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          textAlign: 'center'
        }}>
          
          {/* Animated Pending Icon */}
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: '#fffbeb',
            color: '#d97706',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            border: '2px solid rgba(217, 119, 6, 0.3)',
            boxShadow: '0 8px 20px rgba(217, 119, 6, 0.15)'
          }}>
            <Clock size={36} />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            حسابك بانتظار تفعيل الصلاحيات من مدير النظام
          </h2>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            تم إنشاء وتأكيد حسابك بنجاح. وفقاً لسياسة الأمان والخصوصية في <strong>مستشفى نيل الأمل</strong>، يتم تعيين كافة الحسابات الجديدة بحالة فارغة افتراضياً حتى يقوم مدير النظام (Admin) بتحديد الأقسام والصلاحيات المصرح لك بالدخول إليها.
          </p>

          {/* User Details Card */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            textAlign: 'right',
            marginBottom: '1.5rem'
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem' }}>
              بيانات الحساب المسجل:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>الاسم:</span>
                <strong>{user.name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>اسم المستخدم:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{user.username}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>القسم:</span>
                <span>{user.department}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>الوظيفة:</span>
                <span>{user.jobTitle}</span>
              </div>
            </div>
          </div>

          {msg && (
            <div style={{
              padding: '0.65rem 0.85rem',
              background: '#fffbeb',
              color: '#b45309',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              marginBottom: '1rem',
              border: '1px solid rgba(217, 119, 6, 0.2)'
            }}>
              {msg}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={handleCheckApproval}
              disabled={checking}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              <RefreshCw size={16} className={checking ? 'spin' : ''} />
              <span>فحص تفعيل الصلاحيات</span>
            </button>

            <button
              onClick={onLogout}
              className="btn btn-secondary"
            >
              <LogOut size={16} />
              <span>تسجيل الخروج</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
