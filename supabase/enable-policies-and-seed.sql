-- =========================================================
-- PERMISSIVE RLS POLICIES & SEED DATA FOR RAILWAY RESERVATIONS
-- =========================================================

-- Enable full read/write access for public/anon client demo
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE org_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE cargo_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE cancellations DISABLE ROW LEVEL SECURITY;

-- 1. SEED ORGANIZATIONS
INSERT INTO organizations (id, name, tax_id, billing_address, contact_email)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'Adani Logistics Intermodal Ltd', '07AAACA1234F1Z8', 'Sector 32, Institutional Area, Gurugram, NCR 122001', 'dispatch@adanilogistics.com'),
    ('00000000-0000-0000-0000-000000000002', 'Tata Steel Freight & Raw Materials Div', '20AAACT5678Q1Z4', 'Jamshedpur Works, Jamshedpur, Jharkhand 831001', 'railfreight@tatasteel.com'),
    ('00000000-0000-0000-0000-000000000003', 'Container Corporation of India (CONCOR)', '07AAACC9876K1ZY', 'CONCOR Bhawan, C-3 Mathura Road, New Delhi 110076', 'ops@concorindia.co.in')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, tax_id = EXCLUDED.tax_id, billing_address = EXCLUDED.billing_address;

-- 2. SEED PROFILES
INSERT INTO profiles (id, email, full_name, phone, system_role)
VALUES
    ('00000000-0000-0000-0000-000000000011', 'shipper@adanilogistics.com', 'Rajesh Malhotra (Logistics Head)', '+91 98110 44219', 'customer'),
    ('00000000-0000-0000-0000-000000000012', 'controller@indianrailways.gov.in', 'DFCCIL Chief Freight Controller', '+91 11 2338 7890', 'railway_admin')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, email = EXCLUDED.email;

-- 3. SEED ORG MEMBERS
INSERT INTO org_members (id, org_id, user_id, role)
VALUES
    ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'owner')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED ROUTES
INSERT INTO routes (id, origin_code, origin_name, destination_code, destination_name, distance_km, estimated_hours, is_active)
VALUES
    ('00000000-0000-0000-0000-000000000101', 'DADRI-WDFC', 'Dadri Multi-Modal Logistic Hub (NCR)', 'JNPT-PORT', 'Jawaharlal Nehru Port Trust (Mumbai)', 1483.00, 24.50, true),
    ('00000000-0000-0000-0000-000000000102', 'LUDHIANA-ICD', 'Ludhiana Inland Container Depot', 'MUNDRA-PORT', 'Mundra Port APSEZ Freight Complex (Gujarat)', 1150.00, 19.00, true),
    ('00000000-0000-0000-0000-000000000103', 'REWARI-HUB', 'Rewari Junction Freight Yard', 'PIPAVAV-PORT', 'Pipavav Port Container Terminal', 980.00, 16.50, true),
    ('00000000-0000-0000-0000-000000000104', 'BILASPUR-SEC', 'Bilaspur Coal Basin Logistics Yard', 'VISAKHAPATNAM', 'Visakhapatnam Port Bulk Siding', 560.00, 11.00, true),
    ('00000000-0000-0000-0000-000000000105', 'SANAND-AUTO', 'Sanand Automotive Rail Terminal (Gujarat)', 'CHENNAI-HARBOUR', 'Chennai Harbour Goods Siding', 1720.00, 31.00, true),
    ('00000000-0000-0000-0000-000000000106', 'HOWRAH-E-CORR', 'Dankuni Freight Complex (Howrah/EDFC)', 'DADRI-WDFC', 'Dadri Multi-Modal Logistic Hub (NCR)', 1390.00, 22.00, true)
ON CONFLICT (id) DO UPDATE SET origin_name = EXCLUDED.origin_name, destination_name = EXCLUDED.destination_name;

