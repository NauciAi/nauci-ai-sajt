"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type TrackItem = { id: string; label: string };

type Props = {
  lessonSlug: string;
  items: TrackItem[];
  initiallyDone: boolean;
};

const CHECK_ICON = (
  <svg viewBox="0 0 24 24">
    <polyline points="4 12 9 18 20 6" fill="none" />
  </svg>
);

export default function LessonTracker({ lessonSlug, items, initiallyDone }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(initiallyDone);
  const [saving, setSaving] = useState(false);
  const observedRef = useRef<Set<string>>(new Set());
  const router = useRouter();

  const pct = items.length ? Math.round((checked.size / items.length) * 100) : 0;
  const allRead = checked.size === items.length;

  function markChecked(id: string) {
    setChecked((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            markChecked(entry.target.id);
          }
        });
      },
      { threshold: 0.4 }
    );
    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gateHint = useMemo(() => {
    if (done) return "Odrađeno — sledeća lekcija je otključana.";
    if (allRead) return "Spremno — možeš da označiš lekciju kao odrađenu.";
    return `Ostalo: pročitaj još ${items.length - checked.size} sekcij(a) lekcije.`;
  }, [allRead, checked.size, done, items.length]);

  async function handleMarkDone() {
    if (done || !allRead || saving) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("lesson_progress")
      .upsert(
        { lesson_slug: lessonSlug, completed_at: new Date().toISOString() },
        { onConflict: "user_id,lesson_slug" }
      );
    setSaving(false);
    if (!error) {
      setDone(true);
      router.refresh();
    } else {
      console.error("Ne mogu da sačuvam napredak:", error);
    }
  }

  return (
    <>
      <div className="tracker">
        <div className="tracker-head">
          <span>Napredak kroz lekciju</span>
          <span className="pct">{done ? 100 : pct}%</span>
        </div>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`track-item${checked.has(item.id) || done ? " checked" : ""}`}
            onClick={() => markChecked(item.id)}
          >
            <span className="box">{CHECK_ICON}</span>
            {item.label}
          </button>
        ))}
      </div>

      <button
        className={`mark-done${done ? " done" : allRead ? " ready" : ""}`}
        disabled={done || !allRead || saving}
        onClick={handleMarkDone}
      >
        {done ? "✓ Odrađeno" : saving ? "Čuvam…" : "Označi kao odrađeno"}
      </button>
      <div className="gate-hint">{gateHint}</div>
    </>
  );
}
