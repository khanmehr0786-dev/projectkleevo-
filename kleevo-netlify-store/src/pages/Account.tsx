import { useEffect,useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import type { Order } from "../types";
export function Account(){
 const {user}=useAuth();const [orders,setOrders]=useState<Order[]>([]);const [loading,setLoading]=useState(true);const location=useLocation();const success=(location.state as {success?:string}|null)?.success;
 useEffect(()=>{if(!user)return;supabase.from("orders").select("id,user_id,status,payment_status,total_inr,created_at,items").eq("user_id",user.id).order("created_at",{ascending:false}).then(({data})=>{setOrders((data??[]) as Order[]);setLoading(false);});},[user]);
 return <section className="section account-page"><span className="eyebrow">YOUR KLEEVO ACCOUNT</span><h1>Hello{user?.user_metadata?.full_name?`, ${user.user_metadata.full_name}`:""}.</h1><p className="muted">{user?.email}</p>{success&&<div className="success-notice">{success}</div>}<h2 className="subheading">Your orders</h2>{loading?<p>Loading orders…</p>:orders.length===0?<div className="empty-state"><h3>No orders yet</h3><p>Your KLEEVO orders will appear here after checkout.</p></div>:<div className="orders-list">{orders.map(o=><article className="order-card" key={o.id}><div className="order-head"><b>Order #{o.id.slice(0,8).toUpperCase()}</b><span>{new Date(o.created_at).toLocaleDateString("en-IN")}</span></div><div className="order-meta"><span>Status: <b>{o.status}</b></span><span>Payment: <b>{o.payment_status}</b></span><strong>₹{Number(o.total_inr).toFixed(2)}</strong></div><ul>{o.items?.map((i,n)=><li key={n}>{i.name} × {i.quantity}</li>)}</ul></article>)}</div>}</section>;
}