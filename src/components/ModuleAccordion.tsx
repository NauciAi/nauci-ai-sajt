import Link from "next/link";
import type { CourseModule, Lesson } from "@/lib/lessons";

type Props = {
  courseModule: CourseModule;
  lessons: Lesson[];
  completedSlugs: Set<string>;
  currentSlug?: string;
  defaultOpen?: boolean;
};

/**
 * Čist server component — <details>/<summary> je nativan HTML, strelica se
 * rotira preko CSS-a ([open] selektor u globals.css), nije potreban JS.
 */
export default function ModuleAccordion({
  courseModule,
  lessons,
  completedSlugs,
  currentSlug,
  defaultOpen,
}: Props) {
  const doneCount = courseModule.lessonSlugs.filter((s) => completedSlugs.has(s)).length;

  return (
    <details className="module-block" open={defaultOpen}>
      <summary>
        <span className="m-name">
          Modul {courseModule.num} — {courseModule.title}
        </span>
        <span className="m-meta">
          {doneCount}/{courseModule.lessons.length} <span className="chev">›</span>
        </span>
      </summary>
      <div className="m-body">
        {lessons.map((lesson) => {
          const done = completedSlugs.has(lesson.slug);
          const isCurrent = lesson.slug === currentSlug;
          return (
            <Link
              key={lesson.slug}
              href={`/kurs/${lesson.slug}`}
              className={`lesson-item${isCurrent ? " is-current" : ""}`}
            >
              <span className={`lesson-num${done ? " done" : ""}`}>
                {done ? "✓" : lesson.num}
              </span>
              <span>
                <span className="title">
                  {lesson.num}. {lesson.title}
                </span>
                <span className="desc">{lesson.shortDesc}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </details>
  );
}
