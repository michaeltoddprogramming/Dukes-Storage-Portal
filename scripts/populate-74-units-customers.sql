-- Clear existing data first
DELETE FROM payments;
DELETE FROM rentals;
DELETE FROM customers;
DELETE FROM storage_units;

-- Insert 74 storage units with various types and sizes
INSERT INTO storage_units (id, unit_number, size, unit_type, monthly_rate, is_available, location, description) VALUES
-- Small units (5x5) - Units 1-20
(gen_random_uuid(), '001', '5x5', 'indoor', 75.00, false, 'Building A - Floor 1', 'Small indoor unit perfect for boxes and small furniture'),
(gen_random_uuid(), '002', '5x5', 'indoor', 75.00, false, 'Building A - Floor 1', 'Small indoor unit perfect for boxes and small furniture'),
(gen_random_uuid(), '003', '5x5', 'indoor', 75.00, false, 'Building A - Floor 1', 'Small indoor unit perfect for boxes and small furniture'),
(gen_random_uuid(), '004', '5x5', 'indoor', 75.00, false, 'Building A - Floor 1', 'Small indoor unit perfect for boxes and small furniture'),
(gen_random_uuid(), '005', '5x5', 'indoor', 75.00, false, 'Building A - Floor 1', 'Small indoor unit perfect for boxes and small furniture'),
(gen_random_uuid(), '006', '5x5', 'indoor', 75.00, false, 'Building A - Floor 1', 'Small indoor unit perfect for boxes and small furniture'),
(gen_random_uuid(), '007', '5x5', 'indoor', 75.00, false, 'Building A - Floor 1', 'Small indoor unit perfect for boxes and small furniture'),
(gen_random_uuid(), '008', '5x5', 'indoor', 75.00, false, 'Building A - Floor 1', 'Small indoor unit perfect for boxes and small furniture'),
(gen_random_uuid(), '009', '5x5', 'indoor', 75.00, false, 'Building A - Floor 1', 'Small indoor unit perfect for boxes and small furniture'),
(gen_random_uuid(), '010', '5x5', 'indoor', 75.00, false, 'Building A - Floor 1', 'Small indoor unit perfect for boxes and small furniture'),
(gen_random_uuid(), '011', '5x5', 'indoor', 75.00, false, 'Building A - Floor 2', 'Small indoor unit perfect for boxes and small furniture'),
(gen_random_uuid(), '012', '5x5', 'indoor', 75.00, false, 'Building A - Floor 2', 'Small indoor unit perfect for boxes and small furniture'),
(gen_random_uuid(), '013', '5x5', 'indoor', 75.00, false, 'Building A - Floor 2', 'Small indoor unit perfect for boxes and small furniture'),
(gen_random_uuid(), '014', '5x5', 'indoor', 75.00, false, 'Building A - Floor 2', 'Small indoor unit perfect for boxes and small furniture'),
(gen_random_uuid(), '015', '5x5', 'indoor', 75.00, false, 'Building A - Floor 2', 'Small indoor unit perfect for boxes and small furniture'),
(gen_random_uuid(), '016', '5x5', 'indoor', 75.00, false, 'Building A - Floor 2', 'Small indoor unit perfect for boxes and small furniture'),
(gen_random_uuid(), '017', '5x5', 'indoor', 75.00, false, 'Building A - Floor 2', 'Small indoor unit perfect for boxes and small furniture'),
(gen_random_uuid(), '018', '5x5', 'indoor', 75.00, false, 'Building A - Floor 2', 'Small indoor unit perfect for boxes and small furniture'),
(gen_random_uuid(), '019', '5x5', 'indoor', 75.00, false, 'Building A - Floor 2', 'Small indoor unit perfect for boxes and small furniture'),
(gen_random_uuid(), '020', '5x5', 'indoor', 75.00, false, 'Building A - Floor 2', 'Small indoor unit perfect for boxes and small furniture'),

