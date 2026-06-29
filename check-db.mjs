import postgres from "postgres"

const sql = postgres("postgresql://inventory_user:inventory_password@localhost:5432/inventory_db")

async function check() {
  try {
    const columns = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'products'
    `
    console.log("Columns:", columns.map(c => c.column_name))
  } catch (err) {
    console.error(err)
  } finally {
    process.exit(0)
  }
}

check()
