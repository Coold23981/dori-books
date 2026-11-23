import {createHmac,timingSafeEqual} from "node:crypto";
import {db} from "./catalog";
import {config} from "./server";

type PaystackTransaction={id?:number|string;reference?:string;status?:string;amount?:number;currency?:string};
type VerifyResponse={status?:boolean;data?:PaystackTransaction};
type Order={id:string;status:string;total_cents:number;currency:string;expires_at:number;provider_payment_id:string|null};

export async function initializePaystackTransaction(order:{id:string;total_cents:number;customer_email:string}){
  const c=config();
  if(!c.PAYSTACK_SECRET_KEY||!c.SITE_URL)throw new Error("Paystack is not configured");
  const response=await fetch("https://api.paystack.co/transaction/initialize",{
    method:"POST",
    headers:{Authorization:`Bearer ${c.PAYSTACK_SECRET_KEY}`,"Content-Type":"application/json"},
    body:JSON.stringify({email:order.customer_email,amount:order.total_cents,currency:"ZAR",reference:order.id,callback_url:`${c.SITE_URL.replace(/\/$/,"")}/api/paystack/callback`})
  });
  const payload=await response.json() as {status?:boolean;data?:{authorization_url?:string;reference?:string}};
  if(!response.ok||payload.status!==true||!payload.data?.authorization_url||payload.data.reference!==order.id)throw new Error("Paystack could not initialize this payment");
  return payload.data.authorization_url;
}

async function verifyTransaction(reference:string){
  const secret=config().PAYSTACK_SECRET_KEY;
  if(!secret)throw new Error("Paystack is not configured");
  const response=await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,{headers:{Authorization:`Bearer ${secret}`}});
  const payload=await response.json() as VerifyResponse;
  if(!response.ok||payload.status!==true||!payload.data)throw new Error("Paystack transaction verification failed");
  return payload.data;
}

export async function confirmPaystackPayment(reference:string){
  const database=db();
  if(!database)throw new Error("Order storage is unavailable");
  const order=await database.prepare("SELECT id,status,total_cents,currency,expires_at,provider_payment_id FROM orders WHERE id = ?").bind(reference).first<Order>();
  if(!order)return "missing" as const;
  const tx=await verifyTransaction(reference);
  if(tx.reference!==order.id||tx.status!=="success"||tx.amount!==order.total_cents||tx.currency!==order.currency||tx.id==null)return "unconfirmed" as const;
  const paymentId=String(tx.id);
  const existing=await database.prepare("SELECT order_id FROM payment_events WHERE id = ?").bind(paymentId).first<{order_id:string}>();
  if(existing&&existing.order_id!==order.id)return "conflict" as const;
  if(order.status==="paid"||order.status==="payment_review")return order.provider_payment_id===paymentId?order.status:"conflict" as const;
  if(order.status!=="pending")return "unconfirmed" as const;
  const payload=JSON.stringify({provider:"paystack",reference:tx.reference,transaction_id:paymentId,status:tx.status,amount:tx.amount,currency:tx.currency});
  try{
    await database.batch([
      database.prepare("INSERT INTO payment_events (id,order_id,payload_json,received_at) VALUES (?,?,?,?)").bind(paymentId,order.id,payload,Date.now()),
      database.prepare("UPDATE orders SET status = 'paid', paid_at = ?, provider_payment_id = ? WHERE id = ? AND status = 'pending'").bind(Date.now(),paymentId,order.id)
    ]);
    return "paid" as const;
  }catch{
    // Keep a real payment visible for reconciliation if its stock reservation can no longer be honored.
    try{
      await database.batch([
        database.prepare("INSERT OR IGNORE INTO payment_events (id,order_id,payload_json,received_at) VALUES (?,?,?,?)").bind(paymentId,order.id,payload,Date.now()),
        database.prepare("UPDATE orders SET status = 'payment_review', provider_payment_id = ? WHERE id = ? AND status = 'pending'").bind(paymentId,order.id)
      ]);
      return "payment_review" as const;
    }catch{throw new Error("Could not record Paystack payment for review");}
  }
}

export function verifyPaystackWebhook(rawBody:string,signature:string|null,legacySignature:string|null,webhookSecret:string|undefined,secretKey:string|undefined){
  if(webhookSecret&&signature){
    let timestamp:string|undefined;
    const signatures:{kid:string;hex:string}[]=[];
    for(const part of signature.split(",")){
      const split=part.indexOf("=");if(split<0)continue;
      const key=part.slice(0,split).trim(),value=part.slice(split+1).trim();
      if(key==="t"){if(timestamp!==undefined||!/^\d+$/.test(value))return false;timestamp=value;}
      if(key==="v1"){const colon=value.indexOf(":");if(colon>0)signatures.push({kid:value.slice(0,colon),hex:value.slice(colon+1)});}
    }
    if(!timestamp||Math.abs(Date.now()/1000-Number(timestamp))>300)return false;
    const expected=createHmac("sha512",webhookSecret).update(`${timestamp}.${rawBody}`).digest();
    return signatures.some(({kid,hex})=>kid.startsWith("whk_")&&/^[0-9a-f]{128}$/.test(hex)&&timingSafeEqual(expected,Buffer.from(hex,"hex")));
  }
  if(secretKey&&legacySignature&&/^[0-9a-f]{128}$/.test(legacySignature)){
    const expected=createHmac("sha512",secretKey).update(rawBody).digest();
    return timingSafeEqual(expected,Buffer.from(legacySignature,"hex"));
  }
  return false;
}
