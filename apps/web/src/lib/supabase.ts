import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let serviceClient: SupabaseClient | null = null;

export function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

function getServerKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function getServiceSupabase() {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase service configuration is missing.");
  }

  if (!serviceClient) {
    serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      getServerKey()!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
  }

  return serviceClient;
}

export function getRequestSupabase(accessToken?: string) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase server configuration is missing.");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getServerKey()!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      global: accessToken
        ? { headers: { Authorization: `Bearer ${accessToken}` } }
        : undefined
    }
  );
}
