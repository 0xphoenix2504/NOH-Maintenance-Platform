import type { Asset, MaintenanceTicket, SparePartInventoryItem, PreventiveScheduleItem, AuditLog, UserProfile, UserAccount } from '../types';

export const INITIAL_ASSETS: Asset[] = [
  {
    id: '4th-PCCU-LPTP02',
    name: 'Dell Latitude E5470 - PICCU Station',
    type: 'Laptop',
    brand: 'Dell',
    model: 'Latitude E5470',
    serialNumber: 'BNLMVD2',
    department: 'الدور الرابع - PICCU',
    floor: 'الدور الرابع',
    roomOrUnit: 'PICCU - وحدة الرعاية المركزة لجراحة قلب الأطفال',
    currentUser: 'عبدالرحمن فتحي',
    userRole: 'أخصائي تمريض / مدخل بيانات',
    status: 'needs_parts',
    purchaseDate: '2023-03-15',
    warrantyExpiry: '2026-03-15',
    ipAddress: '192.168.4.42',
    macAddress: '3C:D9:2B:51:7A:12',
    specifications: {
      cpu: 'Intel Core i5-6300U @ 2.40GHz',
      ram: '8 GB DDR4',
      storage: '256GB SSD NVMe',
      os: 'Windows 10 Pro 64-bit'
    },
    notes: 'جهاز تسجيل ومتابعة بيانات مرضى الرعاية المركزة للأطفال',
    createdAt: '2023-03-20',
    qrCodeData: 'ASSET:4th-PCCU-LPTP02|SN:BNLMVD2|LOC:PICCU-4F'
  },
  {
    id: '3rd-OR01-PC01',
    name: 'HP EliteDesk 800 G4 - غرفة العمليات 1',
    type: 'Desktop',
    brand: 'HP',
    model: 'EliteDesk 800 G4 SFF',
    serialNumber: 'CZC9120KL3',
    department: 'الدور الثالث - جناح العمليات الكبرى',
    floor: 'الدور الثالث',
    roomOrUnit: 'غرفة العمليات OR-01',
    currentUser: 'د. سامح ممدوح',
    userRole: 'استشاري جراحة قلب الأطفال',
    status: 'operational',
    purchaseDate: '2023-01-10',
    warrantyExpiry: '2026-01-10',
    ipAddress: '192.168.3.15',
    macAddress: '00:1E:67:D8:F1:89',
    specifications: {
      cpu: 'Intel Core i7-8700 @ 3.20GHz',
      ram: '16 GB DDR4',
      storage: '512GB NVMe SSD + 1TB HDD',
      os: 'Windows 11 Pro 64-bit'
    },
    notes: 'متصل بنظام الأشعة وعرض القسطرة التداخلية PACS',
    createdAt: '2023-01-15',
    qrCodeData: 'ASSET:3rd-OR01-PC01|SN:CZC9120KL3|LOC:OR1-3F'
  },
  {
    id: '2nd-ICU-WS04',
    name: 'Lenovo ThinkCentre M720q - محطة تمريض ICU',
    type: 'Medical Workstation',
    brand: 'Lenovo',
    model: 'ThinkCentre M720q Tiny',
    serialNumber: 'MJ07B8X1',
    department: 'الدور الثاني - العناية المركزة الجراحية',
    floor: 'الدور الثاني',
    roomOrUnit: 'محطة التمريض المركزية B',
    currentUser: 'فريق تمريض وردية A',
    userRole: 'تمريض الرعاية',
    status: 'operational',
    purchaseDate: '2022-11-05',
    warrantyExpiry: '2025-11-05',
    ipAddress: '192.168.2.88',
    macAddress: 'E4:54:E8:22:90:3A',
    specifications: {
      cpu: 'Intel Core i5-9400T',
      ram: '16 GB DDR4',
      storage: '256GB SSD',
      os: 'Windows 10 Pro 64-bit'
    },
    notes: 'مربوط مباشرة مع أجهزة المونيتور الحيوية لمتابعة العلامات الحيوية',
    createdAt: '2022-11-10',
    qrCodeData: 'ASSET:2nd-ICU-WS04|SN:MJ07B8X1|LOC:ICU-2F'
  },
  {
    id: '1st-OPD-PRN02',
    name: 'HP LaserJet Pro M404dn - طباعة تذاكر العيادات',
    type: 'Printer',
    brand: 'HP',
    model: 'LaserJet Pro M404dn',
    serialNumber: 'VNB3B08421',
    department: 'الدور الأول - العيادات الخارجية',
    floor: 'الدور الأول',
    roomOrUnit: 'استقبال العيادات 2',
    currentUser: 'أ. مروة حسني',
    userRole: 'موظفة استقبال وسجلات طبية',
    status: 'operational',
    purchaseDate: '2023-06-20',
    warrantyExpiry: '2025-06-20',
    ipAddress: '192.168.1.110',
    notes: 'طابعة شبكية لطباعة روشتات وتقارير الفحص اليومي',
    createdAt: '2023-06-25',
    qrCodeData: 'ASSET:1st-OPD-PRN02|SN:VNB3B08421|LOC:OPD-1F'
  },
  {
    id: 'SRV-DC-01',
    name: 'Dell PowerEdge R740 - الدومين وسيرفر المستشفى الرئيسي',
    type: 'Server',
    brand: 'Dell',
    model: 'PowerEdge R740 2U Rack',
    serialNumber: '7H8Q4Z2',
    department: 'الدور الأرضي - غرفة السيرفرات وتكنولوجيا المعلومات',
    floor: 'الدور الأرضي',
    roomOrUnit: 'Data Center Main Rack A1',
    currentUser: 'قسم تكنولوجيا المعلومات (IT Team)',
    userRole: 'إدارة الشبكات والأنظمة',
    status: 'operational',
    purchaseDate: '2021-08-12',
    warrantyExpiry: '2026-08-12',
    ipAddress: '192.168.0.10',
    macAddress: '18:66:DA:20:FE:01',
    specifications: {
      cpu: '2x Intel Xeon Silver 4214 (24 Cores)',
      ram: '64 GB ECC DDR4',
      storage: '4x 2TB SAS 12G RAID 10',
      os: 'Windows Server 2022 Datacenter'
    },
    notes: 'سيرفر نظام إدارة المستشفى HIS وقاعدة بيانات المرضى',
    createdAt: '2021-08-20',
    qrCodeData: 'ASSET:SRV-DC-01|SN:7H8Q4Z2|LOC:DC-GF'
  },
  {
    id: 'SW-4TH-CORE',
    name: 'Cisco Catalyst 3850 - سويتش توزيع الدور الرابع',
    type: 'Network Switch',
    brand: 'Cisco',
    model: 'WS-C3850-48P-L',
    serialNumber: 'FOC2134S8X',
    department: 'الدور الرابع - كابينة الشبكات',
    floor: 'الدور الرابع',
    roomOrUnit: 'Network Closet 402',
    currentUser: 'قسم الشبكات والاتصالات',
    status: 'operational',
    purchaseDate: '2022-04-10',
    ipAddress: '192.168.4.1',
    notes: 'يوفر PoE لجميع نقاط مراقبة المرضى وأجهزة الـ VoIP في الدور الرابع',
    createdAt: '2022-04-15',
    qrCodeData: 'ASSET:SW-4TH-CORE|SN:FOC2134S8X|LOC:NET-4F'
  }
];

