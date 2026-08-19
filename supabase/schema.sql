-- RAILWAY COMMODITY RESERVATION SYSTEM (FREIGHT IRCTC)
-- COMPREHENSIVE POSTGRES SCHEMA & RLS SETUP

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'railway_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE org_role AS ENUM ('owner', 'admin', 'member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE service_tier AS ENUM ('normal', 'express');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE slot_status AS ENUM ('scheduled', 'boarding', 'in_transit', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled', 'departed', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE cargo_unit AS ENUM ('MT', 'TEU', 'kL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    system_role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ORGANIZATIONS (B2B Multi-tenant Accounts)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    tax_id TEXT, -- e.g. GSTIN / Business ID
    billing_address TEXT,
    contact_email TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ORG MEMBERS (User-Org Mapping)
CREATE TABLE IF NOT EXISTS org_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role org_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

-- 6. ROUTES
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin_code TEXT NOT NULL,       -- e.g. "NDLS-CARGO"
    origin_name TEXT NOT NULL,       -- e.g. "Delhi ICD Dadri Hub"
    destination_code TEXT NOT NULL,  -- e.g. "JNPT-MUMBAI"
    destination_name TEXT NOT NULL,  -- e.g. "Jawaharlal Nehru Port Terminal"
    distance_km NUMERIC(10,2) NOT NULL CHECK (distance_km > 0),
    estimated_hours NUMERIC(6,2) NOT NULL CHECK (estimated_hours > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CARGO TYPES
CREATE TABLE IF NOT EXISTS cargo_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,       -- e.g. "DRY_BULK", "ISO_CONT", "LIQ_CHEM"
    name TEXT NOT NULL,              -- e.g. "Industrial Bulk (Coal / Minerals)"
    category TEXT NOT NULL,          -- e.g. "Bulk", "Container", "Liquid", "Refrigerated", "Automobile"
    unit_of_measure cargo_unit NOT NULL DEFAULT 'MT',
    rate_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.00 CHECK (rate_multiplier > 0),
    handling_notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. SLOTS (Scheduled Freight Train Allocations)
CREATE TABLE IF NOT EXISTS slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_number TEXT UNIQUE NOT NULL, -- e.g. "FR-2026-0820-01"
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE RESTRICT,
    departure_time TIMESTAMPTZ NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL,
    service_type service_tier NOT NULL DEFAULT 'normal',
    total_capacity NUMERIC(10,2) NOT NULL CHECK (total_capacity > 0),
    remaining_capacity NUMERIC(10,2) NOT NULL CHECK (remaining_capacity >= 0),
    base_rate_per_unit NUMERIC(10,2) NOT NULL CHECK (base_rate_per_unit > 0),
    status slot_status NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_slot_times CHECK (arrival_time > departure_time),
    CONSTRAINT valid_capacity CHECK (remaining_capacity <= total_capacity)
);

-- 9. BOOKINGS (Consignments)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_ref TEXT UNIQUE NOT NULL, -- e.g. "RR-202608-4821"
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    slot_id UUID NOT NULL REFERENCES slots(id) ON DELETE RESTRICT,
    cargo_type_id UUID NOT NULL REFERENCES cargo_types(id) ON DELETE RESTRICT,
    quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
    unit_rate NUMERIC(10,2) NOT NULL,
    total_cost NUMERIC(12,2) NOT NULL CHECK (total_cost > 0),
    status booking_status NOT NULL DEFAULT 'confirmed',
    handling_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. CANCELLATIONS
CREATE TABLE IF NOT EXISTS cancellations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    cancelled_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    cancellation_reason TEXT NOT NULL,
    restored_capacity NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_slots_route_dept ON slots(route_id, departure_time);
CREATE INDEX IF NOT EXISTS idx_slots_status ON slots(status);
CREATE INDEX IF NOT EXISTS idx_bookings_org ON bookings(org_id);
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON org_members(user_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargo_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancellations ENABLE ROW LEVEL SECURITY;

-- Helper check function for admin role
CREATE OR REPLACE FUNCTION is_railway_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = p_user_id AND system_role = 'railway_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON profiles;
CREATE POLICY "Profiles are readable by authenticated users" ON profiles
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Organizations Policies
DROP POLICY IF EXISTS "Orgs readable by members or admin" ON organizations;
CREATE POLICY "Orgs readable by members or admin" ON organizations
    FOR SELECT TO authenticated
    USING (
        is_railway_admin(auth.uid()) OR
        id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Authenticated users can create org" ON organizations;
CREATE POLICY "Authenticated users can create org" ON organizations
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Org admins can update org" ON organizations;
CREATE POLICY "Org admins can update org" ON organizations
    FOR UPDATE TO authenticated
    USING (
        is_railway_admin(auth.uid()) OR
        id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- Org Members Policies
DROP POLICY IF EXISTS "Org members readable by peers or admin" ON org_members;
CREATE POLICY "Org members readable by peers or admin" ON org_members
    FOR SELECT TO authenticated
    USING (
        is_railway_admin(auth.uid()) OR
        org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Org members can be inserted by creator or admin" ON org_members;
CREATE POLICY "Org members can be inserted by creator or admin" ON org_members
    FOR INSERT TO authenticated WITH CHECK (
        is_railway_admin(auth.uid()) OR
        user_id = auth.uid() OR
        org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- Routes Policies (Publicly readable, admin modifiable)
DROP POLICY IF EXISTS "Routes readable by everyone" ON routes;
CREATE POLICY "Routes readable by everyone" ON routes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Routes managed by admin" ON routes;
CREATE POLICY "Routes managed by admin" ON routes
    FOR ALL TO authenticated
    USING (is_railway_admin(auth.uid()))
    WITH CHECK (is_railway_admin(auth.uid()));

-- Cargo Types Policies (Publicly readable, admin modifiable)
DROP POLICY IF EXISTS "Cargo types readable by everyone" ON cargo_types;
CREATE POLICY "Cargo types readable by everyone" ON cargo_types
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Cargo types managed by admin" ON cargo_types;
CREATE POLICY "Cargo types managed by admin" ON cargo_types
    FOR ALL TO authenticated
    USING (is_railway_admin(auth.uid()))
    WITH CHECK (is_railway_admin(auth.uid()));

-- Slots Policies (Publicly readable, admin modifiable)
DROP POLICY IF EXISTS "Slots readable by everyone" ON slots;
CREATE POLICY "Slots readable by everyone" ON slots
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Slots managed by admin" ON slots;
CREATE POLICY "Slots managed by admin" ON slots
    FOR ALL TO authenticated
    USING (is_railway_admin(auth.uid()))
    WITH CHECK (is_railway_admin(auth.uid()));

-- Bookings Policies (Scoped to organization or admin)
DROP POLICY IF EXISTS "Bookings readable by org members or admin" ON bookings;
CREATE POLICY "Bookings readable by org members or admin" ON bookings
    FOR SELECT TO authenticated
    USING (
        is_railway_admin(auth.uid()) OR
        org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Bookings insertable by org members" ON bookings;
CREATE POLICY "Bookings insertable by org members" ON bookings
    FOR INSERT TO authenticated
    WITH CHECK (
        is_railway_admin(auth.uid()) OR
        org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Bookings updatable by org members or admin" ON bookings;
CREATE POLICY "Bookings updatable by org members or admin" ON bookings
    FOR UPDATE TO authenticated
    USING (
        is_railway_admin(auth.uid()) OR
        org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
    );

-- Cancellations Policies
DROP POLICY IF EXISTS "Cancellations readable by org or admin" ON cancellations;
CREATE POLICY "Cancellations readable by org or admin" ON cancellations
    FOR SELECT TO authenticated
    USING (
        is_railway_admin(auth.uid()) OR
        booking_id IN (
            SELECT id FROM bookings
            WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Cancellations insertable by org or admin" ON cancellations;
CREATE POLICY "Cancellations insertable by org or admin" ON cancellations
    FOR INSERT TO authenticated
    WITH CHECK (
        is_railway_admin(auth.uid()) OR
        booking_id IN (
            SELECT id FROM bookings
            WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
        )
    );

-- ATOMIC STORED PROCEDURES (RPC)

-- 1. Atomic Booking Procedure
CREATE OR REPLACE FUNCTION book_slot_atomic(
    p_org_id UUID,
    p_user_id UUID,
    p_slot_id UUID,
    p_cargo_type_id UUID,
    p_quantity NUMERIC,
    p_handling_instructions TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_slot slots%ROWTYPE;
    v_cargo cargo_types%ROWTYPE;
    v_route routes%ROWTYPE;
    v_unit_rate NUMERIC;
    v_service_multiplier NUMERIC;
    v_total_cost NUMERIC;
    v_booking_ref TEXT;
    v_booking_id UUID;
BEGIN
    -- Acquire exclusive row lock on the target slot
    SELECT * INTO v_slot FROM slots WHERE id = p_slot_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Slot not found');
    END IF;

    IF v_slot.status != 'scheduled' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Slot is not currently open for bookings (status: ' || v_slot.status || ')');
    END IF;

    IF v_slot.departure_time <= NOW() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot book freight on a slot that has already departed');
    END IF;

    IF v_slot.remaining_capacity < p_quantity THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Requested quantity (' || p_quantity || ') exceeds available remaining capacity (' || v_slot.remaining_capacity || ')'
        );
    END IF;

    -- Fetch cargo type
    SELECT * INTO v_cargo FROM cargo_types WHERE id = p_cargo_type_id;
    IF NOT FOUND OR NOT v_cargo.is_active THEN
        RETURN jsonb_build_object('success', false, 'error', 'Selected cargo type is invalid or inactive');
    END IF;

    -- Fetch route
    SELECT * INTO v_route FROM routes WHERE id = v_slot.route_id;

    -- Dynamic Pricing formula: base_rate * cargo_multiplier * (1.35 if express else 1.00)
    v_service_multiplier := CASE WHEN v_slot.service_type = 'express' THEN 1.35 ELSE 1.00 END;
    v_unit_rate := ROUND(v_slot.base_rate_per_unit * v_cargo.rate_multiplier * v_service_multiplier, 2);
    v_total_cost := ROUND(v_unit_rate * p_quantity, 2);

    -- Unique Human-readable Booking Reference: e.g. "RR-202608-A93B2F"
    v_booking_ref := 'RR-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));

    -- Decrement slot capacity atomically
    UPDATE slots
    SET remaining_capacity = remaining_capacity - p_quantity
    WHERE id = p_slot_id;

    -- Insert Booking
    INSERT INTO bookings (
        booking_ref, org_id, user_id, slot_id, cargo_type_id,
        quantity, unit_rate, total_cost, status, handling_instructions
    ) VALUES (
        v_booking_ref, p_org_id, p_user_id, p_slot_id, p_cargo_type_id,
        p_quantity, v_unit_rate, v_total_cost, 'confirmed', p_handling_instructions
    ) RETURNING id INTO v_booking_id;

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking_id,
        'booking_ref', v_booking_ref,
        'total_cost', v_total_cost,
        'unit_rate', v_unit_rate,
        'quantity', p_quantity,
        'remaining_capacity', v_slot.remaining_capacity - p_quantity
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Atomic Cancellation Procedure
CREATE OR REPLACE FUNCTION cancel_booking_atomic(
    p_booking_id UUID,
    p_user_id UUID,
    p_reason TEXT
) RETURNS JSONB AS $$
DECLARE
    v_booking bookings%ROWTYPE;
    v_slot slots%ROWTYPE;
BEGIN
    IF p_reason IS NULL OR TRIM(p_reason) = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'A cancellation reason is required');
    END IF;

    -- Lock the booking row
    SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking record not found');
    END IF;

    IF v_booking.status = 'cancelled' THEN
        RETURN jsonb_build_object('success', false, 'error', 'This booking has already been cancelled');
    END IF;

    IF v_booking.status != 'confirmed' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot cancel booking in status: ' || v_booking.status);
    END IF;

    -- Lock the slot row
    SELECT * INTO v_slot FROM slots WHERE id = v_booking.slot_id FOR UPDATE;
    IF v_slot.departure_time <= NOW() OR v_slot.status != 'scheduled' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot cancel booking for a train that has already departed or closed');
    END IF;

    -- Update booking status
    UPDATE bookings
    SET status = 'cancelled', updated_at = NOW()
    WHERE id = p_booking_id;

    -- Restore slot capacity
    UPDATE slots
    SET remaining_capacity = LEAST(v_slot.total_capacity, remaining_capacity + v_booking.quantity)
    WHERE id = v_booking.slot_id;

    -- Log cancellation audit record
    INSERT INTO cancellations (
        booking_id, cancelled_by, cancellation_reason, restored_capacity
    ) VALUES (
        p_booking_id, p_user_id, p_reason, v_booking.quantity
    );

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'booking_ref', v_booking.booking_ref,
        'restored_capacity', v_booking.quantity,
        'new_slot_capacity', v_slot.remaining_capacity + v_booking.quantity
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