-- Medium units (5x10) - Units 21-40
(gen_random_uuid(), '021', '5x10', 'indoor', 125.00, false, 'Building B - Floor 1', 'Medium indoor unit suitable for furniture and appliances'),
(gen_random_uuid(), '022', '5x10', 'indoor', 125.00, false, 'Building B - Floor 1', 'Medium indoor unit suitable for furniture and appliances'),
(gen_random_uuid(), '023', '5x10', 'indoor', 125.00, false, 'Building B - Floor 1', 'Medium indoor unit suitable for furniture and appliances'),
(gen_random_uuid(), '024', '5x10', 'indoor', 125.00, false, 'Building B - Floor 1', 'Medium indoor unit suitable for furniture and appliances'),
(gen_random_uuid(), '025', '5x10', 'indoor', 125.00, false, 'Building B - Floor 1', 'Medium indoor unit suitable for furniture and appliances'),
(gen_random_uuid(), '026', '5x10', 'indoor', 125.00, false, 'Building B - Floor 1', 'Medium indoor unit suitable for furniture and appliances'),
(gen_random_uuid(), '027', '5x10', 'indoor', 125.00, false, 'Building B - Floor 1', 'Medium indoor unit suitable for furniture and appliances'),
(gen_random_uuid(), '028', '5x10', 'indoor', 125.00, false, 'Building B - Floor 1', 'Medium indoor unit suitable for furniture and appliances'),
(gen_random_uuid(), '029', '5x10', 'indoor', 125.00, false, 'Building B - Floor 1', 'Medium indoor unit suitable for furniture and appliances'),
(gen_random_uuid(), '030', '5x10', 'indoor', 125.00, false, 'Building B - Floor 1', 'Medium indoor unit suitable for furniture and appliances'),
(gen_random_uuid(), '031', '5x10', 'indoor', 125.00, false, 'Building B - Floor 2', 'Medium indoor unit suitable for furniture and appliances'),
(gen_random_uuid(), '032', '5x10', 'indoor', 125.00, false, 'Building B - Floor 2', 'Medium indoor unit suitable for furniture and appliances'),
(gen_random_uuid(), '033', '5x10', 'indoor', 125.00, false, 'Building B - Floor 2', 'Medium indoor unit suitable for furniture and appliances'),
(gen_random_uuid(), '034', '5x10', 'indoor', 125.00, false, 'Building B - Floor 2', 'Medium indoor unit suitable for furniture and appliances'),
(gen_random_uuid(), '035', '5x10', 'indoor', 125.00, false, 'Building B - Floor 2', 'Medium indoor unit suitable for furniture and appliances'),
(gen_random_uuid(), '036', '5x10', 'indoor', 125.00, false, 'Building B - Floor 2', 'Medium indoor unit suitable for furniture and appliances'),
(gen_random_uuid(), '037', '5x10', 'indoor', 125.00, false, 'Building B - Floor 2', 'Medium indoor unit suitable for furniture and appliances'),
(gen_random_uuid(), '038', '5x10', 'indoor', 125.00, false, 'Building B - Floor 2', 'Medium indoor unit suitable for furniture and appliances'),
(gen_random_uuid(), '039', '5x10', 'indoor', 125.00, false, 'Building B - Floor 2', 'Medium indoor unit suitable for furniture and appliances'),
(gen_random_uuid(), '040', '5x10', 'indoor', 125.00, false, 'Building B - Floor 2', 'Medium indoor unit suitable for furniture and appliances'),