export const INITIAL_TICKETS: MaintenanceTicket[] = [
  {
    id: 'R10-9-2026',
    assetId: '4th-PCCU-LPTP02',
    technicianName: 'ENG Abdelrahman',
    reportDateTime: '2026-09-03T15:00',
    resolutionDateTime: '2026-09-10T20:00',
    reportingSource: 'user_report',
    issueCategory: 'hardware',
    priority: 'high',
    userProblemDescription: 'الويندوز مش شغال و فيه شاشة سودا',
    diagnosis: 'عطل في الهارد (Hard Disk Drive Failure)',
    actionTaken: 'تم تغيير الهارد بهارد جديد "من غير ممتلكات المستشفى" للضرورة القصوى حتى توفير قطعة بديلة من المخزن',
    sparePartsUsed: [
      {
        id: 'sp-01',
        name: 'SSD Hard Drive M.2 NVMe 250GB',
        partNumber: 'NVME-250-WD',
        quantity: 1,
        unitCost: 1100,
        totalCost: 1100,
        origin: 'external_emergency'
      }
    ],
    totalCost: 1100,
    downtimeFormatted: '8 أيام (173 ساعة)',
    downtimeHours: 173,
    statusAfterMaintenance: 'needs_parts',
    notesAndRecommendations: 'يوصى بتوفير هارد NVMe أصلي من مخزن المستشفى لاستبدال الهارد المؤقت وإجراء نسخ احتياطي فوري للنظام، وفحص دوري لدرجة حرارة اللابتوب.',
    technicianSignature: 'ENG Abdelrahman (IT Dept)',
    userSignature: 'عبدالرحمن فتحي (PICCU)',
    status: 'in_progress',
    createdAt: '2026-09-03T15:00:00'
  },
  {
    id: 'R05-9-2026',
    assetId: '1st-OPD-PRN02',
    technicianName: 'ENG Mohamed Tarek',
    reportDateTime: '2026-09-05T09:30',
    resolutionDateTime: '2026-09-05T11:45',
    reportingSource: 'user_report',
    issueCategory: 'printer',
    priority: 'medium',
    userProblemDescription: 'انحشار متكرر للورق وسحب أكثر من ورقة معاً أثناء طباعة تذاكر العيادة',
    diagnosis: 'تلف وتآكل رول سحب الورق (Pickup Roller) وتراكم أتربة حبرية',
    actionTaken: 'تم تنظيف مسار الورق واستبدال Pickup Roller و Roller Separation من مخزن قطع الغيار واختبار 50 ورقة بنجاح',
    sparePartsUsed: [
      {
        id: 'sp-02',
        name: 'HP Paper Pickup Roller Assembly',
        partNumber: 'RM2-5399-000',
        quantity: 1,
        unitCost: 280,
        totalCost: 280,
        origin: 'hospital_inventory'
      }
    ],
    totalCost: 280,
    downtimeFormatted: 'ساعتان و 15 دقيقة',
    downtimeHours: 2.25,
    statusAfterMaintenance: 'repaired',
    notesAndRecommendations: 'تم التنبيه على موظفي الاستقبال بعدم استخدام ورق رطب أو معاد استخدامه لمنع الانحشار.',
    technicianSignature: 'ENG Mohamed Tarek',
    userSignature: 'أ. مروة حسني',
    status: 'closed',
    createdAt: '2026-09-05T09:30:00'
  },
  {
    id: 'R01-9-2026',
    assetId: '3rd-OR01-PC01',
    technicianName: 'ENG Abdelrahman',
    reportDateTime: '2026-09-01T08:00',
    resolutionDateTime: '2026-09-01T09:15',
    reportingSource: 'periodic_check',
    issueCategory: 'preventive',
    priority: 'high',
    userProblemDescription: 'فحص دوري وقائي شهري لأجهزة محطات غرف العمليات الكبرى',
    diagnosis: 'تراكم أتربة في فتحات التبريد ومروحة المعالج CPU Fan، وتحديث أمني معلق لنظام التشغيل',
    actionTaken: 'تم تنظيف الجهاز باستخدام منفاخ هواء مضغوط معقم، وتحديث برامج التشغيل و Windows Update، والتأكد من سرعة الاتصال بسيرفر PACS',
    sparePartsUsed: [],
    totalCost: 0,
    downtimeFormatted: 'ساعة و 15 دقيقة (مجدولة مسبقاً)',
    downtimeHours: 1.25,
    statusAfterMaintenance: 'repaired',
    notesAndRecommendations: 'حالة الجهاز ممتازة ويعمل بكفاءة كاملة لخدمة العمليات.',
    technicianSignature: 'ENG Abdelrahman',
    userSignature: 'د. سامح ممدوح',
    status: 'closed',
    createdAt: '2026-09-01T08:00:00'
  }
];

