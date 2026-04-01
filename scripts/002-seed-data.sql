-- Seed categories
INSERT INTO categories (name) VALUES
  ('Electronics'),
  ('Clothing'),
  ('Food & Beverages'),
  ('Home & Garden'),
  ('Sports & Outdoors')
ON CONFLICT (name) DO NOTHING;

-- Seed products
INSERT INTO products (name, barcode, category_id, country_of_origin, cost_price, selling_price, current_stock, stock_limit)
SELECT 
  p.name,
  p.barcode,
  c.id,
  p.country_of_origin,
  p.cost_price,
  p.selling_price,
  p.current_stock,
  p.stock_limit
FROM (VALUES
  ('iPhone 15 Pro', 'IP15PRO001', 'Electronics', 'China', 899.00, 1199.00, 45, 10),
  ('Samsung Galaxy S24', 'SGS24001', 'Electronics', 'South Korea', 749.00, 999.00, 32, 10),
  ('Sony WH-1000XM5', 'SNYWH5001', 'Electronics', 'Japan', 279.00, 399.00, 28, 5),
  ('MacBook Air M3', 'MBAM3001', 'Electronics', 'China', 999.00, 1299.00, 15, 5),
  ('Nike Air Max', 'NKAM001', 'Clothing', 'Vietnam', 89.00, 179.00, 120, 20),
  ('Levi''s 501 Jeans', 'LV501001', 'Clothing', 'Mexico', 45.00, 89.00, 85, 15),
  ('Adidas Ultraboost', 'ADUB001', 'Clothing', 'Indonesia', 120.00, 189.00, 65, 10),
  ('Organic Coffee Beans', 'OCB001', 'Food & Beverages', 'Colombia', 12.00, 24.99, 200, 50),
  ('Premium Green Tea', 'PGT001', 'Food & Beverages', 'Japan', 8.00, 18.99, 150, 30),
  ('Craft Beer 6-Pack', 'CB6P001', 'Food & Beverages', 'USA', 9.00, 15.99, 80, 20),
  ('Garden Tool Set', 'GTS001', 'Home & Garden', 'Germany', 35.00, 79.99, 42, 10),
  ('Indoor Plant Pot', 'IPP001', 'Home & Garden', 'Italy', 15.00, 34.99, 95, 20),
  ('LED String Lights', 'LSL001', 'Home & Garden', 'China', 8.00, 19.99, 180, 30),
  ('Yoga Mat Premium', 'YMP001', 'Sports & Outdoors', 'Taiwan', 25.00, 59.99, 70, 15),
  ('Camping Tent 4P', 'CT4P001', 'Sports & Outdoors', 'China', 89.00, 199.99, 25, 5),
  ('Running Shorts', 'RS001', 'Sports & Outdoors', 'Vietnam', 18.00, 39.99, 110, 20),
  ('Wireless Earbuds', 'WE001', 'Electronics', 'China', 45.00, 89.99, 8, 15),
  ('Smart Watch Band', 'SWB001', 'Electronics', 'China', 12.00, 29.99, 3, 10)
) AS p(name, barcode, category_name, country_of_origin, cost_price, selling_price, current_stock, stock_limit)
JOIN categories c ON c.name = p.category_name
ON CONFLICT (barcode) DO NOTHING;

-- Add some stock movements for history
INSERT INTO stock_movements (product_id, type, quantity, notes)
SELECT p.id, 'in', 50, 'Initial stock'
FROM products p
ON CONFLICT DO NOTHING;
