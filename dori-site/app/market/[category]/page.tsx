import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorks } from "../../../lib/catalog";
import { getMarketCategory } from "../../../lib/market";
import { WorkGrid } from "../../works";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getMarketCategory((await params).category);
  return { title: category?.title ?? "Market", description: category?.description ?? "Botanical works by Mandy Lebides." };
}

export default async function CategoryPage({ params }: Props) {
  const category = await getMarketCategory((await params).category);
  if (!category) notFound();
  const works = await getWorks(category.slug);
  return <main id="main"><div className="wrap page-intro market-intro"><Link href="/market" className="text-link">← Back to market</Link><p className="eyebrow" style={{marginTop:40}}>The market</p><h1>{category.title}</h1><p>{category.description}</p></div><section className="wrap section-sm line">{works.length ? <WorkGrid works={works}/> : <div className="empty"><p className="eyebrow">In preparation</p><h2>Pieces will appear here soon.</h2><p>Photographs, descriptions, availability and prices will be added when confirmed.</p><Link href="/contact" className="text-link">Contact the studio ↗</Link></div>}</section></main>;
}
