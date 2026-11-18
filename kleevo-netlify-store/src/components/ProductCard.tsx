import { ShoppingCart, ArrowUpRight } from "lucide-react";
import type { Product } from "../types";
import { useCart } from "../context/CartContext";
export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  return <article className="product-card"><div className="product-image">{product.image_url ? <img src={product.image_url} alt={product.name}/> : <div className="bottle-art"><span>KLEEVO</span><i>{product.name.replace("KLEEVO ","")}</i><small>{product.size_ml} ml</small></div>}<span className="product-tag">{product.category ?? "Home care"}</span></div><div className="product-info"><div><h3>{product.name}</h3><p>{product.description}</p></div><div className="product-buy"><div><b>₹{Number(product.price_inr).toFixed(0)}</b><small>{product.size_ml} ml</small></div><button onClick={() => add(product)} aria-label={`Add ${product.name} to cart`}><ShoppingCart size={17}/> Add</button></div></div></article>;
}