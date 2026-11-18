import { Link, NavLink, Outlet } from "react-router-dom";
import { ShoppingBag, UserRound, Menu, ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
export function Layout() {
  const { user, role, signOut } = useAuth(); const { count } = useCart();
  return <><div className="topline">Manufactured in India by S.M ENTERPRISES · Everyday cleaning, elevated</div>
    <header className="header"><Link to="/" className="brand"><span className="brand-mark">K</span><span>KLEEVO<small>BY S.M ENTERPRISES</small></span></Link>
      <nav><NavLink to="/">Home</NavLink><a href="/#products">Shop</a><a href="/#about">About us</a><a href="/#contact">Contact</a></nav>
      <div className="header-actions"><Link className="icon-link" to="/account" aria-label="Account"><UserRound size={19}/></Link><Link className="cart-link" to="/cart"><ShoppingBag size={18}/> Cart <b>{count}</b></Link>{user ? <button className="text-button" onClick={() => void signOut()} title="Sign out"><LogOut size={17}/></button> : <Link className="login-link" to="/login">Sign in</Link>}{role === "admin" && <Link to="/admin" className="admin-shortcut"><ShieldCheck size={16}/> Admin</Link>}</div>
    </header><main><Outlet /></main><footer id="contact"><div><div className="brand footer-brand"><span className="brand-mark">K</span><span>KLEEVO<small>BY S.M ENTERPRISES</small></span></div><p>Thoughtful cleaning essentials for everyday spaces.</p></div><div><b>Explore</b><a href="/#products">Products</a><Link to="/account">My account</Link><Link to="/admin/login">Admin access</Link></div><div><b>Contact</b><span>S.M ENTERPRISES</span><a href="mailto:kleevo.inn@gmail.com">kleevo.inn@gmail.com</a><a href="tel:9632583912">9632583912</a><span>Instagram: @kleevo.in</span></div><small className="copyright">© {new Date().getFullYear()} KLEEVO · All rights reserved.</small></footer></>;
}