import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { Layout } from "./components/Layout";
import { RequireAdmin, RequireUser } from "./components/Protected";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Cart } from "./pages/Cart";
import { Account } from "./pages/Account";
import { Admin } from "./pages/Admin";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><BrowserRouter><AuthProvider><CartProvider><Routes><Route element={<Layout/>}><Route index element={<Home/>}/><Route path="login" element={<Login/>}/><Route path="admin/login" element={<Login admin/>}/><Route path="cart" element={<Cart/>}/><Route path="account" element={<RequireUser><Account/></RequireUser>}/><Route path="admin" element={<RequireAdmin><Admin/></RequireAdmin>}/><Route path="*" element={<Home/>}/></Route></Routes></CartProvider></AuthProvider></BrowserRouter></React.StrictMode>
);