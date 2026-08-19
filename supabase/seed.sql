-- SEED DATA FOR RAILWAY COMMODITY RESERVATION SYSTEM (FREIGHT IRCTC)

-- 1. CARGO TYPES
INSERT INTO cargo_types (code, name, category, unit_of_measure, rate_multiplier, handling_notes)
VALUES 
    ('DRY_BULK_COAL', 'Thermal Coal & Coke (Bulk Hopper Rake)', 'Bulk', 'MT', 1.00, 'Requires rotary tippler handling at destination. High dusting protocol active.'),
    ('DRY_BULK_MINERAL', 'Iron Ore & Bauxite Aggregates', 'Bulk', 'MT', 1.15, 'Heavy payload wagons with reinforced side walls. Weighbridge mandatory.'),
    ('ISO_CONTAINER_GEN', 'Standard 20ft/40ft ISO Intermodal Containers', 'Container', 'TEU', 1.25, 'Double-stack container flat wagons (BLCA/BLCB). Twist-lock inspection required.'),
    ('ISO_REEFER_COLD', 'Refrigerated Cold Chain Cargo (Pharma/Agri)', 'Refrigerated', 'TEU', 1.60, 'Continuous onboard genset power monitoring required (+2°C to -18°C).'),
    ('LIQUID_PETROCHEM', 'Petroleum, Oil & Lubricants (POL Tanker Rake)', 'Liquid', 'kL', 1.45, 'Hazard Class 3. Flameproof degassing certificate mandatory prior to siding entry.'),
    ('AUTO_RAKE_RO_RO', 'Automobile Roll-On / Roll-Off (BCACBM Rake)', 'Automobile', 'MT', 1.30, 'Multi-tier bi-level car carrier rakes with wheel chocking security.')
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name, 
    category = EXCLUDED.category, 
    rate_multiplier = EXCLUDED.rate_multiplier, 
    handling_notes = EXCLUDED.handling_notes;

-- 2. ROUTES (Corridors across Dedicated Freight Corridors)
INSERT INTO routes (origin_code, origin_name, destination_code, destination_name, distance_km, estimated_hours)
VALUES
    ('DADRI-WDFC', 'Dadri Multi-Modal Logistic Hub (NCR)', 'JNPT-PORT', 'Jawaharlal Nehru Port Trust (Mumbai)', 1483.00, 24.50),
    ('LUDHIANA-ICD', 'Ludhiana Inland Container Depot', 'MUNDRA-PORT', 'Mundra Port APSEZ Freight Complex (Gujarat)', 1150.00, 19.00),
    ('REWARI-HUB', 'Rewari Junction Freight Yard', 'PIPAVAV-PORT', 'Pipavav Port Container Terminal', 980.00, 16.50),
    ('BILASPUR-SEC', 'Bilaspur Coal Basin Logistics Yard', 'VISAKHAPATNAM', 'Visakhapatnam Port Bulk Siding', 560.00, 11.00),
    ('SANAND-AUTO', 'Sanand Automotive Rail Terminal (Gujarat)', 'CHENNAI-HARBOUR', 'Chennai Harbour Goods Siding', 1720.00, 31.00),
    ('HOWRAH-E-CORR', 'Dankuni Freight Complex (Howrah/EDFC)', 'DADRI-WDFC', 'Dadri Multi-Modal Logistic Hub (NCR)', 1390.00, 22.00)
ON CONFLICT DO NOTHING;

-- 3. SCHEDULED SLOTS (Upcoming 7 Days)
-- Dynamically inserting scheduled slots for available routes
DO $$
DECLARE
    r_dadri_jnpt UUID;
    r_ludhiana_mundra UUID;
    r_rewari_pipavav UUID;
    r_bilaspur_vizag UUID;
    r_sanand_chennai UUID;
    r_howrah_dadri UUID;
