import lessonsData from "@/data/lessons.json";
import modulesData from "@/data/modules.json";

export type LessonSection = {
  heading: string;
  paragraphs: string[];
};

export type Lesson = {
  num: number;
  slug: string;
  title: string;
  shortDesc: string;
  intro: string[];
  diagram: string;
  diagramAlt: string;
  sections: LessonSection[];
  exercise: string[];
  youtubeId?: string | null;
};

export type CourseModule = {
  num: number;
  title: string;
  lessons: number[];
  lessonSlugs: string[];
};

export const lessons = lessonsData as Lesson[];
export const modules = modulesData as CourseModule[];

export function getAllLessons(): Lesson[] {
  return lessons;
}

export function getLessonBySlug(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}

export function getModules(): CourseModule[] {
  return modules;
}

export function getModuleForLesson(num: number): CourseModule | undefined {
  return modules.find((m) => m.lessons.includes(num));
}

export function getLessonNavigation(num: number) {
  const prev = lessons.find((l) => l.num === num - 1) ?? null;
  const next = lessons.find((l) => l.num === num + 1) ?? null;
  return { prev, next };
}

export function sectionId(lessonSlug: string, index: number) {
  return `${lessonSlug}-sec-${index + 1}`;
}
