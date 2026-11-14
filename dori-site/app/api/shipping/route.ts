import {db} from "../../../lib/catalog";
export async function GET(){if(!db())return Response.json({zones:[]});try{const result=await db()!.prepare("SELECT id,name,countries_json,price_cents FROM shipping_zones WHERE active = 1 ORDER BY name").all();return Response.json({zones:result.results})}catch{return Response.json({zones:[]})}}
