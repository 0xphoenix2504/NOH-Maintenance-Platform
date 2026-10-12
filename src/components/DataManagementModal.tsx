import { useState, useRef, useEffect } from 'react';
import {
  Database,
  Download,
  Upload,
  FileSpreadsheet,
  RotateCcw,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Laptop,
  Package,
  CalendarCheck,
  Cloud,
  CloudLightning,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../services/supabaseClient';
import confetti from 'canvas-confetti';

interface DataManagementModalProps {
  onDataRestored: () => void;
  onClose: () => void;
  initialTab?: 'cloud' | 'files';
}

const SUPABASE_SCHEMA_SQL = `-- ==============================================================================
-- 🏥 Nile of Hope Hospital — Maintenance Platform (Supabase PostgreSQL Schema)
-- مستشفى نيل الأمل لجراحات الاختلافات الخلقية للأطفال
-- منظومة إدارة وصيانة تكنولوجيا المعلومات (IT Maintenance Platform)
-- قاعدة بيانات سريعة وخفيفة مهجنة (Relational + JSONB Documents)
-- ==============================================================================

-- 1. جدول الحسابات والمستخدمين والصلاحيات (Accounts & RBAC)
CREATE TABLE IF NOT EXISTS public.noh_accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    status TEXT NOT NULL DEFAULT 'pending',
    department TEXT,
    job_title TEXT,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- 2. جدول الأصول والأجهزة والعهد (IT Assets)
CREATE TABLE IF NOT EXISTS public.noh_assets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    serial_number TEXT,
    department TEXT NOT NULL,
    floor TEXT,
    room_or_unit TEXT,
    assigned_user TEXT,
    user_role TEXT,
    status TEXT NOT NULL DEFAULT 'operational',
    purchase_date TEXT,
    warranty_expiry TEXT,
    ip_address TEXT,
    mac_address TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    qr_code_data TEXT
);

-- 3. جدول بلاغات وتقارير الصيانة (Maintenance Tickets & Work Orders)
CREATE TABLE IF NOT EXISTS public.noh_tickets (
    id TEXT PRIMARY KEY,
    asset_id TEXT REFERENCES public.noh_assets(id) ON DELETE SET NULL,
    technician_name TEXT NOT NULL,
    technician_id TEXT,
    report_date_time TEXT NOT NULL,
    resolution_date_time TEXT NOT NULL,
    reporting_source TEXT NOT NULL DEFAULT 'user_report',
    issue_category TEXT NOT NULL DEFAULT 'hardware',
    priority TEXT NOT NULL DEFAULT 'medium',
    user_problem_description TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    action_taken TEXT NOT NULL,
    spare_parts_used JSONB DEFAULT '[]'::jsonb,
    total_cost NUMERIC NOT NULL DEFAULT 0,
    downtime_formatted TEXT NOT NULL DEFAULT '0 دقيقة',
    downtime_hours NUMERIC DEFAULT 0,
    status_after_maintenance TEXT NOT NULL DEFAULT 'repaired',
    notes_and_recommendations TEXT,
    technician_signature TEXT,
    user_signature TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT,
    problem_type TEXT,
    happened_before BOOLEAN DEFAULT FALSE,
    location TEXT,
    floor TEXT,
    requester_id TEXT,
    requester_name TEXT,
    status_history JSONB DEFAULT '[]'::jsonb,
    attachment JSONB
);

-- 4. جدول مخزن قطع الغيار والمهمات (Spare Parts Inventory)
CREATE TABLE IF NOT EXISTS public.noh_inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    part_number TEXT,
    quantity_in_stock INTEGER NOT NULL DEFAULT 0,
    min_threshold INTEGER NOT NULL DEFAULT 0,
    unit_cost NUMERIC NOT NULL DEFAULT 0,
    location TEXT,
    status TEXT NOT NULL DEFAULT 'in_stock',
    supplier TEXT,
    compatible_models JSONB DEFAULT '[]'::jsonb,
    last_restocked TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول الصيانة الوقائية والفحص الدوري (Preventive Maintenance Schedules)
CREATE TABLE IF NOT EXISTS public.noh_preventive (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    frequency TEXT NOT NULL DEFAULT 'monthly',
    assigned_technician TEXT NOT NULL,
    next_due_date TEXT NOT NULL,
    last_done_date TEXT,
    status TEXT NOT NULL DEFAULT 'upcoming',
    checklist JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. جدول سجل النشاط والتغييرات والرقابة (Audit Activity Logs)
CREATE TABLE IF NOT EXISTS public.noh_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_name TEXT,
    user_role TEXT,
    action_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    target_title TEXT,
    description TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb
);

-- ⚡ الفهارس الذكية لسرعة فائقة وخفة في الأداء (Indexes)
CREATE INDEX IF NOT EXISTS idx_noh_assets_dept ON public.noh_assets(department);
CREATE INDEX IF NOT EXISTS idx_noh_assets_status ON public.noh_assets(status);
CREATE INDEX IF NOT EXISTS idx_noh_assets_type ON public.noh_assets(type);

CREATE INDEX IF NOT EXISTS idx_noh_tickets_asset_id ON public.noh_tickets(asset_id);
CREATE INDEX IF NOT EXISTS idx_noh_tickets_status ON public.noh_tickets(status);
CREATE INDEX IF NOT EXISTS idx_noh_tickets_priority ON public.noh_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_noh_tickets_created_at ON public.noh_tickets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_noh_inventory_category ON public.noh_inventory(category);
CREATE INDEX IF NOT EXISTS idx_noh_inventory_status ON public.noh_inventory(status);

CREATE INDEX IF NOT EXISTS idx_noh_preventive_status ON public.noh_preventive(status);
CREATE INDEX IF NOT EXISTS idx_noh_preventive_due ON public.noh_preventive(next_due_date);

CREATE INDEX IF NOT EXISTS idx_noh_logs_timestamp ON public.noh_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_noh_accounts_username ON public.noh_accounts(username);

-- 🔒 تفعيل الأمان وسياسات الوصول (Row Level Security & Policies)
ALTER TABLE public.noh_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noh_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noh_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noh_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noh_preventive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noh_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access noh_accounts" ON public.noh_accounts;
CREATE POLICY "Public access noh_accounts" ON public.noh_accounts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access noh_assets" ON public.noh_assets;
CREATE POLICY "Public access noh_assets" ON public.noh_assets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access noh_tickets" ON public.noh_tickets;
CREATE POLICY "Public access noh_tickets" ON public.noh_tickets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access noh_inventory" ON public.noh_inventory;
CREATE POLICY "Public access noh_inventory" ON public.noh_inventory FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access noh_preventive" ON public.noh_preventive;
CREATE POLICY "Public access noh_preventive" ON public.noh_preventive FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access noh_logs" ON public.noh_logs;
CREATE POLICY "Public access noh_logs" ON public.noh_logs FOR ALL USING (true) WITH CHECK (true);

-- 🌱 إضافة حسابات الإدارة الأساسية للمنصة (Master Admin Seed Accounts)
INSERT INTO public.noh_accounts (
    id, name, username, email, password, role, status, department, job_title, permissions
) VALUES 
(
    'acc-admin-master',
    'ENG Abdelrahman Yasser',
    'admin',
    'abdelrahman@nileofhope.org',
    'admin',
    'admin',
    'active',
    'قسم تكنولوجيا المعلومات IT',
    'مدير تكنولوجيا المعلومات والنظم',
    '["dashboard", "tickets", "assets", "inventory", "preventive", "analytics", "logs", "user_management", "reports_export"]'::jsonb
),
(
    'acc-admin-secondary',
    'ENG Abdelrahman',
    'abdelrahman',
    'a.yasser@nileofhope.org',
    '123',
    'admin',
    'active',
    'قسم تكنولوجيا المعلومات IT',
    'مهندس صيانة ودعم فني IT',
    '["dashboard", "tickets", "assets", "inventory", "preventive", "analytics", "logs", "user_management", "reports_export"]'::jsonb
)
ON CONFLICT (username) DO NOTHING;`;

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  onDataRestored,
  onClose,
  initialTab = 'cloud'
}) => {
  const [activeTab, setActiveTab] = useState<'cloud' | 'files'>(initialTab);
  const [msg, setMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Supabase states
  const [supabaseConfig, setSupabaseConfigState] = useState(getSupabaseConfig());
  const [urlInput, setUrlInput] = useState(supabaseConfig.url);
  const [keyInput, setKeyInput] = useState(supabaseConfig.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlViewer, setShowSqlViewer] = useState(false);

  useEffect(() => {
    const config = getSupabaseConfig();
    setSupabaseConfigState(config);
    if (!urlInput && config.url) setUrlInput(config.url);
    if (!keyInput && config.anonKey) setKeyInput(config.anonKey);
  }, []);

  // 1. Supabase Test & Save
  const handleTestAndSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = urlInput.trim();
    const cleanKey = keyInput.trim();

    if (!cleanUrl || !cleanKey) {
      setMsg({ type: 'error', text: 'يرجى إدخال كل من Project URL و Anon Key لحفظ الاتصال.' });
      return;
    }

    setIsTesting(true);
    setMsg(null);

    const testRes = await testSupabaseConnection(cleanUrl, cleanKey);
    setIsTesting(false);

    if (testRes.normalizedUrl && testRes.normalizedUrl !== cleanUrl) {
      setUrlInput(testRes.normalizedUrl);
    }

    if (testRes.success) {
      const finalUrl = testRes.normalizedUrl || cleanUrl;
      saveSupabaseConfig(finalUrl, cleanKey);
      setSupabaseConfigState(getSupabaseConfig());
      setMsg({ type: 'success', text: testRes.message });
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch {
        // ignore
      }
    } else {
      setMsg({ type: 'error', text: testRes.message });
    }
  };

  const handleDisconnect = () => {
    if (confirm('هل تريد قطع الاتصال بـ Supabase والعودة للتخزين المحلي فقط؟')) {
      saveSupabaseConfig('', '');
      setUrlInput('');
      setKeyInput('');
      setSupabaseConfigState(getSupabaseConfig());
      setMsg({ type: 'info', text: 'تمت إزالة مفاتيح Supabase، المنصة تعمل الآن بالتخزين المحلي فقط.' });
    }
  };

  // 2. Push Local Data to Supabase
  const handlePushToCloud = async () => {
    if (!supabaseConfig.isConfigured) {
      setMsg({ type: 'error', text: 'يرجى تهيئة وحفظ بيانات الاتصال بـ Supabase أولاً.' });
      return;
    }

    setIsPushing(true);
    setMsg(null);

    try {
      const res = await storageService.syncPushToSupabase();
      setIsPushing(false);
      if (res.success) {
        setMsg({
          type: 'success',
          text: `تم بنجاح رفع: ${res.counts.assets} جهاز، ${res.counts.tickets} تذكرة، ${res.counts.inventory} صنف مخزن، ${res.counts.preventive} فحص وقائي!`
        });
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
      } else {
        setMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setIsPushing(false);
      setMsg({ type: 'error', text: err.message || 'فشلت المزامنة السحابية.' });
    }
  };

  // 3. Pull Cloud Data from Supabase
  const handlePullFromCloud = async () => {
    if (!supabaseConfig.isConfigured) {
      setMsg({ type: 'error', text: 'يرجى تهيئة وحفظ بيانات الاتصال بـ Supabase أولاً.' });
      return;
    }

    if (!confirm('سيتم استيراد كافة السجلات من Supabase وتحديث الذاكرة المحلية، هل تريد المتابعة؟')) {
      return;
    }

    setIsPulling(true);
    setMsg(null);

    try {
      const res = await storageService.syncPullFromSupabase();
      setIsPulling(false);
      if (res.success && res.data) {
        setMsg({
          type: 'success',
          text: `تم استيراد وتحديث: ${res.data.assets.length} جهاز، ${res.data.tickets.length} تذكرة صيانة، ${res.data.inventory.length} صنف مخزن.`
        });
        setTimeout(() => {
          onDataRestored();
        }, 1200);
      } else {
        setMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setIsPulling(false);
      setMsg({ type: 'error', text: err.message || 'فشل جلب البيانات السحابية.' });
    }
  };

  // 4. Copy SQL Schema
  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // 5. Export JSON Backup
  const handleDownloadBackup = () => {
    const jsonStr = storageService.exportFullDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    link.setAttribute('download', `NileOfHope_IT_Backup_${dateStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setMsg({ type: 'success', text: 'تم تحميل ملف النسخة الاحتياطية الكاملة بنجاح!' });
  };

  // 6. Import JSON Backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const res = storageService.importFullDatabaseJSON(content);
      if (res.success) {
        setMsg({ type: 'success', text: 'تمت استعادة البيانات بنجاح وتحديث النظام!' });
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
        setTimeout(() => {
          onDataRestored();
        }, 1200);
      } else {
        setMsg({ type: 'error', text: `فشلت الاستعادة: ${res.error}` });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 7. Export CSV Table
  const handleExportCSV = (table: 'assets' | 'tickets' | 'inventory' | 'preventive', label: string) => {
    const csvContent = storageService.exportTableToCSV(table);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    link.setAttribute('download', `NileOfHope_${table}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setMsg({ type: 'success', text: `تم تصدير ملف ${label} بنجاح!` });
  };

  // 8. Reset Default
  const handleResetToDefault = () => {
    if (confirm('هل أنت متأكد تماماً من رغبتك في إعادة تعيين كافة البيانات إلى الحالة الافتراضية؟ سيتم حذف أي بيانات مخصصة تم إدخالها مؤخراً.')) {
      storageService.resetToDefault();
      setMsg({ type: 'success', text: 'تمت إعادة ضبط النظام إلى البيانات الافتراضية لمستشفى نيل الأمل.' });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '780px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '10px' }}>
              <Database size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>إدارة قاعدة البيانات والنسخ الاحتياطي</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                استضافة ومزامنة السحابة (Supabase Cloud PostgreSQL) والنسخ الاحتياطي المحلي
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.5rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-card)'
        }}>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`btn btn-sm ${activeTab === 'cloud' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem 1.1rem' }}
          >
            <Cloud size={16} />
            <span>قاعدة بيانات Supabase السحابية</span>
            {supabaseConfig.isConfigured && (
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                display: 'inline-block',
                marginLeft: '4px'
              }} />
            )}
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`btn btn-sm ${activeTab === 'files' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem 1.1rem' }}
          >
            <FileSpreadsheet size={16} />
            <span>ملفات النسخ والـ Excel (JSON / CSV)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
          
          {/* Notification Msg */}
          {msg && (
            <div style={{
              padding: '0.85rem 1.1rem',
              background: msg.type === 'success' ? '#ecfdf5' : msg.type === 'error' ? '#fef2f2' : '#eff6ff',
              color: msg.type === 'success' ? '#059669' : msg.type === 'error' ? '#dc2626' : '#2563eb',
              border: `1px solid ${msg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : msg.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(37, 99, 235, 0.3)'}`,
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.86rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              whiteSpace: 'pre-line',
              lineHeight: 1.6
            }}>
              <div style={{ flexShrink: 0, marginTop: '2px' }}>
                {msg.type === 'success' ? <CheckCircle2 size={18} /> : msg.type === 'error' ? <AlertTriangle size={18} /> : <CloudLightning size={18} />}
              </div>
              <div style={{ flex: 1 }}>{msg.text}</div>
            </div>
          )}

          {/* ==================== TAB 1: SUPABASE CLOUD ==================== */}
          {activeTab === 'cloud' && (
            <>
              {/* Status Banner */}
              <div style={{
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: supabaseConfig.isConfigured 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)' 
                  : 'rgba(245, 158, 11, 0.07)',
                border: `1px solid ${supabaseConfig.isConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: supabaseConfig.isConfigured ? '#10b981' : '#f59e0b',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: supabaseConfig.isConfigured ? '0 4px 12px rgba(16, 185, 129, 0.35)' : 'none'
                  }}>
                    {supabaseConfig.isConfigured ? <CloudLightning size={20} /> : <Database size={20} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                      {supabaseConfig.isConfigured ? 'قاعدة البيانات السحابية نشطة ومتصلة' : 'قاعدة البيانات تعمل في الوضع المحلي (Offline Mode)'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {supabaseConfig.isConfigured 
                        ? `المشروع: ${supabaseConfig.url} (${supabaseConfig.source === 'env' ? 'ملف .env' : 'إعدادات المتصفح'})`
                        : 'يتم حفظ كافة البيانات على المتصفح (LocalStorage). اربط مشروع Supabase لتفعيل المزامنة السحابية.'}
                    </div>
                  </div>
                </div>

                {supabaseConfig.isConfigured && supabaseConfig.source === 'localStorage' && (
                  <button
                    onClick={handleDisconnect}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#dc2626', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                  >
                    قطع الاتصال
                  </button>
                )}
              </div>

              {/* Supabase Credentials Card */}
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} color="var(--primary)" />
                  بيانات الاتصال بمشروع Supabase (Project Credentials)
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  يمكنك الحصول عليها من لوحة تحكم Supabase: Project Settings ➔ API ➔ Project URL & anon public key.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', display: 'block' }}>
                      رابط المشروع (Supabase Project URL):
                    </label>
                    <input
                      type="url"
                      dir="ltr"
                      className="form-control"
                      placeholder="https://your-project-id.supabase.co"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', display: 'block' }}>
                      المفتاح العام (Supabase Anon Public API Key):
                    </label>
                    <input
                      type="password"
                      dir="ltr"
                      className="form-control"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleTestAndSave()}
                      disabled={isTesting}
                      className="btn btn-primary"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      {isTesting ? <RefreshCw size={16} className="spin" /> : <CheckCircle2 size={16} />}
                      <span>{isTesting ? 'جاري الفحص والاتصال...' : 'اختبار وحفظ الاتصال'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sync Actions Card */}
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={16} color="#06b6d4" />
                  المزامنة اللحظية (Cloud Synchronization)
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  تبادل البيانات بين جهازك المحلي وسحابة Supabase لضمان تطابق السجلات بين كافة أجهزة المستشفى.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <button
                    onClick={handlePushToCloud}
                    disabled={isPushing || !supabaseConfig.isConfigured}
                    className="btn btn-primary"
                    style={{
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                      opacity: !supabaseConfig.isConfigured ? 0.6 : 1
                    }}
                  >
                    {isPushing ? <RefreshCw size={16} className="spin" /> : <Upload size={16} />}
                    <span>{isPushing ? 'جاري الرفع للسحابة...' : 'رفع البيانات المحلية إلى Supabase'}</span>
                  </button>

                  <button
                    onClick={handlePullFromCloud}
                    disabled={isPulling || !supabaseConfig.isConfigured}
                    className="btn btn-secondary"
                    style={{
                      justifyContent: 'center',
                      borderColor: 'var(--primary)',
                      color: 'var(--primary)',
                      opacity: !supabaseConfig.isConfigured ? 0.6 : 1
                    }}
                  >
                    {isPulling ? <RefreshCw size={16} className="spin" /> : <Download size={16} />}
                    <span>{isPulling ? 'جاري التنزيل والتحديث...' : 'استيراد البيانات من Supabase'}</span>
                  </button>
                </div>
              </div>

              {/* Setup Guide & Copy SQL Script */}
              <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(2, 132, 199, 0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} color="#0284c7" />
                    سكربت إنشاء الجداول (SQL Schema Script)
                  </h4>
                  <button
                    onClick={handleCopySql}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '0.35rem 0.85rem' }}
                  >
                    {copiedSql ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedSql ? 'تم النسخ بنجاح! 📋' : 'نسخ كود SQL كامل'}</span>
                  </button>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                  انسخ هذا الكود والصقه في تبويب <strong>SQL Editor</strong> داخل لوحة تحكم Supabase ثم اضغط <strong>RUN</strong> لإنشاء الجداول والسياسات والفهارس في ثوانٍ.
                </p>

                {/* Collapsible SQL Viewer */}
                <button
                  type="button"
                  onClick={() => setShowSqlViewer(!showSqlViewer)}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'space-between', marginBottom: showSqlViewer ? '0.75rem' : 0 }}
                >
                  <span>{showSqlViewer ? 'إخفاء معاينة كود SQL' : 'عرض ومعاينة كود SQL للجداول'}</span>
                  {showSqlViewer ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showSqlViewer && (
                  <pre
                    dir="ltr"
                    style={{
                      maxHeight: '180px',
                      overflowY: 'auto',
                      background: '#0f172a',
                      color: '#38bdf8',
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {SUPABASE_SCHEMA_SQL}
                  </pre>
                )}

                {/* Steps Accordion */}
                <div style={{
                  marginTop: '0.85rem',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.78rem',
                  lineHeight: '1.6'
                }}>
                  <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.3rem' }}>
                    ⚡ خطوات استضافة قاعدة البيانات على Supabase في دقيقتين:
                  </strong>
                  <ol style={{ paddingRight: '1.25rem', margin: 0 }}>
                    <li>ادخل على موقع <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: '#0284c7', textDecoration: 'underline' }}>supabase.com <ExternalLink size={12} style={{ display: 'inline' }} /></a> وأنشئ حساباً مجانياً ثم مشروعاً جديداً.</li>
                    <li>من القائمة الجانبية في Supabase، اختر <strong>SQL Editor</strong>، واضغط <strong>New Query</strong>.</li>
                    <li>اضغط على زر <strong>نسخ كود SQL كامل</strong> أعلاه والصقه، ثم اضغط <strong>RUN</strong>.</li>
                    <li>توجه إلى <strong>Project Settings ➔ Data API</strong> وانسخ <strong>Project URL</strong> و <strong>anon key</strong> والصقهما في هذه النافذة ثم اضغط حفظ!</li>
                  </ol>
                </div>
              </div>
            </>
          )}

          {/* ==================== TAB 2: LOCAL BACKUP & EXCEL ==================== */}
          {activeTab === 'files' && (
            <>
              {/* Section 1: Full System Backup & Restore */}
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Database size={16} color="var(--primary)" />
                  النسخة الاحتياطية الشاملة (Full JSON Backup)
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  حفظ نسخة كاملة من قاعدة البيانات تشمل كافة الأجهزة، التذاكر، المخزون، الجداول الوقائية، والمستخدمين في ملف JSON واحد.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <button
                    onClick={handleDownloadBackup}
                    className="btn btn-primary"
                    style={{ justifyContent: 'center' }}
                  >
                    <Download size={16} />
                    <span>تحميل نسخة احتياطية (JSON)</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary"
                    style={{ justifyContent: 'center' }}
                  >
                    <Upload size={16} />
                    <span>استعادة نسخة سابقة (JSON)</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {/* Section 2: CSV / Excel Export per Module */}
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileSpreadsheet size={16} color="#059669" />
                  تصدير الجداول إلى ملفات Excel / CSV
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  تصدير البيانات بصيغة CSV المتوافقة تماماً مع برامج Excel وتدعم اللغة العربية بترميز UTF-8.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem' }}>
                  <button
                    onClick={() => handleExportCSV('tickets', 'تذاكر وتقارير الصيانة')}
                    className="btn btn-secondary btn-sm"
                    style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
                  >
                    <FileText size={16} color="#0284c7" />
                    <span>تصدير تقارير الصيانة (Tickets)</span>
                  </button>

                  <button
                    onClick={() => handleExportCSV('assets', 'سجل الأجهزة والعهد')}
                    className="btn btn-secondary btn-sm"
                    style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
                  >
                    <Laptop size={16} color="#10b981" />
                    <span>تصدير سجل الأجهزة (Assets)</span>
                  </button>

                  <button
                    onClick={() => handleExportCSV('inventory', 'قطع الغيار والمخزون')}
                    className="btn btn-secondary btn-sm"
                    style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
                  >
                    <Package size={16} color="#8b5cf6" />
                    <span>تصدير رصيد المخزن (Inventory)</span>
                  </button>

                  <button
                    onClick={() => handleExportCSV('preventive', 'الصيانة الوقائية')}
                    className="btn btn-secondary btn-sm"
                    style={{ justifyContent: 'flex-start', padding: '0.6rem 0.85rem' }}
                  >
                    <CalendarCheck size={16} color="#06b6d4" />
                    <span>تصدير الصيانة الوقائية (Preventive)</span>
                  </button>
                </div>
              </div>

              {/* Section 3: Reset to Default Data */}
              <div className="glass-panel" style={{ padding: '1rem 1.25rem', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#dc2626' }}>
                    إعادة تعيين قاعدة البيانات الافتراضية
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    استرجاع بيانات التقرير الأصلي وأجهزة المستشفى التجريبية المعتمدة
                  </div>
                </div>

                <button
                  onClick={handleResetToDefault}
                  className="btn btn-danger btn-sm"
                >
                  <RotateCcw size={14} />
                  <span>إعادة ضبط افتراضي</span>
                </button>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '0.85rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            منظومة مستشفى نيل الأمل لجراحات الأطفال — تكنولوجيا المعلومات IT
          </div>
          <button onClick={onClose} className="btn btn-secondary">إغلاق</button>
        </div>

      </div>
    </div>
  );
};
