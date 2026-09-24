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
 * Napomena: tačna imena polja u `payload.data` mogu se malo razlikovati
 * u zavisnosti od verzije @polar-sh/sdk paketa. Ako npm install povuče
 * noviju verziju, proveri u Polar dashboard-u (Webhooks -> test payload)
 * kako se tačno zove polje za email i iznos, pa po potrebi prilagodi dole.
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

    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin.from("purchases").upsert(
      {
        email,
        provider: "polar",
        external_id: order.id,
        amount_cents: order.totalAmount ?? null,
        currency: order.currency ?? null,
      },
      { onConflict: "email" }
    );

    if (error) {
      console.error("Polar webhook: greška pri upisu u purchases", error);
    }
  },
});
