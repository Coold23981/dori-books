import {db,type Work} from "../../../lib/catalog";
import {config,json,sameOrigin,validEmail} from "../../../lib/server";
import {initializePaystackTransaction} from "../../../lib/paystack";

type Zone={id:string;name:string;countries_json:string;price_cents:number};

export async function POST(request:Request){
  if(!sameOrigin(request))return json("Request origin was not accepted.",403);
  const c=config();
  if(!c.DB||!c.SITE_URL||!c.PAYSTACK_SECRET_KEY)return json("Checkout is not active yet.",503);
  let d:Record<string,unknown>;try{d=await request.json()}catch{return json("Invalid request.")}
  if(typeof d.name!=="string"||d.name.trim().length<2||d.name.length>100||!validEmail(d.email)||typeof d.address1!=="string"||d.address1.length<4||d.address1.length>200||typeof d.city!=="string"||d.city.length<2||typeof d.postcode!=="string"||d.postcode.length<2||typeof d.country!=="string"||d.country.length!==2||typeof d.zoneId!=="string"||!Array.isArray(d.items)||d.items.length<1||d.items.length>20)return json("Please review your checkout details.");
  const items=d.items as {id?:unknown;qty?:unknown}[];
  if(items.some(x=>typeof x.id!=="string"||!Number.isInteger(x.qty)||Number(x.qty)<1||Number(x.qty)>20)||new Set(items.map(x=>x.id)).size!==items.length)return json("Invalid bag items.");
  const zone=await db()!.prepare("SELECT * FROM shipping_zones WHERE id = ? AND active = 1").bind(d.zoneId).first<Zone>();
  if(!zone)return json("Select an available shipping option.");
  let countries:string[];try{countries=JSON.parse(zone.countries_json)}catch{return json("Shipping configuration is invalid.",503)}
  if(!countries.includes(d.country))return json("This shipping option does not serve the selected country.");
  const works:Work[]=[];
  for(const x of items){const work=await db()!.prepare("SELECT * FROM artworks WHERE id = ?").bind(x.id).first<Work>();if(!work||work.status!=="available"||work.price_cents==null||work.price_cents<0||work.currency!=="ZAR"||Number(x.qty)>work.stock_total||work.edition_size===1&&Number(x.qty)>1)return json("A selected work is no longer available.",409);works.push(work)}
  const subtotal=items.reduce((n,x,i)=>n+works[i].price_cents!*Number(x.qty),0),now=Date.now(),id=crypto.randomUUID(),expiry=now+30*60*1000,total=subtotal+zone.price_cents;
  const address=JSON.stringify({address1:d.address1,address2:d.address2||"",city:d.city,postcode:d.postcode,country:d.country});
  const statements=[db()!.prepare("INSERT INTO orders (id,status,customer_name,customer_email,address_json,shipping_zone_id,shipping_cents,subtotal_cents,total_cents,currency,created_at,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").bind(id,"pending",d.name.trim(),d.email,address,zone.id,zone.price_cents,subtotal,total,"ZAR",now,expiry),...items.map((x,i)=>db()!.prepare("INSERT INTO order_items (id,order_id,artwork_id,title,quantity,unit_cents) VALUES (?,?,?,?,?,?)").bind(crypto.randomUUID(),id,works[i].id,works[i].title,x.qty,works[i].price_cents))];
  try{await db()!.batch(statements)}catch{return json("A selected work has just become unavailable. Please review your bag.",409)}
  try{return Response.json({authorization_url:await initializePaystackTransaction({id,total_cents:total,customer_email:String(d.email)})})}
  catch{await db()!.prepare("UPDATE orders SET status = 'cancelled' WHERE id = ? AND status = 'pending'").bind(id).run();return json("Paystack could not start the payment. Please try again.",502)}
}
