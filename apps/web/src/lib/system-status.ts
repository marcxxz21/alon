import { getServiceSupabase, hasSupabaseConfig } from "@/lib/supabase";

export type SystemStatus = {
  supabase: {
    configured: boolean;
    reachable: boolean;
    message: string;
  };
  airflow: {
    configured: boolean;
    reachable: boolean;
    url: string | null;
    message: string;
  };
};

export async function getSystemStatus(): Promise<SystemStatus> {
  const supabaseConfigured = hasSupabaseConfig();
  let supabaseReachable = false;
  let supabaseMessage = "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.";

  if (supabaseConfigured) {
    const { error } = await getServiceSupabase()
      .from("tickers")
      .select("symbol")
      .limit(1);

    supabaseReachable = !error;
    supabaseMessage = error ? error.message : "Connected to Supabase PostgreSQL.";
  }

  const airflowUrl = process.env.AIRFLOW_API_URL ?? process.env.AIRFLOW_HEALTH_URL ?? null;
  let airflowReachable = false;
  let airflowMessage = "Missing AIRFLOW_API_URL or AIRFLOW_HEALTH_URL. Airflow is deployed separately from Vercel.";

  if (airflowUrl) {
    try {
      const response = await fetch(airflowUrl, { cache: "no-store" });
      airflowReachable = response.ok;
      airflowMessage = response.ok ? "Airflow health endpoint responded." : `Airflow responded with HTTP ${response.status}.`;
    } catch (error) {
      airflowMessage = error instanceof Error ? error.message : "Airflow health check failed.";
    }
  }

  return {
    supabase: {
      configured: supabaseConfigured,
      reachable: supabaseReachable,
      message: supabaseMessage
    },
    airflow: {
      configured: Boolean(airflowUrl),
      reachable: airflowReachable,
      url: airflowUrl,
      message: airflowMessage
    }
  };
}
