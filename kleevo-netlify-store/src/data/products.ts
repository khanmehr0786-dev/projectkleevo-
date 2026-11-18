import type { Product } from "../types";

export const fallbackProducts: Product[] = [
  { id: "dish-wash", sku: "KLV-DW-500", name: "KLEEVO Dish Wash", description: "Cuts through everyday grease for sparkling utensils.", size_ml: 500, price_inr: 100, stock_qty: 0, is_active: true, image_url: null, category: "Kitchen" },
  { id: "cloth-detergent", sku: "KLV-CD-500", name: "KLEEVO Cloth Detergent", description: "A fresh clean for everyday fabrics.", size_ml: 500, price_inr: 110, stock_qty: 0, is_active: true, image_url: null, category: "Laundry" },
  { id: "floor-wash", sku: "KLV-FW-500", name: "KLEEVO Floor Wash", description: "A refreshing clean for everyday floor care.", size_ml: 500, price_inr: 110, stock_qty: 0, is_active: true, image_url: null, category: "Home" },
  { id: "toilet-cleaner", sku: "KLV-TC-500", name: "KLEEVO Toilet Cleaner", description: "Targeted cleaning for toilet surfaces.", size_ml: 500, price_inr: 100, stock_qty: 0, is_active: true, image_url: null, category: "Bathroom" },
  { id: "bathroom-cleaner", sku: "KLV-BC-500", name: "KLEEVO Bathroom Cleaner", description: "Everyday bathroom surface cleaning.", size_ml: 500, price_inr: 100, stock_qty: 0, is_active: true, image_url: null, category: "Bathroom" },
  { id: "car-wash", sku: "KLV-CW-500", name: "KLEEVO Car Wash", description: "Car shampoo for your vehicle care routine. Shake well before use.", size_ml: 500, price_inr: 210, stock_qty: 0, is_active: true, image_url: null, category: "Vehicle" },
  { id: "glass-cleaner", sku: "KLV-GC-500", name: "KLEEVO Glass Cleaner", description: "Streak-free shine for glass surfaces.", size_ml: 500, price_inr: 110, stock_qty: 0, is_active: true, image_url: null, category: "Home" }
];