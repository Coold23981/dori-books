"use client";

import { useEffect, useState } from "react";
import Link from "../site-link";
import { readCart, removeItem, setQty, type CartItem } from "../../lib/cart";
import { money } from "../../lib/format";

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const checkoutEnabled = process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === "true";

  useEffect(() => {
    const update = () => setItems(readCart());
    update();
    window.addEventListener("dori-cart", update);
    return () => window.removeEventListener("dori-cart", update);
  }, []);

  const total = items.reduce((sum, item) => sum + item.price_cents * item.qty, 0);

  return <main id="main">
    <div className="wrap page-intro"><p className="eyebrow">Your selection</p><h1>The bag.</h1></div>
    <section className="wrap section-sm line">
      {items.length ? <>
        <div>{items.map(item => <div className="cart-row" key={item.id}>
          <div><h3>{item.title}</h3><p>{money(item.price_cents, item.currency)}</p></div>
          <label>Quantity <input className="field" style={{width:80}} type="number" min="1" max={item.max} value={item.qty} onChange={event => setQty(item.id, Number(event.target.value))}/></label>
          <button type="button" onClick={() => removeItem(item.id)}>Remove</button>
        </div>)}</div>
        <p className="serif" style={{fontSize:32,marginTop:30}}>Subtotal {money(total, items[0].currency)}</p>
        {checkoutEnabled ? <><p className="muted">Shipping is calculated at checkout. Stock and prices are verified again before payment.</p><Link href="/checkout" className="btn">Continue to checkout ↗</Link></> : <><p className="muted">Purchases will open after the studio confirms delivery and secure payment.</p><Link href="/market" className="btn">Browse the collections</Link></>}
      </> : <div className="empty"><h3>Your bag is empty.</h3><p>Explore the collections while new works are being prepared.</p><Link href="/market" className="text-link">Explore works ↗</Link></div>}
    </section>
  </main>;
}
