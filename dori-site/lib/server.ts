import {env} from "cloudflare:workers";
export function config(){return env as Cloudflare.Env}
export function json(message:string,status=400){return Response.json({message},{status})}
export function validEmail(value:unknown){return typeof value==="string"&&value.length<=200&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)}
export function sameOrigin(request:Request){const site=config().SITE_URL;return !!site&&request.headers.get("origin")===new URL(site).origin}
export async function verifyTurnstile(token:unknown,request:Request){const secret=config().TURNSTILE_SECRET_KEY;if(!secret)return false;if(typeof token!=="string"||!token)return false;const body=new FormData();body.set("secret",secret);body.set("response",token);const ip=request.headers.get("cf-connecting-ip");if(ip)body.set("remoteip",ip);try{const res=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body});const out=await res.json() as {success?:boolean};return out.success===true}catch{return false}}