-- Large units (10x10) - Units 41-60
(gen_random_uuid(), '041', '10x10', 'indoor', 200.00, false, 'Building C - Floor 1', 'Large indoor unit for household contents'),
(gen_random_uuid(), '042', '10x10', 'indoor', 200.00, false, 'Building C - Floor 1', 'Large indoor unit for household contents'),
(gen_random_uuid(), '043', '10x10', 'indoor', 200.00, false, 'Building C - Floor 1', 'Large indoor unit for household contents'),
(gen_random_uuid(), '044', '10x10', 'indoor', 200.00, false, 'Building C - Floor 1', 'Large indoor unit for household contents'),
(gen_random_uuid(), '045', '10x10', 'indoor', 200.00, false, 'Building C - Floor 1', 'Large indoor unit for household contents'),
(gen_random_uuid(), '046', '10x10', 'indoor', 200.00, false, 'Building C - Floor 1', 'Large indoor unit for household contents'),
(gen_random_uuid(), '047', '10x10', 'indoor', 200.00, false, 'Building C - Floor 1', 'Large indoor unit for household contents'),
(gen_random_uuid(), '048', '10x10', 'indoor', 200.00, false, 'Building C - Floor 1', 'Large indoor unit for household contents'),
(gen_random_uuid(), '049', '10x10', 'indoor', 200.00, false, 'Building C - Floor 1', 'Large indoor unit for household contents'),
(gen_random_uuid(), '050', '10x10', 'indoor', 200.00, false, 'Building C - Floor 1', 'Large indoor unit for household contents'),
(gen_random_uuid(), '051', '10x10', 'indoor', 200.00, false, 'Building C - Floor 2', 'Large indoor unit for household contents'),
(gen_random_uuid(), '052', '10x10', 'indoor', 200.00, false, 'Building C - Floor 2', 'Large indoor unit for household contents'),
(gen_random_uuid(), '053', '10x10', 'indoor', 200.00, false, 'Building C - Floor 2', 'Large indoor unit for household contents'),
(gen_random_uuid(), '054', '10x10', 'indoor', 200.00, false, 'Building C - Floor 2', 'Large indoor unit for household contents'),
(gen_random_uuid(), '055', '10x10', 'indoor', 200.00, false, 'Building C - Floor 2', 'Large indoor unit for household contents'),
(gen_random_uuid(), '056', '10x10', 'indoor', 200.00, false, 'Building C - Floor 2', 'Large indoor unit for household contents'),
(gen_random_uuid(), '057', '10x10', 'indoor', 200.00, false, 'Building C - Floor 2', 'Large indoor unit for household contents'),
(gen_random_uuid(), '058', '10x10', 'indoor', 200.00, false, 'Building C - Floor 2', 'Large indoor unit for household contents'),
(gen_random_uuid(), '059', '10x10', 'indoor', 200.00, false, 'Building C - Floor 2', 'Large indoor unit for household contents'),
(gen_random_uuid(), '060', '10x10', 'indoor', 200.00, false, 'Building C - Floor 2', 'Large indoor unit for household contents'),

-- Extra Large units (10x20) - Units 61-70
(gen_random_uuid(), '061', '10x20', 'outdoor', 300.00, false, 'Outdoor Area A', 'Extra large outdoor unit for vehicles and large items'),
(gen_random_uuid(), '062', '10x20', 'outdoor', 300.00, false, 'Outdoor Area A', 'Extra large outdoor unit for vehicles and large items'),
(gen_random_uuid(), '063', '10x20', 'outdoor', 300.00, false, 'Outdoor Area A', 'Extra large outdoor unit for vehicles and large items'),
(gen_random_uuid(), '064', '10x20', 'outdoor', 300.00, false, 'Outdoor Area A', 'Extra large outdoor unit for vehicles and large items'),
(gen_random_uuid(), '065', '10x20', 'outdoor', 300.00, false, 'Outdoor Area A', 'Extra large outdoor unit for vehicles and large items'),
(gen_random_uuid(), '066', '10x20', 'outdoor', 300.00, false, 'Outdoor Area B', 'Extra large outdoor unit for vehicles and large items'),
(gen_random_uuid(), '067', '10x20', 'outdoor', 300.00, false, 'Outdoor Area B', 'Extra large outdoor unit for vehicles and large items'),
(gen_random_uuid(), '068', '10x20', 'outdoor', 300.00, false, 'Outdoor Area B', 'Extra large outdoor unit for vehicles and large items'),
(gen_random_uuid(), '069', '10x20', 'outdoor', 300.00, false, 'Outdoor Area B', 'Extra large outdoor unit for vehicles and large items'),
(gen_random_uuid(), '070', '10x20', 'outdoor', 300.00, false, 'Outdoor Area B', 'Extra large outdoor unit for vehicles and large items'),

