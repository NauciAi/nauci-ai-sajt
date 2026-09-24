import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nauči AI — kurs za apsolutne početnike",
  description:
    "19 lekcija u 7 modula: nauči da koristiš Claude i AI u svakodnevnom radu, korak po korak, bez tehničkog predznanja.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr">
      <body>{children}</body>
    </html>
  );
}
