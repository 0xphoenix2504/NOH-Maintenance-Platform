-- ==============================================================================
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

-- ==============================================================================
-- ⚡ الفهارس الذكية لسرعة فائقة وخفة في الأداء (High-Performance Indexes)
-- ==============================================================================

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

-- ==============================================================================
-- 🔒 تفعيل الأمان وسياسات الوصول (Row Level Security & Policies)
-- ==============================================================================

ALTER TABLE public.noh_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noh_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noh_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noh_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noh_preventive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noh_logs ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول الشاملة للـ anon key والـ authenticated users
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

-- ==============================================================================
-- 🌱 إضافة حسابات الإدارة الأساسية للمنصة (Master Admin Seed Accounts)
-- ==============================================================================

INSERT INTO public.noh_accounts (
    id,
    name,
    username,
    email,
    password,
    role,
    status,
    department,
    job_title,
    permissions
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
ON CONFLICT (username) DO NOTHING;
