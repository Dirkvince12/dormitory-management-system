import type { PostgrestError } from "@supabase/supabase-js";

const SCHEMA_MISMATCH_HINT =
  "Run supabase/apply-pending-schema.sql in Supabase → SQL Editor, or add DATABASE_URL to .env and run: npm run db:migrate";

function isPostgrestPayload(
  value: unknown,
): value is { code?: string; message?: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof (value as { message: unknown }).message === "string"
  );
}

function formatPostgrestPayload(payload: { code?: string; message: string }): string {
  if (payload.code === "PGRST204") {
    return `Database schema is out of date (${payload.message}). ${SCHEMA_MISMATCH_HINT}`;
  }
  return payload.message;
}

export function formatSupabaseError(error: unknown): string {
  if (isPostgrestPayload(error) && error.message) {
    return formatPostgrestPayload({ code: error.code, message: error.message });
  }

  if (error instanceof Error) {
    try {
      const parsed: unknown = JSON.parse(error.message);
      if (isPostgrestPayload(parsed) && parsed.message) {
        return formatPostgrestPayload({ code: parsed.code, message: parsed.message });
      }
    } catch {
      // Not a JSON-wrapped PostgREST error.
    }
    return error.message;
  }

  return "Something went wrong";
}

export function throwSupabaseError(error: PostgrestError): never {
  throw new Error(formatPostgrestPayload(error));
}
