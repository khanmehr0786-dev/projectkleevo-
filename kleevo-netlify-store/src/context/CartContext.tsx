import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Product } from "../types";
type CartLine = { product: Product; quantity: number };
type CartValue = { lines: CartLine[]; add: (p: Product) => void; remove: (id: string) => void; setQty: (id: string, qty: number) => void; clear: () => void; total: number; count: number };
const CartContext = createContext<CartValue | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const add = (p: Product) => setLines(old => old.some(x => x.product.id === p.id) ? old.map(x => x.product.id === p.id ? { ...x, quantity: x.quantity + 1 } : x) : [...old, { product: p, quantity: 1 }]);
  const remove = (id: string) => setLines(old => old.filter(x => x.product.id !== id));
  const setQty = (id: string, quantity: number) => setLines(old => old.map(x => x.product.id === id ? { ...x, quantity: Math.max(1, quantity) } : x));
  const total = lines.reduce((sum, x) => sum + Number(x.product.price_inr) * x.quantity, 0);
  const value = useMemo(() => ({ lines, add, remove, setQty, clear: () => setLines([]), total, count: lines.reduce((s,x)=>s+x.quantity,0) }), [lines, total]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const v = useContext(CartContext); if (!v) throw new Error("useCart must be inside CartProvider"); return v; }