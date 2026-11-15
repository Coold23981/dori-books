import { Placeholder } from "./ui";
import type { MarketCategory } from "../lib/market";

const conceptImages: Record<string, string> = {
  "a4-drawings": "/images/drawings-concept.png",
  "mini-canvases": "/images/canvases-concept.png",
  "japanese-journals": "/images/journals-concept.png",
  "botanical-bookmarks": "/images/bookmarks-concept.png",
};

export function CategoryImage({ category }: { category: MarketCategory }) {
  if (category.image_key) return <img src={`/api/images/${encodeURIComponent(category.image_key)}`} alt={category.title} loading="lazy" />;
  if (conceptImages[category.slug]) return <span className="category-concept"><img src={conceptImages[category.slug]} alt={`Illustrative preview for ${category.title}`} loading="lazy" /><span>Illustrative preview</span></span>;
  return <Placeholder label={`${category.title} photography to come`} kind={category.slug === "japanese-journals" ? "book" : "botanical"} />;
}
