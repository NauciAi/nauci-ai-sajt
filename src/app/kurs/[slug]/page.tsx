import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import LessonTracker from "@/components/LessonTracker";
import { createClient } from "@/lib/supabase/server";
import {
  getLessonBySlug,
  getModuleForLesson,
  getLessonNavigation,
  sectionId,
} from "@/lib/lessons";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function LekcijaPage({ params }: Props) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) notFound();

  const courseModule = getModuleForLesson(lesson.num);
  const { prev, next } = getLessonNavigation(lesson.num);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: progressRow } = await supabase
    .from("lesson_progress")
    .select("lesson_slug")
    .eq("lesson_slug", lesson.slug)
    .maybeSingle();

  const initiallyDone = !!progressRow;

  const trackerItems = lesson.sections.map((s, i) => ({
    id: sectionId(lesson.slug, i),
    label: s.heading,
  }));

  return (
    <>
      <Navbar email={user?.email ?? ""} />
      <div className="lesson-wrap">
        <Link className="back-link" href="/kurs">
          ← Sve lekcije
        </Link>
        <span className="lesson-eyebrow">
          {courseModule ? `Modul ${courseModule.num} · ${courseModule.title} · ` : ""}
          Lekcija {lesson.num} od 19
        </span>
        <h1>{lesson.title}</h1>
        <p className="sub">{lesson.shortDesc}</p>

        <div className="video-placeholder">
          {lesson.youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${lesson.youtubeId}`}
              title={lesson.title}
              allowFullScreen
            />
          ) : (
            <span>Video snimak lekcije stiže uskoro</span>
          )}
        </div>

        <div className="lesson-body">
          {lesson.intro.map((p, i) => (
            <p key={`intro-${i}`}>{p}</p>
          ))}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lesson.diagram} alt={lesson.diagramAlt || lesson.title} />

          {lesson.sections.map((section, i) => (
            <div key={section.heading}>
              <h3 id={sectionId(lesson.slug, i)}>{section.heading}</h3>
              {section.paragraphs.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
          ))}
        </div>

        <LessonTracker lessonSlug={lesson.slug} items={trackerItems} initiallyDone={initiallyDone} />

        {lesson.exercise.length > 0 && (
          <div className="lesson-body">
            <h3>Vežba</h3>
            {lesson.exercise.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}

        <div className="lesson-nav">
          <span>{prev ? `← ${prev.num}. ${prev.title}` : ""}</span>
          {next ? (
            <Link href={`/kurs/${next.slug}`}>
              {next.num}. {next.title} →
            </Link>
          ) : (
            <span>Ovo je poslednja lekcija 🎉</span>
          )}
        </div>
      </div>
    </>
  );
}
