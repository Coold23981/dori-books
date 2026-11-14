import {db} from "../../../../lib/catalog";
import {config} from "../../../../lib/server";
import {encodeFields,payfastHost,verifySignature} from "../../../../lib/payfast";
type Order={id:string;status:string;total_cents:number;expires_at:number;provider_payment_id:string|null};
export async function POST(request:Request){
  const c=config();
  if(!db()||!c.PAYFAST_PASSPHRASE||!c.PAYFAST_MERCHANT_ID)return new Response("Not configured",{status:503});
  const raw=await request.text();
  if(raw.length>20000)return new Response("Too large",{status:413});
  const form=new URLSearchParams(raw),received=form.get("signature")||"";
  const fields:Record<string,string>={};
  for(const [k,v] of form)if(k!=="signature")fields[k]=v;
  if(!verifySignature(fields,received,c.PAYFAST_PASSPHRASE)||fields.merchant_id!==c.PAYFAST_MERCHANT_ID)return new Response("Invalid signature",{status:400});
  const order=await db()!.prepare("SELECT id,status,total_cents,expires_at,provider_payment_id FROM orders WHERE id = ?").bind(fields.m_payment_id).first<Order>();
  if(!order||!Number.isFinite(Number(fields.amount_gross))||Math.round(Number(fields.amount_gross)*100)!==order.total_cents)return new Response("Invalid order",{status:400});
  const confirmation=await fetch(`https://${payfastHost()}/eng/query/validate`,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:encodeFields(fields)});
  if(!confirmation.ok||await confirmation.text()!=="VALID")return new Response("Provider validation failed",{status:400});
  const paymentId=fields.pf_payment_id||"";
  if(!paymentId)return new Response("Missing payment id",{status:400});
  const existing=await db()!.prepare("SELECT order_id FROM payment_events WHERE id = ?").bind(paymentId).first<{order_id:string}>();
  if(existing&&existing.order_id!==order.id)return new Response("Payment id belongs to another order",{status:409});
  if(order.status==="paid"||order.status==="payment_review")return order.provider_payment_id===paymentId?new Response("OK"):new Response("Conflicting payment id",{status:409});
  if(order.status!=="pending")return new Response("Order requires review",{status:409});
  if(fields.payment_status!=="COMPLETE")return new Response("No completed payment",{status:409});
  try{
    await db()!.batch([
      db()!.prepare("INSERT INTO payment_events (id,order_id,payload_json,received_at) VALUES (?,?,?,?)").bind(paymentId,order.id,JSON.stringify(fields),Date.now()),
      db()!.prepare("UPDATE orders SET status = 'paid', paid_at = ?, provider_payment_id = ? WHERE id = ? AND status = 'pending'").bind(Date.now(),paymentId,order.id)
    ]);
    return new Response("OK");
  }catch{
    // A genuine late payment may arrive after its reservation expires. Preserve it for refund/reconciliation.
    try{
      await db()!.batch([
        db()!.prepare("INSERT OR IGNORE INTO payment_events (id,order_id,payload_json,received_at) VALUES (?,?,?,?)").bind(paymentId,order.id,JSON.stringify(fields),Date.now()),
        db()!.prepare("UPDATE orders SET status = 'payment_review', provider_payment_id = ? WHERE id = ? AND status = 'pending'").bind(paymentId,order.id)
      ]);
      return new Response("OK");
    }catch{return new Response("Manual review persistence failed",{status:500})}
  }
}
