const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const PLACEHOLDER_SERVICE_KEYS = new Set([
  "your-service-role-key",
  "your_service_role_key",
  "paste-service-role-key-here",
]);

function isValidServiceRoleKey(key: string | undefined): boolean {
  if (!key?.trim()) return false;
  if (PLACEHOLDER_SERVICE_KEYS.has(key.trim().toLowerCase())) return false;
  return key.length > 20;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function isSupabaseServerReady(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && isValidServiceRoleKey(supabaseServiceRoleKey));
}

export type DataSourceMode = "demo" | "database" | "misconfigured";

/** Resolved on the server — public env vars alone are not enough to persist data. */
export function resolveDataSourceMode(): DataSourceMode {
  if (!isSupabaseConfigured()) return "demo";
  if (!isSupabaseServerReady()) return "misconfigured";
  return "database";
}

export function getSupabasePublicEnv() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase env vars. Copy .env.local.example to .env.local and set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  };
}

export function getSupabaseServiceRoleKey() {
  if (!supabaseServiceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local (server-only, never use in client code).",
    );
  }

  return supabaseServiceRoleKey;
}
