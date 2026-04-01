import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { quantity, reason } = await request.json()

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "Valid quantity is required" },
        { status: 400 }
      )
    }

    // Check current stock first
    const [product] = await sql`
      SELECT stock_in, stock_out FROM products WHERE id = ${id}
    `

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    const currentStock = product.stock_in - product.stock_out

    if (quantity > currentStock) {
      return NextResponse.json(
        { error: "Cannot remove more stock than available" },
        { status: 400 }
      )
    }

    // Update product stock_out
    await sql`
      UPDATE products 
      SET stock_out = stock_out + ${quantity}
      WHERE id = ${id}
    `

    // Record stock movement
    await sql`
      INSERT INTO stock_movements (product_id, type, quantity)
      VALUES (${id}, 'out', ${quantity})
    `

    // Get updated product
    const [updated] = await sql`
      SELECT p.*, c.name as category_name,
             (p.stock_in - p.stock_out) as current_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ${id}
    `

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error adjusting stock:", error)
    return NextResponse.json(
      { error: "Failed to adjust stock" },
      { status: 500 }
    )
  }
}
