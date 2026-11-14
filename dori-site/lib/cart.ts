export type CartItem={id:string;title:string;price_cents:number;currency:string;qty:number;max:number};
const key="dori-bag";
export function readCart():CartItem[]{if(typeof window==="undefined")return [];try{const v=JSON.parse(sessionStorage.getItem(key)||"[]");return Array.isArray(v)?v.filter((x)=>x&&typeof x.id==="string"&&Number.isInteger(x.qty)&&x.qty>0):[]}catch{return []}}
function save(items:CartItem[]){sessionStorage.setItem(key,JSON.stringify(items));window.dispatchEvent(new Event("dori-cart"))}
export function addToCart(item:CartItem){const items=readCart();const existing=items.find(x=>x.id===item.id);if(existing)existing.qty=Math.min(existing.max,existing.qty+1);else items.push(item);save(items)}
export function setQty(id:string,qty:number){if(!Number.isInteger(qty))return;const items=readCart();const item=items.find(x=>x.id===id);if(item)item.qty=Math.max(1,Math.min(item.max,qty));save(items)}
export function removeItem(id:string){save(readCart().filter(x=>x.id!==id))}
export function clearCart(){save([])}
