import { Placeholder } from "./ui";
import type { MarketCategory } from "../lib/market";

export function CategoryImage({ category }: { category: MarketCategory }) {
  return category.image_key
    ? <img src={`/api/images/${encodeURIComponent(category.image_key)}`} alt={category.title} loading="lazy" />
    : <Placeholder label={`${category.title} photography to come`} kind={category.slug === "japanese-journals" ? "book" : "botanical"} />;
}