BEGIN
    SELECT id INTO r_dadri_jnpt FROM routes WHERE origin_code = 'DADRI-WDFC' LIMIT 1;
    SELECT id INTO r_ludhiana_mundra FROM routes WHERE origin_code = 'LUDHIANA-ICD' LIMIT 1;
    SELECT id INTO r_rewari_pipavav FROM routes WHERE origin_code = 'REWARI-HUB' LIMIT 1;
    SELECT id INTO r_bilaspur_vizag FROM routes WHERE origin_code = 'BILASPUR-SEC' LIMIT 1;
    SELECT id INTO r_sanand_chennai FROM routes WHERE origin_code = 'SANAND-AUTO' LIMIT 1;
    SELECT id INTO r_howrah_dadri FROM routes WHERE origin_code = 'HOWRAH-E-CORR' LIMIT 1;

    -- DADRI -> JNPT (Tomorrow Express Slot)
    INSERT INTO slots (slot_number, route_id, departure_time, arrival_time, service_type, total_capacity, remaining_capacity, base_rate_per_unit, status)
    VALUES (
        'FL-WDFC-EX-01',
        r_dadri_jnpt,
        NOW() + INTERVAL '1 day' + INTERVAL '4 hours',
        NOW() + INTERVAL '2 days' + INTERVAL '4 hours' + INTERVAL '30 minutes',
        'express',
        1800.00,
        1800.00,
        145.00,
        'scheduled'
    ) ON CONFLICT (slot_number) DO NOTHING;

    -- DADRI -> JNPT (Day after tomorrow Normal Slot)
    INSERT INTO slots (slot_number, route_id, departure_time, arrival_time, service_type, total_capacity, remaining_capacity, base_rate_per_unit, status)
    VALUES (
        'FL-WDFC-NR-02',
        r_dadri_jnpt,
        NOW() + INTERVAL '2 days' + INTERVAL '8 hours',
        NOW() + INTERVAL '3 days' + INTERVAL '12 hours',
        'normal',
        2400.00,
        2150.00,
        110.00,
        'scheduled'
    ) ON CONFLICT (slot_number) DO NOTHING;

    -- LUDHIANA -> MUNDRA (Express Container Special)
    INSERT INTO slots (slot_number, route_id, departure_time, arrival_time, service_type, total_capacity, remaining_capacity, base_rate_per_unit, status)
    VALUES (
        'FL-CONT-MUNDRA-03',
        r_ludhiana_mundra,
        NOW() + INTERVAL '1 day' + INTERVAL '10 hours',
        NOW() + INTERVAL '2 days' + INTERVAL '5 hours',
        'express',
        1200.00,
        980.00,
        135.00,
        'scheduled'
    ) ON CONFLICT (slot_number) DO NOTHING;

    -- BILASPUR -> VIZAG (Bulk Heavy Haul Normal)
    INSERT INTO slots (slot_number, route_id, departure_time, arrival_time, service_type, total_capacity, remaining_capacity, base_rate_per_unit, status)
    VALUES (
        'FL-BULK-VIZAG-04',
        r_bilaspur_vizag,
        NOW() + INTERVAL '1 day' + INTERVAL '2 hours',
        NOW() + INTERVAL '1 day' + INTERVAL '13 hours',
        'normal',
        3600.00,
        3600.00,
        85.00,
        'scheduled'
    ) ON CONFLICT (slot_number) DO NOTHING;

    -- REWARI -> PIPAVAV (Normal Service)
    INSERT INTO slots (slot_number, route_id, departure_time, arrival_time, service_type, total_capacity, remaining_capacity, base_rate_per_unit, status)
    VALUES (
        'FL-PIPAVAV-NR-05',
        r_rewari_pipavav,
        NOW() + INTERVAL '3 days' + INTERVAL '6 hours',
        NOW() + INTERVAL '3 days' + INTERVAL '22 hours' + INTERVAL '30 minutes',
        'normal',
        1500.00,
        1500.00,
        98.00,
        'scheduled'
    ) ON CONFLICT (slot_number) DO NOTHING;

    -- SANAND -> CHENNAI (Auto Rake Express)
    INSERT INTO slots (slot_number, route_id, departure_time, arrival_time, service_type, total_capacity, remaining_capacity, base_rate_per_unit, status)
    VALUES (
        'FL-AUTO-CHN-06',
        r_sanand_chennai,
        NOW() + INTERVAL '2 days' + INTERVAL '14 hours',
        NOW() + INTERVAL '3 days' + INTERVAL '21 hours',
        'express',
        1100.00,
        1100.00,
        160.00,
        'scheduled'
    ) ON CONFLICT (slot_number) DO NOTHING;

    -- HOWRAH -> DADRI (East-West Corridor Express)
    INSERT INTO slots (slot_number, route_id, departure_time, arrival_time, service_type, total_capacity, remaining_capacity, base_rate_per_unit, status)
    VALUES (
        'FL-EDFC-EX-07',
        r_howrah_dadri,
        NOW() + INTERVAL '1 day' + INTERVAL '16 hours',
        NOW() + INTERVAL '2 days' + INTERVAL '14 hours',
        'express',
        2200.00,
        1950.00,
        140.00,
        'scheduled'
    ) ON CONFLICT (slot_number) DO NOTHING;
END $$;
