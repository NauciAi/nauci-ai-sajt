# Nauči AI — sajt kursa

Next.js sajt za kurs "Nauči AI": početna strana, prijava bez lozinke (magic link),
plaćanje preko Polar-a, i 19 lekcija u 7 modula sa čeklistom napretka.

Ovaj fajl je pisan pod pretpostavkom da još ništa nisi podesio (nemaš Supabase
projekat ni GitHub repo). Prati korake redom, odozgo na dole.

**Važna napomena**: kod je napisan ručno, pažljivo, po proverenim Next.js/Supabase/Polar
obrascima, ali ga nisam mogao pokrenuti (`npm install` / `npm run dev`) u sesiji u kojoj je
napravljen jer taj sandbox nema pristup npm registru. To znači da postoji mala šansa da će
neka verzija paketa u `package.json` u međuvremenu zastareti, pa `npm install` javi grešku
za tačno tu verziju. Ako se to desi, pogledaj sekciju **"Ako npm install javi grešku"** na
dnu ovog fajla — rešenje je skoro uvek jedna komanda.

## 1. Preduslovi

- Instaliran [Node.js](https://nodejs.org) verzija 20 ili novija (proveri sa `node -v`).
- Nalog na [supabase.com](https://supabase.com) (besplatan).
- Nalog na [polar.sh](https://polar.sh) (besplatan za početak).
- Nalog na [GitHub](https://github.com) i [Vercel](https://vercel.com) (za objavljivanje sajta).

## 2. Instalacija

U terminalu, unutar ovog foldera:

```bash
npm install
```

Ovo povlači sve pakete iz `package.json` (Next.js, React, Supabase, Polar...).

## 3. Podešavanje Supabase-a

1. Idi na [supabase.com](https://supabase.com) → **New project**. Zapamti lozinku baze
   (ne treba ti kasnije, ali je čuvaj negde sigurno).
2. Kad se projekat digne, idi na **SQL Editor** → **New query**, otvori fajl
   `supabase/schema.sql` iz ovog projekta, ceo ga kopiraj, nalepi u editor i klikni **Run**.
   Ovo pravi dve tabele: `purchases` (ko je platio) i `lesson_progress` (ko je odradio koju
   lekciju), sa pravilima da svaki korisnik vidi samo svoje podatke.
3. Idi na **Authentication → Providers**, proveri da je **Email** uključen (jeste po
   defaultu).
4. Idi na **Authentication → URL Configuration** i podesi:
   - **Site URL**: `http://localhost:3000` (za sada, dok testiraš lokalno)
   - **Redirect URLs**: dodaj `http://localhost:3000/auth/callback`
   - Kad sajt bude na pravom domenu, ovde dodaješ i `https://tvoj-domen.rs` i
     `https://tvoj-domen.rs/auth/callback`.
5. Idi na **Settings → API**. Tu su tri vrednosti koje ti trebaju za `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** ključ → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** ključ (klikni "Reveal") → `SUPABASE_SERVICE_ROLE_KEY`
     (ovaj ključ NIKAD ne sme da ide u frontend kod ni u GitHub — koristi se samo u
     webhook ruti, na serveru)

## 4. Podešavanje Polar-a (naplata)

1. Napravi nalog na [polar.sh](https://polar.sh) i poveži svoj bankovni nalog (za isplate).
2. **Products** → napravi proizvod "Nauči AI kurs", cena 19€, jednokratno plaćanje
   (ne pretplata).
3. Na strani proizvoda nađi **Checkout Link** (izgleda kao
   `https://buy.polar.sh/polar_cl_xxxxxxxx`) → to ide u `NEXT_PUBLIC_POLAR_CHECKOUT_URL`.
4. **Settings → Webhooks** → **Add endpoint**:
   - URL: `https://tvoj-domen.rs/api/webhooks/polar` (lokalno ovo ne možeš testirati bez
     alata kao što je `ngrok`, testiraj webhook tek kad sajt bude na Vercel-u)
   - Events: čekiraj **order.paid**
   - Klikni Create, i Polar će ti dati **Secret** → to ide u `POLAR_WEBHOOK_SECRET`.

## 5. .env.local

Kopiraj `.env.example` u novi fajl `.env.local` i popuni sve vrednosti koje si sakupio/la
u koracima 3 i 4:

```bash
cp .env.example .env.local
```

## 6. Pokretanje lokalno

```bash
npm run dev
```

Otvori [http://localhost:3000](http://localhost:3000). Trebalo bi da vidiš početnu stranu.
Klikni "Prijavi se", unesi svoj mejl, i proveri inbox za link (magic link ne radi za
kupovinu dok ne uradiš korak 7 ispod — do tad ćeš posle prijave sletati na "Nemaš aktivan
pristup", što je i očekivano ako još ništa nisi kupio/la).

## 7. Testiranje celog toka

Da bi testirao/la ceo tok (kupovina → otključan kurs), najlakše je da ručno dodaš
sebe u `purchases` tabelu dok webhook još nije povezan na pravi domen:

Supabase → **Table Editor** → `purchases` → **Insert row** → upiši svoj email (isti
onaj kojim se prijavljuješ) → Save. Osveži `/kurs` u pregledaču i treba da uđeš.

## 8. Objavljivanje (deploy)

1. Napravi novi repo na GitHub-u i pošalji kod:
   ```bash
   git init
   git add .
   git commit -m "Prva verzija sajta"
   git branch -M main
   git remote add origin https://github.com/tvoj-nalog/nauci-ai-sajt.git
   git push -u origin main
   ```
2. Idi na [vercel.com](https://vercel.com) → **Add New Project** → izaberi ovaj repo.
3. U **Environment Variables** dodaj SVE vrednosti iz `.env.local` (Vercel ih ne čita
   automatski iz fajla, moraš ih ručno uneti ili nalepiti ceo `.env.local` u polje koje
   Vercel ponudi za to).
4. Deploy. Kad sajt bude živ, vrati se u Supabase (Authentication → URL Configuration) i
   Polar (Settings → Webhooks) i zameni `http://localhost:3000` pravim Vercel/domen
   adresama, uključujući `/auth/callback` i `/api/webhooks/polar`.
5. Ako imaš svoj domen (npr. unlimited.rs), poveži ga u Vercel → **Settings → Domains**.

## Struktura projekta

```
src/app/page.tsx                 → početna strana
src/app/prijava/page.tsx         → prijava (magic link)
src/app/auth/callback/route.ts   → prihvata magic link i uloguje korisnika
src/app/nema-pristup/page.tsx    → "platio nisi" ekran
src/app/kurs/page.tsx            → dashboard sa svih 19 lekcija po modulima
src/app/kurs/[slug]/page.tsx     → pojedinačna lekcija
src/app/api/webhooks/polar/      → prima potvrdu o plaćanju od Polar-a
src/middleware.ts                → čuva ko sme na /kurs i /nema-pristup
src/data/lessons.json            → sadržaj svih 19 lekcija (generisano iz kursa)
src/data/modules.json            → 7 modula i koje lekcije sadrže
public/diagrams/                 → ilustracije za svaku lekciju
supabase/schema.sql              → SQL za Supabase tabele
```

## Šta još treba dodati kasnije

- **Video lekcije**: trenutno je placeholder ("Video snimak lekcije stiže uskoro").
  Kad snimiš i postaviš na YouTube (unlisted), otvori `src/data/lessons.json`, nađi
  lekciju i dodaj joj polje `"youtubeId": "xxxxxxxxxxx"` (to je deo YouTube linka posle
  `v=`). Stranica lekcije to automatski prikazuje kao ugrađeni video.
- **Menjanje teksta lekcija**: sve je u `src/data/lessons.json`, čist tekst, lako za
  izmenu bez diranja koda.

## Ako npm install javi grešku

Ako `npm install` javi da tačno određena verzija nekog paketa ne postoji (najverovatnije
`@polar-sh/nextjs` ili `@polar-sh/sdk`, pošto se ti paketi menjaju najbrže), otvori
`package.json` i tu liniju zameni sa `"latest"`, npr:

```json
"@polar-sh/nextjs": "latest",
```

pa ponovo pokreni `npm install`. Isto važi za bilo koji drugi paket iz liste.
