// ─── Supabase Client Integration Service ───────────────────────────────────────
// Connects PathCareSync AI directly to user-configured Supabase PostgreSQL database

export type DatabaseProvider = 'mock' | 'supabase' | 'azure';

export interface DatabaseConfig {
  provider: DatabaseProvider;
  supabaseUrl: string;
  supabaseAnonKey: string;
  azureEndpoint?: string;
  isConnected: boolean;
  lastConnectedAt?: string;
}

const STORAGE_KEY = 'pathcaresync_database_config';

// Load initial config from localStorage or Vite environment variables
export function getDatabaseConfig(): DatabaseConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to parse database config from storage', e);
  }

  // Fallback to Vite env variables if provided
  const metaEnv = (import.meta as any).env || {};
  const envUrl = metaEnv.VITE_SUPABASE_URL || metaEnv.SUPABASE_URL || '';
  const envKey = metaEnv.VITE_SUPABASE_ANON_KEY || metaEnv.SUPABASE_PUBLISHABLE_KEY || metaEnv.SUPABASE_ANON_KEY || '';

  return {
    provider: envUrl && envKey ? 'supabase' : 'mock',
    supabaseUrl: envUrl,
    supabaseAnonKey: envKey,
    isConnected: Boolean(envUrl && envKey),
  };
}

export function saveDatabaseConfig(config: DatabaseConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save database config', e);
  }
}

/**
 * Validates connection to a Supabase project via its REST API (PostgREST)
 */
export async function testSupabaseConnection(url: string, anonKey: string): Promise<{
  success: boolean;
  message: string;
  patientCount?: number;
}> {
  if (!url || !anonKey) {
    return { success: false, message: 'Supabase URL and Anon Public Key are required.' };
  }

  const cleanUrl = url.trim().replace(/\/+$/, '');
  const endpoint = `${cleanUrl}/rest/v1/patients?select=patient_id`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': anonKey.trim(),
        'Authorization': `Bearer ${anonKey.trim()}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          message: 'Authentication failed (401/403). Please verify your Supabase Anon Public Key.',
        };
      }
      if (response.status === 404) {
        return {
          success: true,
          message: 'Supabase project reachable & credentials authenticated! (Note: Run supabase_schema.sql in your Supabase SQL Editor to initialize the 17 care tables).',
          patientCount: 0,
        };
      }
      return {
        success: false,
        message: `Supabase returned HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    const count = Array.isArray(data) ? data.length : 0;

    return {
      success: true,
      message: `Successfully connected to Supabase PostgreSQL! Found ${count} registered patient records.`,
      patientCount: count,
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { success: false, message: 'Connection timed out after 6 seconds. Please verify the Supabase URL.' };
    }
    return {
      success: false,
      message: `Connection failed: ${err.message || 'Network unreachable'}. Check URL format (https://[project-id].supabase.co).`,
    };
  }
}

/**
 * Fetch patient list from Supabase
 */
export async function fetchSupabasePatients(): Promise<any[] | null> {
  const config = getDatabaseConfig();
  if (config.provider !== 'supabase' || !config.supabaseUrl || !config.supabaseAnonKey) {
    return null;
  }

  try {
    const cleanUrl = config.supabaseUrl.trim().replace(/\/+$/, '');
    const res = await fetch(`${cleanUrl}/rest/v1/patients?select=*&order=current_risk_score.desc`, {
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseAnonKey}`,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : null;
  } catch (err) {
    console.warn('Supabase fetch failed, falling back to mock cohort:', err);
    return null;
  }
}

/**
 * Post observation telemetry to Supabase
 */
export async function recordSupabaseObservation(
  patientId: string,
  telemetryJson: Record<string, any>,
  source: string,
  clinicianName?: string
): Promise<boolean> {
  const config = getDatabaseConfig();
  if (config.provider !== 'supabase' || !config.supabaseUrl || !config.supabaseAnonKey) {
    return false;
  }

  try {
    const cleanUrl = config.supabaseUrl.trim().replace(/\/+$/, '');
    const res = await fetch(`${cleanUrl}/rest/v1/observations`, {
      method: 'POST',
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        patient_id: patientId,
        observation_type: Object.keys(telemetryJson)[0] || 'clinical_telemetry',
        telemetry_json: telemetryJson,
        source: source,
        recorded_at: new Date().toISOString(),
        is_validated: true,
        validated_by: clinicianName || 'Authorized User',
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Send real 6-digit OTP email using Supabase Auth endpoint
 */
export async function sendSupabaseOtp(email: string): Promise<{
  success: boolean;
  message: string;
  realEmailSent: boolean;
}> {
  if (!email || !email.includes('@')) {
    return {
      success: true,
      message: 'Demo credentials detected. Use instant code 452188 to proceed.',
      realEmailSent: false,
    };
  }

  const config = getDatabaseConfig();
  const cleanUrl = config.supabaseUrl?.trim().replace(/\/+$/, '');
  const key = config.supabaseAnonKey?.trim();

  if (!cleanUrl || !key) {
    return {
      success: true,
      message: 'Database not connected. Use instant verification code 452188.',
      realEmailSent: false,
    };
  }

  try {
    const res = await fetch(`${cleanUrl}/auth/v1/otp`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim() }),
    });

    if (res.ok) {
      return {
        success: true,
        message: `Real verification code dispatched by Supabase to ${email}. Check your inbox or spam folder! (Demo code 452188 also accepted).`,
        realEmailSent: true,
      };
    }

    const errData = await res.json().catch(() => ({}));
    const errorMsg = errData.msg || errData.message || `HTTP ${res.status}`;

    return {
      success: true,
      message: `Supabase Auth Notice (${errorMsg}). You can use the instant code 452188 to continue without delay.`,
      realEmailSent: false,
    };
  } catch (err: any) {
    return {
      success: true,
      message: `Network offline or blocked (${err.message || 'Error'}). Instant code 452188 is ready.`,
      realEmailSent: false,
    };
  }
}

/**
 * Verify OTP with Supabase Auth or fallback demo code
 */
export async function verifySupabaseOtp(email: string, token: string): Promise<{
  success: boolean;
  message?: string;
}> {
  const cleanToken = token.trim();

  // Instant demo code bypass
  if (cleanToken === '452188') {
    return { success: true };
  }

  const config = getDatabaseConfig();
  const cleanUrl = config.supabaseUrl?.trim().replace(/\/+$/, '');
  const key = config.supabaseAnonKey?.trim();

  if (!cleanUrl || !key || !email) {
    return { success: cleanToken.length === 6 };
  }

  try {
    const res = await fetch(`${cleanUrl}/auth/v1/verify`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'email',
        email: email.trim(),
        token: cleanToken,
      }),
    });

    if (res.ok) {
      return { success: true };
    }

    const errData = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errData.msg || errData.message || 'Invalid or expired OTP code.',
    };
  } catch {
    return { success: cleanToken.length === 6 };
  }
}


