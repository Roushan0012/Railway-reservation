import { railwayService } from '../src/lib/services/railwayService.js';

console.log('====================================================');
console.log('RAILWAY COMMODITY RESERVATION SYSTEM — TEST SUITE');
console.log('====================================================\n');

// 1. Initial State Verification
const session = railwayService.getSession();
console.log('✓ Active Actor Session:', session.role, '— Org:', session.org.name);

const routes = railwayService.getRoutes();
console.log(`✓ Loaded ${routes.length} active rail freight corridors.`);

const cargoTypes = railwayService.getCargoTypes();
console.log(`✓ Loaded ${cargoTypes.length} commodity classifications.`);

const slots = railwayService.getSlots();
console.log(`✓ Loaded ${slots.length} scheduled freight train slots.`);

// 2. Availability Search
const searchResults = railwayService.searchAvailability({
  originCode: 'DADRI-WDFC',
  destinationCode: 'JNPT-PORT',
  serviceType: 'express',
});
console.log(`\n[TEST] Availability Search (DADRI -> JNPT Express): Found ${searchResults.length} slot(s).`);
if (searchResults.length === 0) throw new Error('Search failed to return expected slots');

const targetSlot = searchResults[0];
console.log(`Target Slot: ${targetSlot.slot_number} | Available Capacity: ${targetSlot.remaining_capacity} MT | Rate: ₹${targetSlot.calculatedRate}/MT`);

// 3. Overbooking Guard Test
console.log('\n[TEST] Overbooking Guard: Attempting to reserve 99,999 MT (exceeds capacity)...');
const overbookResult = railwayService.bookSlot({
  orgId: session.org.id,
  userId: session.user.id,
  slotId: targetSlot.id,
  cargoTypeId: cargoTypes[0].id,
  quantity: 99999,
});
if (overbookResult.success) throw new Error('Overbooking guard failed — booking succeeded when it should fail!');
console.log('✓ Overbooking successfully blocked with error:', overbookResult.error);

// 4. Valid Booking Test
const initialCapacity = targetSlot.remaining_capacity;
const bookingPayload = 150; // MT
console.log(`\n[TEST] Committing valid booking for ${bookingPayload} MT on slot ${targetSlot.slot_number}...`);
const bookResult = railwayService.bookSlot({
  orgId: session.org.id,
  userId: session.user.id,
  slotId: targetSlot.id,
  cargoTypeId: cargoTypes[0].id,
  quantity: bookingPayload,
  handlingInstructions: 'Urgent container export cut-off at JNPT port terminal.',
});

if (!bookResult.success || !bookResult.bookingRef) {
  throw new Error(`Booking failed: ${bookResult.error}`);
}
console.log(`✓ Booking Confirmed! Ref: ${bookResult.bookingRef} | Total Invoice: ₹${bookResult.totalCost}`);

// Verify capacity decremented
const updatedSlot = railwayService.getSlotById(targetSlot.id);
console.log(`✓ Slot Capacity updated: Initial = ${initialCapacity} MT -> Now = ${updatedSlot.remaining_capacity} MT`);
if (updatedSlot.remaining_capacity !== initialCapacity - bookingPayload) {
  throw new Error('Capacity decrement mismatch!');
}

// 5. Booking Retrieval Test
const retrievedBooking = railwayService.getBookingByRef(bookResult.bookingRef);
if (!retrievedBooking || retrievedBooking.status !== 'confirmed') {
  throw new Error('Failed to retrieve active booking record!');
}
console.log(`✓ Retrieved booking: Ref = ${retrievedBooking.booking_ref} | Status = ${retrievedBooking.status} | Consignor = ${retrievedBooking.organization?.name}`);

// 6. Cancellation & Capacity Restoration Test
console.log(`\n[TEST] Cancelling reservation ${bookResult.bookingRef} with operational reason...`);
const cancelResult = railwayService.cancelBooking(
  bookResult.bookingId,
  session.user.id,
  'Delayed container stuffing at manufacturing siding'
);

if (!cancelResult.success) {
  throw new Error(`Cancellation failed: ${cancelResult.error}`);
}
console.log(`✓ Cancellation Confirmed! Restored Capacity = ${cancelResult.restoredCapacity} MT`);

const slotAfterCancel = railwayService.getSlotById(targetSlot.id);
console.log(`✓ Slot Capacity after cancellation: ${slotAfterCancel.remaining_capacity} MT (Fully Restored: ${slotAfterCancel.remaining_capacity === initialCapacity})`);
if (slotAfterCancel.remaining_capacity !== initialCapacity) {
  throw new Error('Capacity restoration mismatch!');
}

// 7. Double Cancellation Guard Test
console.log('\n[TEST] Double Cancellation Guard: Attempting to cancel the same booking a second time...');
const doubleCancelResult = railwayService.cancelBooking(
  bookResult.bookingId,
  session.user.id,
  'Duplicate cancellation attempt'
);
if (doubleCancelResult.success) throw new Error('Double cancellation guard failed!');
console.log('✓ Double cancellation successfully blocked with error:', doubleCancelResult.error);

// 8. Admin CRUD Verification
console.log('\n[TEST] Admin Operations: Creating a new corridor and scheduled freight slot...');
railwayService.setRole('railway_admin');
const newRoute = railwayService.createRoute({
  origin_code: 'KANDLA-PORT',
  origin_name: 'Deendayal Port Authority (Kandla)',
  destination_code: 'DADRI-WDFC',
  destination_name: 'Dadri Multi-Modal Logistic Hub (NCR)',
  distance_km: 1110,
  estimated_hours: 18.5,
  is_active: true,
});
console.log(`✓ Created Corridor: [${newRoute.origin_code} -> ${newRoute.destination_code}]`);

const newSlot = railwayService.createSlot({
  slot_number: 'FL-KANDLA-EX-88',
  route_id: newRoute.id,
  departure_time: new Date(Date.now() + 86400000 * 2).toISOString(),
  arrival_time: new Date(Date.now() + 86400000 * 3).toISOString(),
  service_type: 'express',
  total_capacity: 2500,
  base_rate_per_unit: 130,
  status: 'scheduled',
});
console.log(`✓ Created Express Slot: ${newSlot.slot_number} (Capacity: ${newSlot.total_capacity} MT)`);

const testSearch = railwayService.searchAvailability({ originCode: 'KANDLA-PORT' });
if (testSearch.length !== 1) throw new Error('Newly created slot not discoverable in availability search!');
console.log(`✓ Successfully discovered new slot in search results.`);

console.log('\n====================================================');
console.log('ALL INVARIANTS & OPERATIONAL FLOWS PASSED WITH 100% SUCCESS!');
console.log('====================================================\n');
