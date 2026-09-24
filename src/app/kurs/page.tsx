import Navbar from "@/components/Navbar";
import ModuleAccordion from "@/components/ModuleAccordion";
import { createClient } from "@/lib/supabase/server";
import { getAllLessons, getModules } from "@/lib/lessons";

export default async function KursPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: progressRows } = await supabase
    .from("lesson_progress")
    .select("lesson_slug");

  const completedSlugs = new Set((progressRows ?? []).map((r) => r.lesson_slug as string));

  const lessons = getAllLessons();
  const modules = getModules();
  const totalLessons = lessons.length;
  const donePct = totalLessons ? Math.round((completedSlugs.size / totalLessons) * 100) : 0;

  // Prvi modul koji ima bar jednu neodrađenu lekciju ostaje otvoren po defaultu.
  const firstOpenModuleNum =
    modules.find((m) => m.lessonSlugs.some((s) => !completedSlugs.has(s)))?.num ?? modules[0]?.num;

  return (
    <>
      <Navbar email={user?.email ?? ""} />
      <div className="course-wrap">
        <h1>Lekcije</h1>
        <p className="sub">Prođi kroz module redom, svojim tempom.</p>

        <div className="progress-label">
          <span>Tvoj napredak</span>
          <span>
            {completedSlugs.size} / {totalLessons}
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${donePct}%` }} />
        </div>

        {modules.map((courseModule) => (
          <ModuleAccordion
            key={courseModule.num}
            courseModule={courseModule}
            lessons={lessons.filter((l) => courseModule.lessons.includes(l.num))}
            completedSlugs={completedSlugs}
            defaultOpen={courseModule.num === firstOpenModuleNum}
          />
        ))}
      </div>
    </>
  );
}
