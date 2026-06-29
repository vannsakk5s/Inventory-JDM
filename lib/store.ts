export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  barcode: string;
  madeIn: string;
  costPrice: number;
  sellingPrice: number;
  stockIn: number;
  stockOut: number;
  stockLimit: number;
  createdAt: Date;
}

export interface Sale {
  id: string;
  products: { productId: string; quantity: number; price: number }[];
  total: number;
  createdAt: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: "in" | "out";
  quantity: number;
  createdAt: Date;
}

// Sample Categories
export const initialCategories: Category[] = [
  { id: "cat-1", name: "Electronics", description: "Electronic devices and accessories", createdAt: new Date("2024-01-01") },
  { id: "cat-2", name: "Clothing", description: "Apparel and fashion items", createdAt: new Date("2024-01-02") },
  { id: "cat-3", name: "Food & Beverages", description: "Consumable products", createdAt: new Date("2024-01-03") },
  { id: "cat-4", name: "Home & Garden", description: "Home improvement and garden supplies", createdAt: new Date("2024-01-04") },
  { id: "cat-5", name: "Sports", description: "Sports equipment and gear", createdAt: new Date("2024-01-05") },
];

// Sample Products
export const initialProducts: Product[] = [
  { id: "prod-1", name: "Wireless Headphones", categoryId: "cat-1", barcode: "8901234567890", madeIn: "China", costPrice: 45, sellingPrice: 79.99, stockIn: 150, stockOut: 85, stockLimit: 20, createdAt: new Date("2024-01-10") },
  { id: "prod-2", name: "Smart Watch", categoryId: "cat-1", barcode: "8901234567891", madeIn: "South Korea", costPrice: 120, sellingPrice: 199.99, stockIn: 80, stockOut: 65, stockLimit: 15, createdAt: new Date("2024-01-11") },
  { id: "prod-3", name: "Cotton T-Shirt", categoryId: "cat-2", barcode: "8901234567892", madeIn: "Bangladesh", costPrice: 8, sellingPrice: 24.99, stockIn: 500, stockOut: 420, stockLimit: 50, createdAt: new Date("2024-01-12") },
  { id: "prod-4", name: "Running Shoes", categoryId: "cat-5", barcode: "8901234567893", madeIn: "Vietnam", costPrice: 35, sellingPrice: 89.99, stockIn: 200, stockOut: 175, stockLimit: 30, createdAt: new Date("2024-01-13") },
  { id: "prod-5", name: "Organic Coffee Beans", categoryId: "cat-3", barcode: "8901234567894", madeIn: "Colombia", costPrice: 12, sellingPrice: 29.99, stockIn: 300, stockOut: 285, stockLimit: 40, createdAt: new Date("2024-01-14") },
  { id: "prod-6", name: "Garden Hose 50ft", categoryId: "cat-4", barcode: "8901234567895", madeIn: "USA", costPrice: 18, sellingPrice: 39.99, stockIn: 100, stockOut: 72, stockLimit: 15, createdAt: new Date("2024-01-15") },
  { id: "prod-7", name: "Bluetooth Speaker", categoryId: "cat-1", barcode: "8901234567896", madeIn: "China", costPrice: 25, sellingPrice: 59.99, stockIn: 120, stockOut: 95, stockLimit: 20, createdAt: new Date("2024-01-16") },
  { id: "prod-8", name: "Yoga Mat", categoryId: "cat-5", barcode: "8901234567897", madeIn: "Taiwan", costPrice: 15, sellingPrice: 34.99, stockIn: 180, stockOut: 165, stockLimit: 25, createdAt: new Date("2024-01-17") },
  { id: "prod-9", name: "Denim Jeans", categoryId: "cat-2", barcode: "8901234567898", madeIn: "Mexico", costPrice: 22, sellingPrice: 59.99, stockIn: 250, stockOut: 210, stockLimit: 35, createdAt: new Date("2024-01-18") },
  { id: "prod-10", name: "LED Desk Lamp", categoryId: "cat-4", barcode: "8901234567899", madeIn: "China", costPrice: 20, sellingPrice: 44.99, stockIn: 90, stockOut: 78, stockLimit: 15, createdAt: new Date("2024-01-19") },
  { id: "prod-11", name: "Protein Powder", categoryId: "cat-3", barcode: "8901234567900", madeIn: "USA", costPrice: 28, sellingPrice: 54.99, stockIn: 150, stockOut: 142, stockLimit: 20, createdAt: new Date("2024-01-20") },
  { id: "prod-12", name: "Wireless Mouse", categoryId: "cat-1", barcode: "8901234567901", madeIn: "China", costPrice: 12, sellingPrice: 29.99, stockIn: 200, stockOut: 198, stockLimit: 30, createdAt: new Date("2024-01-21") },
];

// Sample Sales Data
export const initialSales: Sale[] = [
  { id: "sale-1", products: [{ productId: "prod-1", quantity: 2, price: 79.99 }, { productId: "prod-7", quantity: 1, price: 59.99 }], total: 219.97, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: "sale-2", products: [{ productId: "prod-3", quantity: 5, price: 24.99 }], total: 124.95, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: "sale-3", products: [{ productId: "prod-2", quantity: 1, price: 199.99 }, { productId: "prod-8", quantity: 2, price: 34.99 }], total: 269.97, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { id: "sale-4", products: [{ productId: "prod-4", quantity: 3, price: 89.99 }], total: 269.97, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { id: "sale-5", products: [{ productId: "prod-5", quantity: 4, price: 29.99 }, { productId: "prod-11", quantity: 2, price: 54.99 }], total: 229.94, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  { id: "sale-6", products: [{ productId: "prod-6", quantity: 2, price: 39.99 }], total: 79.98, createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
  { id: "sale-7", products: [{ productId: "prod-9", quantity: 3, price: 59.99 }, { productId: "prod-3", quantity: 2, price: 24.99 }], total: 229.95, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  { id: "sale-8", products: [{ productId: "prod-10", quantity: 1, price: 44.99 }], total: 44.99, createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
  { id: "sale-9", products: [{ productId: "prod-1", quantity: 1, price: 79.99 }, { productId: "prod-12", quantity: 2, price: 29.99 }], total: 139.97, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  { id: "sale-10", products: [{ productId: "prod-2", quantity: 2, price: 199.99 }], total: 399.98, createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
  { id: "sale-11", products: [{ productId: "prod-4", quantity: 5, price: 89.99 }], total: 449.95, createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) },
  { id: "sale-12", products: [{ productId: "prod-7", quantity: 3, price: 59.99 }], total: 179.97, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
];

// Sample Stock Movements
export const initialStockMovements: StockMovement[] = [
  { id: "mov-1", productId: "prod-1", type: "in", quantity: 50, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: "mov-2", productId: "prod-1", type: "out", quantity: 10, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: "mov-3", productId: "prod-3", type: "out", quantity: 25, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { id: "mov-4", productId: "prod-5", type: "in", quantity: 100, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  { id: "mov-5", productId: "prod-12", type: "out", quantity: 15, createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
  { id: "mov-6", productId: "prod-8", type: "in", quantity: 30, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  { id: "mov-7", productId: "prod-11", type: "out", quantity: 20, createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
  { id: "mov-8", productId: "prod-2", type: "in", quantity: 25, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
];

// Helper functions
export function getCurrentStock(product: Product): number {
  return product.stockIn - product.stockOut;
}

export function isLowStock(product: Product): boolean {
  return getCurrentStock(product) <= product.stockLimit;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
