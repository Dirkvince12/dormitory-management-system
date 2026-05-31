"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export function AuthActions() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured() || loading || !user) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[140px]">
        {user.email}
      </span>
      <form action={signOutAction}>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          data-testid="button-sign-out"
        >
          <LogOut className="h-4 w-4 mr-1.5" />
          Sign out
        </Button>
      </form>
    </div>
  );
}
