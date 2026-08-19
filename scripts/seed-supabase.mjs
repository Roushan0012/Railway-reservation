import { createClient } from '@supabase/supabase-js';

const url = 'https://qmjtbovedceegyblbbuj.supabase.co';
const key = 'sb_publishable_r2jPMV2neNniVCZyhqr9dA_9rH0RwlS';

const supabase = createClient(url, key);

async function seed() {
  console.log('Seeding Supabase tables directly via REST API...');

  // 1. Organizations
  const orgs = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Adani Logistics Intermodal Ltd',
      tax_id: '07AAACA1234F1Z8',
      billing_address: 'Sector 32, Institutional Area, Gurugram, NCR 122001',
      contact_email: 'dispatch@adanilogistics.com',
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Tata Steel Freight & Raw Materials Div',
      tax_id: '20AAACT5678Q1Z4',
      billing_address: 'Jamshedpur Works, Jamshedpur, Jharkhand 831001',
      contact_email: 'railfreight@tatasteel.com',
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Container Corporation of India (CONCOR)',
      tax_id: '07AAACC9876K1ZY',
      billing_address: 'CONCOR Bhawan, C-3 Mathura Road, New Delhi 110076',
      contact_email: 'ops@concorindia.co.in',
    },
  ];
  const { error: orgErr } = await supabase.from('organizations').upsert(orgs);
  if (orgErr) console.error('Org seed error:', orgErr);
  else console.log('✓ Organizations seeded');

  // 2. Profiles
  const profiles = [
    {
      id: '00000000-0000-0000-0000-000000000011',
      email: 'shipper@adanilogistics.com',
      full_name: 'Rajesh Malhotra (Logistics Head)',
      phone: '+91 98110 44219',
      system_role: 'customer',
    },
    {
      id: '00000000-0000-0000-0000-000000000012',
      email: 'controller@indianrailways.gov.in',
      full_name: 'DFCCIL Chief Freight Controller',
      phone: '+91 11 2338 7890',
      system_role: 'railway_admin',
    },
  ];
  const { error: profErr } = await supabase.from('profiles').upsert(profiles);
  if (profErr) console.error('Profiles seed error:', profErr);
  else console.log('✓ Profiles seeded');

  // 3. Org Members
  const orgMembers = [
    {
      id: '00000000-0000-0000-0000-000000000021',
      org_id: '00000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000011',
      role: 'owner',
    }
  ];
  const { error: memErr } = await supabase.from('org_members').upsert(orgMembers);
  if (memErr) console.error('Org members seed error:', memErr);
  else console.log('✓ Org Members seeded');

  // 4. Routes
  const routes = [
    {
      id: '00000000-0000-0000-0000-000000000101',
      origin_code: 'DADRI-WDFC',
      origin_name: 'Dadri Multi-Modal Logistic Hub (NCR)',
      destination_code: 'JNPT-PORT',
      destination_name: 'Jawaharlal Nehru Port Trust (Mumbai)',
      distance_km: 1483.00,
      estimated_hours: 24.50,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000102',
      origin_code: 'LUDHIANA-ICD',
      origin_name: 'Ludhiana Inland Container Depot',
      destination_code: 'MUNDRA-PORT',
      destination_name: 'Mundra Port APSEZ Freight Complex (Gujarat)',
      distance_km: 1150.00,
      estimated_hours: 19.00,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000103',
      origin_code: 'REWARI-HUB',
      origin_name: 'Rewari Junction Freight Yard',
      destination_code: 'PIPAVAV-PORT',
      destination_name: 'Pipavav Port Container Terminal',
      distance_km: 980.00,
      estimated_hours: 16.50,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000104',
      origin_code: 'BILASPUR-SEC',
      origin_name: 'Bilaspur Coal Basin Logistics Yard',
      destination_code: 'VISAKHAPATNAM',
      destination_name: 'Visakhapatnam Port Bulk Siding',
      distance_km: 560.00,
      estimated_hours: 11.00,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000105',
      origin_code: 'SANAND-AUTO',
      origin_name: 'Sanand Automotive Rail Terminal (Gujarat)',
      destination_code: 'CHENNAI-HARBOUR',
      destination_name: 'Chennai Harbour Goods Siding',
      distance_km: 1720.00,
      estimated_hours: 31.00,
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000106',
      origin_code: 'HOWRAH-E-CORR',
      origin_name: 'Dankuni Freight Complex (Howrah/EDFC)',
      destination_code: 'DADRI-WDFC',
      destination_name: 'Dadri Multi-Modal Logistic Hub (NCR)',
      distance_km: 1390.00,
      estimated_hours: 22.00,
      is_active: true,
    },
  ];
  const { error: routeErr } = await supabase.from('routes').upsert(routes);
  if (routeErr) console.error('Routes seed error:', routeErr);
  else console.log('✓ Routes seeded');

  // 5. Cargo Types
  const cargoTypes = [
    {
      id: '00000000-0000-0000-0000-000000000201',
      code: 'DRY_BULK_COAL',
      name: 'Thermal Coal & Coke (Bulk Hopper Rake)',
      category: 'Bulk',
      unit_of_measure: 'MT',
      rate_multiplier: 1.00,
      handling_notes: 'Requires rotary tippler handling at destination. High dusting protocol active.',
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000202',
      code: 'DRY_BULK_MINERAL',
      name: 'Iron Ore & Bauxite Aggregates',
      category: 'Bulk',
      unit_of_measure: 'MT',
      rate_multiplier: 1.15,
      handling_notes: 'Heavy payload wagons with reinforced side walls. Weighbridge mandatory.',
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000203',
      code: 'ISO_CONTAINER_GEN',
      name: 'Standard 20ft/40ft ISO Intermodal Containers',
      category: 'Container',
      unit_of_measure: 'TEU',
      rate_multiplier: 1.25,
      handling_notes: 'Double-stack container flat wagons (BLCA/BLCB). Twist-lock inspection required.',
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000204',
      code: 'ISO_REEFER_COLD',
      name: 'Refrigerated Cold Chain Cargo (Pharma/Agri)',
      category: 'Refrigerated',
      unit_of_measure: 'TEU',
      rate_multiplier: 1.60,
      handling_notes: 'Continuous onboard genset power monitoring required (+2°C to -18°C).',
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000205',
      code: 'LIQUID_PETROCHEM',
      name: 'Petroleum, Oil & Lubricants (POL Tanker Rake)',
      category: 'Liquid',
      unit_of_measure: 'kL',
      rate_multiplier: 1.45,
      handling_notes: 'Hazard Class 3. Flameproof degassing certificate mandatory prior to siding entry.',
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000206',
      code: 'AUTO_RAKE_RO_RO',
      name: 'Automobile Roll-On / Roll-Off (BCACBM Rake)',
      category: 'Automobile',
      unit_of_measure: 'MT',
      rate_multiplier: 1.30,
      handling_notes: 'Multi-tier bi-level car carrier rakes with wheel chocking security.',
      is_active: true,
    },
  ];
  const { error: cargoErr } = await supabase.from('cargo_types').upsert(cargoTypes);
  if (cargoErr) console.error('Cargo types seed error:', cargoErr);
  else console.log('✓ Cargo Types seeded');

  // 6. Slots
  const getFutureDate = (daysAhead, hour = 8) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  const slots = [
    {
      id: '00000000-0000-0000-0000-000000000301',
      slot_number: 'FL-WDFC-EX-01',
      route_id: '00000000-0000-0000-0000-000000000101',
      departure_time: getFutureDate(1, 6),
      arrival_time: getFutureDate(2, 6.5),
      service_type: 'express',
      total_capacity: 1800.00,
      remaining_capacity: 1800.00,
      base_rate_per_unit: 145.00,
      status: 'scheduled',
    },
    {
      id: '00000000-0000-0000-0000-000000000302',
      slot_number: 'FL-WDFC-NR-02',
      route_id: '00000000-0000-0000-0000-000000000101',
      departure_time: getFutureDate(2, 10),
      arrival_time: getFutureDate(3, 14),
      service_type: 'normal',
      total_capacity: 2400.00,
      remaining_capacity: 2150.00,
      base_rate_per_unit: 110.00,
      status: 'scheduled',
    },
    {
      id: '00000000-0000-0000-0000-000000000303',
      slot_number: 'FL-CONT-MUNDRA-03',
      route_id: '00000000-0000-0000-0000-000000000102',
      departure_time: getFutureDate(1, 14),
      arrival_time: getFutureDate(2, 9),
      service_type: 'express',
      total_capacity: 1200.00,
      remaining_capacity: 980.00,
      base_rate_per_unit: 135.00,
      status: 'scheduled',
    },
    {
      id: '00000000-0000-0000-0000-000000000304',
      slot_number: 'FL-BULK-VIZAG-04',
      route_id: '00000000-0000-0000-0000-000000000104',
      departure_time: getFutureDate(1, 4),
      arrival_time: getFutureDate(1, 15),
      service_type: 'normal',
      total_capacity: 3600.00,
      remaining_capacity: 3600.00,
      base_rate_per_unit: 85.00,
      status: 'scheduled',
    },
    {
      id: '00000000-0000-0000-0000-000000000305',
      slot_number: 'FL-PIPAVAV-NR-05',
      route_id: '00000000-0000-0000-0000-000000000103',
      departure_time: getFutureDate(3, 8),
      arrival_time: getFutureDate(4, 0.5),
      service_type: 'normal',
      total_capacity: 1500.00,
      remaining_capacity: 1500.00,
      base_rate_per_unit: 98.00,
      status: 'scheduled',
    },
    {
      id: '00000000-0000-0000-0000-000000000306',
      slot_number: 'FL-AUTO-CHN-06',
      route_id: '00000000-0000-0000-0000-000000000105',
      departure_time: getFutureDate(2, 18),
      arrival_time: getFutureDate(4, 1),
      service_type: 'express',
      total_capacity: 1100.00,
      remaining_capacity: 1100.00,
      base_rate_per_unit: 160.00,
      status: 'scheduled',
    },
  ];
  const { error: slotErr } = await supabase.from('slots').upsert(slots);
  if (slotErr) console.error('Slots seed error:', slotErr);
  else console.log('✓ Slots seeded');

  console.log('\n--- Seeding completed! ---');
}

seed();
