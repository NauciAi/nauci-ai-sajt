import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Na ovu adresu Supabase šalje korisnika nazad nakon klika na magic link iz mejla
 * (podešeno preko `emailRedirectTo` u prijava/page.tsx).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") ?? "/kurs";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Greška pri razmeni magic link koda za sesiju:", error.message);
      const url = new URL("/prijava", origin);
      url.searchParams.set("greska", "link");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.redirect(`${origin}${redirect}`);
}