export const INITIAL_SPARE_PARTS: SparePartInventoryItem[] = [
  {
    id: 'sp-01',
    name: 'SSD Hard Drive M.2 NVMe 250GB / 500GB',
    category: 'Storage',
    partNumber: 'NVME-250-WD',
    quantityInStock: 2,
    minThreshold: 5,
    unitCost: 1100,
    location: 'مخزن تكنولوجيا المعلومات - خزانة 1 رف B',
    status: 'low_stock',
    supplier: 'الشركة المصرية لتكنولوجيا التخزين'
  },
  {
    id: 'sp-02',
    name: 'HP Paper Pickup Roller Assembly',
    category: 'Printer Parts',
    partNumber: 'RM2-5399-000',
    quantityInStock: 8,
    minThreshold: 3,
    unitCost: 280,
    location: 'مخزن تكنولوجيا المعلومات - خزانة 3 رف A',
    status: 'in_stock',
    supplier: 'مركز خدمة HP المعتمد'
  },
  {
    id: 'sp-03',
    name: 'DDR4 RAM 8GB 2666MHz SODIMM / Desktop',
    category: 'RAM Memory',
    partNumber: 'RAM-DDR4-8G-KNG',
    quantityInStock: 12,
    minThreshold: 4,
    unitCost: 650,
    location: 'مخزن تكنولوجيا المعلومات - خزانة 1 رف A',
    status: 'in_stock',
    supplier: 'سيتي سنتر تكنولوجي'
  },
  {
    id: 'sp-04',
    name: 'Dell Laptop Original Charger 65W / 90W 7.4mm Barrel',
    category: 'Power Adapters',
    partNumber: 'DELL-PWR-90W-ORG',
    quantityInStock: 4,
    minThreshold: 3,
    unitCost: 850,
    location: 'مخزن تكنولوجيا المعلومات - خزانة 2 رف C',
    status: 'in_stock',
    supplier: 'الوكيل المعتمد لديل'
  },
  {
    id: 'sp-05',
    name: 'Thermal Paste Arctic MX-4 (معجون تبريد معالج)',
    category: 'Consumables',
    partNumber: 'MX4-4G-COOL',
    quantityInStock: 6,
    minThreshold: 2,
    unitCost: 220,
    location: 'حقيبة عدة الصيانة الميدانية',
    status: 'in_stock',
    supplier: 'ألفا تك مصر'
  },
  {
    id: 'sp-06',
    name: 'Cat6 UTP Patch Cord 3M / 5M (Medical Blue)',
    category: 'Network Cables',
    partNumber: 'NET-CAT6-3M-BL',
    quantityInStock: 35,
    minThreshold: 10,
    unitCost: 45,
    location: 'مخزن تكنولوجيا المعلومات - درج الكابلات',
    status: 'in_stock',
    supplier: 'الشركة الهندسية للشبكات'
  }
];

