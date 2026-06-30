import postgres from "postgres"

export const sql = postgres(process.env.DATABASE_URL!)

export type Category = {
  id: number
  name: string
  created_at: string
}

export type Product = {
  id: number
  name: string
  barcode: string
  category_id: number
  category_name?: string
  country_of_origin: string
  cost_price: number
  selling_price: number
  current_stock: number
  stock_limit: number
  created_at: string
  updated_at: string
}

export type Sale = {
  id: number
  total_amount: number
  tax_amount: number
  created_at: string
  items?: SaleItem[]
}

export type SaleItem = {
  id: number
  sale_id: number
  product_id: number
  product_name?: string
  quantity: number
  unit_price: number
  total_price: number
}

export type StockMovement = {
  id: number
  product_id: number
  product_name?: string
  type: "in" | "out"
  quantity: number
  notes: string | null
  created_at: string
}
