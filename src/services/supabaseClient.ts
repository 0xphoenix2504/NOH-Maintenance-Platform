import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL_KEY = 'noh_supabase_url';
const SUPABASE_KEY_KEY = 'noh_supabase_anon_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'env' | 'localStorage' | 'none';
}

let cachedClient: SupabaseClient | null = null;
let cachedUrl: string | null = null;
let cachedKey: string | null = null;

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL ? import.meta.env.VITE_SUPABASE_URL : '').trim();
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY ? import.meta.env.VITE_SUPABASE_ANON_KEY : '').trim();

  const localUrl = (localStorage.getItem(SUPABASE_URL_KEY) || '').trim();
  const localKey = (localStorage.getItem(SUPABASE_KEY_KEY) || '').trim();

  if (envUrl && envKey && !envUrl.includes('your-project-id')) {
    return {
      url: envUrl,
      anonKey: envKey,
      isConfigured: true,
      source: 'env'
    };
  }

  if (localUrl && localKey) {
    return {
      url: localUrl,
      anonKey: localKey,
      isConfigured: true,
      source: 'localStorage'
    };
  }

  return {
    url: '',
    anonKey: '',
    isConfigured: false,
    source: 'none'
  };
}

export function normalizeSupabaseUrl(rawUrl: string): string {
  let url = (rawUrl || '').trim();
  if (!url) return '';

  // If user pasted dashboard project URL like https://supabase.com/dashboard/project/abcdefgh...
  const dashboardMatch = url.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // Remove trailing slashes and common path segments
  url = url.replace(/\/+$/, '').replace(/\/rest\/v1\/?$/i, '');

  // Prepend https:// if protocol is omitted
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  return url;
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  const cleanUrl = normalizeSupabaseUrl(url);
  const cleanKey = anonKey.trim().replace(/[\r\n\t]/g, '');

  if (cleanUrl && cleanKey) {
    localStorage.setItem(SUPABASE_URL_KEY, cleanUrl);
    localStorage.setItem(SUPABASE_KEY_KEY, cleanKey);
  } else {
    localStorage.removeItem(SUPABASE_URL_KEY);
    localStorage.removeItem(SUPABASE_KEY_KEY);
  }

  // Reset client cache so new instance will be created with updated credentials
  cachedClient = null;
  cachedUrl = null;
  cachedKey = null;
}

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();

  if (!config.isConfigured) {
    return null;
  }

  if (cachedClient && cachedUrl === config.url && cachedKey === config.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    cachedUrl = config.url;
    cachedKey = config.anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(
  rawUrl: string,
  rawKey: string
): Promise<{ success: boolean; message: string; normalizedUrl?: string }> {
  const url = normalizeSupabaseUrl(rawUrl);
  const key = (rawKey || '').trim().replace(/[\r\n\t]/g, '');

  if (!url || !key) {
    return {
      success: false,
      message: 'يرجى إدخال كل من رابط المشروع Project URL ومفتاح Anon Key.'
    };
  }

  // Basic check for URL structure
  try {
    const parsed = new URL(url);
    if (
      !parsed.hostname.includes('supabase.co') &&
      !parsed.hostname.includes('localhost') &&
      !parsed.hostname.includes('127.0.0.1')
    ) {
      return {
        success: false,
        message: `الرابط المدخل (${url}) غير صالح. يجب أن ينتهي بنطاق .supabase.co (مثل: https://your-id.supabase.co)`
      };
    }
  } catch {
    return {
      success: false,
      message: 'صيغة الرابط غير صحيحة. يرجى التأكد من كتابة رابط سليم مثل https://your-id.supabase.co'
    };
  }

  try {
    const testClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const { error } = await testClient
      .from('noh_accounts')
      .select('id')
      .limit(1);

    if (error) {
      if (
        error.code === 'PGRST116' ||
        error.code === '42P01' ||
        error.message.includes('relation "public.noh_accounts" does not exist') ||
        error.message.includes('noh_accounts')
      ) {
        return {
          success: false,
          normalizedUrl: url,
          message:
            'تم الاتصال بالسيرفر بنجاح لكن الجداول غير موجودة! يرجى فتح SQL Editor في Supabase وتنفيذ سكربت supabase_schema.sql.'
        };
      }

      if (
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('Load failed')
      ) {
        return {
          success: false,
          normalizedUrl: url,
          message:
            'تعذر الاتصال بخادم Supabase (TypeError: Failed to fetch).\n' +
            'تأكد من:\n' +
            '1. نسخ Project URL من (Project Settings ➔ API) وليس رابط لوحة التحكم في المتصفح.\n' +
            '2. اكتمال تهيئة المشروع على Supabase (ألا يكون في وضع Paused أو قيد الإنشاء).\n' +
            '3. تعطيل مانع الإعلانات (AdBlocker) أو حماية متصفح Brave على هذا الموقع.\n' +
            '4. التأكد من اتصال الإنترنت وعدم وجود جدار حماية (Firewall) يحظر نطاق supabase.co.'
        };
      }

      return {
        success: false,
        normalizedUrl: url,
        message: `خطأ في الاتصال: ${error.message}`
      };
    }

    return {
      success: true,
      normalizedUrl: url,
      message: 'تم الاتصال بقاعدة بيانات Supabase السحابية بنجاح!'
    };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (
      errMsg.includes('Failed to fetch') ||
      errMsg.includes('NetworkError') ||
      errMsg.includes('Load failed')
    ) {
      return {
        success: false,
        normalizedUrl: url,
        message:
          'تعذر الاتصال بخادم Supabase (TypeError: Failed to fetch).\n' +
          'تأكد من:\n' +
          '1. نسخ Project URL من (Project Settings ➔ API) وليس رابط لوحة التحكم في المتصفح.\n' +
          '2. اكتمال تهيئة المشروع على Supabase (ألا يكون في وضع Paused أو قيد الإنشاء).\n' +
          '3. تعطيل مانع الإعلانات (AdBlocker) أو حماية متصفح Brave على هذا الموقع.\n' +
          '4. التأكد من اتصال الإنترنت وعدم وجود جدار حماية (Firewall) يحظر نطاق supabase.co.'
      };
    }

    return {
      success: false,
      normalizedUrl: url,
      message: `فشل الاتصال: ${errMsg}`
    };
  }
}
