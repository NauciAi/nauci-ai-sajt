import promptsData from "@/data/prompts.json";

export type PromptItem = {
  title: string;
  prompt: string;
  free: boolean;
};

export type PromptCategory = {
  category: string;
  total: number;
  items: PromptItem[];
};

export const promptCategories = promptsData as PromptCategory[];

export function getPromptCategories(): PromptCategory[] {
  return promptCategories;
}

export function getFreePromptCount(): number {
  return promptCategories.reduce(
    (sum, c) => sum + c.items.filter((i) => i.free).length,
    0
  );
}

export function getTotalPromptCount(): number {
  return promptCategories.reduce((sum, c) => sum + c.total, 0);
}

/**
 * Vraća kategorije spremne za prikaz na stranici.
 * Ako `unlocked` nije true, vidljivi su samo besplatni promptovi (a `locked`
 * govori koliko ih još ima u toj kategoriji u punoj biblioteci).
 */
export function getPromptCategoriesForUser(unlocked: boolean) {
  return promptCategories.map((cat) => {
    const visibleItems = unlocked ? cat.items : cat.items.filter((i) => i.free);
    return {
      category: cat.category,
      total: cat.total,
      items: visibleItems,
      locked: cat.total - visibleItems.length,
    };
  });
}
