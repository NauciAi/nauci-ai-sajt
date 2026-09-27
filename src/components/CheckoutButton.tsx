"use client";

import Script from "next/script";

type CheckoutButtonProps = {
  children: React.ReactNode;
  className?: string;
  /** Ako znamo email korisnika (npr. na /nema-pristup), prosledimo ga da Polar unapred popuni polje. */
  prefillEmail?: string | null;
  /**
   * Opcioni override checkout linka, za drugi proizvod (npr. paket od 500 promptova).
   * Ako se ne prosledi, koristi se podrazumevani kurs iz NEXT_PUBLIC_POLAR_CHECKOUT_URL.
   */
  checkoutUrl?: string;
};

/**
 * Dugme koje otvara Polar-ov embedded checkout (ostaje na istoj stranici, bez redirekcije).
 * Link ka proizvodu se podešava preko NEXT_PUBLIC_POLAR_CHECKOUT_URL u .env fajlu —
 * dobijaš ga u Polar dashboard-u kad napraviš proizvod (Products -> tvoj kurs -> Checkout Link).
 * Za drugi proizvod prosledi `checkoutUrl` prop (npr. iz NEXT_PUBLIC_POLAR_PROMPTS_CHECKOUT_URL).
 */
export default function CheckoutButton({
  children,
  className,
  prefillEmail,
  checkoutUrl,
}: CheckoutButtonProps) {
  const base = checkoutUrl || process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL;

  if (!base) {
    return (
      <button
        className={className ?? "pill-btn"}
        disabled
        title="Podesi NEXT_PUBLIC_POLAR_CHECKOUT_URL u .env fajlu"
      >
        {children}
      </button>
    );
  }

  const href = prefillEmail
    ? `${base}${base.includes("?") ? "&" : "?"}customer_email=${encodeURIComponent(prefillEmail)}`
    : base;

  return (
    <>
      <a href={href} data-polar-checkout data-polar-checkout-theme="dark" className={className ?? "pill-btn"}>
        {children}
      </a>
      <Script
        id="polar-embed-script"
        src="https://cdn.polar.sh/checkout/embed.js"
        strategy="afterInteractive"
      />
    </>
  );
}
