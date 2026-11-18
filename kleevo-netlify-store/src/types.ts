export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  size_ml: number;
  price_inr: number;
  stock_qty: number;
  is_active: boolean;
  image_url: string | null;
  category: string | null;
};

export type OrderItem = {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
};

export type Order = {
  id: string;
  user_id: string;
  status: string;
  payment_status: string;
  total_inr: number;
  created_at: string;
  items: OrderItem[];
};