import postgres from "postgres"

const sql = postgres("postgresql://inventory_user:inventory_password@localhost:5432/inventory_db")

async function test() {
  try {
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products'
    `
    console.log(result)
  } catch (err) {
    console.error(err)
  }
}

test()