-- 5. SEED CARGO TYPES
INSERT INTO cargo_types (id, code, name, category, unit_of_measure, rate_multiplier, handling_notes, is_active)
VALUES
    ('00000000-0000-0000-0000-000000000201', 'DRY_BULK_COAL', 'Thermal Coal & Coke (Bulk Hopper Rake)', 'Bulk', 'MT', 1.00, 'Requires rotary tippler handling at destination. High dusting protocol active.', true),
    ('00000000-0000-0000-0000-000000000202', 'DRY_BULK_MINERAL', 'Iron Ore & Bauxite Aggregates', 'Bulk', 'MT', 1.15, 'Heavy payload wagons with reinforced side walls. Weighbridge mandatory.', true),
    ('00000000-0000-0000-0000-000000000203', 'ISO_CONTAINER_GEN', 'Standard 20ft/40ft ISO Intermodal Containers', 'Container', 'TEU', 1.25, 'Double-stack container flat wagons (BLCA/BLCB). Twist-lock inspection required.', true),
    ('00000000-0000-0000-0000-000000000204', 'ISO_REEFER_COLD', 'Refrigerated Cold Chain Cargo (Pharma/Agri)', 'Refrigerated', 'TEU', 1.60, 'Continuous onboard genset power monitoring required (+2°C to -18°C).', true),
    ('00000000-0000-0000-0000-000000000205', 'LIQUID_PETROCHEM', 'Petroleum, Oil & Lubricants (POL Tanker Rake)', 'Liquid', 'kL', 1.45, 'Hazard Class 3. Flameproof degassing certificate mandatory prior to siding entry.', true),
    ('00000000-0000-0000-0000-000000000206', 'AUTO_RAKE_RO_RO', 'Automobile Roll-On / Roll-Off (BCACBM Rake)', 'Automobile', 'MT', 1.30, 'Multi-tier bi-level car carrier rakes with wheel chocking security.', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, rate_multiplier = EXCLUDED.rate_multiplier;

-- 6. SEED SLOTS
INSERT INTO slots (id, slot_number, route_id, departure_time, arrival_time, service_type, total_capacity, remaining_capacity, base_rate_per_unit, status)
VALUES
    ('00000000-0000-0000-0000-000000000301', 'FL-WDFC-EX-01', '00000000-0000-0000-0000-000000000101', NOW() + INTERVAL '1 day' + INTERVAL '4 hours', NOW() + INTERVAL '2 days' + INTERVAL '4 hours', 'express', 1800.00, 1800.00, 145.00, 'scheduled'),
    ('00000000-0000-0000-0000-000000000302', 'FL-WDFC-NR-02', '00000000-0000-0000-0000-000000000101', NOW() + INTERVAL '2 days' + INTERVAL '8 hours', NOW() + INTERVAL '3 days' + INTERVAL '12 hours', 'normal', 2400.00, 2150.00, 110.00, 'scheduled'),
    ('00000000-0000-0000-0000-000000000303', 'FL-CONT-MUNDRA-03', '00000000-0000-0000-0000-000000000102', NOW() + INTERVAL '1 day' + INTERVAL '10 hours', NOW() + INTERVAL '2 days' + INTERVAL '5 hours', 'express', 1200.00, 980.00, 135.00, 'scheduled'),
    ('00000000-0000-0000-0000-000000000304', 'FL-BULK-VIZAG-04', '00000000-0000-0000-0000-000000000104', NOW() + INTERVAL '1 day' + INTERVAL '2 hours', NOW() + INTERVAL '1 day' + INTERVAL '13 hours', 'normal', 3600.00, 3600.00, 85.00, 'scheduled'),
    ('00000000-0000-0000-0000-000000000305', 'FL-PIPAVAV-NR-05', '00000000-0000-0000-0000-000000000103', NOW() + INTERVAL '3 days' + INTERVAL '6 hours', NOW() + INTERVAL '3 days' + INTERVAL '22 hours', 'normal', 1500.00, 1500.00, 98.00, 'scheduled'),
    ('00000000-0000-0000-0000-000000000306', 'FL-AUTO-CHN-06', '00000000-0000-0000-0000-000000000105', NOW() + INTERVAL '2 days' + INTERVAL '14 hours', NOW() + INTERVAL '3 days' + INTERVAL '21 hours', 'express', 1100.00, 1100.00, 160.00, 'scheduled'),
    ('00000000-0000-0000-0000-000000000307', 'FL-EDFC-EX-07', '00000000-0000-0000-0000-000000000106', NOW() + INTERVAL '1 day' + INTERVAL '16 hours', NOW() + INTERVAL '2 days' + INTERVAL '14 hours', 'express', 2200.00, 1950.00, 140.00, 'scheduled')
ON CONFLICT (id) DO UPDATE SET remaining_capacity = EXCLUDED.remaining_capacity, total_capacity = EXCLUDED.total_capacity;
