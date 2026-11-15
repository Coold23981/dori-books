import Link from "./site-link";
import { getMarketCategories } from "../lib/market";
import { CategoryImage } from "./category-image";
import { Newsletter } from "./ui";

export const dynamic = "force-dynamic";

export default async function Home() {
  const categories = await getMarketCategories();

  return <main id="main">
    <div className="motto-band"><h1>Saving South African fynbos one flower at a time</h1></div>
    <div className="wrap home-features">{categories.map((category) => <section className="home-feature" key={category.id}><Link className="home-feature-media" href={`/market/${category.slug}`} aria-label={`Explore ${category.title}`}><CategoryImage category={category}/></Link><div className="home-feature-copy"><h2>{category.title}</h2><p>{category.description}</p><Link href={`/market/${category.slug}`} className="btn">View the collection</Link></div></section>)}</div>
    <section className="newsletter-section" id="newsletter"><div className="wrap newsletter"><div><p className="eyebrow">From the studio</p><h2>Stay in the loop</h2><p>Occasional notes about new work and collections.</p></div><Newsletter/></div></section>
    <section className="home-info" aria-label="More about Botanical Journals"><div className="home-info-inner"><details><summary>about the artist</summary><p>Mandy Lebides creates botanical drawings and hand bound objects inspired by South African plants. <Link href="/artist">Meet the artist ↗</Link></p></details><details><summary>the making process</summary><p>See how drawing, paper and binding come together. <Link href="/process">Explore the process ↗</Link></p></details><details><summary>shop the collections</summary><p>Browse drawings, mini canvases, journals and bookmarks. <Link href="/market">Visit the market ↗</Link></p></details><details><summary>studio enquiries</summary><p>Enquiries will open when the studio's contact details are confirmed. <Link href="/contact">Enquiry information ↗</Link></p></details></div></section>
  </main>;
}
