import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase klijent za Server Components i Route Handlers.
 * Čita/piše kolačiće preko Next.js `cookies()` API-ja.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ovo se dešava kad se pozove iz Server Component-e (bez mogućnosti pisanja
            // kolačića). Nije problem jer middleware.ts osvežava sesiju na svaki zahtev.
          }
        },
      },
    }
  );
}
