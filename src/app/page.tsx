import Image from "next/image";
import Link from "next/link";
import CheckoutButton from "@/components/CheckoutButton";
import { getModules } from "@/lib/lessons";

export default function LandingPage() {
  const modules = getModules();

  return (
    <div className="hero-section">
      <div className="nav">
        <Image src="/logo.png" alt="" width={34} height={34} className="logo-img" />
        <span className="logo">
          Nauči<span className="dot">AI</span>
        </span>
      </div>

      <div className="hero">
        <div className="badge-row">
          <span className="badge-outline">⚡ AI kurs za potpune početnike</span>
        </div>
        <h1>
          Nemaš iskustva sa AI?
          <span className="accent">Ovaj kurs je tvoj početak.</span>
        </h1>
        <p className="sub">
          19 lekcija u 7 modula, korak po korak, od apsolutne nule. Kreneš od osnova i gradiš
          znanje lekciju po lekciju, dok ne budeš samostalno koristio/la AI u svakodnevnom radu.
        </p>

        <div className="cta-block">
          <CheckoutButton>Počni kurs →</CheckoutButton>
          <div className="price-info">
            <b>19€</b>
            <br />
            jednokratno, doživotni pristup
          </div>
        </div>

        <div className="secondary-link">
          Već imaš pristup? <Link href="/prijava">Prijavi se</Link>
        </div>

        <div className="modules-strip">
          {modules.map((m) => (
            <span key={m.num}>{m.title}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
