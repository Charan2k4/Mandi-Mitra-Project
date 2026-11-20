-- Mandi Mitra Sample & Seed Dataset for Supabase PostgreSQL
-- Can be executed directly in the Supabase SQL Editor

-- 1. States
INSERT INTO states (name, code) VALUES
('Telangana', 'TS'),
('Andhra Pradesh', 'AP'),
('Maharashtra', 'MH'),
('Karnataka', 'KA'),
('Punjab', 'PB'),
('Madhya Pradesh', 'MP')
ON CONFLICT (name) DO NOTHING;

-- 2. Districts (sample key districts with verified coordinates)
INSERT INTO districts (state_id, name, latitude, longitude) VALUES
((SELECT id FROM states WHERE code = 'TS'), 'Warangal', 17.978400, 79.594100),
((SELECT id FROM states WHERE code = 'TS'), 'Khammam', 17.247300, 80.151400),
((SELECT id FROM states WHERE code = 'TS'), 'Nizamabad', 18.672500, 78.094100),
((SELECT id FROM states WHERE code = 'TS'), 'Suryapet', 17.143900, 79.623900),
((SELECT id FROM states WHERE code = 'AP'), 'Guntur', 16.306700, 80.436500),
((SELECT id FROM states WHERE code = 'AP'), 'Kurnool', 15.828100, 78.037300),
((SELECT id FROM states WHERE code = 'MH'), 'Nashik', 19.997500, 73.789800),
((SELECT id FROM states WHERE code = 'MH'), 'Nagpur', 21.145800, 79.088200),
((SELECT id FROM states WHERE code = 'KA'), 'Dharwad', 15.364700, 75.124000),
((SELECT id FROM states WHERE code = 'PB'), 'Ludhiana', 30.901000, 75.857300),
((SELECT id FROM states WHERE code = 'MP'), 'Indore', 22.719600, 75.857700)
ON CONFLICT DO NOTHING;

-- 3. Mandis (APMCs)
INSERT INTO mandis (district_id, name, code, latitude, longitude, address, contact_phone) VALUES
((SELECT id FROM districts WHERE name = 'Warangal'), 'Enumamula Cotton Market (Warangal)', 'TS_WGL_01', 17.994400, 79.623100, 'Enumamula Market Yard, Warangal, Telangana', '0870-2424100'),
((SELECT id FROM districts WHERE name = 'Warangal'), 'Narsampet Mandi', 'TS_WGL_02', 17.925000, 79.897000, 'Narsampet Yard, Warangal, Telangana', '08718-230222'),
((SELECT id FROM districts WHERE name = 'Khammam'), 'Khammam Chilli & Grain Market', 'TS_KHM_01', 17.252000, 80.148000, 'Market Yard, Khammam, Telangana', '08742-224530'),
((SELECT id FROM districts WHERE name = 'Nizamabad'), 'Nizamabad Turmeric & Paddy Mandi', 'TS_NZB_01', 18.681000, 78.102000, 'Mandi Road, Nizamabad, Telangana', '08462-235411'),
((SELECT id FROM districts WHERE name = 'Suryapet'), 'Suryapet Commercial Crop Mandi', 'TS_SRY_01', 17.151000, 79.630000, 'Khammam Road, Suryapet, Telangana', '08684-220140'),
((SELECT id FROM districts WHERE name = 'Guntur'), 'Guntur Mirchi Yard (Asia Largest Chilli Market)', 'AP_GNT_01', 16.292000, 80.448000, 'Mirchi Yard, Guntur, Andhra Pradesh', '0863-2234551'),
((SELECT id FROM districts WHERE name = 'Kurnool'), 'Kurnool Onion & Groundnut Mandi', 'AP_KNL_01', 15.834000, 78.045000, 'APMC Yard, Kurnool, Andhra Pradesh', '08518-245120'),
((SELECT id FROM districts WHERE name = 'Nashik'), 'Lasalgaon APMC (Asia Largest Onion Mandi)', 'MH_NSK_01', 20.147000, 74.227000, 'Lasalgaon, Nashik, Maharashtra', '02550-266020'),
((SELECT id FROM districts WHERE name = 'Nagpur'), 'Nagpur Kalamna Market Yard', 'MH_NGP_01', 21.182000, 79.143000, 'Kalamna, Nagpur, Maharashtra', '0712-2681420'),
((SELECT id FROM districts WHERE name = 'Dharwad'), 'Hubballi (Hubli) APMC Yard', 'KA_DHW_01', 15.352000, 75.148000, 'Amargol, Hubli, Karnataka', '0836-2351240'),
((SELECT id FROM districts WHERE name = 'Ludhiana'), 'Khanna Grain Market (Asia Largest Grain Market)', 'PB_LDH_01', 30.702000, 76.218000, 'Khanna, Ludhiana, Punjab', '01628-226110'),
((SELECT id FROM districts WHERE name = 'Indore'), 'Indore Devi Ahilya Bai Holkar APMC', 'MP_IND_01', 22.735000, 75.889000, 'Choithram, Indore, Madhya Pradesh', '0731-2551400')
ON CONFLICT DO NOTHING;

-- 4. Commodities
INSERT INTO commodities (name, category, unit, shelf_life_days) VALUES
('Paddy (Dhan)', 'Cereals', 'Quintal', 180),
('Cotton (Kapas)', 'Fibres', 'Quintal', 120),
('Red Chilli (Mirchi)', 'Spices', 'Quintal', 90),
('Maize (Makka)', 'Cereals', 'Quintal', 120),
('Soybean', 'Oilseeds', 'Quintal', 90),
('Wheat (Gehun)', 'Cereals', 'Quintal', 180),
('Onion (Pyaz)', 'Vegetables', 'Quintal', 30),
('Tomato', 'Vegetables', 'Quintal', 10),
('Bengal Gram (Chana)', 'Pulses', 'Quintal', 150),
('Turmeric (Haldi)', 'Spices', 'Quintal', 180)
ON CONFLICT (name) DO NOTHING;

-- 5. Varieties
INSERT INTO varieties (commodity_id, name) VALUES
((SELECT id FROM commodities WHERE name = 'Paddy (Dhan)'), 'Sona Masuri'),
((SELECT id FROM commodities WHERE name = 'Paddy (Dhan)'), 'Basmati'),
((SELECT id FROM commodities WHERE name = 'Paddy (Dhan)'), 'Common (FAQ)'),
((SELECT id FROM commodities WHERE name = 'Cotton (Kapas)'), 'Medium Staple'),
((SELECT id FROM commodities WHERE name = 'Cotton (Kapas)'), 'Long Staple'),
((SELECT id FROM commodities WHERE name = 'Cotton (Kapas)'), 'DCH-32'),
((SELECT id FROM commodities WHERE name = 'Red Chilli (Mirchi)'), 'Teja'),
((SELECT id FROM commodities WHERE name = 'Red Chilli (Mirchi)'), 'Guntur Sannam (334)'),
((SELECT id FROM commodities WHERE name = 'Soybean'), 'Yellow'),
((SELECT id FROM commodities WHERE name = 'Wheat (Gehun)'), 'Lok-1'),
((SELECT id FROM commodities WHERE name = 'Wheat (Gehun)'), 'Sharbati'),
((SELECT id FROM commodities WHERE name = 'Onion (Pyaz)'), 'Red Onion'),
((SELECT id FROM commodities WHERE name = 'Turmeric (Haldi)'), 'Finger')
ON CONFLICT DO NOTHING;
