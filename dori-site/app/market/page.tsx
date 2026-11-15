import type { Metadata } from "next";
import Link from "next/link";
import { getMarketCategories } from "../../lib/market";
import { getWorks } from "../../lib/catalog";
import { Placeholder } from "../ui";
import { WorkGrid } from "../works";

export const metadata: Metadata = { title: "Market", description: "Explore Dori's original botanical drawings, mini canvases, hand bound journals and bookmarks." };
export const dynamic = "force-dynamic";

export default async function Market() {
  const [categories, allWorks] = await Promise.all([getMarketCategories(), getWorks()]);
  const works = allWorks.filter(work => categories.some(category => category.slug === work.category));
  return <main id="main">
    <div className="wrap page-intro market-intro"><p className="eyebrow">The market</p><h1>Botanical works<br/><em>to hold and keep.</em></h1><p>Explore the four kinds of work made by Dori. Individual pieces and verified prices will appear here as they are ready.</p></div>
    <section className="wrap section-sm line"><div className="market-grid">{categories.map(category => <Link href={`/market/${category.slug}`} className="market-card" key={category.id}>{category.image_key ? <img src={`/api/images/${encodeURIComponent(category.image_key)}`} alt="" loading="lazy"/> : <Placeholder label="Product photography to come" kind="botanical"/>}<div className="market-card-copy"><p className="eyebrow">Explore the work</p><h2>{category.title}</h2><p>{category.description}</p><span className="text-link">View collection ↗</span></div></Link>)}</div></section>
    {works.length > 0 && <section className="wrap section-sm line"><div className="section-heading"><div><p className="eyebrow">Available work</p><h2>Browse the market.</h2></div></div><WorkGrid works={works}/></section>}
  </main>;
}
