"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function PrijavaForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/kurs";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback?redirect=${encodeURIComponent(
          redirect
        )}`,
      },
    });

    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="login-wrap">
      <h1>Pristupi kursu</h1>
      <p className="lead">Unesi email — pošaljemo ti link za prijavu, bez lozinke.</p>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email adresa</label>
          <input
            id="email"
            type="email"
            required
            placeholder="tvoj@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "sending" || status === "sent"}
          />
          <div className="hint">Koristi istu email adresu sa kojom si kupio/la kurs.</div>
        </div>

        <button className="btn-full" type="submit" disabled={status === "sending" || status === "sent"}>
          {status === "sending" ? "Šaljem link…" : "Pošalji link za prijavu"}
        </button>
      </form>

      {status === "sent" && (
        <div className="form-note ok">
          Poslali smo link na <b>{email}</b>. Otvori mejl i klikni na link da se uloguješ.
        </div>
      )}
      {status === "error" && (
        <div className="form-note err">
          Nešto nije uspelo. Proveri email adresu i probaj ponovo.
        </div>
      )}
    </div>
  );
}

export default function PrijavaPage() {
  return (
    <Suspense fallback={null}>
      <PrijavaForm />
    </Suspense>
  );
}
