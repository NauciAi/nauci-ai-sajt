import Link from "next/link";
import Navbar from "@/components/Navbar";
import CopyPromptButton from "@/components/CopyPromptButton";
import CheckoutButton from "@/components/CheckoutButton";
import { createClient } from "@/lib/supabase/server";
import { getFreePromptCount, getTotalPromptCount, getPromptCategoriesForUser } from "@/lib/prompts";

export default async function PromptoviPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? "";

  const { data: promptsPurchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("email", email)
    .eq("product", "prompts500")
    .maybeSingle();

  const unlocked = !!promptsPurchase;

  const categories = getPromptCategoriesForUser(unlocked);
  const freeCount = getFreePromptCount();
  const totalCount = getTotalPromptCount();
  const promptsCheckoutUrl = process.env.NEXT_PUBLIC_POLAR_PROMPTS_CHECKOUT_URL;

  return (
    <>
      <Navbar email={email} />
      <div className="prompts-wrap">
        <Link className="back-link" href="/kurs">
          ← Sve lekcije
        </Link>
        <span className="lesson-eyebrow">Biblioteka promptova</span>
        <h1>{unlocked ? `Svih ${totalCount} Claude promptova` : `${freeCount} besplatnih Claude promptova`}</h1>
        <p className="sub">
          Gotovi promptovi za tvoj biznis, podeljeni po oblastima. Klikni na dugme da kopiraš
          prompt, zalepi ga u Claude i zameni delove u [zagradama] svojim podacima.
        </p>

        {unlocked ? (
          <div className="upsell-banner unlocked-banner">
            <div className="upsell-text">
              <strong>✅ Otključano</strong>
              <span>Imaš pristup svih {totalCount} promptova iz {categories.length} oblasti.</span>
            </div>
          </div>
        ) : (
          <div className="upsell-banner">
            <div className="upsell-text">
              <strong>Želiš ih sve?</strong>
              <span>
                Ovih {freeCount} je samo početak. Kompletna biblioteka ima {totalCount} promptova
                za skoro svaku situaciju u biznisu.
              </span>
            </div>
            {promptsCheckoutUrl ? (
              <CheckoutButton checkoutUrl={promptsCheckoutUrl} prefillEmail={email}>
                Otključaj svih {totalCount} za 9€
              </CheckoutButton>
            ) : (
              <button className="pill-btn" disabled title="Uskoro dostupno">
                Otključaj svih {totalCount} za 9€ (uskoro)
              </button>
            )}
          </div>
        )}

        <div className="prompt-categories">
          {categories.map((cat) => (
            <section className="prompt-category" key={cat.category}>
              <div className="prompt-category-head">
                <h2>{cat.category}</h2>
                <span className="prompt-count">
                  {cat.items.length} / {cat.total}
                </span>
              </div>

              <div className="prompt-table">
                {cat.items.map((item) => (
                  <div className="prompt-row" key={item.title}>
                    <div className="prompt-row-text">
                      <span className="prompt-title">{item.title}</span>
                      <p className="prompt-body">{item.prompt}</p>
                    </div>
                    <CopyPromptButton text={item.prompt} />
                  </div>
                ))}
              </div>

              {cat.locked > 0 && (
                <div className="prompt-locked-hint">
                  🔒 Još {cat.locked} promptova u ovoj kategoriji dostupno je u punoj biblioteci
                  od {totalCount}.
                </div>
              )}
            </section>
          ))}
        </div>

        {!unlocked && (
          <div className="upsell-banner upsell-banner-bottom">
            <div className="upsell-text">
              <strong>Stigao/la si do kraja besplatne liste</strong>
              <span>
                Otključaj svih {totalCount} promptova iz {categories.length} oblasti, jednom
                uplatom od 9€.
              </span>
            </div>
            {promptsCheckoutUrl ? (
              <CheckoutButton checkoutUrl={promptsCheckoutUrl} prefillEmail={email}>
                Otključaj svih {totalCount}
              </CheckoutButton>
            ) : (
              <button className="pill-btn" disabled title="Uskoro dostupno">
                Otključaj svih {totalCount} (uskoro)
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
