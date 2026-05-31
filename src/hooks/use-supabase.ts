"use client";

import { useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Browser Supabase client for Client Components.
 * Returns null until env vars are set in .env.
 */
export function useSupabase() {
  const supabase = useMemo(() => {
    if (!isSupabaseConfigured()) return null;
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  return supabase;
}
