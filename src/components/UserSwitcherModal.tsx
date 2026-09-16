import { useState } from 'react';
import type { UserProfile } from '../types';
import { X, Check, UserPlus, UserCheck, ShieldCheck } from 'lucide-react';

interface UserSwitcherModalProps {
  users: UserProfile[];
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  onAddUser: (user: UserProfile) => void;
  onClose: () => void;
}

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({
  users,
  currentUser,
  onSelectUser,
  onAddUser,
  onClose
}) => {
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('مهندس صيانة IT');
  const [newDepartment, setNewDepartment] = useState('قسم تكنولوجيا المعلومات');

  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: newName.trim(),
      role: newRole.trim(),
      department: newDepartment.trim(),
      isCustom: true
    };

    onAddUser(newUser);
    onSelectUser(newUser);
    setIsAddingCustom(false);
    setNewName('');
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '8px' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                تبديل المستخدم والمهندس النشط
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                سيتم توثيق كافة التعديلات والتذاكر وحركات المخزون باسم هذا الحساب
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          
          {/* User List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              اختر المهندس أو المسؤول الحالي:
            </div>

            {users.map(user => {
              const isSelected = user.id === currentUser.id || user.name === currentUser.name;
              return (
                <div
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: isSelected ? 'var(--primary-light)' : 'var(--bg-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: isSelected ? '#0284c7' : 'var(--bg-card-hover)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800
                    }}>
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {user.role} {user.department ? `• ${user.department}` : ''}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div style={{
                      background: 'var(--primary)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Custom User section */}
          {!isAddingCustom ? (
            <button
              onClick={() => setIsAddingCustom(true)}
              className="btn btn-secondary"
              style={{ width: '100%', borderStyle: 'dashed' }}
            >
              <UserPlus size={16} />
              إضافة مهندس أو مستخدم جديد للقائمة
            </button>
          ) : (
            <form onSubmit={handleAddNewSubmit} style={{ background: 'var(--bg-card-hover)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary)' }}>
                تسجيل مستخدم / فني جديد
              </div>

              <div className="form-group">
                <label className="form-label">الاسم بالكامل (مع اللقب) *</label>
                <input
                  type="text"
                  className="form-control"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثال: ENG أحمد فتحي"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div className="form-group">
                  <label className="form-label">المسمى الوظيفي</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="مهندس صيانة IT"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">القسم</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="تكنولوجيا المعلومات"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  className="btn btn-secondary btn-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  حفظ وتفعيل
                </button>
              </div>
            </form>
          )}

        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
