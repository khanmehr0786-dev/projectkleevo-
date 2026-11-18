import type { Handler } from "@netlify/functions";
import { createHmac, timingSafeEqual } from "node:crypto";
import { requireUser, supabaseAdmin, json } from "./_shared";

type Body={razorpay_order_id?:string;razorpay_payment_id?:string;razorpay_signature?:string;orderId?:string};
const handler:Handler=async(event)=>{
 if(event.httpMethod!=="POST")return json(405,{error:"Method not allowed."});
 try{
  const user=await requireUser(event);const body=JSON.parse(event.body||"{}") as Body;
  if(!body.razorpay_order_id||!body.razorpay_payment_id||!body.razorpay_signature||!body.orderId)return json(400,{error:"Missing payment verification fields."});
  const {data:order,error}=await supabaseAdmin.from("orders").select("id,user_id,razorpay_order_id,payment_status").eq("id",body.orderId).eq("user_id",user.id).single();
  if(error||!order||order.razorpay_order_id!==body.razorpay_order_id)return json(404,{error:"Order not found."});
  if(order.payment_status==="paid")return json(200,{verified:true,message:"Payment already verified."});
  const secret=process.env.RAZORPAY_KEY_SECRET;if(!secret)return json(500,{error:"Payment verification is not configured."});
  const expected=createHmac("sha256",secret).update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`).digest("hex");
  const a=Buffer.from(expected,"hex"),b=Buffer.from(body.razorpay_signature,"hex");
  if(a.length!==b.length||!timingSafeEqual(a,b)){await supabaseAdmin.from("orders").update({payment_status:"failed"}).eq("id",order.id);return json(400,{error:"Payment signature could not be verified."});}
  const {data:payment,error:payErr}=await supabaseAdmin.from("payments").insert({order_id:order.id,user_id:user.id,razorpay_payment_id:body.razorpay_payment_id,razorpay_order_id:body.razorpay_order_id,status:"verified"}).select("id").single();
  if(payErr && !payErr.message.includes("duplicate"))return json(500,{error:"Could not record payment verification."});
  const {error:updateErr}=await supabaseAdmin.from("orders").update({payment_status:"paid",status:"confirmed",razorpay_payment_id:body.razorpay_payment_id}).eq("id",order.id);
  if(updateErr)return json(500,{error:"Payment was verified but order update failed. Contact support with your order ID."});
  return json(200,{verified:true,paymentRecordId:payment?.id});
 }catch(error){return json(400,{error:error instanceof Error?error.message:"Payment verification failed."});}
};
export {handler};