import { db } from "./catalog";

export type MarketCategory = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_key: string | null;
  sort_order: number;
  active: number;
};

export const initialCategories: MarketCategory[] = [
  { id: "a4e46b34-64f9-4ee4-a001-75f24a584001", slug: "a4-drawings", title: "Original A4 botanical drawings", description: "Original botanical drawings in A4 format.", image_key: null, sort_order: 1, active: 1 },
  { id: "a4e46b34-64f9-4ee4-a001-75f24a584002", slug: "mini-canvases", title: "Mini botanical canvases", description: "Original hand drawn mini botanical canvases.", image_key: null, sort_order: 2, active: 1 },
  { id: "a4e46b34-64f9-4ee4-a001-75f24a584003", slug: "japanese-journals", title: "Japanese botanical journals", description: "Hand bound Japanese botanical journals.", image_key: null, sort_order: 3, active: 1 },
  { id: "a4e46b34-64f9-4ee4-a001-75f24a584004", slug: "botanical-bookmarks", title: "Botanical bookmarks", description: "Hand drawn botanical bookmarks.", image_key: null, sort_order: 4, active: 1 },
];

export async function getMarketCategories(): Promise<MarketCategory[]> {
  if (!db()) return initialCategories;
  try {
    return (await db()!.prepare("SELECT * FROM market_categories WHERE active = 1 ORDER BY sort_order, title").all<MarketCategory>()).results;
  } catch {
    return initialCategories;
  }
}

export async function getMarketCategory(slug: string): Promise<MarketCategory | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  return (await getMarketCategories()).find(category => category.slug === slug) ?? null;
}
