-- Adding sample customers, units, rentals, and payments data
INSERT INTO customers (id, name, email, phone, address) VALUES
  ('cust-001', 'John Smith', 'john.smith@email.com', '555-0101', '123 Main St, Anytown, ST 12345'),
  ('cust-002', 'Sarah Johnson', 'sarah.johnson@email.com', '555-0102', '456 Oak Ave, Somewhere, ST 67890'),
  ('cust-003', 'Mike Davis', 'mike.davis@email.com', '555-0103', '789 Pine Rd, Elsewhere, ST 54321'),
  ('cust-004', 'Lisa Wilson', 'lisa.wilson@email.com', '555-0104', '321 Elm St, Nowhere, ST 98765'),
  ('cust-005', 'Tom Brown', 'tom.brown@email.com', '555-0105', '654 Maple Dr, Anywhere, ST 13579')
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage_units (id, unit_number, size, monthly_rate, status) VALUES
  ('unit-001', 'A101', '5x5', 75.00, 'occupied'),
  ('unit-002', 'A102', '5x10', 95.00, 'occupied'),
  ('unit-003', 'A103', '10x10', 125.00, 'occupied'),
  ('unit-004', 'A104', '10x15', 150.00, 'occupied'),
  ('unit-005', 'A105', '10x20', 175.00, 'occupied')
ON CONFLICT (id) DO NOTHING;

INSERT INTO rentals (id, customer_id, unit_id, start_date, monthly_rent, status) VALUES
  ('rent-001', 'cust-001', 'unit-001', '2024-01-01', 75.00, 'active'),
  ('rent-002', 'cust-002', 'unit-002', '2024-01-15', 95.00, 'active'),
  ('rent-003', 'cust-003', 'unit-003', '2024-02-01', 125.00, 'active'),
  ('rent-004', 'cust-004', 'unit-004', '2024-02-15', 150.00, 'active'),
  ('rent-005', 'cust-005', 'unit-005', '2024-03-01', 175.00, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO payments (id, rental_id, amount, due_date, paid_date, status) VALUES
  -- January 2025 payments
  ('pay-001', 'rent-001', 75.00, '2025-01-01', '2024-12-28', 'paid'),
  ('pay-002', 'rent-002', 95.00, '2025-01-15', '2025-01-12', 'paid'),
  ('pay-003', 'rent-003', 125.00, '2025-01-01', NULL, 'overdue'),
  ('pay-004', 'rent-004', 150.00, '2025-01-15', NULL, 'pending'),
  ('pay-005', 'rent-005', 175.00, '2025-01-01', '2025-01-01', 'paid'),
  
  -- February 2025 payments
  ('pay-006', 'rent-001', 75.00, '2025-02-01', NULL, 'pending'),
  ('pay-007', 'rent-002', 95.00, '2025-02-15', NULL, 'pending'),
  ('pay-008', 'rent-003', 125.00, '2025-02-01', NULL, 'pending'),
  ('pay-009', 'rent-004', 150.00, '2025-02-15', NULL, 'pending'),
  ('pay-010', 'rent-005', 175.00, '2025-02-01', NULL, 'pending'),
  
  -- March 2025 payments
  ('pay-011', 'rent-001', 75.00, '2025-03-01', NULL, 'pending'),
  ('pay-012', 'rent-002', 95.00, '2025-03-15', NULL, 'pending'),
  ('pay-013', 'rent-003', 125.00, '2025-03-01', NULL, 'pending'),
  ('pay-014', 'rent-004', 150.00, '2025-03-15', NULL, 'pending'),
  ('pay-015', 'rent-005', 175.00, '2025-03-01', NULL, 'pending')
ON CONFLICT (id) DO NOTHING;
