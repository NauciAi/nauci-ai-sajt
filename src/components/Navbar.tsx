"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Navbar({ email }: { email: string }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="navbar">
      <Link href="/kurs" className="brand">
        <Image src="/logo.png" alt="Nauči AI" width={28} height={28} />
        <span>Nauči AI</span>
      </Link>
      <div className="right">
        <span>{email}</span>
        <button className="signout" onClick={handleSignOut}>
          Odjavi se
        </button>
      </div>
    </div>
  );
}
