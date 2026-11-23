import {redirect} from "next/navigation";
import {confirmPaystackPayment} from "../../../../lib/paystack";

export async function GET(request:Request){
  const url=new URL(request.url),reference=url.searchParams.get("reference");
  if(reference&&reference.length<=100){
    try{await confirmPaystackPayment(reference)}catch{/* The order page will continue showing the payment as pending. */}
    return redirect(`/order/${encodeURIComponent(reference)}`);
  }
  return redirect("/market");
}
