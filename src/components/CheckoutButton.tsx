"use client";

import Script from "next/script";

type CheckoutButtonProps = {
  children: React.ReactNode;
  className?: string;
  /** Ako znamo email korisnika (npr. na /nema-pristup), prosledimo ga da Polar unapred popuni polje. */
  prefillEmail?: string | null;
};

/**
 * Dugme koje otvara Polar-ov embedded checkout (ostaje na istoj stranici, bez redirekcije).
 * Link ka proizvodu se podešava preko NEXT_PUBLIC_POLAR_CHECKOUT_URL u .env fajlu —
 * dobijaš ga u Polar dashboard-u kad napraviš proizvod (Products -> tvoj kurs -> Checkout Link).
 */
export default function CheckoutButton({ children, className, prefillEmail }: CheckoutButtonProps) {
  const base = process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL;

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
