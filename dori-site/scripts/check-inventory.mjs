import {DatabaseSync} from "node:sqlite";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve,dirname} from "node:path";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const sql=readFileSync(resolve(root,"drizzle/0000_initial.sql"),"utf8").replaceAll("--> statement-breakpoint","");
const db=new DatabaseSync(":memory:");db.exec(sql);const now=Date.now();
const work=(id,stock,edition)=>db.prepare("INSERT INTO artworks (id,slug,title,category,price_cents,stock_total,edition_size,status,created_at) VALUES (?,?,?,?,?,?,?,?,?)").run(id,id,id,stock===1?"unique":"limited",10000,stock,edition,"available","2026-01-01");
const order=(id,expiry)=>db.prepare("INSERT INTO orders (id,status,customer_name,customer_email,address_json,shipping_zone_id,shipping_cents,subtotal_cents,total_cents,currency,created_at,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").run(id,"pending","Test","test@example.invalid","{}","zone",0,10000,10000,"ZAR",now,expiry);
const reserve=(id,orderId,workId,qty=1)=>db.prepare("INSERT INTO order_items (id,order_id,artwork_id,title,quantity,unit_cents) VALUES (?,?,?,?,?,?)").run(id,orderId,workId,workId,qty,10000);
function rejects(fn){let failed=false;try{fn()}catch{failed=true}if(!failed)throw Error("Expected stock guard to reject operation")}
work("unique-work",1,1);order("first",now+1800000);order("second",now+1800000);reserve("item-first","first","unique-work");rejects(()=>reserve("item-second","second","unique-work"));db.prepare("UPDATE orders SET status='paid' WHERE id='first'").run();rejects(()=>db.prepare("UPDATE artworks SET stock_total=0 WHERE id='unique-work'").run());
work("edition",3,3);order("edition-order",now+1800000);reserve("edition-item","edition-order","edition",2);order("edition-second",now+1800000);rejects(()=>reserve("edition-too-many","edition-second","edition",2));reserve("edition-last","edition-second","edition",1);
work("late-work",1,1);order("expired",now-1000);reserve("expired-item","expired","late-work");order("current",now+1800000);reserve("current-item","current","late-work");rejects(()=>db.prepare("UPDATE orders SET status='paid' WHERE id='expired'").run());
console.log("Inventory guards passed: unique work, edition limit, stock edit, late payment.");
