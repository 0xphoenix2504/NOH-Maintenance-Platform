import React, { useState, useEffect, useRef } from 'react';
import type {
  UserAccount,
  EndUserTicketView,
  ProblemTypeOption,
  HappenedBeforeOption,
  LocationOption
} from '../types';
import {
  PROBLEM_TYPE_OPTIONS,
  HAPPENED_BEFORE_OPTIONS,
  LOCATION_OPTIONS,
  LOCATION_FLOORS
} from '../types';
import { storageService } from '../services/storageService';
import {
  Send,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  X,
  Eye,
  LogOut,
  Sun,
  Moon,
  Laptop,
  Monitor,
  Printer,
  Server,
  Layers,
  Building,
  Check,
  Shield,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EndUserPortalViewProps {
  currentUser: UserAccount;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const EndUserPortalView: React.FC<EndUserPortalViewProps> = ({
  currentUser,
  onLogout,
  theme,
  onToggleTheme
}) => {
  const [activeTab, setActiveTab] = useState<'new_ticket' | 'my_tickets'>('new_ticket');
  const [myTickets, setMyTickets] = useState<EndUserTicketView[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<EndUserTicketView | null>(null);

  // Form State
  const [problemType, setProblemType] = useState<ProblemTypeOption | ''>('');
  const [happenedBefore, setHappenedBefore] = useState<HappenedBeforeOption | ''>('');
  const [location, setLocation] = useState<LocationOption | ''>('');
  const [floor, setFloor] = useState<string>('');
  
  // Attachment State
  const [attachmentFile, setAttachmentFile] = useState<{
    name: string;
    type: string;
    size: number;
    dataUrl: string;
  } | null>(null);
  const [attachmentError, setAttachmentError] = useState<string>('');
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);

  // Submission & Validation States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user tickets on mount and tab change
  const refreshTickets = () => {
    const list = storageService.getTicketsForUser(currentUser);
    setMyTickets(list as EndUserTicketView[]);
  };

  useEffect(() => {
    refreshTickets();
  }, [currentUser]);

  // Handle Q3 change: reset Q4 if invalid
  const handleLocationChange = (newLocation: LocationOption) => {
    setLocation(newLocation);
    const validFloors = LOCATION_FLOORS[newLocation] as readonly string[];
    if (floor && !validFloors.includes(floor)) {
      setFloor('');
    }
    // Clear validation error on change
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: '' }));
    }
  };

  // Handle File Input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size using service rules
    const validation = storageService.validateAttachment({
      name: file.name,
      type: file.type,
      size: file.size
    });

    if (!validation.valid) {
      setAttachmentError(validation.error || 'الملف المرفق غير صالح.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAttachmentFile({
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setAttachmentFile(null);
    setAttachmentError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle Form Submission
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccessMsg('');

    // Pre-validate locally
    const validationPayload = {
      problemType,
      happenedBefore,
      location,
      floor,
      attachment: attachmentFile ? {
        name: attachmentFile.name,
        type: attachmentFile.type,
        size: attachmentFile.size
      } : null
    };

    const valResult = storageService.validateEndUserTicket(validationPayload);
    if (!valResult.valid) {
      setErrors(valResult.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = storageService.submitEndUserTicket({
        problemType,
        happenedBefore,
        location,
        floor,
        attachment: attachmentFile
      }, currentUser);

      if (res.success && res.ticket) {
        // Trigger celebration
        try {
          confetti({
            particleCount: 65,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }

        setSubmitSuccessMsg(`تم إرسال بلاغك بنجاح برقم: ${res.ticket.id}`);
        refreshTickets();

        // Reset form
        setProblemType('');
        setHappenedBefore('');
        setLocation('');
        setFloor('');
        handleRemoveAttachment();
        setErrors({});

        // Auto switch to My Tickets after 1.2s
        setTimeout(() => {
          setActiveTab('my_tickets');
          setSubmitSuccessMsg('');
        }, 1400);
      } else {
        setErrors(res.errors || { general: 'تعذر حفظ البلاغ، يرجى إعادة المحاولة.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="badge" style={{ background: '#e0f2fe', color: '#0284c7', border: '1px solid rgba(2, 132, 199, 0.3)' }}>
            <Clock size={12} /> بانتظار الفني (جديد)
          </span>
        );
      case 'in_progress':
        return (
          <span className="badge badge-maintenance">
            <Layers size={12} /> جاري العمل والمعاينة
          </span>
        );
      case 'pending_parts':
        return (
          <span className="badge badge-needs-parts">
            <AlertTriangle size={12} /> بانتظار قطع غيار
          </span>
        );
      case 'resolved':
        return (
          <span className="badge badge-operational">
            <CheckCircle2 size={12} /> تم الإصلاح
          </span>
        );
      case 'closed':
        return (
          <span className="badge" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
            <FileCheck size={12} /> مغلق ومعتمد
          </span>
        );
      default:
        return <span className="badge">{status}</span>;
    }
  };

  // Icon mapping for problem types
  const getProblemTypeIcon = (type: string) => {
    switch (type) {
      case 'Laptop':
        return <Laptop size={20} />;
      case 'Computer':
        return <Monitor size={20} />;
      case 'Printer':
        return <Printer size={20} />;
      case 'Pacs':
      case 'PrimeCare':
        return <Server size={20} />;
      default:
        return <HelpCircle size={20} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <div className="bg-ambient" />

      {/* Top Navbar */}
      <header style={{
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Hospital Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          <img
            src="/noh-logo.png"
            alt="Nile of Hope Logo"
            style={{ width: '42px', height: '42px', objectFit: 'contain' }}
            onError={(e) => {
              // fallback if logo image not found
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              مستشفى نيل الأمل لجراحات الأطفال
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, margin: 0 }}>
              بوابة خدمة المستخدمين • قسم تكنولوجيا المعلومات (IT)
            </p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'var(--bg-card)',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#8b5cf6',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 800
            }}>
              {currentUser.name.charAt(0)}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{currentUser.department}</div>
            </div>
          </div>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.45rem', borderRadius: '50%' }}
            title={theme === 'light' ? 'التبديل إلى الوضع الليلي' : 'التبديل إلى الوضع الفاتح'}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444' }}
            title="تسجيل الخروج"
          >
            <LogOut size={15} />
            <span style={{ fontSize: '0.8rem' }}>خروج</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '900px', width: '100%', margin: '1.5rem auto', padding: '0 1rem', flex: 1 }}>
        
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          background: 'var(--bg-card)',
          padding: '0.4rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={() => setActiveTab('new_ticket')}
            style={{
              flex: 1,
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              background: activeTab === 'new_ticket' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'new_ticket' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            <Send size={18} />
            <span>تقديم بلاغ صيانة جديد</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('my_tickets');
              refreshTickets();
            }}
            style={{
              flex: 1,
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              background: activeTab === 'my_tickets' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'my_tickets' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            <FileText size={18} />
            <span>متابعة بلاغاتي</span>
            <span style={{
              background: activeTab === 'my_tickets' ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-card-hover)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem'
            }}>
              {myTickets.length}
            </span>
          </button>
        </div>

        {/* TAB 1: GUIDED TICKET FORM */}
        {activeTab === 'new_ticket' && (
          <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                نموذج تسجيل بلاغ عطل فني
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                يرجى الإجابة عن الأسئلة الموجهة التالية لتمكين فريق تكنولوجيا المعلومات من فحص العطل وحله بالسرعة القصوى
              </p>
            </div>

            {submitSuccessMsg && (
              <div style={{
                background: '#ecfdf5',
                border: '1px solid #10b981',
                color: '#065f46',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: 700
              }}>
                <CheckCircle2 size={20} color="#10b981" />
                <span>{submitSuccessMsg}</span>
              </div>
            )}

            {errors.general && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #ef4444',
                color: '#991b1b',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: 700
              }}>
                <AlertTriangle size={20} color="#ef4444" />
                <span>{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

              {/* Q1: مشكلتك اي؟ */}
              <div style={{
                background: 'var(--bg-card)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: errors.problemType ? '1px solid #ef4444' : '1px solid var(--border-color)'
              }}>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                  1. مشكلتك اي؟ <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  {PROBLEM_TYPE_OPTIONS.map((opt) => {
                    const isSelected = problemType === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setProblemType(opt);
                          if (errors.problemType) setErrors(prev => ({ ...prev, problemType: '' }));
                        }}
                        style={{
                          padding: '0.85rem 0.5rem',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          background: isSelected ? 'var(--primary-light)' : 'var(--bg-card-hover)',
                          color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: isSelected ? 800 : 600,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {getProblemTypeIcon(opt)}
                        <span style={{ fontSize: '0.88rem' }}>{opt}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.problemType && (
                  <div style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.45rem', fontWeight: 700 }}>
                    {errors.problemType}
                  </div>
                )}
              </div>

              {/* Q2: هل المشكلة دي حصلت قبل كدة؟ */}
              <div style={{
                background: 'var(--bg-card)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: errors.happenedBefore ? '1px solid #ef4444' : '1px solid var(--border-color)'
              }}>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                  2. هل المشكلة دي حصلت قبل كدة؟ <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {HAPPENED_BEFORE_OPTIONS.map((opt) => {
                    const isSelected = happenedBefore === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setHappenedBefore(opt);
                          if (errors.happenedBefore) setErrors(prev => ({ ...prev, happenedBefore: '' }));
                        }}
                        style={{
                          padding: '0.85rem',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          background: isSelected ? 'var(--primary-light)' : 'var(--bg-card-hover)',
                          color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontWeight: isSelected ? 800 : 600,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {opt === 'نعم' ? <Check size={18} /> : <X size={18} />}
                        <span style={{ fontSize: '0.95rem' }}>{opt}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.happenedBefore && (
                  <div style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.45rem', fontWeight: 700 }}>
                    {errors.happenedBefore}
                  </div>
                )}
              </div>

              {/* Q3: مكانك فين؟ */}
              <div style={{
                background: 'var(--bg-card)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: errors.location ? '1px solid #ef4444' : '1px solid var(--border-color)'
              }}>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                  3. مكانك فين؟ <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {LOCATION_OPTIONS.map((opt) => {
                    const isSelected = location === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleLocationChange(opt)}
                        style={{
                          padding: '0.85rem',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          background: isSelected ? 'var(--primary-light)' : 'var(--bg-card-hover)',
                          color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontWeight: isSelected ? 800 : 600,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Building size={18} />
                        <span style={{ fontSize: '0.95rem' }}>{opt}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.location && (
                  <div style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.45rem', fontWeight: 700 }}>
                    {errors.location}
                  </div>
                )}
              </div>

              {/* Q4: Floor (Dynamic based on Q3) */}
              <div style={{
                background: 'var(--bg-card)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: errors.floor ? '1px solid #ef4444' : '1px solid var(--border-color)'
              }}>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                  4. الدور كام؟ <span style={{ color: '#ef4444' }}>*</span>
                  {location && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '8px' }}>
                      (أدوار موقع {location})
                    </span>
                  )}
                </label>

                {!location ? (
                  <div style={{
                    padding: '1rem',
                    textAlign: 'center',
                    background: 'var(--bg-card-hover)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem'
                  }}>
                    ℹ️ يرجى اختيار الموقع في السؤال السابق (ميامي أو جناكليس) لتحديد الأدوار المتاحة هنا.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.6rem' }}>
                    {LOCATION_FLOORS[location].map((flOpt) => {
                      const isSelected = floor === flOpt;
                      return (
                        <button
                          key={flOpt}
                          type="button"
                          onClick={() => {
                            setFloor(flOpt);
                            if (errors.floor) setErrors(prev => ({ ...prev, floor: '' }));
                          }}
                          style={{
                            padding: '0.65rem 0.5rem',
                            borderRadius: 'var(--radius-md)',
                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                            background: isSelected ? 'var(--primary-light)' : 'var(--bg-card-hover)',
                            color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: isSelected ? 800 : 600,
                            textAlign: 'center',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {flOpt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {errors.floor && (
                  <div style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.45rem', fontWeight: 700 }}>
                    {errors.floor}
                  </div>
                )}
              </div>

              {/* Q5: Attachment (Optional) */}
              <div style={{
                background: 'var(--bg-card)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: (errors.attachment || attachmentError) ? '1px solid #ef4444' : '1px solid var(--border-color)'
              }}>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '1rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  5. إرفاق صورة أو لقطة شاشة للمشكلة (اختياري)
                </label>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                  يمكنك إرفاق صورة توضح رسالة الخطأ أو مظهر العطل للمساعدة في الفحص (الحد الأقصى: 5 ميجابايت • الصيغ: PNG, JPG, JPEG, WEBP).
                </p>

                {!attachmentFile ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      id="ticket-image-upload"
                    />
                    <label
                      htmlFor="ticket-image-upload"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.5rem',
                        border: '2px dashed var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-card-hover)',
                        cursor: 'pointer',
                        gap: '8px',
                        transition: 'border-color 0.2s ease'
                      }}
                    >
                      <Upload size={24} color="var(--primary)" />
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
                        انقر لاختيار صورة من جهازك
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        PNG, JPG, WEBP بحد أقصى 5 MB
                      </span>
                    </label>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-card-hover)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={attachmentFile.dataUrl}
                        alt="Preview"
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer'
                        }}
                        onClick={() => setPreviewModalImage(attachmentFile.dataUrl)}
                        title="انقر للمعاينة بحجم أكبر"
                      />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {attachmentFile.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {(attachmentFile.size / (1024 * 1024)).toFixed(2)} MB • صورة معتمدة
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setPreviewModalImage(attachmentFile.dataUrl)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.4rem 0.6rem' }}
                        title="معاينة الصورة"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveAttachment}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.4rem 0.6rem', color: '#ef4444' }}
                        title="إلغاء المرفق"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {(attachmentError || errors.attachment) && (
                  <div style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.45rem', fontWeight: 700 }}>
                    {attachmentError || errors.attachment}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.9rem',
                  fontSize: '1rem',
                  fontWeight: 800,
                  boxShadow: '0 6px 20px var(--primary-glow)'
                }}
              >
                <Send size={18} />
                <span>{isSubmitting ? 'جاري إرسال البلاغ...' : 'إرسال البلاغ إلى فريق الصيانة'}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: MY TICKETS VIEW (FOLLOW-UP) */}
        {activeTab === 'my_tickets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>سجل بلاغاتي ومتابعة الحالات</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  يمكنك متابعة حالة كل بلاغ ومراحله الزمنية المسجلة من قبل مهندسي الدعم الفني
                </p>
              </div>

              <button
                onClick={() => setActiveTab('new_ticket')}
                className="btn btn-primary btn-sm"
              >
                <Send size={14} />
                <span>تقديم بلاغ جديد</span>
              </button>
            </div>

            {myTickets.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  لا توجد بلاغات مسجلة حتى الآن
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  لم تقم بتسجيل أي بلاغات صيانة بعد. يمكنك تقديم بلاغ جديد فوراً وسيقوم فريق الصيانة بمتابعته.
                </p>
                <button onClick={() => setActiveTab('new_ticket')} className="btn btn-primary">
                  <Send size={16} />
                  <span>تقديم أول بلاغ الآن</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {myTickets.map(ticket => (
                  <div
                    key={ticket.id}
                    className="glass-panel"
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8rem',
                          background: 'var(--bg-card-hover)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          color: 'var(--primary)',
                          fontWeight: 700
                        }}>
                          {ticket.id}
                        </span>
                        {getStatusBadge(ticket.status)}
                      </div>

                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        {ticket.title}
                      </h4>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <span>📍 الموقع: {ticket.location} - {ticket.floor}</span>
                        <span>🗓️ تاريخ البلاغ: {new Date(ticket.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        {ticket.attachment && (
                          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                            📎 مرفق صورة
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="btn btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Eye size={16} />
                      <span>متابعة تفاصيل البلاغ</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* TICKET DETAILS & STATUS HISTORY MODAL (READ-ONLY) */}
      {selectedTicket && (
        <div className="modal-backdrop" onClick={() => setSelectedTicket(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '650px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '8px' }}>
                  <FileText size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>متابعة تفاصيل البلاغ</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--primary)' }}>
                      #{selectedTicket.id}
                    </span>
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="modal-close-btn"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Form Answers Grid */}
              <div style={{
                background: 'var(--bg-card-hover)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>نوع المشكلة:</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{selectedTicket.problemType}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>تكررت المشكلة سابقاً:</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>
                    {selectedTicket.happenedBefore ? 'نعم' : 'لا'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>الموقع:</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{selectedTicket.location}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>الدور:</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{selectedTicket.floor}</div>
                </div>
              </div>

              {/* Attachment if present */}
              {selectedTicket.attachment && (
                <div style={{
                  padding: '1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)'
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📎 الصورة المرفقة بالبلاغ:</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={selectedTicket.attachment.dataUrl}
                      alt="Attachment Preview"
                      style={{
                        width: '70px',
                        height: '70px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer'
                      }}
                      onClick={() => setPreviewModalImage(selectedTicket.attachment!.dataUrl)}
                      title="انقر للمعاينة بالحجم الكامل"
                    />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{selectedTicket.attachment.fileName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {(selectedTicket.attachment.fileSize / (1024 * 1024)).toFixed(2)} MB • {selectedTicket.attachment.fileType}
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewModalImage(selectedTicket.attachment!.dataUrl)}
                        className="btn btn-secondary btn-sm"
                        style={{ marginTop: '6px', fontSize: '0.72rem', padding: '2px 8px' }}
                      >
                        <Eye size={12} />
                        <span>عرض الصورة كاملة</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Status History Timeline */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} color="var(--primary)" />
                  <span>المسار الزمني لمراحل البلاغ (Status History):</span>
                </h4>

                <div style={{
                  position: 'relative',
                  paddingRight: '1.25rem',
                  borderRight: '2px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  {selectedTicket.statusHistory.map((history, idx) => (
                    <div key={history.id || idx} style={{ position: 'relative' }}>
                      {/* Timeline dot */}
                      <div style={{
                        position: 'absolute',
                        right: '-1.65rem',
                        top: '4px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: idx === selectedTicket.statusHistory.length - 1 ? 'var(--primary)' : 'var(--text-muted)',
                        border: '2px solid var(--bg-card)'
                      }} />

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        {getStatusBadge(history.newStatus)}
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {new Date(history.changedAt).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {history.notes && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {history.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy Notice (Security Constraint) */}
              <div style={{
                background: 'var(--bg-card-hover)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Shield size={16} color="var(--primary)" />
                <span>
                  🔒 <strong>ملاحظة أمان:</strong> تفاصيل التشخيص الفني الداخلي وسجل الصيانة الفنية مخصصة لمهندسي الدعم الفني، وتظهر لك فقط المراحل التشغيلية المعتمدة.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="btn btn-secondary"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SIZE IMAGE PREVIEW MODAL */}
      {previewModalImage && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 100 }}
          onClick={() => setPreviewModalImage(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              background: 'var(--bg-card)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewModalImage(null)}
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(0, 0, 0, 0.6)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
            <img
              src={previewModalImage}
              alt="Full Preview"
              style={{ maxWidth: '85vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: '4px' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
