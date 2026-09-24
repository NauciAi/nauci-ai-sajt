import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase klijent za Client Components (radi u pregledaču).
 * Koristi se npr. za prijavu (magic link) i za čuvanje napretka kroz lekciju.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