-- Premium units (20x20) - Units 71-74
(gen_random_uuid(), '071', '20x20', 'climate_controlled', 500.00, false, 'Premium Building', 'Premium climate-controlled unit for sensitive items'),
(gen_random_uuid(), '072', '20x20', 'climate_controlled', 500.00, false, 'Premium Building', 'Premium climate-controlled unit for sensitive items'),
(gen_random_uuid(), '073', '20x20', 'climate_controlled', 500.00, false, 'Premium Building', 'Premium climate-controlled unit for sensitive items'),
(gen_random_uuid(), '074', '20x20', 'climate_controlled', 500.00, false, 'Premium Building', 'Premium climate-controlled unit for sensitive items');

-- Insert 74 customers with realistic data
INSERT INTO customers (id, first_name, last_name, email, phone, address, emergency_contact_name, emergency_contact_phone) VALUES
(gen_random_uuid(), 'John', 'Smith', 'john.smith@email.com', '555-0101', '123 Main St, Anytown, ST 12345', 'Jane Smith', '555-0102'),
(gen_random_uuid(), 'Sarah', 'Johnson', 'sarah.johnson@email.com', '555-0103', '456 Oak Ave, Anytown, ST 12345', 'Mike Johnson', '555-0104'),
(gen_random_uuid(), 'Michael', 'Brown', 'michael.brown@email.com', '555-0105', '789 Pine Rd, Anytown, ST 12345', 'Lisa Brown', '555-0106'),
(gen_random_uuid(), 'Emily', 'Davis', 'emily.davis@email.com', '555-0107', '321 Elm St, Anytown, ST 12345', 'David Davis', '555-0108'),
(gen_random_uuid(), 'Robert', 'Wilson', 'robert.wilson@email.com', '555-0109', '654 Maple Dr, Anytown, ST 12345', 'Carol Wilson', '555-0110'),
(gen_random_uuid(), 'Jessica', 'Miller', 'jessica.miller@email.com', '555-0111', '987 Cedar Ln, Anytown, ST 12345', 'Tom Miller', '555-0112'),
(gen_random_uuid(), 'David', 'Moore', 'david.moore@email.com', '555-0113', '147 Birch Way, Anytown, ST 12345', 'Amy Moore', '555-0114'),
(gen_random_uuid(), 'Ashley', 'Taylor', 'ashley.taylor@email.com', '555-0115', '258 Spruce St, Anytown, ST 12345', 'Chris Taylor', '555-0116'),
(gen_random_uuid(), 'Christopher', 'Anderson', 'chris.anderson@email.com', '555-0117', '369 Willow Ave, Anytown, ST 12345', 'Maria Anderson', '555-0118'),
(gen_random_uuid(), 'Amanda', 'Thomas', 'amanda.thomas@email.com', '555-0119', '741 Poplar Rd, Anytown, ST 12345', 'Steve Thomas', '555-0120'),
(gen_random_uuid(), 'Matthew', 'Jackson', 'matthew.jackson@email.com', '555-0121', '852 Hickory Dr, Anytown, ST 12345', 'Linda Jackson', '555-0122'),
(gen_random_uuid(), 'Jennifer', 'White', 'jennifer.white@email.com', '555-0123', '963 Ash Ln, Anytown, ST 12345', 'Paul White', '555-0124'),
(gen_random_uuid(), 'Joshua', 'Harris', 'joshua.harris@email.com', '555-0125', '159 Walnut Way, Anytown, ST 12345', 'Karen Harris', '555-0126'),
(gen_random_uuid(), 'Stephanie', 'Martin', 'stephanie.martin@email.com', '555-0127', '357 Cherry St, Anytown, ST 12345', 'Brian Martin', '555-0128'),
(gen_random_uuid(), 'Daniel', 'Thompson', 'daniel.thompson@email.com', '555-0129', '468 Peach Ave, Anytown, ST 12345', 'Nancy Thompson', '555-0130'),
(gen_random_uuid(), 'Michelle', 'Garcia', 'michelle.garcia@email.com', '555-0131', '579 Apple Rd, Anytown, ST 12345', 'Carlos Garcia', '555-0132'),
(gen_random_uuid(), 'Andrew', 'Martinez', 'andrew.martinez@email.com', '555-0133', '680 Orange Dr, Anytown, ST 12345', 'Rosa Martinez', '555-0134'),
(gen_random_uuid(), 'Lisa', 'Robinson', 'lisa.robinson@email.com', '555-0135', '791 Lemon Ln, Anytown, ST 12345', 'Mark Robinson', '555-0136'),
(gen_random_uuid(), 'Ryan', 'Clark', 'ryan.clark@email.com', '555-0137', '802 Lime Way, Anytown, ST 12345', 'Susan Clark', '555-0138'),
(gen_random_uuid(), 'Nicole', 'Rodriguez', 'nicole.rodriguez@email.com', '555-0139', '913 Grape St, Anytown, ST 12345', 'Jose Rodriguez', '555-0140'),
(gen_random_uuid(), 'Kevin', 'Lewis', 'kevin.lewis@email.com', '555-0141', '024 Berry Ave, Anytown, ST 12345', 'Patricia Lewis', '555-0142'),
(gen_random_uuid(), 'Rachel', 'Lee', 'rachel.lee@email.com', '555-0143', '135 Plum Rd, Anytown, ST 12345', 'James Lee', '555-0144'),
(gen_random_uuid(), 'Brandon', 'Walker', 'brandon.walker@email.com', '555-0145', '246 Fig Dr, Anytown, ST 12345', 'Helen Walker', '555-0146'),
(gen_random_uuid(), 'Megan', 'Hall', 'megan.hall@email.com', '555-0147', '357 Date Ln, Anytown, ST 12345', 'Robert Hall', '555-0148'),
(gen_random_uuid(), 'Jason', 'Allen', 'jason.allen@email.com', '555-0149', '468 Kiwi Way, Anytown, ST 12345', 'Dorothy Allen', '555-0150'),
(gen_random_uuid(), 'Samantha', 'Young', 'samantha.young@email.com', '555-0151', '579 Mango St, Anytown, ST 12345', 'William Young', '555-0152'),
(gen_random_uuid(), 'Justin', 'Hernandez', 'justin.hernandez@email.com', '555-0153', '680 Papaya Ave, Anytown, ST 12345', 'Maria Hernandez', '555-0154'),
(gen_random_uuid(), 'Brittany', 'King', 'brittany.king@email.com', '555-0155', '791 Coconut Rd, Anytown, ST 12345', 'Charles King', '555-0156'),
(gen_random_uuid(), 'Tyler', 'Wright', 'tyler.wright@email.com', '555-0157', '802 Banana Dr, Anytown, ST 12345', 'Betty Wright', '555-0158'),
(gen_random_uuid(), 'Kayla', 'Lopez', 'kayla.lopez@email.com', '555-0159', '913 Pineapple Ln, Anytown, ST 12345', 'Antonio Lopez', '555-0160'),
(gen_random_uuid(), 'Nathan', 'Hill', 'nathan.hill@email.com', '555-0161', '024 Strawberry Way, Anytown, ST 12345', 'Margaret Hill', '555-0162'),
(gen_random_uuid(), 'Crystal', 'Scott', 'crystal.scott@email.com', '555-0163', '135 Blueberry St, Anytown, ST 12345', 'Kenneth Scott', '555-0164'),
(gen_random_uuid(), 'Jacob', 'Green', 'jacob.green@email.com', '555-0165', '246 Raspberry Ave, Anytown, ST 12345', 'Donna Green', '555-0166'),
(gen_random_uuid(), 'Alexis', 'Adams', 'alexis.adams@email.com', '555-0167', '357 Blackberry Rd, Anytown, ST 12345', 'Ronald Adams', '555-0168'),
(gen_random_uuid(), 'Zachary', 'Baker', 'zachary.baker@email.com', '555-0169', '468 Cranberry Dr, Anytown, ST 12345', 'Lisa Baker', '555-0170'),
(gen_random_uuid(), 'Danielle', 'Gonzalez', 'danielle.gonzalez@email.com', '555-0171', '579 Gooseberry Ln, Anytown, ST 12345', 'Miguel Gonzalez', '555-0172'),
(gen_random_uuid(), 'Aaron', 'Nelson', 'aaron.nelson@email.com', '555-0173', '680 Elderberry Way, Anytown, ST 12345', 'Sandra Nelson', '555-0174'),
(gen_random_uuid(), 'Heather', 'Carter', 'heather.carter@email.com', '555-0175', '791 Mulberry St, Anytown, ST 12345', 'Gary Carter', '555-0176'),
(gen_random_uuid(), 'Jordan', 'Mitchell', 'jordan.mitchell@email.com', '555-0177', '802 Boysenberry Ave, Anytown, ST 12345', 'Deborah Mitchell', '555-0178'),
(gen_random_uuid(), 'Lauren', 'Perez', 'lauren.perez@email.com', '555-0179', '913 Huckleberry Rd, Anytown, ST 12345', 'Frank Perez', '555-0180'),
(gen_random_uuid(), 'Adam', 'Roberts', 'adam.roberts@email.com', '555-0181', '024 Currant Dr, Anytown, ST 12345', 'Carol Roberts', '555-0182'),
(gen_random_uuid(), 'Kimberly', 'Turner', 'kimberly.turner@email.com', '555-0183', '135 Acai Ln, Anytown, ST 12345', 'Raymond Turner', '555-0184'),
(gen_random_uuid(), 'Sean', 'Phillips', 'sean.phillips@email.com', '555-0185', '246 Goji Way, Anytown, ST 12345', 'Sharon Phillips', '555-0186'),
(gen_random_uuid(), 'Courtney', 'Campbell', 'courtney.campbell@email.com', '555-0187', '357 Pomegranate St, Anytown, ST 12345', 'Larry Campbell', '555-0188'),
(gen_random_uuid(), 'Eric', 'Parker', 'eric.parker@email.com', '555-0189', '468 Persimmon Ave, Anytown, ST 12345', 'Cynthia Parker', '555-0190'),
(gen_random_uuid(), 'Vanessa', 'Evans', 'vanessa.evans@email.com', '555-0191', '579 Apricot Rd, Anytown, ST 12345', 'Steven Evans', '555-0192'),
(gen_random_uuid(), 'Jeremy', 'Edwards', 'jeremy.edwards@email.com', '555-0193', '680 Nectarine Dr, Anytown, ST 12345', 'Ruth Edwards', '555-0194'),
(gen_random_uuid(), 'Tiffany', 'Collins', 'tiffany.collins@email.com', '555-0195', '791 Tangerine Ln, Anytown, ST 12345', 'George Collins', '555-0196'),
(gen_random_uuid(), 'Jonathan', 'Stewart', 'jonathan.stewart@email.com', '555-0197', '802 Clementine Way, Anytown, ST 12345', 'Judith Stewart', '555-0198'),
(gen_random_uuid(), 'Amber', 'Sanchez', 'amber.sanchez@email.com', '555-0199', '913 Mandarin St, Anytown, ST 12345', 'Edward Sanchez', '555-0200'),
(gen_random_uuid(), 'Marcus', 'Morris', 'marcus.morris@email.com', '555-0201', '024 Grapefruit Ave, Anytown, ST 12345', 'Barbara Morris', '555-0202'),
(gen_random_uuid(), 'Chelsea', 'Rogers', 'chelsea.rogers@email.com', '555-0203', '135 Cantaloupe Rd, Anytown, ST 12345', 'Timothy Rogers', '555-0204'),
(gen_random_uuid(), 'Cody', 'Reed', 'cody.reed@email.com', '555-0205', '246 Honeydew Dr, Anytown, ST 12345', 'Marie Reed', '555-0206'),
(gen_random_uuid(), 'Kristen', 'Cook', 'kristen.cook@email.com', '555-0207', '357 Watermelon Ln, Anytown, ST 12345', 'Arthur Cook', '555-0208'),
(gen_random_uuid(), 'Trevor', 'Bailey', 'trevor.bailey@email.com', '555-0209', '468 Avocado Way, Anytown, ST 12345', 'Julie Bailey', '555-0210'),
(gen_random_uuid(), 'Monica', 'Rivera', 'monica.rivera@email.com', '555-0211', '579 Tomato St, Anytown, ST 12345', 'Wayne Rivera', '555-0212'),
(gen_random_uuid(), 'Austin', 'Cooper', 'austin.cooper@email.com', '555-0213', '680 Cucumber Ave, Anytown, ST 12345', 'Gloria Cooper', '555-0214'),
(gen_random_uuid(), 'Jasmine', 'Richardson', 'jasmine.richardson@email.com', '555-0215', '791 Carrot Rd, Anytown, ST 12345', 'Ralph Richardson', '555-0216'),
(gen_random_uuid(), 'Kyle', 'Cox', 'kyle.cox@email.com', '555-0217', '802 Celery Dr, Anytown, ST 12345', 'Teresa Cox', '555-0218'),
(gen_random_uuid(), 'Lindsey', 'Howard', 'lindsey.howard@email.com', '555-0219', '913 Broccoli Ln, Anytown, ST 12345', 'Roy Howard', '555-0220'),
(gen_random_uuid(), 'Caleb', 'Ward', 'caleb.ward@email.com', '555-0221', '024 Spinach Way, Anytown, ST 12345', 'Diana Ward', '555-0222'),
(gen_random_uuid(), 'Jenna', 'Torres', 'jenna.torres@email.com', '555-0223', '135 Lettuce St, Anytown, ST 12345', 'Eugene Torres', '555-0224'),
(gen_random_uuid(), 'Ian', 'Peterson', 'ian.peterson@email.com', '555-0225', '246 Cabbage Ave, Anytown, ST 12345', 'Janice Peterson', '555-0226'),
(gen_random_uuid(), 'Paige', 'Gray', 'paige.gray@email.com', '555-0227', '357 Kale Rd, Anytown, ST 12345', 'Harold Gray', '555-0228'),
(gen_random_uuid(), 'Blake', 'Ramirez', 'blake.ramirez@email.com', '555-0229', '468 Arugula Dr, Anytown, ST 12345', 'Cheryl Ramirez', '555-0230'),
(gen_random_uuid(), 'Jillian', 'James', 'jillian.james@email.com', '555-0231', '579 Chard Ln, Anytown, ST 12345', 'Gerald James', '555-0232'),
(gen_random_uuid(), 'Connor', 'Watson', 'connor.watson@email.com', '555-0233', '680 Collard Way, Anytown, ST 12345', 'Mildred Watson', '555-0234'),
(gen_random_uuid(), 'Haley', 'Brooks', 'haley.brooks@email.com', '555-0235', '791 Mustard St, Anytown, ST 12345', 'Louis Brooks', '555-0236'),
(gen_random_uuid(), 'Devin', 'Kelly', 'devin.kelly@email.com', '555-0237', '802 Turnip Ave, Anytown, ST 12345', 'Frances Kelly', '555-0238'),
(gen_random_uuid(), 'Allison', 'Sanders', 'allison.sanders@email.com', '555-0239', '913 Radish Rd, Anytown, ST 12345', 'Philip Sanders', '555-0240'),
(gen_random_uuid(), 'Mason', 'Price', 'mason.price@email.com', '555-0241', '024 Beet Dr, Anytown, ST 12345', 'Alice Price', '555-0242'),
(gen_random_uuid(), 'Brooke', 'Bennett', 'brooke.bennett@email.com', '555-0243', '135 Parsnip Ln, Anytown, ST 12345', 'Joe Bennett', '555-0244'),
(gen_random_uuid(), 'Hunter', 'Wood', 'hunter.wood@email.com', '555-0245', '246 Rutabaga Way, Anytown, ST 12345', 'Evelyn Wood', '555-0246'),
(gen_random_uuid(), 'Gabrielle', 'Barnes', 'gabrielle.barnes@email.com', '555-0247', '357 Squash St, Anytown, ST 12345', 'Albert Barnes', '555-0248'),
(gen_random_uuid(), 'Lucas', 'Ross', 'lucas.ross@email.com', '555-0249', '468 Pumpkin Ave, Anytown, ST 12345', 'Jean Ross', '555-0250'),
(gen_random_uuid(), 'Sierra', 'Henderson', 'sierra.henderson@email.com', '555-0251', '579 Zucchini Rd, Anytown, ST 12345', 'Willie Henderson', '555-0252'),
(gen_random_uuid(), 'Garrett', 'Coleman', 'garrett.coleman@email.com', '555-0253', '680 Eggplant Dr, Anytown, ST 12345', 'Katherine Coleman', '555-0254'),
(gen_random_uuid(), 'Marissa', 'Jenkins', 'marissa.jenkins@email.com', '555-0255', '791 Pepper Ln, Anytown, ST 12345', 'Jesse Jenkins', '555-0256');

