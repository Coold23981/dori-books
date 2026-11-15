import type { Metadata } from "next";
import Link from "next/link";
import { getMarketCategories } from "../../lib/market";
import { getWorks } from "../../lib/catalog";
import { CategoryImage } from "../category-image";
import { WorkGrid } from "../works";

export const metadata: Metadata = { title: "Market", description: "Explore Dori's original botanical drawings, mini canvases, hand bound journals and bookmarks." };
export const dynamic = "force-dynamic";

export default async function Market() {
  const [categories, allWorks] = await Promise.all([getMarketCategories(), getWorks()]);
  const works = allWorks.filter(work => categories.some(category => category.slug === work.category));
  return <main id="main">
    <div className="wrap storefront-intro market-heading"><p className="eyebrow">Dori botanical art</p><h1>The market.</h1><p>Explore original pieces and hand made objects. Each category opens into its own gallery.</p></div>
    <section className="wrap market-gallery" aria-label="Product categories">{categories.map(category => <Link href={`/market/${category.slug}`} className="market-tile" key={category.id}><div className="market-tile-media"><CategoryImage category={category}/></div><div className="market-tile-copy"><div><h2>{category.title}</h2><p>{category.description}</p></div><span aria-hidden="true">↗</span></div></Link>)}</section>
    {works.length > 0 && <section className="wrap section-sm line"><div className="section-heading"><div><p className="eyebrow">Available work</p><h2>Browse all pieces.</h2></div></div><WorkGrid works={works}/></section>}
  </main>;
}
