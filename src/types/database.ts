export type UserRole = 'customer' | 'railway_admin';
export type OrgRole = 'owner' | 'admin' | 'member';
export type ServiceTier = 'normal' | 'express';
export type SlotStatus = 'scheduled' | 'boarding' | 'in_transit' | 'completed' | 'cancelled';
export type BookingStatus = 'confirmed' | 'cancelled' | 'departed' | 'completed';
export type CargoUnit = 'MT' | 'TEU' | 'kL';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  system_role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  tax_id?: string | null;
  billing_address?: string | null;
  contact_email: string;
  created_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgRole;
  created_at: string;
  organization?: Organization;
  profile?: Profile;
}

export interface Route {
  id: string;
  origin_code: string;
  origin_name: string;
  destination_code: string;
  destination_name: string;
  distance_km: number;
  estimated_hours: number;
  is_active: boolean;
  created_at: string;
}

export interface CargoType {
  id: string;
  code: string;
  name: string;
  category: string;
  unit_of_measure: CargoUnit;
  rate_multiplier: number;
  handling_notes?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Slot {
  id: string;
  slot_number: string;
  route_id: string;
  departure_time: string;
  arrival_time: string;
  service_type: ServiceTier;
  total_capacity: number;
  remaining_capacity: number;
  base_rate_per_unit: number;
  status: SlotStatus;
  created_at: string;
  route?: Route;
}

export interface Booking {
  id: string;
  booking_ref: string;
  org_id: string;
  user_id: string;
  slot_id: string;
  cargo_type_id: string;
  quantity: number;
  unit_rate: number;
  total_cost: number;
  status: BookingStatus;
  handling_instructions?: string | null;
  created_at: string;
  updated_at: string;
  slot?: Slot;
  cargo_type?: CargoType;
  organization?: Organization;
  profile?: Profile;
  cancellation?: Cancellation | null;
}

export interface Cancellation {
  id: string;
  booking_id: string;
  cancelled_by: string;
  cancellation_reason: string;
  restored_capacity: number;
  created_at: string;
  cancelled_by_profile?: Profile;
}

export interface AvailabilitySearchParams {
  originCode?: string;
  destinationCode?: string;
  departureDate?: string;
  cargoTypeId?: string;
  serviceType?: ServiceTier | 'all';
}

export interface BookingRequest {
  orgId: string;
  userId: string;
  slotId: string;
  cargoTypeId: string;
  quantity: number;
  handlingInstructions?: string;
}

export interface BookingResult {
  success: boolean;
  bookingId?: string;
  bookingRef?: string;
  totalCost?: number;
  unitRate?: number;
  quantity?: number;
  remainingCapacity?: number;
  error?: string;
}

export interface CancellationResult {
  success: boolean;
  bookingId?: string;
  bookingRef?: string;
  restoredCapacity?: number;
  newSlotCapacity?: number;
  error?: string;
}
