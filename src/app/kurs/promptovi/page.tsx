import Link from "next/link";
import Navbar from "@/components/Navbar";
import CopyPromptButton from "@/components/CopyPromptButton";
import { createClient } from "@/lib/supabase/server";
import { getPromptCategories, getFreePromptCount, getTotalPromptCount } from "@/lib/prompts";

export default async function PromptoviPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const categories = getPromptCategories();
  const freeCount = getFreePromptCount();
  const totalCount = getTotalPromptCount();

  return (
    <>
      <Navbar email={user?.email ?? ""} />
      <div className="prompts-wrap">
        <Link className="back-link" href="/kurs">
          ← Sve lekcije
        </Link>
        <span className="lesson-eyebrow">Biblioteka promptova</span>
        <h1>{freeCount} besplatnih Claude promptova</h1>
        <p className="sub">
          Gotovi promptovi za tvoj biznis, podeljeni po oblastima. Klikni na dugme da kopiraš
          prompt, zalepi ga u Claude i zameni delove u [zagradama] svojim podacima.
        </p>

        <div className="upsell-banner">
          <div className="upsell-text">
            <strong>Želiš ih sve?</strong>
            <span>
              Ovih {freeCount} je samo početak. Kompletna biblioteka ima {totalCount} promptova
              za skoro svaku situaciju u biznisu.
            </span>
          </div>
          <button className="pill-btn" disabled title="Uskoro dostupno">
            Otključaj svih {totalCount} za 9€ (uskoro)
          </button>
        </div>

        <div className="prompt-categories">
          {categories.map((cat) => {
            const locked = cat.total - cat.items.length;
            return (
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

                {locked > 0 && (
                  <div className="prompt-locked-hint">
                    🔒 Još {locked} promptova u ovoj kategoriji dostupno je u punoj biblioteci od{" "}
                    {totalCount}.
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <div className="upsell-banner upsell-banner-bottom">
          <div className="upsell-text">
            <strong>Stigao/la si do kraja besplatne liste</strong>
            <span>
              Otključaj svih {totalCount} promptova iz {categories.length} oblasti, jednom
              uplatom od 9€.
            </span>
          </div>
          <button className="pill-btn" disabled title="Uskoro dostupno">
            Otključaj svih {totalCount} (uskoro)
          </button>
        </div>
      </div>
    </>
  );
}
