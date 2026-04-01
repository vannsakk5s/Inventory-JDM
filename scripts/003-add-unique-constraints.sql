-- Add unique constraint on category name
ALTER TABLE categories ADD CONSTRAINT categories_name_unique UNIQUE (name);

-- Add unique constraint on product barcode (allowing nulls)
CREATE UNIQUE INDEX IF NOT EXISTS products_barcode_unique ON products(barcode) WHERE barcode IS NOT NULL;
