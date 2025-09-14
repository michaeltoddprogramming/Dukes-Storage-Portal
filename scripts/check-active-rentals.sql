-- Check how many active rentals exist
SELECT 
  r.id,
  r.status,
  c.first_name,
  c.last_name,
  su.unit_number,
  r.monthly_rate
FROM rentals r
JOIN customers c ON r.customer_id = c.id
JOIN storage_units su ON r.unit_id = su.id
WHERE r.status = 'active'
ORDER BY su.unit_number;

-- Count total storage units
SELECT COUNT(*) as total_storage_units FROM storage_units;

-- Count active rentals
SELECT COUNT(*) as active_rentals FROM rentals WHERE status = 'active';
