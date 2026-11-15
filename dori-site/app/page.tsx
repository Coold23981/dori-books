import Link from "next/link";
import { getFeatured } from "../lib/catalog";
import { getMarketCategories } from "../lib/market";
import { CategoryImage } from "./category-image";
import { WorkGrid } from "./works";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, allFeatured] = await Promise.all([getMarketCategories(), getFeatured()]);
  const featured = allFeatured.filter(work => categories.some(category => category.slug === work.category));

  return <main id="main">
    <div className="wrap storefront-intro home-intro"><div><p className="eyebrow">Dori botanical art</p><h1>Made by hand.</h1></div><p>Original botanical drawings, mini canvases, hand bound Japanese journals and bookmarks.</p></div>
    <div className="wrap home-features">{categories.map((category, index) => <section className="home-feature" key={category.id}><Link className="home-feature-media" href={`/market/${category.slug}`} aria-label={`Explore ${category.title}`}><CategoryImage category={category}/></Link><div className="home-feature-copy"><p className="eyebrow">The market · 0{index + 1}</p><h2>{category.title}</h2><p>{category.description}</p><Link href={`/market/${category.slug}`} className="btn">Explore this collection ↗</Link></div></section>)}</div>
    {featured.length > 0 && <section className="section line"><div className="wrap"><div className="section-heading"><div><p className="eyebrow">From the market</p><h2>Selected works.</h2></div><Link href="/market" className="text-link">Browse all ↗</Link></div><WorkGrid works={featured}/></div></section>}
    <div className="wrap storefront-bottom"><p>Explore all four categories together.</p><Link href="/market" className="text-link">Visit the market ↗</Link></div>
  </main>;
}
