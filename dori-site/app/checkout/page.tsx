import type { Metadata } from "next";
import Link from "../site-link";
import CheckoutForm from "./checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default function Checkout() {
  if (process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === "true") return <CheckoutForm />;

  return <main id="main">
    <div className="wrap page-intro"><p className="eyebrow">The market</p><h1>Checkout is<br/><em>coming soon.</em></h1><p>Purchases will open after the studio confirms individual works, delivery options and secure payment.</p></div>
    <section className="wrap section-sm line"><div className="contact-available"><p className="eyebrow">Keep exploring</p><h2>The work is taking shape.</h2><p>Browse the collections and the process while the shop is being prepared.</p><div className="studio-next-actions"><Link className="btn" href="/market">Browse the collections</Link><Link className="text-link" href="/process">The making process ↗</Link></div></div></section>
  </main>;
}
