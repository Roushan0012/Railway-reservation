# Railway Commodity Reservation System (Freight IRCTC)

A production-grade B2B web application for reserving, checking availability, booking, and cancelling cargo and bulk commodity freight slots on dedicated rail corridors (the freight equivalent of IRCTC).

---

## 1. Actor Model & Use Cases

### Actor 1: Business Customer (Shipper / Logistics Account Holder)
- **Organization Onboarding**: Operates under a multi-tenant business entity (e.g., *Adani Logistics*, *Tata Steel*, *CONCOR*).
- **Availability Search**: Queries rail slots by Origin/Destination freight terminals, scheduled date, cargo category (Dry Bulk, Containerized ISO, Liquid Tanker, Reefer, Auto Rake), and service tier (Express vs. Standard).
- **Slot Reservation**: Books a slot specifying exact quantity/tonnage, views instant cost breakdown based on route distance, base freight rate, cargo multiplier, and express factor.
- **Confirmation & Receipts**: Receives a unique booking reference code (e.g. `RR-202608-4821`), downloadable/printable consignment note & electronic railway receipt.
- **Consignment Dashboard**: Views all active, departed, and past bookings for their organization with status filters.
- **Cancellation Flow**: Cancels active reservations prior to slot departure with mandatory reason logging; instantly updates status and triggers atomic capacity restoration.

### Actor 2: Admin / Railway Network Operator (DFCCIL Controller)
- **Network Inventory Control**: Manages routes (terminals, distances, transit schedules), cargo type definitions (handling notes, rate multipliers), and creates scheduled freight slots with designated capacity, departure/arrival timestamps, service tier, and base rates.
- **Master Operations & Visibility**: System-wide oversight over all freight bookings across all registered organizations, slot occupancy rates, and cancellation logs.
- **Operational Status Management**: Updates slot lifecycle (Scheduled → Boarding/Loading → In Transit / Departed → Completed).

---

## 2. Entity Relationships & Database Schema

```
+------------------+         +--------------------+         +-------------------+
|  organizations   |<----+---|    org_members     |---+---->|     profiles      |
|  (Tenant Root)   |     |   | (User-Org mapping) |   |     | (auth.users sync) |
+------------------+     |   +--------------------+   |     +-------------------+
         |               |                            |               |
         | (1:N)         |                            |               |
         v               |                            |               |
+------------------+     |                            |               |
|     bookings     |-----+----------------------------+               |
| (Slot Bookings)  |                                                  |
+------------------+                                                  |
     |         ^                                                      |
     | (1:1)   | (N:1)                                                |
     v         |                                                      |
+------------------+     +--------------------+                       |
|  cancellations   |     |       slots        |                       |
| (Audit & Refund) |     |  (Train Schedules) |                       |
+------------------+     +--------------------+                       |
                               |          |                           |
                        (N:1)  v          v  (N:1)                    |
                          +--------+  +-------------+                 |
                          | routes |  | cargo_types |                 |
                          +--------+  +-------------+                 |
```

### Core Entities
1. `profiles`: Extends Supabase auth; stores contact info and system roles (`customer` | `railway_admin`).
2. `organizations`: Multi-tenant business accounts (Company Name, GSTIN/Tax ID, billing address).
3. `org_members`: Maps users to organizations with roles (`owner`, `admin`, `member`).
4. `routes`: Origin and destination freight stations, distance (km), estimated transit hours, active status.
5. `cargo_types`: Classifications (Dry Bulk, Liquid Tanker, Containerized ISO, Reefer, Auto Rake), handling protocols, unit of measure (`MT`, `TEU`, `kL`), base multiplier.
6. `slots`: Scheduled freight runs on a route with departure/arrival timestamps, service tier (`normal` | `express`), total capacity, remaining capacity, base rate per unit, and status.
7. `bookings`: Consignment reservations with unique booking references, scoped to an organization and user, linking slot and cargo type with exact quantity and final cost.
8. `cancellations`: 1:1 audit records for cancelled bookings logging the actor, timestamp, reason, and restored capacity.

---

## 3. Strict Black & White Theme Rules

The UI strictly adheres to a high-contrast monochrome design language:
- **No Chromatic Colors**: No greens, reds, blues, or yellows anywhere in the application.
- **Hierarchy & Status Indicators**:
  - **Confirmed**: Solid Black background, White bold text, shield/check icon.
  - **Cancelled**: 2px Dashed Black border, White background, strikethrough decoration + cross icon.
  - **Scheduled / In Transit**: 2px Solid Black border, Black text, clock icon.
  - **Express Service**: Solid Black pill badge with lightning bolt icon.
- **Buttons / CTAs**: Solid black with white text (primary), outlined black on white with bold border (secondary).
- **Typography**: Inter & Geist Mono with high-contrast font weights.

---

## 4. Hard Constraints & Atomic Invariants

1. **Atomic Capacity Guard**: A booking cannot be created if `requested_quantity > remaining_capacity` or `remaining_capacity <= 0`. Handled via transactional Postgres RPC (`book_slot_atomic`) with `FOR UPDATE` row-level locks on `slots`.
2. **Atomic Capacity Restoration**: Cancelling a booking increments `slots.remaining_capacity` by the exact booking quantity and logs a cancellation record in a single atomic transaction (`cancel_booking_atomic`).
3. **Idempotency & Status Guard**: A booking cannot be cancelled twice, and cannot be cancelled if slot departure timestamp is in the past or status is `departed`/`completed`.
4. **Multi-Tenant RLS**: All customer queries are scoped to the user's active organization via RLS. Admin role has global bypass/policy access for inventory management.
5. **Express vs Normal Service**: Express service applies an operational premium multiplier (1.35x base cost) and guarantees prioritized non-stop transit.

---

## 5. Local Setup & Running with Supabase

### Prerequisites
- Node.js 18+
- npm

### Installation
```bash
# Clone or navigate to the project directory
cd /Users/roushan_iiitbgp/Desktop/Project1

# Install dependencies
npm install

# Run the development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Supabase Database Setup
1. Open your Supabase Dashboard SQL Editor for project `qmjtbovedceegyblbbuj`.
2. Execute the contents of `supabase/schema.sql` to create all tables, indexes, RLS policies, and atomic RPC functions.
3. Execute the contents of `supabase/seed.sql` to seed initial freight corridors, cargo classifications, and scheduled train slots.
