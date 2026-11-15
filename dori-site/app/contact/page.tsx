"use client";

import { useState } from "react";
import Script from "next/script";
import Link from "../site-link";

export default function Contact() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const active = process.env.NEXT_PUBLIC_CONTACT_ENABLED === "true" && Boolean(siteKey);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    data.turnstile = data["cf-turnstile-response"] || "";
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json() as { message?: string };
      setMessage(result.message || "Unable to send the enquiry right now.");
      if (response.ok) form.reset();
    } catch {
      setMessage("Unable to send the enquiry right now.");
    } finally {
      setBusy(false);
    }
  }

  return <main id="main">
    <div className="wrap page-intro">
      <p className="eyebrow">Contact</p>
      <h1>Begin a<br/><em>conversation.</em></h1>
      <p>{active ? "For artwork acquisitions, collector enquiries or a note to the studio, please use the form below." : "The studio is preparing its enquiry channel. You can explore the collections and learn about Mandy's process in the meantime."}</p>
    </div>
    <section className="wrap section-sm line">
      {active ? <div className="split" style={{alignItems:"start"}}>
        <div><h2>Write to the studio.</h2><p>We will only use your details to respond to your enquiry. Read our <Link href="/privacy" style={{textDecoration:"underline"}}>privacy policy</Link>.</p></div>
        <form className="form-stack" onSubmit={submit}>
          <label>Name<input className="field" name="name" required maxLength={100}/></label>
          <label>Email<input className="field" name="email" type="email" required maxLength={200}/></label>
          <label>Enquiry type<select className="field" name="type" required><option>General Enquiry</option><option>Artwork Acquisition</option><option>Collector Enquiry</option><option>Gallery / Institutional Enquiry</option></select></label>
          <label>Artwork reference, if any<input className="field" name="artwork" maxLength={200}/></label>
          <label>Message<textarea className="field" name="message" required minLength={10} maxLength={5000}/></label>
          <input className="sr-only" name="website" tabIndex={-1} autoComplete="off"/>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive"/>
          <div className="cf-turnstile" data-sitekey={siteKey}/>
          <button className="btn" type="submit" disabled={busy}>{busy ? "Sending…" : "Send enquiry ↗"}</button>
          <p role="status" aria-live="polite">{message}</p>
        </form>
      </div> : <div className="contact-available">
        <p className="eyebrow">Studio enquiries</p>
        <h2>Good things take a little time.</h2>
        <p>The enquiry form will open once Mandy confirms the studio's contact details. Until then, discover the collections and the hands behind them.</p>
        <div className="studio-next-actions"><Link className="btn" href="/market">Explore the collections</Link><Link className="text-link" href="/artist">Meet the artist ↗</Link></div>
      </div>}
    </section>
  </main>;
}
