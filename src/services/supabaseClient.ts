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

export function saveSupabaseConfig(url: string, anonKey: string): void {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();

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

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    const testClient = createClient(url.trim(), key.trim(), {
      auth: { persistSession: false }
    });

    const { error } = await testClient.from('noh_accounts').select('id').limit(1);

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "public.noh_accounts" does not exist')) {
        return {
          success: false,
          message: 'تم الاتصال بـ Supabase بنجاح ولكن الجداول غير موجودة! يرجى تشغيل سكربت supabase_schema.sql في SQL Editor.'
        };
      }
      return {
        success: false,
        message: `خطأ في الاتصال: ${error.message}`
      };
    }

    return {
      success: true,
      message: 'تم الاتصال بقاعدة بيانات Supabase السحابية بنجاح!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `فشل الاتصال: ${err.message || 'يرجى التأكد من صحة الرابط ومفتاح Anon Key'}`
    };
  }
}
