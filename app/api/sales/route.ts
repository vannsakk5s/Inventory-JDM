import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") || "7")
    
    const sales = await sql`
      SELECT 
        s.*,
        json_agg(
          json_build_object(
            'id', si.id,
            'product_id', si.product_id,
            'product_name', p.name,
            'quantity', si.quantity,
            'price', si.price
          )
        ) as items
      FROM sales s
      LEFT JOIN sale_items si ON si.sale_id = s.id
      LEFT JOIN products p ON p.id = si.product_id
      WHERE s.created_at >= NOW() - INTERVAL '1 day' * ${days}
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `
    
    return NextResponse.json(sales)
  } catch (error) {
    console.error("Failed to fetch sales:", error)
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, total } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 })
    }

    // Create the sale
    const [sale] = await sql`
      INSERT INTO sales (total)
      VALUES (${total || 0})
      RETURNING *
    `

    // Add sale items and update product stock
    for (const item of items) {
      await sql`
        INSERT INTO sale_items (sale_id, product_id, quantity, price)
        VALUES (${sale.id}, ${item.product_id}, ${item.quantity}, ${item.price})
      `

      // Update product stock_out
      await sql`
        UPDATE products
        SET stock_out = stock_out + ${item.quantity}
        WHERE id = ${item.product_id}
      `

      // Record stock movement
      await sql`
        INSERT INTO stock_movements (product_id, type, quantity)
        VALUES (${item.product_id}, 'out', ${item.quantity})
      `
    }

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    console.error("Failed to create sale:", error)
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 })
  }
}
