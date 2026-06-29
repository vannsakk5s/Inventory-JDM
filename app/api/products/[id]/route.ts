import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const [product] = await sql`
      SELECT 
        p.*,
        p.name_en as name,
        c.name as category_name,
        (p.stock_in - p.stock_out) as current_stock
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = ${id}
    `
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    console.error("Failed to fetch product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name_en, name_kh, category_id, barcode, made_in, cost_price, selling_price, stock_in, stock_limit, image_url } = body

    // Get current product to calculate stock change
    const [currentProduct] = await sql`SELECT * FROM products WHERE id = ${id}`
    if (!currentProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const [product] = await sql`
      UPDATE products
      SET 
        name_en = CASE WHEN ${name_en} IS NOT NULL THEN ${name_en || null} ELSE name_en END,
        name_kh = CASE WHEN ${name_kh !== undefined ? name_kh : null}::text IS NOT NULL THEN ${name_kh || null} ELSE name_kh END,
        category_id = COALESCE(${category_id || null}, category_id),
        barcode = COALESCE(${barcode || null}, barcode),
        made_in = COALESCE(${made_in || null}, made_in),
        cost_price = COALESCE(${cost_price}, cost_price),
        selling_price = COALESCE(${selling_price}, selling_price),
        stock_in = COALESCE(${stock_in}, stock_in),
        stock_limit = COALESCE(${stock_limit}, stock_limit),
        image_url = COALESCE(${image_url || null}, image_url)
      WHERE id = ${id}
      RETURNING *, name_en as name
    `

    // Record stock movement if stock changed
    if (stock_in !== undefined && stock_in !== currentProduct.stock_in) {
      const difference = stock_in - currentProduct.stock_in
      if (difference > 0) {
        await sql`
          INSERT INTO stock_movements (product_id, type, quantity)
          VALUES (${id}, 'in', ${difference})
        `
      } else if (difference < 0) {
        await sql`
          INSERT INTO stock_movements (product_id, type, quantity)
          VALUES (${id}, 'out', ${Math.abs(difference)})
        `
      }
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Failed to update product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const [product] = await sql`
      DELETE FROM products WHERE id = ${id} RETURNING *
    `
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json({ message: "Product deleted" })
  } catch (error) {
    console.error("Failed to delete product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
