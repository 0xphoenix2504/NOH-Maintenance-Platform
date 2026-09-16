import { useState } from 'react';
import type { UserAccount } from '../types';
import { storageService } from '../services/storageService';
import {
  Lock,
  User,
  Briefcase,
  ArrowLeft,
  UserPlus,
  LogIn,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';

interface AuthViewProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState('قسم تكنولوجيا المعلومات IT');
  const [regJobTitle, setRegJobTitle] = useState('مهندس صيانة ودعم فني');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginIdentifier.trim() || !loginPassword) {
      setErrorMsg('يرجى إدخال اسم المستخدم وكلمة المرور.');
      return;
    }

    const result = storageService.login(loginIdentifier, loginPassword);
    if (result.success && result.user) {
      onLoginSuccess(result.user);
    } else {
      setErrorMsg(result.error || 'فشل تسجيل الدخول، يرجى التحقق من البيانات.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName.trim() || !regUsername.trim() || !regPassword) {
      setErrorMsg('يرجى ملء جميع الحقول الإلزامية.');
      return;
    }

    if (regPassword.length < 3) {
      setErrorMsg('كلمة المرور يجب ألا تقل عن 3 أحرف.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('كلمات المرور غير متطابقة.');
      return;
    }

    const result = storageService.register({
      name: regName,
      username: regUsername,
      email: regEmail,
      department: regDepartment,
      jobTitle: regJobTitle,
      password: regPassword
    });

    if (result.success && result.user) {
      setSuccessMsg('تم إنشاء الحساب بنجاح! سيتم تحويلك إلى النظام.');
      setTimeout(() => {
        onLoginSuccess(result.user!);
      }, 800);
    } else {
      setErrorMsg(result.error || 'حدث خطأ أثناء إنشاء الحساب.');
    }
  };

  // Quick Demo Login helper
  const handleQuickDemoLogin = (userType: 'admin' | 'tech' | 'pending') => {
    if (userType === 'admin') {
      const res = storageService.login('admin', 'admin');
      if (res.success && res.user) onLoginSuccess(res.user);
    } else if (userType === 'tech') {
      const res = storageService.login('mohamed', '123');
      if (res.success && res.user) onLoginSuccess(res.user);
    } else if (userType === 'pending') {
      const res = storageService.login('sara', '123');
      if (res.success && res.user) onLoginSuccess(res.user);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
      background: 'var(--bg-primary)'
    }}>
      {/* Background Ambient Glow */}
      <div className="bg-ambient" />

      <div style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 10 }}>
        
        {/* Hospital Branding Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '20px',
            background: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(2, 132, 199, 0.15)',
            border: '1px solid rgba(2, 132, 199, 0.2)',
            padding: '8px',
            marginBottom: '0.85rem'
          }}>
            <img src="/logo.png" alt="مستشفى نيل الأمل" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            مستشفى نيل الأمل
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>
            منصة إدارة وصيانة تكنولوجيا المعلومات IT
          </p>
        </div>

        {/* Auth Card Container */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)' }}>
          
          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            background: 'var(--bg-card-hover)',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.25rem'
          }}>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              style={{
                padding: '0.6rem 0.5rem',
                border: 'none',
                borderRadius: '6px',
                background: mode === 'login' ? 'var(--bg-secondary)' : 'transparent',
                color: mode === 'login' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: mode === 'login' ? 800 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: mode === 'login' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <LogIn size={16} />
              <span>تسجيل الدخول</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              style={{
                padding: '0.6rem 0.5rem',
                border: 'none',
                borderRadius: '6px',
                background: mode === 'register' ? 'var(--bg-secondary)' : 'transparent',
                color: mode === 'register' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: mode === 'register' ? 800 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: mode === 'register' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <UserPlus size={16} />
              <span>إنشاء حساب جديد</span>
            </button>
          </div>

          {/* Error & Success Messages */}
          {errorMsg && (
            <div style={{
              padding: '0.75rem 1rem',
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '1rem'
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              padding: '0.75rem 1rem',
              background: '#ecfdf5',
              color: '#059669',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '1rem'
            }}>
              <Sparkles size={17} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>اسم المستخدم أو البريد الإلكتروني</label>
                <div style={{ position: 'relative' }}>
                  <User size={17} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingRight: '2.4rem' }}
                    placeholder="مثال: admin أو m.tarek@nileofhope.org"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>كلمة المرور</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={17} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    className="form-control form-control-mono"
                    style={{ paddingRight: '2.4rem', paddingLeft: '2.4rem' }}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
              >
                <span>دخول إلى المنصة</span>
                <ArrowLeft size={18} />
              </button>
            </form>
          ) : (
            /* TAB 2: REGISTER FORM */
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>الاسم الكامل (مع اللقب) *</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingRight: '2.4rem' }}
                    placeholder="مثال: ENG أحمد فتحي"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>اسم المستخدم *</label>
                  <input
                    type="text"
                    className="form-control form-control-mono"
                    placeholder="ahmed_it"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>البريد الإلكتروني</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="ahmed@nileofhope.org"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>القسم / الموقع</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="قسم IT"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>المسمى الوظيفي</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="مهندس صيانة"
                    value={regJobTitle}
                    onChange={(e) => setRegJobTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>كلمة المرور *</label>
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem' }}
                    >
                      {showRegPassword ? 'إخفاء' : 'إظهار'}
                    </button>
                  </div>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    className="form-control form-control-mono"
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>تأكيد المرور *</label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    className="form-control form-control-mono"
                    placeholder="••••••••"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-card-hover)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                ℹ️ <strong>ملاحظة الأمان:</strong> عند إنشاء الحساب، سيكون الحساب فارغاً بانتظار قيام مدير النظام باعتماده وتحديد الصلاحيات المخصصة لك.
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '0.35rem', justifyContent: 'center' }}
              >
                <span>إنشاء الحساب</span>
                <UserPlus size={18} />
              </button>
            </form>
          )}

          {/* Quick Demo Test Logins */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.65rem', textAlign: 'center' }}>
              ⚡ حسابات تجريبية سريعة (Click to Login):
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'space-between', padding: '0.45rem 0.75rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={15} color="#0284c7" />
                  <strong>مدير النظام (Admin)</strong>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>admin / admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('tech')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'space-between', padding: '0.45rem 0.75rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Briefcase size={15} color="#10b981" />
                  <span>فني صيانة معتمد</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>mohamed / 123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('pending')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'space-between', padding: '0.45rem 0.75rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={15} color="#f59e0b" />
                  <span>حساب جديد معلق (Zero Permissions)</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>sara / 123</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          مستشفى نيل الأمل لجراحات الأطفال © 2026 • قسم تكنولوجيا المعلومات
        </div>

      </div>
    </div>
  );
};