export const INITIAL_PREVENTIVE_SCHEDULES: PreventiveScheduleItem[] = [
  {
    id: 'prev-01',
    title: 'فحص وتنظيف أجهزة محطات العناية المركزة (PICCU & ICU)',
    department: 'الدور الرابع والثاني - الرعاية المركزة للأطفال',
    frequency: 'monthly',
    assignedTechnician: 'ENG Abdelrahman',
    nextDueDate: '2026-10-01',
    lastDoneDate: '2026-09-01',
    status: 'upcoming',
    checklist: [
      { id: 'chk-1', text: 'فحص استقرار نظام التشغيل والبرامج الطبية', done: true },
      { id: 'chk-2', text: 'تنظيف فتحات التهوية والمراوح من الأتربة', done: true },
      { id: 'chk-3', text: 'اختبار كابل الشبكة وكفاءة اتصال الـ PACS والمونيتورز', done: false },
      { id: 'chk-4', text: 'فحص كابلات الكهرباء ومصدر الـ UPS الطبي للطوارئ', done: false }
    ]
  },
  {
    id: 'prev-02',
    title: 'فحص محطات العمل وغرف العمليات الكبرى (OR)',
    department: 'الدور الثالث - جناح العمليات',
    frequency: 'monthly',
    assignedTechnician: 'ENG Abdelrahman',
    nextDueDate: '2026-10-05',
    lastDoneDate: '2026-09-01',
    status: 'upcoming',
    checklist: [
      { id: 'chk-5', text: 'فحص كروت الشاشة وشاشات العرض الجراحية عالية الدقة', done: false },
      { id: 'chk-6', text: 'التحقق من عمل الماوس ولوحة المفاتيح المعقمة', done: false },
      { id: 'chk-7', text: 'فحص التحديثات الأمنية وتوافقها مع الأجهزة الطبية', done: false }
    ]
  },
  {
    id: 'prev-03',
    title: 'أخذ نسخة احتياطية وفحص درجات حرارة السيرفرات الرئيسية (DC)',
    department: 'الدور الأرضي - غرفة السيرفرات Data Center',
    frequency: 'weekly',
    assignedTechnician: 'ENG Mohamed Tarek',
    nextDueDate: '2026-09-14',
    lastDoneDate: '2026-09-07',
    status: 'due_today',
    checklist: [
      { id: 'chk-8', text: 'التحقق من حالة أقراص التخزين RAID ومصابيح الـ Health', done: true },
      { id: 'chk-9', text: 'فحص نظام التكييف المزدوج ودرجة حرارة الكبائن', done: true },
      { id: 'chk-10', text: 'التحقق من نجاح الـ Automated Daily Backup', done: false }
    ]
  }
];