-- Create rentals for all 74 customers (each customer rents one unit)
WITH customer_unit_pairs AS (
  SELECT 
    c.id as customer_id,
    s.id as unit_id,
    s.monthly_rate,
    ROW_NUMBER() OVER (ORDER BY c.first_name, c.last_name) as rn
  FROM customers c
  CROSS JOIN storage_units s
  WHERE s.unit_number = LPAD((ROW_NUMBER() OVER (ORDER BY c.first_name, c.last_name))::text, 3, '0')
)
INSERT INTO rentals (id, customer_id, storage_unit_id, start_date, monthly_rate, deposit_amount, is_active)
SELECT 
  gen_random_uuid(),
  customer_id,
  unit_id,
  '2024-01-01'::date + (rn * INTERVAL '3 days'),
  monthly_rate,
  monthly_rate * 1.5,
  true
FROM customer_unit_pairs;

-- Create payment records for the past 6 months for each rental
WITH rental_payments AS (
  SELECT 
    r.id as rental_id,
    r.monthly_rate,
    generate_series(
      date_trunc('month', CURRENT_DATE - INTERVAL '5 months'),
      date_trunc('month', CURRENT_DATE),
      INTERVAL '1 month'
    ) as payment_month
  FROM rentals r
  WHERE r.is_active = true
)
INSERT INTO payments (id, rental_id, amount, payment_date, payment_method, payment_type, notes)
SELECT 
  gen_random_uuid(),
  rp.rental_id,
  rp.monthly_rate,
  rp.payment_month + INTERVAL '5 days' + (RANDOM() * INTERVAL '10 days'),
  CASE 
    WHEN RANDOM() < 0.4 THEN 'cash'
    WHEN RANDOM() < 0.7 THEN 'credit_card'
    WHEN RANDOM() < 0.9 THEN 'bank_transfer'
    ELSE 'check'
  END,
  'rent',
  CASE 
    WHEN RANDOM() < 0.1 THEN 'Late payment - additional fee applied'
    WHEN RANDOM() < 0.2 THEN 'Paid early - thank you!'
    ELSE 'Regular monthly payment'
  END
FROM rental_payments rp
WHERE RANDOM() > 0.05; -- 95% payment rate (some months missed)
