-- Seed categories (simple inserts, will skip if already exists via unique constraint)
INSERT INTO categories (name) VALUES ('Electronics') ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name) VALUES ('Clothing') ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name) VALUES ('Food & Beverages') ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name) VALUES ('Home & Garden') ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name) VALUES ('Sports & Outdoors') ON CONFLICT (name) DO NOTHING;

-- Seed products (using subqueries for category lookup)
INSERT INTO products (name, barcode, category_id, made_in, cost_price, selling_price, stock_in, stock_out, stock_limit)
VALUES 
  ('iPhone 15 Pro', 'IP15PRO001', (SELECT id FROM categories WHERE name = 'Electronics'), 'China', 899.00, 1199.00, 45, 0, 10),
  ('Samsung Galaxy S24', 'SGS24001', (SELECT id FROM categories WHERE name = 'Electronics'), 'South Korea', 749.00, 999.00, 32, 0, 10),
  ('Sony WH-1000XM5', 'SNYWH5001', (SELECT id FROM categories WHERE name = 'Electronics'), 'Japan', 279.00, 399.00, 28, 0, 5),
  ('MacBook Air M3', 'MBAM3001', (SELECT id FROM categories WHERE name = 'Electronics'), 'China', 999.00, 1299.00, 15, 0, 5),
  ('Nike Air Max', 'NKAM001', (SELECT id FROM categories WHERE name = 'Clothing'), 'Vietnam', 89.00, 179.00, 120, 0, 20),
  ('Levi''s 501 Jeans', 'LV501001', (SELECT id FROM categories WHERE name = 'Clothing'), 'Mexico', 45.00, 89.00, 85, 0, 15),
  ('Adidas Ultraboost', 'ADUB001', (SELECT id FROM categories WHERE name = 'Clothing'), 'Indonesia', 120.00, 189.00, 65, 0, 10),
  ('Organic Coffee Beans', 'OCB001', (SELECT id FROM categories WHERE name = 'Food & Beverages'), 'Colombia', 12.00, 24.99, 200, 0, 50),
  ('Premium Green Tea', 'PGT001', (SELECT id FROM categories WHERE name = 'Food & Beverages'), 'Japan', 8.00, 18.99, 150, 0, 30),
  ('Craft Beer 6-Pack', 'CB6P001', (SELECT id FROM categories WHERE name = 'Food & Beverages'), 'USA', 9.00, 15.99, 80, 0, 20),
  ('Garden Tool Set', 'GTS001', (SELECT id FROM categories WHERE name = 'Home & Garden'), 'Germany', 35.00, 79.99, 42, 0, 10),
  ('Indoor Plant Pot', 'IPP001', (SELECT id FROM categories WHERE name = 'Home & Garden'), 'Italy', 15.00, 34.99, 95, 0, 20),
  ('LED String Lights', 'LSL001', (SELECT id FROM categories WHERE name = 'Home & Garden'), 'China', 8.00, 19.99, 180, 0, 30),
  ('Yoga Mat Premium', 'YMP001', (SELECT id FROM categories WHERE name = 'Sports & Outdoors'), 'Taiwan', 25.00, 59.99, 70, 0, 15),
  ('Camping Tent 4P', 'CT4P001', (SELECT id FROM categories WHERE name = 'Sports & Outdoors'), 'China', 89.00, 199.99, 25, 0, 5),
  ('Running Shorts', 'RS001', (SELECT id FROM categories WHERE name = 'Sports & Outdoors'), 'Vietnam', 18.00, 39.99, 110, 0, 20),
  ('Wireless Earbuds', 'WE001', (SELECT id FROM categories WHERE name = 'Electronics'), 'China', 45.00, 89.99, 8, 0, 15),
  ('Smart Watch Band', 'SWB001', (SELECT id FROM categories WHERE name = 'Electronics'), 'China', 12.00, 29.99, 3, 0, 10);

-- Add some stock movements for history
INSERT INTO stock_movements (product_id, type, quantity)
SELECT p.id, 'in', p.stock_in
FROM products p;
