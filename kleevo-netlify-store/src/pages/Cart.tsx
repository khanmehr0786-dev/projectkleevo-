import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useState } from "react";
declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, callback: (response: Record<string,string>) => void) => void } } }
export function Cart() {
 const {lines,total,setQty,remove,clear}=useCart(); const {user}=useAuth(); const navigate=useNavigate(); const [busy,setBusy]=useState(false); const [msg,setMsg]=useState("");
 const [address,setAddress]=useState({full_name:"",phone:"",line1:"",line2:"",city:"",state:"Karnataka",pincode:""});
 async function checkout(){
  if(!user){navigate("/login",{state:{from:"/cart"}});return;} if(!lines.length)return;
  setBusy(true);setMsg("");
  try{
   const {data:sessionData}=await supabase.auth.getSession(); const token=sessionData.session?.access_token;
   const res=await fetch("/.netlify/functions/create-razorpay-order",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({items:lines.map(x=>({product_id:x.product.id,quantity:x.quantity})),shippingAddress:address})});
   const payload=await res.json(); if(!res.ok)throw new Error(payload.error||"Could not start checkout.");
   const scriptOk=await loadRazorpay(); if(!scriptOk)throw new Error("Razorpay checkout could not be loaded. Please try again.");
   const rzp=new window.Razorpay!({key:payload.keyId,amount:payload.amount,currency:"INR",name:"KLEEVO",description:"KLEEVO order",order_id:payload.razorpayOrderId,prefill:{email:user.email},theme:{color:"#163b58"},handler:async(response:Record<string,string>)=>{
    const verify=await fetch("/.netlify/functions/verify-razorpay-payment",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({...response,orderId:payload.orderId})});
    const result=await verify.json();if(!verify.ok) {setMsg(result.error||"Payment verification failed. Contact support before retrying.");return;}clear();navigate("/account",{state:{success:"Payment verified. Your order has been placed."}});
   }});
   rzp.on("payment.failed",(response)=>setMsg(response.description||"Payment failed. No confirmed order was placed."));
   rzp.open();
  }catch(e){setMsg(e instanceof Error?e.message:"Checkout failed.");}finally{setBusy(false);}
 }
 return <section className="section cart-page"><span className="eyebrow">YOUR BAG</span><h1>Shopping cart</h1>{!lines.length?<div className="empty-state"><h2>Your cart is waiting for a little KLEEVO.</h2><p>Explore the collection and add your everyday essentials.</p><Link className="button-primary" to="/">Shop products</Link></div>:<div className="cart-layout"><div className="cart-lines">{lines.map(x=><div className="cart-line" key={x.product.id}><div className="cart-thumb"><div className="mini-bottle">K</div></div><div className="cart-description"><b>{x.product.name}</b><small>{x.product.size_ml} ml</small><strong>₹{x.product.price_inr}</strong></div><div className="qty-control"><button onClick={()=>setQty(x.product.id,x.quantity-1)}><Minus size={14}/></button><span>{x.quantity}</span><button onClick={()=>setQty(x.product.id,x.quantity+1)}><Plus size={14}/></button></div><button className="remove-button" onClick={()=>remove(x.product.id)} aria-label="Remove"><Trash2 size={17}/></button></div>)}</div><aside className="summary-card"><h2>Delivery address</h2>
 <div className="address-fields">
  <label>Full name<input required value={address.full_name} onChange={e=>setAddress({...address,full_name:e.target.value})} placeholder="Recipient name"/></label>
  <label>Mobile number<input required inputMode="numeric" maxLength={10} value={address.phone} onChange={e=>setAddress({...address,phone:e.target.value.replace(/\D/g,"").slice(0,10)})} placeholder="10-digit mobile number"/></label>
  <label>Address line 1<input required value={address.line1} onChange={e=>setAddress({...address,line1:e.target.value})} placeholder="House / street / area"/></label>
  <label>Address line 2 (optional)<input value={address.line2} onChange={e=>setAddress({...address,line2:e.target.value})} placeholder="Landmark"/></label>
  <div className="address-row"><label>City<input required value={address.city} onChange={e=>setAddress({...address,city:e.target.value})}/></label><label>State<input required value={address.state} onChange={e=>setAddress({...address,state:e.target.value})}/></label></div>
  <label>PIN code<input required inputMode="numeric" maxLength={6} value={address.pincode} onChange={e=>setAddress({...address,pincode:e.target.value.replace(/\D/g,"").slice(0,6)})} placeholder="6-digit PIN code"/></label>
 </div><h2>Order summary</h2><div><span>Subtotal</span><b>₹{total.toFixed(2)}</b></div><div><span>Shipping</span><b>FREE</b></div><hr/><div className="summary-total"><b>Total</b><b>₹{total.toFixed(2)}</b></div><button className="button-primary full" disabled={busy || !address.full_name.trim() || !/^\d{10}$/.test(address.phone) || !address.line1.trim() || !address.city.trim() || !address.state.trim() || !/^\d{6}$/.test(address.pincode)} onClick={checkout}>{busy?"Preparing checkout…":"Pay securely with Razorpay"}</button><small className="muted">Free delivery is shown for this starter configuration. Confirm your delivery coverage and shipping policy before launch.</small>{msg&&<div className="notice">{msg}</div>}</aside></div>}</section>;
}
function loadRazorpay(){return new Promise<boolean>(resolve=>{if(window.Razorpay){resolve(true);return;}const script=document.createElement("script");script.src="https://checkout.razorpay.com/v1/checkout.js";script.onload=()=>resolve(true);script.onerror=()=>resolve(false);document.body.appendChild(script);});}