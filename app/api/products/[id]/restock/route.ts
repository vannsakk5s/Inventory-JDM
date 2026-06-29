import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!)

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { quantity } = body

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be positive" }, { status: 400 })
    }

    // Update product stock
    const [product] = await sql`
      UPDATE products
      SET stock_in = stock_in + ${quantity}
      WHERE id = ${id}
      RETURNING *
    `

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Record stock movement
    await sql`
      INSERT INTO stock_movements (product_id, type, quantity)
      VALUES (${id}, 'in', ${quantity})
    `

    return NextResponse.json(product)
  } catch (error) {
    console.error("Failed to restock product:", error)
    return NextResponse.json({ error: "Failed to restock product" }, { status: 500 })
  }
}
