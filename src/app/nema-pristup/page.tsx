import Navbar from "@/components/Navbar";
import CheckoutButton from "@/components/CheckoutButton";
import { createClient } from "@/lib/supabase/server";

export default async function NemaPristupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? "";

  return (
    <>
      <Navbar email={email} />
      <div className="locked-wrap">
        <div className="locked-icon">🔒</div>
        <h1>Nemaš aktivan pristup</h1>
        <p>
          Tvoj nalog postoji, ali još nismo pronašli uplatu vezanu za ovu email adresu. Kupi
          kurs da odmah otključaš svih 19 lekcija.
        </p>
        <CheckoutButton prefillEmail={email}>Kupi kurs — 19€ →</CheckoutButton>
        <div className="locked-refresh">
          Već si platio/la pre par minuta? <a href="/nema-pristup">Osveži stranicu</a>
        </div>
      </div>
    </>
  );
}
