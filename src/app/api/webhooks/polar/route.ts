import { Webhooks } from "@polar-sh/nextjs";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Polar šalje POST na ovu rutu (npr. https://tvoj-domen.rs/api/webhooks/polar)
 * kad se nešto desi sa porudžbinom. Nas zanima "order.paid": tad upisujemo
 * kupca u tabelu `purchases`, po email adresi, i middleware.ts mu otključava kurs.
 *
 * Podesi u Polar dashboard-u: Settings -> Webhooks -> Add endpoint
 *   URL:    https://tvoj-domen.rs/api/webhooks/polar
 *   Secret: isti string koji staviš u POLAR_WEBHOOK_SECRET (.env)
 *   Events: order.paid (dovoljno za osnovni tok; ostali se ignorišu)
 *
 * Dva proizvoda, jedan webhook: da bismo znali da li je kupljen KURS ili
 * PAKET OD 500 PROMPTOVA, upoređujemo ID proizvoda iz porudžbine sa
 * POLAR_COURSE_PRODUCT_ID / POLAR_PROMPTS_PRODUCT_ID (.env). Te ID-jeve
 * nalaziš u Polar dashboard-u -> Products -> otvoriš proizvod -> ID u URL-u
 * ili u detaljima proizvoda. Ako ništa ne poklopi, podrazumevano upisujemo
 * "course" (bezbednija podrazumevana vrednost nego da kupac ostane bez ičega).
 *
 * Napomena: tačna imena polja u `payload.data` mogu se malo razlikovati
 * u zavisnosti od verzije @polar-sh/sdk paketa. Ako npm install povuče
 * noviju verziju, proveri u Polar dashboard-u (Webhooks -> test payload)
 * kako se tačno zove polje za email, proizvod i iznos, pa po potrebi
 * prilagodi dole (posebno `order.productId`).
 */
export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onOrderPaid: async (payload) => {
    const order = payload.data;
    const email = order.customer?.email;

    if (!email) {
      console.error("Polar webhook: order.paid bez email adrese kupca", order.id);
      return;
    }

    const productId =
      (order as { productId?: string; product?: { id?: string } }).productId ??
      (order as { product?: { id?: string } }).product?.id;

    let product: "course" | "prompts500" = "course";
    if (productId && productId === process.env.POLAR_PROMPTS_PRODUCT_ID) {
      product = "prompts500";
    } else if (productId && productId === process.env.POLAR_COURSE_PRODUCT_ID) {
      product = "course";
    } else {
      console.warn(
        "Polar webhook: ID proizvoda se ne poklapa ni sa jednim podešenim proizvodom, upisujem kao 'course'.",
        productId
      );
    }

    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin.from("purchases").upsert(
      {
        email,
        product,
        provider: "polar",
        external_id: order.id,
        amount_cents: order.totalAmount ?? null,
        currency: order.currency ?? null,
      },
      { onConflict: "email,product" }
    );

    if (error) {
      console.error("Polar webhook: greška pri upisu u purchases", error);
    }
  },
});
