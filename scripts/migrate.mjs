import postgres from "postgres";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  try {
    const envPath = path.join(__dirname, "..", ".env.local");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      envContent.split("\n").forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          let value = match[2] || "";
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          process.env[match[1]] = value;
        }
      });
      databaseUrl = process.env.DATABASE_URL;
    }
  } catch (err) {
    console.error("Failed to load .env.local:", err);
  }
}

if (!databaseUrl) {
  console.warn("WARNING: DATABASE_URL is not set. Skipping migrations.");
  process.exit(0);
}

const sql = postgres(databaseUrl, { ssl: "require" });

async function runMigrations() {
  try {
    // 1. Create migrations table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        run_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 2. Check if the 'products' table already exists (from an older manually-created state)
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'products';
    `;
    const productsTableExists = tables.length > 0;

    // 3. Get already run migrations
    const runMigrationsList = await sql`SELECT name FROM migrations`;
    const runMigrationNames = new Set(runMigrationsList.map(m => m.name));

    // If 'products' table exists, but we haven't recorded the first migrations,
    // we should seed the migrations table so we don't try to recreate them.
    if (productsTableExists && !runMigrationNames.has("001-create-tables.sql")) {
      console.log("Existing tables detected. Seeding migration history...");
      await sql`
        INSERT INTO migrations (name) VALUES 
        ('001-create-tables.sql'),
        ('002-seed-data.sql'),
        ('003-add-unique-constraints.sql')
        ON CONFLICT (name) DO NOTHING;
      `;
      // Update our local set
      runMigrationNames.add("001-create-tables.sql");
      runMigrationNames.add("002-seed-data.sql");
      runMigrationNames.add("003-add-unique-constraints.sql");
    }

    // 4. Read migration directory
    const migrationsDir = path.join(__dirname);
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith(".sql"))
      .sort(); // Sort so they run in order (001, 002, 003, 004...)

    for (const file of files) {
      if (runMigrationNames.has(file)) {
        console.log(`Migration ${file} is already applied.`);
        continue;
      }

      console.log(`Applying migration ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const query = fs.readFileSync(filePath, "utf-8");

      // Execute migration
      await sql.unsafe(query);

      // Record migration
      await sql`
        INSERT INTO migrations (name) VALUES (${file});
      `;
      console.log(`Successfully applied ${file}.`);
    }

    console.log("All migrations are up to date!");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigrations();
