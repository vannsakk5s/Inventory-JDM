import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const lowStock = searchParams.get("lowStock")
    const search = searchParams.get("search")

    let products
    
    if (lowStock === "true") {
      products = await sql`
        SELECT 
          p.*,
          c.name as category_name,
          (p.stock_in - p.stock_out) as current_stock
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE (p.stock_in - p.stock_out) <= p.stock_limit
        ORDER BY (p.stock_in - p.stock_out) ASC
      `
    } else if (category) {
      products = await sql`
        SELECT 
          p.*,
          c.name as category_name,
          (p.stock_in - p.stock_out) as current_stock
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.category_id = ${category}
        ORDER BY p.name
      `
    } else if (search) {
      const searchTerm = `%${search}%`
      products = await sql`
        SELECT 
          p.*,
          c.name as category_name,
          (p.stock_in - p.stock_out) as current_stock
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.name ILIKE ${searchTerm} OR p.barcode ILIKE ${searchTerm}
        ORDER BY p.name
      `
    } else {
      products = await sql`
        SELECT 
          p.*,
          c.name as category_name,
          (p.stock_in - p.stock_out) as current_stock
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        ORDER BY p.name
      `
    }
    
    return NextResponse.json(products)
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, category_id, barcode, made_in, cost_price, selling_price, stock_in, stock_limit, image_url } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const [product] = await sql`
      INSERT INTO products (name, category_id, barcode, made_in, cost_price, selling_price, stock_in, stock_out, stock_limit, image_url)
      VALUES (
        ${name}, 
        ${category_id || null}, 
        ${barcode || null}, 
        ${made_in || null}, 
        ${cost_price || 0}, 
        ${selling_price || 0}, 
        ${stock_in || 0},
        0,
        ${stock_limit || 10},
        ${image_url || null}
      )
      RETURNING *
    `

    // Record the initial stock movement if there's stock
    if (stock_in && stock_in > 0) {
      await sql`
        INSERT INTO stock_movements (product_id, type, quantity)
        VALUES (${product.id}, 'in', ${stock_in})
      `
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Failed to create product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
