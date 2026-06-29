import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Get total products
    const [{ count: total_products }] = await sql`SELECT COUNT(*)::int as count FROM products`
    
    // Get total revenue (all time)
    const [{ sum: total_revenue }] = await sql`SELECT COALESCE(SUM(total), 0) as sum FROM sales`
    
    // Get today's revenue
    const [{ sum: today_revenue }] = await sql`
      SELECT COALESCE(SUM(total), 0) as sum FROM sales
      WHERE DATE(created_at) = CURRENT_DATE
    `
    
    // Get stock in (last 7 days)
    const [{ sum: stock_in }] = await sql`
      SELECT COALESCE(SUM(quantity), 0) as sum FROM stock_movements
      WHERE type = 'in' AND created_at >= NOW() - INTERVAL '7 days'
    `
    
    // Get stock out (last 7 days)
    const [{ sum: stock_out }] = await sql`
      SELECT COALESCE(SUM(quantity), 0) as sum FROM stock_movements
      WHERE type = 'out' AND created_at >= NOW() - INTERVAL '7 days'
    `
    
    // Get low stock count
    const [{ count: low_stock_count }] = await sql`
      SELECT COUNT(*)::int as count FROM products
      WHERE (stock_in - stock_out) <= stock_limit
    `
    
    // Get sales data for last 7 days
    const sales_data = await sql`
      SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(total), 0) as revenue
      FROM sales
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `
    
    // Get stock movement data for last 7 days
    const stock_data = await sql`
      SELECT 
        DATE(created_at) as date,
        type,
        COALESCE(SUM(quantity), 0) as quantity
      FROM stock_movements
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at), type
      ORDER BY DATE(created_at)
    `
    
    // Get recent sales
    const recent_sales = await sql`
      SELECT 
        s.*,
        json_agg(
          json_build_object(
            'product_name', p.name_en,
            'product_name_kh', p.name_kh,
            'quantity', si.quantity
          )
        ) as items
      FROM sales s
      LEFT JOIN sale_items si ON si.sale_id = s.id
      LEFT JOIN products p ON p.id = si.product_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT 5
    `
    
    // Get low stock products
    const low_stock_products = await sql`
      SELECT 
        p.*,
        c.name as category_name,
        (p.stock_in - p.stock_out) as current_stock
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE (p.stock_in - p.stock_out) <= p.stock_limit
      ORDER BY (p.stock_in - p.stock_out) ASC
      LIMIT 5
    `
    
    return NextResponse.json({
      summary: {
        total_products,
        total_revenue: parseFloat(total_revenue) || 0,
        today_revenue: parseFloat(today_revenue) || 0,
        stock_in: parseInt(stock_in) || 0,
        stock_out: parseInt(stock_out) || 0,
        low_stock_count
      },
      sales_data,
      stock_data,
      recent_sales,
      low_stock_products
    })
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
