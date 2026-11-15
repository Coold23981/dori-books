import type { Metadata } from "next";
import Link from "../../site-link";
import { notFound } from "next/navigation";
import { getWorks } from "../../../lib/catalog";
import { getMarketCategory, getMarketCategories } from "../../../lib/market";
import { WorkGrid } from "../../works";
import { CategoryImage } from "../../category-image";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getMarketCategory((await params).category);
  return { title: category?.title ?? "Market", description: category?.description ?? "Botanical works by Mandy Lebides." };
}

export default async function CategoryPage({ params }: Props) {
  const category = await getMarketCategory((await params).category);
  if (!category) notFound();
  const [works, categories] = await Promise.all([getWorks(category.slug), getMarketCategories()]);
  const related = categories.filter(item => item.slug !== category.slug).slice(0, 3);
  return <main id="main">
    <div className="wrap page-intro market-intro"><Link href="/market" className="text-link">← Back to market</Link><p className="eyebrow" style={{marginTop:40}}>The market</p><h1>{category.title}</h1><p>{category.description}</p></div>
    <section className="wrap collection-showcase" aria-label={`${category.title} preview`}><div className="collection-showcase-media"><CategoryImage category={category}/></div><div className="collection-showcase-copy"><p className="eyebrow">A closer look</p><h2>{category.title}</h2><p>{category.description} Explore the work behind this collection while individual pieces are being prepared.</p><Link href="/process" className="btn">The making process</Link></div></section>
    <section className="wrap section-sm line">{works.length ? <WorkGrid works={works}/> : <div className="empty collection-empty"><p className="eyebrow">In preparation</p><h2>New pieces are on their way.</h2><p>Individual photographs, descriptions, availability and prices will be added when confirmed.</p><div className="studio-next-actions"><Link href="/market" className="btn">Browse all collections</Link><Link href="/artist" className="text-link">Meet the artist ↗</Link></div></div>}</section>
    {related.length > 0 && <section className="wrap collection-related"><div className="section-heading"><div><p className="eyebrow">Keep exploring</p><h2>Other collections</h2></div></div><div className="collection-related-grid">{related.map(item => <Link href={`/market/${item.slug}`} className="collection-related-card" key={item.slug}><span className="collection-related-media"><CategoryImage category={item}/></span><span className="collection-related-title">{item.title}<span aria-hidden="true">↗</span></span></Link>)}</div></section>}
  </main>;
}
