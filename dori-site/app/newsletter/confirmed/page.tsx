import type { Metadata } from "next";
import Link from "../../site-link";

export const metadata: Metadata = {
  title: "Subscription confirmed",
  description: "Your Botanical Journals studio email subscription is confirmed.",
};

export default function NewsletterConfirmed() {
  return <main id="main">
    <section className="wrap page-intro legal">
      <p className="eyebrow">From the studio</p>
      <h1>You're on the list.</h1>
      <p>Thank you for confirming your email address. Look out for a welcome note from Mandy, then occasional news about new work and collections.</p>
      <p>You can unsubscribe using the link in any studio email.</p>
      <Link className="btn" href="/market">Explore the collections</Link>
    </section>
  </main>;
}
