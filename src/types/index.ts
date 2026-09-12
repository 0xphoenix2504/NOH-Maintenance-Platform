export type DeviceType = 
  | 'Laptop'
  | 'Desktop'
  | 'Server'
  | 'Printer'
  | 'Network Switch'
  | 'Medical Workstation'
  | 'Monitor'
  | 'UPS'
  | 'Other';

export type DeviceStatus = 
  | 'operational'      // يعمل بكفاءة
  | 'in_maintenance'   // تحت الصيانة
  | 'needs_parts'      // بانتظار قطع غيار
  | 'damaged'          // تالف غير قابل للإصلاح
  | 'spare'            // جهاز احتياطي
  | 'decommissioned';  // كهنة / خارج الخدمة

export interface Asset {
  id: string;                      // كود الجهاز (Asset ID) e.g. 4th-PCCU-LPTP02
  name: string;                    // اسم/توصيف الجهاز
  type: DeviceType;                // نوع الجهاز
  brand: string;                   // الماركة e.g. Dell
  model: string;                   // الموديل e.g. Latitude E5470
  serialNumber: string;            // الرقم التسلسلي (Serial Number) e.g. BNLMVD2
  department: string;              // الموقع / القسم e.g. الدور الرابع - PICCU
  floor: string;                   // الدور
  roomOrUnit: string;              // الوحدة / الغرفة
  currentUser: string;             // اسم المستخدم / العهدة e.g. عبدالرحمن فتحي
  userRole?: string;               // المسمى الوظيفي
  status: DeviceStatus;            // حالة الجهاز
  purchaseDate?: string;           // تاريخ الشراء
  warrantyExpiry?: string;         // انتهاء الضمان
  ipAddress?: string;              // عنوان IP
  macAddress?: string;             // عنوان MAC
  specifications?: {
    cpu?: string;
    ram?: string;
    storage?: string;
    os?: string;
  };
  notes?: string;
  createdAt: string;
  qrCodeData?: string;
}

export type ReportingSource = 
  | 'user_report'       // بلاغ مستخدم
  | 'periodic_check'    // فحص دوري وقائي
  | 'network_alert'     // إنذار شبكة ومراقبة
  | 'management'        // توجيه إدارة
  | 'routine_inspection';// جولة تفقدية

export type IssueCategory = 
  | 'hardware'          // هاردوير
  | 'software'          // سوفت وير
  | 'network'           // شبكات
  | 'os'                // نظام التشغيل
  | 'printer'           // طابعات وماسحات
  | 'preventive'        // صيانة وقائية
  | 'other';            // أخرى

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export type TicketStatus = 
  | 'open'              // مفتوح / جديد
  | 'in_progress'       // جاري العمل
  | 'pending_parts'     // بانتظار قطعة غيار
  | 'resolved'          // تم الإصلاح
  | 'closed';           // مغلق ومعتمد

export type PostMaintenanceStatus = 
  | 'repaired'          // تم الإصلاح بنجاح
  | 'needs_parts'       // يحتاج قطعة غيار
  | 'under_observation' // قيد الملاحظة
  | 'unrepairable'      // تالف غير قابل للإصلاح
  | 'transferred_agent';// تم التحويل لتوكيل خارجي

export interface UsedSparePart {
  id: string;
  name: string;        // e.g. SSD Hard Drive M.2 NVMe 250GB
  partNumber?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  origin: 'hospital_inventory' | 'external_emergency' | 'under_warranty'; // ممتلكات المستشفى أو خارجي
}

export interface MaintenanceTicket {
  id: string;                          // رقم التقرير e.g. R10-9-2026
  assetId: string;                     // كود الجهاز
  assetDetails?: Partial<Asset>;       // نسخة من بيانات الجهاز وقت البلاغ
  
  technicianName: string;              // اسم الفني المسؤول e.g. ENG Abdelrahman
  technicianId?: string;
  
  reportDateTime: string;              // تاريخ ووقت البلاغ e.g. 2026-09-03T15:00
  resolutionDateTime: string;          // تاريخ ووقت انتهاء الصيانة e.g. 2026-09-10T20:00
  
  reportingSource: ReportingSource;    // مصدر البلاغ e.g. بلاغ مستخدم
  issueCategory: IssueCategory;        // نوع العطل e.g. هاردوير
  priority: PriorityLevel;             // الأولوية
  
  userProblemDescription: string;      // وصف المستخدم للمشكلة e.g. الويندوز مش شغال و فيه شاشة سودا
  
  diagnosis: string;                   // التشخيص (السبب الجذري) e.g. عطل في الهارد
  actionTaken: string;                 // الإجراء المتخذ e.g. تم تغيير الهارد بهارد جديد "من غير ممتلكات المستشفى" للضرورة القصوى
  
  sparePartsUsed: UsedSparePart[];     // قطع الغيار المستخدمة
  totalCost: number;                   // التكلفة الإجمالية إن وجدت
  
  downtimeFormatted: string;           // مدة التوقف e.g. 8 أيام
  downtimeHours?: number;              // عدد الساعات المحسوبة
  
  statusAfterMaintenance: PostMaintenanceStatus; // الحالة بعد الصيانة e.g. يحتاج قطعة غيار
  
  notesAndRecommendations: string;     // ملاحظات وتوصيات
  
  technicianSignature?: string;        // توقيع الفني
  userSignature?: string;              // توقيع المستخدم / المسؤول
  
  status: TicketStatus;
  createdAt: string;
}

export interface SparePartInventoryItem {
  id: string;
  name: string;
  category: string;
  partNumber: string;
  quantityInStock: number;
  minThreshold: number;
  unitCost: number;
  location: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  supplier?: string;
}

export interface PreventiveScheduleItem {
  id: string;
  title: string;
  department: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  assignedTechnician: string;
  nextDueDate: string;
  lastDoneDate?: string;
  status: 'upcoming' | 'due_today' | 'overdue' | 'completed';
  checklist: Array<{ id: string; text: string; done: boolean }>;
}
