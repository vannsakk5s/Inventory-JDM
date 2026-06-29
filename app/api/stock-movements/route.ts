import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") || "7")
    const type = searchParams.get("type")
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    
    let timeFilter;
    if (from && to) {
      timeFilter = sql`sm.created_at >= ${from}::timestamp AND sm.created_at <= ${to}::timestamp + interval '1 day'`
    } else {
      timeFilter = sql`sm.created_at >= NOW() - INTERVAL '1 day' * ${days}`
    }
    
    let movements
    
    if (type) {
      movements = await sql`
        SELECT 
          sm.*,
          p.name_en as product_name
        FROM stock_movements sm
        LEFT JOIN products p ON p.id = sm.product_id
        WHERE ${timeFilter}
          AND sm.type = ${type}
        ORDER BY sm.created_at DESC
      `
    } else {
      movements = await sql`
        SELECT 
          sm.*,
          p.name_en as product_name
        FROM stock_movements sm
        LEFT JOIN products p ON p.id = sm.product_id
        WHERE ${timeFilter}
        ORDER BY sm.created_at DESC
      `
    }
    
    return NextResponse.json(movements)
  } catch (error) {
    console.error("Failed to fetch stock movements:", error)
    return NextResponse.json({ error: "Failed to fetch stock movements" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { product_id, type, quantity } = body

    if (!product_id || !type || !quantity) {
      return NextResponse.json({ error: "product_id, type, and quantity are required" }, { status: 400 })
    }

    if (!["in", "out"].includes(type)) {
      return NextResponse.json({ error: "Type must be 'in' or 'out'" }, { status: 400 })
    }

    // Record stock movement
    const [movement] = await sql`
      INSERT INTO stock_movements (product_id, type, quantity)
      VALUES (${product_id}, ${type}, ${quantity})
      RETURNING *
    `

    // Update product stock
    if (type === "in") {
      await sql`
        UPDATE products
        SET stock_in = stock_in + ${quantity}
        WHERE id = ${product_id}
      `
    } else {
      await sql`
        UPDATE products
        SET stock_out = stock_out + ${quantity}
        WHERE id = ${product_id}
      `
    }

    return NextResponse.json(movement, { status: 201 })
  } catch (error) {
    console.error("Failed to create stock movement:", error)
    return NextResponse.json({ error: "Failed to create stock movement" }, { status: 500 })
  }
}
