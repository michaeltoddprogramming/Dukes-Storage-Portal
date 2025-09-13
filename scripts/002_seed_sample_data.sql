-- Sample data for testing the storage unit management system

-- Insert a sample facility
INSERT INTO public.facilities (id, name, address, phone, email) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Downtown Storage Center', '123 Main St, Anytown, ST 12345', '(555) 123-4567', 'info@downtownstorage.com')
ON CONFLICT (id) DO NOTHING;

-- Insert sample storage units
INSERT INTO public.storage_units (facility_id, unit_number, size_category, dimensions, monthly_rate, status, floor_level, has_climate_control, has_electricity) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'A101', 'small', '5x5', 75.00, 'available', 1, false, false),
('550e8400-e29b-41d4-a716-446655440000', 'A102', 'small', '5x5', 75.00, 'occupied', 1, false, false),
('550e8400-e29b-41d4-a716-446655440000', 'A103', 'medium', '5x10', 125.00, 'available', 1, true, false),
('550e8400-e29b-41d4-a716-446655440000', 'A104', 'medium', '10x10', 150.00, 'available', 1, true, true),
('550e8400-e29b-41d4-a716-446655440000', 'B201', 'large', '10x15', 200.00, 'occupied', 2, true, true),
('550e8400-e29b-41d4-a716-446655440000', 'B202', 'large', '10x20', 250.00, 'available', 2, true, true),
('550e8400-e29b-41d4-a716-446655440000', 'B203', 'extra_large', '15x20', 350.00, 'maintenance', 2, true, true),
('550e8400-e29b-41d4-a716-446655440000', 'C301', 'medium', '10x10', 140.00, 'available', 3, false, false)
ON CONFLICT (facility_id, unit_number) DO NOTHING;

-- Insert sample customers
INSERT INTO public.customers (first_name, last_name, email, phone, address, city, state, zip_code, emergency_contact_name, emergency_contact_phone) VALUES 
('John', 'Smith', 'john.smith@email.com', '(555) 234-5678', '456 Oak Ave', 'Anytown', 'ST', '12345', 'Jane Smith', '(555) 234-5679'),
('Sarah', 'Johnson', 'sarah.johnson@email.com', '(555) 345-6789', '789 Pine St', 'Anytown', 'ST', '12346', 'Mike Johnson', '(555) 345-6790'),
('Michael', 'Brown', 'michael.brown@email.com', '(555) 456-7890', '321 Elm Dr', 'Anytown', 'ST', '12347', 'Lisa Brown', '(555) 456-7891')
ON CONFLICT (email) DO NOTHING;

-- Insert sample rentals (linking customers to units)
INSERT INTO public.rentals (customer_id, unit_id, start_date, monthly_rate, security_deposit, status) 
SELECT 
  c.id,
  u.id,
  '2024-01-01'::date,
  u.monthly_rate,
  u.monthly_rate,
  'active'
FROM public.customers c, public.storage_units u 
WHERE c.email = 'john.smith@email.com' AND u.unit_number = 'A102'
ON CONFLICT DO NOTHING;

INSERT INTO public.rentals (customer_id, unit_id, start_date, monthly_rate, security_deposit, status) 
SELECT 
  c.id,
  u.id,
  '2024-02-15'::date,
  u.monthly_rate,
  u.monthly_rate,
  'active'
FROM public.customers c, public.storage_units u 
WHERE c.email = 'sarah.johnson@email.com' AND u.unit_number = 'B201'
ON CONFLICT DO NOTHING;

-- Insert sample payments
INSERT INTO public.payments (rental_id, amount, payment_date, payment_method, payment_type, reference_number)
SELECT 
  r.id,
  r.monthly_rate,
  '2024-01-01'::date,
  'credit_card',
  'deposit',
  'DEP-001'
FROM public.rentals r
JOIN public.customers c ON r.customer_id = c.id
WHERE c.email = 'john.smith@email.com'
LIMIT 1;

INSERT INTO public.payments (rental_id, amount, payment_date, payment_method, payment_type, reference_number)
SELECT 
  r.id,
  r.monthly_rate,
  '2024-01-01'::date,
  'credit_card',
  'rent',
  'RENT-001'
FROM public.rentals r
JOIN public.customers c ON r.customer_id = c.id
WHERE c.email = 'john.smith@email.com'
LIMIT 1;
