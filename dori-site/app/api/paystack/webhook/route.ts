import {config} from "../../../../lib/server";
import {confirmPaystackPayment,verifyPaystackWebhook} from "../../../../lib/paystack";

export async function POST(request:Request){
  const c=config(),raw=await request.text();
  if(raw.length>20000)return new Response("Too large",{status:413});
  if(!verifyPaystackWebhook(raw,request.headers.get("paystack-signature"),request.headers.get("x-paystack-signature"),c.PAYSTACK_WEBHOOK_SECRET,c.PAYSTACK_SECRET_KEY))return new Response("Invalid signature",{status:401});
  let event:{event?:string;data?:{reference?:unknown}};
  try{event=JSON.parse(raw) as typeof event}catch{return new Response("Invalid event",{status:400});}
  if(event.event!=="charge.success")return new Response("Ignored",{status:200});
  if(typeof event.data?.reference!=="string")return new Response("Missing reference",{status:400});
  try{await confirmPaystackPayment(event.data.reference);return new Response("OK");}
  catch{return new Response("Payment verification failed",{status:503});}
}