export const INITIAL_ACCOUNTS: UserAccount[] = [
  {
    id: 'acc-admin',
    name: 'ENG Abdelrahman (Admin)',
    username: 'admin',
    email: 'abdelrahmanyasser.phoenix@gmail.com',
    password: 'admin',
    role: 'admin',
    status: 'active',
    department: 'قسم تكنولوجيا المعلومات IT',
    jobTitle: 'مدير النظام ومسؤول الصيانة',
    permissions: ['dashboard', 'tickets', 'assets', 'inventory', 'preventive', 'logs', 'user_management'],
    createdAt: '2026-08-01T08:00:00',
    lastLogin: '2026-09-16T14:00:00'
  },
  {
    id: 'acc-tech-01',
    name: 'ENG Mohamed Tarek',
    username: 'mohamed',
    email: 'm.tarek@nileofhope.org',
    password: '123',
    role: 'technician',
    status: 'active',
    department: 'قسم تكنولوجيا المعلومات IT',
    jobTitle: 'مهندس شبكات وبنية تحتية',
    permissions: ['dashboard', 'tickets', 'assets', 'inventory', 'preventive', 'logs'],
    createdAt: '2026-08-05T09:00:00',
    lastLogin: '2026-09-15T11:00:00'
  },
  {
    id: 'acc-tech-02',
    name: 'ENG Hossam IT',
    username: 'hossam',
    email: 'hossam@nileofhope.org',
    password: '123',
    role: 'technician',
    status: 'active',
    department: 'قسم تكنولوجيا المعلومات IT',
    jobTitle: 'مهندس صيانة ودعم فني',
    permissions: ['dashboard', 'tickets', 'assets', 'logs'],
    createdAt: '2026-08-10T10:00:00'
  },
  {
    id: 'acc-pending-01',
    name: 'م. سارة أحمد',
    username: 'sara',
    email: 'sara.ahmed@nileofhope.org',
    password: '123',
    role: 'user',
    status: 'pending',
    department: 'شؤون الأجهزة والعهد',
    jobTitle: 'مسؤولة العهد وقواعد البيانات',
    permissions: [], // Default: zero permissions until admin grants them
    createdAt: '2026-09-15T16:30:00'
  }
];

