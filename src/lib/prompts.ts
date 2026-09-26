import promptsData from "@/data/prompts.json";

export type PromptItem = {
  title: string;
  prompt: string;
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
  return promptCategories.reduce((sum, c) => sum + c.items.length, 0);
}

export function getTotalPromptCount(): number {
  return promptCategories.reduce((sum, c) => sum + c.total, 0);
}
