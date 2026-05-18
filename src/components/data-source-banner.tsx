"use client";

import { AlertTriangle } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function DataSourceBanner() {
  const { dataSourceMode, isLoading } = useAppStore();

  if (isLoading || dataSourceMode === "database") return null;

  const message =
    dataSourceMode === "demo"
      ? "Demo mode — changes are stored in the browser only and are not saved to Supabase. Add your Supabase environment variables in Vercel (and .env.local for local dev), then redeploy."
      : "Supabase URL and anon key are set, but SUPABASE_SERVICE_ROLE_KEY is missing or invalid. Writes will not reach your database until you add the service role key from Supabase → Project Settings → API.";

  return (
    <div
      role="status"
      className="mb-6 flex gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <p>{message}</p>
    </div>
  );
}