export const INITIAL_USERS: UserProfile[] = INITIAL_ACCOUNTS.map(a => ({
  id: a.id,
  name: a.name,
  role: a.jobTitle,
  department: a.department,
  username: a.username,
  status: a.status,
  permissions: a.permissions
}));

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-101',
    timestamp: '2026-09-10T20:05:00',
    userName: 'ENG Abdelrahman',
    userRole: 'مهندس صيانة ودعم فني IT',
    actionType: 'status_change',
    targetType: 'ticket',
    targetId: 'R10-9-2026',
    targetTitle: 'تقرير صيانة لابتوب PICCU (4th-PCCU-LPTP02)',
    description: 'تم تحديث حالة البلاغ إلى "يحتاج قطعة غيار" وتركيب هارد NVMe مؤقت للطوارئ',
    details: {
      changes: [
        { field: 'statusAfterMaintenance', label: 'الحالة بعد الصيانة', oldValue: 'in_progress', newValue: 'needs_parts' },
        { field: 'downtimeFormatted', label: 'مدة التوقف', oldValue: '0', newValue: '8 أيام (173 ساعة)' }
      ],
      extraInfo: 'تم تركيب SSD خارجي مؤقت للضرورة القصوى لحين توفير قطعة بديلة من المخزن'
    }
  },
  {
    id: 'log-102',
    timestamp: '2026-09-10T19:45:00',
    userName: 'ENG Abdelrahman',
    userRole: 'مهندس صيانة ودعم فني IT',
    actionType: 'status_change',
    targetType: 'asset',
    targetId: '4th-PCCU-LPTP02',
    targetTitle: 'Dell Latitude E5470 - PICCU Station',
    description: 'تم تغيير حالة الجهاز من "يعمل بكفاءة" إلى "بانتظار قطع غيار"',
    details: {
      changes: [
        { field: 'status', label: 'حالة الجهاز', oldValue: 'operational', newValue: 'needs_parts' }
      ]
    }
  },
  {
    id: 'log-103',
    timestamp: '2026-09-05T11:45:00',
    userName: 'ENG Mohamed Tarek',
    userRole: 'مهندس شبكات وبنية تحتية',
    actionType: 'update',
    targetType: 'ticket',
    targetId: 'R05-9-2026',
    targetTitle: 'تقرير صيانة طابعة العيادات (1st-OPD-PRN02)',
    description: 'تم إغلاق البلاغ بنجاح وتغيير حالة الجهاز إلى "تم الإصلاح"',
    details: {
      changes: [
        { field: 'status', label: 'حالة التذكرة', oldValue: 'in_progress', newValue: 'closed' },
        { field: 'statusAfterMaintenance', label: 'الحالة بعد الصيانة', oldValue: 'under_observation', newValue: 'repaired' }
      ]
    }
  },
  {
    id: 'log-104',
    timestamp: '2026-09-05T11:20:00',
    userName: 'ENG Mohamed Tarek',
    userRole: 'مهندس شبكات وبنية تحتية',
    actionType: 'stock_adjust',
    targetType: 'spare_part',
    targetId: 'sp-02',
    targetTitle: 'HP Paper Pickup Roller Assembly',
    description: 'تم صرف قطعة غيار (1 قطعة) لصالح صيانة طابعة العيادات الخارجية',
    details: {
      changes: [
        { field: 'quantityInStock', label: 'الرصيد المتبقي بالمخزن', oldValue: 9, newValue: 8 }
      ],
      extraInfo: 'خصم تلقائي مرتبط بالتقرير رقم R05-9-2026'
    }
  },
  {
    id: 'log-105',
    timestamp: '2026-09-03T15:00:00',
    userName: 'ENG Abdelrahman',
    userRole: 'مهندس صيانة ودعم فني IT',
    actionType: 'create',
    targetType: 'ticket',
    targetId: 'R10-9-2026',
    targetTitle: 'بلاغ صيانة جديد لجهاز 4th-PCCU-LPTP02',
    description: 'تسجيل بلاغ عطل جديد: شاشة سوداء وعدم إقلاع نظام التشغيل في رعاية الأطفال',
    details: {
      extraInfo: 'مصدر البلاغ: بلاغ مستخدم (عبدالرحمن فتحي - تمريض PICCU)'
    }
  },
  {
    id: 'log-106',
    timestamp: '2026-09-01T09:15:00',
    userName: 'ENG Abdelrahman',
    userRole: 'مهندس صيانة ودعم فني IT',
    actionType: 'update',
    targetType: 'preventive',
    targetId: 'prev-01',
    targetTitle: 'فحص وتنظيف أجهزة محطات العناية المركزة (PICCU & ICU)',
    description: 'إنجاز بنود الفحص الدوري الشهري وتحديث تقرير الصيانة الوقائية',
    details: {
      changes: [
        { field: 'chk-1', label: 'فحص استقرار نظام التشغيل والبرامج الطبية', oldValue: false, newValue: true },
        { field: 'chk-2', label: 'تنظيف فتحات التهوية والمراوح من الأتربة', oldValue: false, newValue: true }
      ]
    }
  },
  {
    id: 'log-107',
    timestamp: '2026-08-20T10:00:00',
    userName: 'ENG Hossam IT',
    userRole: 'مدير تكنولوجيا المعلومات',
    actionType: 'create',
    targetType: 'asset',
    targetId: 'SRV-DC-01',
    targetTitle: 'Dell PowerEdge R740 - الدومين وسيرفر المستشفى الرئيسي',
    description: 'إضافة سيرفر جديد إلى سجل الأصول وتوليد كود الباركود والـ QR Code',
    details: {
      extraInfo: 'غرفة السيرفرات الرئيسية Data Center A1'
    }
  }
];
