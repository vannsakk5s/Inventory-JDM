import useSWR, { mutate } from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Types based on database schema
export interface Category {
  id: string
  name: string
  description: string | null
  created_at: string
  product_count?: number
}

export interface Product {
  id: string
  name: string
  category_id: string | null
  category_name?: string
  barcode: string | null
  made_in: string | null
  cost_price: number
  selling_price: number
  stock_in: number
  stock_out: number
  stock_limit: number
  current_stock?: number
  image_url: string | null
  created_at: string
}

export interface Sale {
  id: string
  total: number
  created_at: string
  items?: {
    id: string
    product_id: string
    product_name: string
    quantity: number
    price: number
  }[]
}

export interface StockMovement {
  id: string
  product_id: string
  product_name?: string
  type: "in" | "out"
  quantity: number
  created_at: string
}

export interface DashboardData {
  summary: {
    total_products: number
    total_revenue: number
    today_revenue: number
    stock_in: number
    stock_out: number
    low_stock_count: number
  }
  sales_data: { date: string; revenue: number }[]
  stock_data: { date: string; type: string; quantity: number }[]
  recent_sales: Sale[]
  low_stock_products: Product[]
}

// Hooks
export function useCategories() {
  const { data, error, isLoading } = useSWR<Category[]>("/api/categories", fetcher)
  return {
    categories: data || [],
    isLoading,
    isError: error,
  }
}

export function useProducts(options?: { category?: string; lowStock?: boolean; search?: string }) {
  const params = new URLSearchParams()
  if (options?.category) params.set("category", options.category)
  if (options?.lowStock) params.set("lowStock", "true")
  if (options?.search) params.set("search", options.search)
  
  const url = `/api/products${params.toString() ? `?${params.toString()}` : ""}`
  const { data, error, isLoading } = useSWR<Product[]>(url, fetcher)
  
  return {
    products: data || [],
    isLoading,
    isError: error,
  }
}

export function useSales(days: number = 7) {
  const { data, error, isLoading } = useSWR<Sale[]>(`/api/sales?days=${days}`, fetcher)
  return {
    sales: data || [],
    isLoading,
    isError: error,
  }
}

export function useStockMovements(days: number = 7, type?: string) {
  const params = new URLSearchParams({ days: days.toString() })
  if (type) params.set("type", type)
  
  const { data, error, isLoading } = useSWR<StockMovement[]>(`/api/stock-movements?${params.toString()}`, fetcher)
  return {
    movements: data || [],
    isLoading,
    isError: error,
  }
}

export function useDashboard() {
  const { data, error, isLoading } = useSWR<DashboardData>("/api/dashboard", fetcher)
  return {
    data,
    isLoading,
    isError: error,
  }
}

// Mutations
export async function createCategory(data: { name: string; description?: string }) {
  const res = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create category")
  mutate("/api/categories")
  return res.json()
}

export async function updateCategory(id: string, data: { name?: string; description?: string }) {
  const res = await fetch(`/api/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update category")
  mutate("/api/categories")
  return res.json()
}

export async function deleteCategory(id: string) {
  const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete category")
  mutate("/api/categories")
}

export async function createProduct(data: Partial<Product>) {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create product")
  mutate((key: string) => key.startsWith("/api/products"))
  mutate("/api/dashboard")
  return res.json()
}

export async function updateProduct(id: string, data: Partial<Product>) {
  const res = await fetch(`/api/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update product")
  mutate((key: string) => key.startsWith("/api/products"))
  mutate("/api/dashboard")
  return res.json()
}

export async function deleteProduct(id: string) {
  const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete product")
  mutate((key: string) => key.startsWith("/api/products"))
  mutate("/api/dashboard")
}

export async function restockProduct(id: string, quantity: number, reason?: string) {
  const res = await fetch(`/api/products/${id}/restock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity, reason }),
  })
  if (!res.ok) throw new Error("Failed to restock product")
  mutate((key: string) => key.startsWith("/api/products"))
  mutate((key: string) => key.startsWith("/api/stock-movements"))
  mutate("/api/dashboard")
  return res.json()
}

export async function adjustStock(id: string, quantity: number, reason?: string) {
  const res = await fetch(`/api/products/${id}/adjust-stock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity, reason }),
  })
  if (!res.ok) throw new Error("Failed to adjust stock")
  mutate((key: string) => key.startsWith("/api/products"))
  mutate((key: string) => key.startsWith("/api/stock-movements"))
  mutate("/api/dashboard")
  return res.json()
}

export async function createSale(items: { product_id: string; quantity: number; price: number }[], total: number) {
  const res = await fetch("/api/sales", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, total }),
  })
  if (!res.ok) throw new Error("Failed to create sale")
  mutate((key: string) => key.startsWith("/api/sales"))
  mutate((key: string) => key.startsWith("/api/products"))
  mutate((key: string) => key.startsWith("/api/stock-movements"))
  mutate("/api/dashboard")
  return res.json()
}

// Utility functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function getCurrentStock(product: Product): number {
  return product.current_stock ?? (product.stock_in - product.stock_out)
}

export function isLowStock(product: Product): boolean {
  return getCurrentStock(product) <= product.stock_limit
}
