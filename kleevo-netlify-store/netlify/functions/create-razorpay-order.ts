import type { Handler } from "@netlify/functions";
import { requireUser, supabaseAdmin, json } from "./_shared";

type Body = { items?: { product_id: string; quantity: number }[]; shippingAddress?: {full_name?:string;phone?:string;line1?:string;line2?:string;city?:string;state?:string;pincode?:string} };
const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405,{error:"Method not allowed."});
  try {
    const user = await requireUser(event);
    const body = JSON.parse(event.body || "{}") as Body;
    if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 30) return json(400,{error:"Invalid cart."});
    const a=body.shippingAddress;
    if(!a || !a.full_name?.trim() || !/^\d{10}$/.test(a.phone||"") || !a.line1?.trim() || !a.city?.trim() || !a.state?.trim() || !/^\d{6}$/.test(a.pincode||"")) return json(400,{error:"Enter a valid delivery address and 10-digit mobile number."});
    const quantities = new Map<string,number>();
    for (const item of body.items) {
      if (typeof item.product_id !== "string" || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) return json(400,{error:"Invalid product quantity."});
      quantities.set(item.product_id,(quantities.get(item.product_id)||0)+item.quantity);
    }
    const ids=[...quantities.keys()];
    const {data:products,error:pErr}=await supabaseAdmin.from("products").select("id,name,price_inr,stock_qty,is_active,size_ml").in("id",ids);
    if(pErr || !products || products.length!==ids.length) return json(400,{error:"One or more products are unavailable."});
    let total=0;
    const items=products.map(p=>{
      const quantity=quantities.get(p.id)!;
      if(!p.is_active || p.stock_qty < quantity) throw new Error(`${p.name} is currently unavailable or has insufficient stock.`);
      total+=Math.round(Number(p.price_inr)*100)*quantity;
      return {product_id:p.id,name:p.name,quantity,unit_price:Number(p.price_inr)};
    });
    if(total<100 || total>50000000) return json(400,{error:"Order total is outside the supported payment range."});
    const keyId=process.env.RAZORPAY_KEY_ID, keySecret=process.env.RAZORPAY_KEY_SECRET;
    if(!keyId||!keySecret) return json(500,{error:"Payment gateway is not configured."});
    const {data:order,error:oErr}=await supabaseAdmin.from("orders").insert({user_id:user.id,items,shipping_address:a,total_inr:total/100,status:"pending",payment_status:"created"}).select("id").single();
    if(oErr||!order) return json(500,{error:"Could not create order."});
    const auth=btoa(`${keyId}:${keySecret}`);
    const rp=await fetch("https://api.razorpay.com/v1/orders",{method:"POST",headers:{"Authorization":`Basic ${auth}`,"Content-Type":"application/json"},body:JSON.stringify({amount:total,currency:"INR",receipt:order.id,notes:{supabase_order_id:order.id,user_id:user.id}})});
    const rpData=await rp.json();
    if(!rp.ok){await supabaseAdmin.from("orders").update({payment_status:"failed"}).eq("id",order.id);return json(502,{error:"Payment provider could not create the order."});}
    await supabaseAdmin.from("orders").update({razorpay_order_id:rpData.id}).eq("id",order.id);
    return json(200,{orderId:order.id,razorpayOrderId:rpData.id,amount:total,currency:"INR",keyId});
  } catch(error) { return json(400,{error:error instanceof Error?error.message:"Unable to create payment order."}); }
};
export { handler };