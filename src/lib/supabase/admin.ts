import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Admin klijent sa service_role ključem — zaobilazi RLS.
 * KORISTITI SAMO na serveru (webhook rute i slično), NIKAD u kodu koji ide u pregledač.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
