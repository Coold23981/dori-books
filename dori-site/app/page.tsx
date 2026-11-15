import Link from "next/link";
import { getFeatured } from "../lib/catalog";
import { getMarketCategories } from "../lib/market";
import { Placeholder } from "./ui";
import { WorkGrid } from "./works";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, allFeatured] = await Promise.all([getMarketCategories(), getFeatured()]);
  const featured = allFeatured.filter(work => categories.some(category => category.slug === work.category));
  return <main id="main">
    <section className="hero"><div className="hero-copy"><p className="eyebrow">Original botanical art · South Africa</p><h1>Botanical art,<br/><em>made by hand.</em></h1><p className="lead">Original drawings, mini canvases, hand bound Japanese journals and botanical bookmarks by Dori.</p><div className="hero-actions"><Link href="/market" className="btn">Explore the market <span>↗</span></Link></div></div><div className="hero-art"><Placeholder label="Original product photography to come" kind="botanical"/></div></section>
    <section className="section wrap"><div className="section-heading"><div><p className="eyebrow">Explore</p><h2>The market.</h2></div><Link href="/market" className="text-link">View all ↗</Link></div><div className="home-category-grid">{categories.map((category, index) => <Link href={`/market/${category.slug}`} className="home-category" key={category.id}><span className="home-category-number">0{index + 1}</span><h3>{category.title}</h3><span aria-hidden="true">↗</span></Link>)}</div></section>
    {featured.length > 0 && <section className="section line"><div className="wrap"><div className="section-heading"><div><p className="eyebrow">From the market</p><h2>Selected works.</h2></div><Link href="/market" className="text-link">Browse all ↗</Link></div><WorkGrid works={featured}/></div></section>}
    <section className="section line"><div className="wrap split"><div className="copy"><p className="eyebrow">Meet Dori</p><h2>Drawn from nature.</h2><p>Each product category begins with botanical drawing and is shaped by hand. Learn more about the artist and her process.</p><Link href="/artist" className="text-link">About the artist ↗</Link></div><Placeholder label="Artist studio photograph to come" kind="botanical"/></div></section>
  </main>;
}
