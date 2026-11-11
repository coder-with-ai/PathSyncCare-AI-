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
          success: false,
          message: 'Connected to Supabase project, but "patients" table was not found. Please run the supabase_schema.sql script in the Supabase SQL Editor.',
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

