import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Ovaj middleware čuva tri stanja pristupa kursu:
 *  1. Nije ulogovan          -> /kurs* i /nema-pristup preusmerava na /prijava
 *  2. Ulogovan, nije platio  -> /kurs* preusmerava na /nema-pristup
 *  3. Ulogovan i platio      -> pristup /kurs* dozvoljen (i /nema-pristup ga vraća na /kurs)
 *
 * "Platio" = postoji red u tabeli `purchases` sa istim email-om kao ulogovani korisnik.
 * Taj red upisuje Polar webhook (src/app/api/webhooks/polar/route.ts) čim porudžbina bude plaćena.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const needsLogin = path.startsWith("/kurs") || path === "/nema-pristup";

  if (!needsLogin) {
    return response;
  }

  if (!user || !user.email) {
    const url = request.nextUrl.clone();
    url.pathname = "/prijava";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("email", user.email)
    .maybeSingle();

  const hasAccess = !!purchase;

  if (path.startsWith("/kurs") && !hasAccess) {
    const url = request.nextUrl.clone();
    url.pathname = "/nema-pristup";
    return NextResponse.redirect(url);
  }

  if (path === "/nema-pristup" && hasAccess) {
    const url = request.nextUrl.clone();
    url.pathname = "/kurs";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/kurs/:path*", "/nema-pristup"],
};
