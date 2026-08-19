import {
  Route,
  CargoType,
  Slot,
  Booking,
  Cancellation,
  Organization,
  Profile,
  OrgMember,
  AvailabilitySearchParams,
  BookingRequest,
  BookingResult,
  CancellationResult,
  UserRole,
} from '@/types/database';
import { supabase } from '@/lib/supabase/client';

export const DEFAULT_ORGS: Organization[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Adani Logistics Intermodal Ltd',
    tax_id: '07AAACA1234F1Z8',
    billing_address: 'Sector 32, Institutional Area, Gurugram, NCR 122001',
    contact_email: 'dispatch@adanilogistics.com',
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Tata Steel Freight & Raw Materials Div',
    tax_id: '20AAACT5678Q1Z4',
    billing_address: 'Jamshedpur Works, Jamshedpur, Jharkhand 831001',
    contact_email: 'railfreight@tatasteel.com',
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Container Corporation of India (CONCOR)',
    tax_id: '07AAACC9876K1ZY',
    billing_address: 'CONCOR Bhawan, C-3 Mathura Road, New Delhi 110076',
    contact_email: 'ops@concorindia.co.in',
    created_at: new Date().toISOString(),
  },
];

export const DEFAULT_PROFILES: Profile[] = [
  {
    id: '00000000-0000-0000-0000-000000000011',
    email: 'shipper@adanilogistics.com',
    full_name: 'Rajesh Malhotra (Logistics Head)',
    phone: '+91 98110 44219',
    system_role: 'customer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000012',
    email: 'controller@indianrailways.gov.in',
    full_name: 'DFCCIL Chief Freight Controller',
    phone: '+91 11 2338 7890',
    system_role: 'railway_admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const STORAGE_KEY = 'railway_freight_system_state_v2';

interface AppState {
  routes: Route[];
  cargoTypes: CargoType[];
  slots: Slot[];
  organizations: Organization[];
  profiles: Profile[];
  orgMembers: OrgMember[];
  bookings: Booking[];
  cancellations: Cancellation[];
  currentUserId: string;
  currentOrgId: string;
  currentRole: UserRole;
}

class RailwayDataStore {
  private state: AppState;
  private isInitialized = false;

  constructor() {
    this.state = this.loadInitialState();
    if (typeof window !== 'undefined') {
      this.syncWithSupabase();
    }
  }

  private loadInitialState(): AppState {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // Fall back to default
        }
      }
    }

    return {
      routes: [],
      cargoTypes: [],
      slots: [],
      organizations: DEFAULT_ORGS,
      profiles: DEFAULT_PROFILES,
      orgMembers: [],
      bookings: [],
      cancellations: [],
      currentUserId: '00000000-0000-0000-0000-000000000011',
      currentOrgId: '00000000-0000-0000-0000-000000000001',
      currentRole: 'customer',
    };
  }

  private saveState() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    }
  }

  // Real-time synchronization with Supabase Database
  public async syncWithSupabase() {
    try {
      const [
        { data: routesData },
        { data: cargoData },
        { data: slotsData },
        { data: bookingsData },
        { data: cancellationsData },
        { data: orgsData },
        { data: profilesData }
      ] = await Promise.all([
        supabase.from('routes').select('*').order('created_at', { ascending: true }),
        supabase.from('cargo_types').select('*').order('created_at', { ascending: true }),
        supabase.from('slots').select('*').order('departure_time', { ascending: true }),
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('cancellations').select('*').order('created_at', { ascending: false }),
        supabase.from('organizations').select('*'),
        supabase.from('profiles').select('*')
      ]);

      let updated = false;

      if (routesData && routesData.length > 0) {
        this.state.routes = routesData;
        updated = true;
      }
      if (cargoData && cargoData.length > 0) {
        this.state.cargoTypes = cargoData;
        updated = true;
      }
      if (slotsData && slotsData.length > 0) {
        this.state.slots = slotsData;
        updated = true;
      }
      if (bookingsData && bookingsData.length > 0) {
        this.state.bookings = bookingsData;
        updated = true;
      }
      if (cancellationsData && cancellationsData.length > 0) {
        this.state.cancellations = cancellationsData;
        updated = true;
      }
      if (orgsData && orgsData.length > 0) {
        this.state.organizations = orgsData;
        updated = true;
      }
      if (profilesData && profilesData.length > 0) {
        this.state.profiles = profilesData;
        updated = true;
      }

      if (updated) {
        this.saveState();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('railway_state_changed'));
        }
      }
      this.isInitialized = true;
    } catch (err) {
      console.warn('Supabase sync notice:', err);
    }
  }

  // Active Session & Context
  public getSession() {
    const user = this.state.profiles.find((p) => p.id === this.state.currentUserId) || this.state.profiles[0] || DEFAULT_PROFILES[0];
    const org = this.state.organizations.find((o) => o.id === this.state.currentOrgId) || this.state.organizations[0] || DEFAULT_ORGS[0];
    return {
      user,
      org,
      role: this.state.currentRole,
      allOrgs: this.state.organizations.length > 0 ? this.state.organizations : DEFAULT_ORGS,
    };
  }

  public setRole(role: UserRole) {
    this.state.currentRole = role;
    if (role === 'railway_admin') {
      this.state.currentUserId = '00000000-0000-0000-0000-000000000012';
    } else {
      this.state.currentUserId = '00000000-0000-0000-0000-000000000011';
    }
    this.saveState();
  }

  public setOrganization(orgId: string) {
    this.state.currentOrgId = orgId;
    this.saveState();
  }

  // ROUTES CRUD
  public getRoutes(): Route[] {
    return this.state.routes.filter((r) => r.is_active);
  }

  public getAllRoutesAdmin(): Route[] {
    return this.state.routes;
  }

  public getRouteById(id: string): Route | undefined {
    return this.state.routes.find((r) => r.id === id);
  }

  public async createRoute(routeData: Omit<Route, 'id' | 'created_at'>): Promise<Route> {
    const id = crypto.randomUUID();
    const newRoute: Route = {
      ...routeData,
      id,
      created_at: new Date().toISOString(),
    };
    this.state.routes.unshift(newRoute);
    this.saveState();

    // Persist directly to Supabase
    try {
      await supabase.from('routes').insert(newRoute);
    } catch (e) {
      console.warn('Supabase route insert notice:', e);
    }

    return newRoute;
  }

  public async updateRoute(id: string, updates: Partial<Route>): Promise<Route | null> {
    const idx = this.state.routes.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.state.routes[idx] = { ...this.state.routes[idx], ...updates };
    this.saveState();

    // Update in Supabase
    try {
      await supabase.from('routes').update(updates).eq('id', id);
    } catch (e) {
      console.warn('Supabase route update notice:', e);
    }

    return this.state.routes[idx];
  }

  // CARGO TYPES CRUD
  public getCargoTypes(): CargoType[] {
    return this.state.cargoTypes.filter((c) => c.is_active);
  }

  public getAllCargoTypesAdmin(): CargoType[] {
    return this.state.cargoTypes;
  }

  public getCargoTypeById(id: string): CargoType | undefined {
    return this.state.cargoTypes.find((c) => c.id === id);
  }

  public async createCargoType(cargoData: Omit<CargoType, 'id' | 'created_at'>): Promise<CargoType> {
    const id = crypto.randomUUID();
    const newCargo: CargoType = {
      ...cargoData,
      id,
      created_at: new Date().toISOString(),
    };
    this.state.cargoTypes.unshift(newCargo);
    this.saveState();

    try {
      await supabase.from('cargo_types').insert(newCargo);
    } catch (e) {
      console.warn('Supabase cargo insert notice:', e);
    }

    return newCargo;
  }

  public async updateCargoType(id: string, updates: Partial<CargoType>): Promise<CargoType | null> {
    const idx = this.state.cargoTypes.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.state.cargoTypes[idx] = { ...this.state.cargoTypes[idx], ...updates };
    this.saveState();

    try {
      await supabase.from('cargo_types').update(updates).eq('id', id);
    } catch (e) {
      console.warn('Supabase cargo update notice:', e);
    }

    return this.state.cargoTypes[idx];
  }

  // SLOTS CRUD
  public getSlots(): Slot[] {
    return this.state.slots.map((slot) => ({
      ...slot,
      route: this.getRouteById(slot.route_id),
    }));
  }

  public getSlotById(id: string): Slot | undefined {
    const slot = this.state.slots.find((s) => s.id === id);
    if (!slot) return undefined;
    return {
      ...slot,
      route: this.getRouteById(slot.route_id),
    };
  }

  public async createSlot(slotData: Omit<Slot, 'id' | 'created_at' | 'remaining_capacity'>): Promise<Slot> {
    const id = crypto.randomUUID();
    const newSlot: Slot = {
      ...slotData,
      id,
      remaining_capacity: slotData.total_capacity,
      created_at: new Date().toISOString(),
    };
    this.state.slots.unshift(newSlot);
    this.saveState();

    try {
      await supabase.from('slots').insert(newSlot);
    } catch (e) {
      console.warn('Supabase slot insert notice:', e);
    }

    return this.getSlotById(newSlot.id)!;
  }

  public async updateSlot(id: string, updates: Partial<Slot>): Promise<Slot | null> {
    const idx = this.state.slots.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.state.slots[idx] = { ...this.state.slots[idx], ...updates };
    this.saveState();

    try {
      await supabase.from('slots').update(updates).eq('id', id);
    } catch (e) {
      console.warn('Supabase slot update notice:', e);
    }

    return this.getSlotById(id) || null;
  }

  // AVAILABILITY SEARCH
  public searchAvailability(params: AvailabilitySearchParams): (Slot & { calculatedRate?: number; calculatedCost?: number })[] {
    const allSlots = this.getSlots();

    return allSlots
      .filter((slot) => {
        if (slot.status !== 'scheduled') return false;
        if (new Date(slot.departure_time) <= new Date()) return false;
        if (slot.remaining_capacity <= 0) return false;

        if (params.originCode && slot.route?.origin_code !== params.originCode) {
          return false;
        }
        if (params.destinationCode && slot.route?.destination_code !== params.destinationCode) {
          return false;
        }

        if (params.departureDate) {
          const searchDate = new Date(params.departureDate).toISOString().split('T')[0];
          const slotDate = new Date(slot.departure_time).toISOString().split('T')[0];
          if (searchDate !== slotDate) return false;
        }

        if (params.serviceType && params.serviceType !== 'all') {
          if (slot.service_type !== params.serviceType) return false;
        }

        return true;
      })
      .map((slot) => {
        let cargoMultiplier = 1.0;
        if (params.cargoTypeId) {
          const cargo = this.getCargoTypeById(params.cargoTypeId);
          if (cargo) cargoMultiplier = cargo.rate_multiplier;
        }
        const serviceMultiplier = slot.service_type === 'express' ? 1.35 : 1.0;
        const calculatedRate = Math.round(slot.base_rate_per_unit * cargoMultiplier * serviceMultiplier * 100) / 100;

        return {
          ...slot,
          calculatedRate,
        };
      })
      .sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime());
  }

  // ATOMIC BOOKING ACTION (DIRECT SUPABASE PERSISTENCE)
  public async bookSlot(req: BookingRequest): Promise<BookingResult> {
    const slotIdx = this.state.slots.findIndex((s) => s.id === req.slotId);
    if (slotIdx === -1) {
      return { success: false, error: 'Slot not found in rail registry.' };
    }

    const slot = this.state.slots[slotIdx];

    if (slot.status !== 'scheduled') {
      return { success: false, error: `Slot is not open for booking (current status: ${slot.status}).` };
    }

    if (new Date(slot.departure_time) <= new Date()) {
      return { success: false, error: 'Cannot book a departed freight slot.' };
    }

    if (req.quantity <= 0) {
      return { success: false, error: 'Quantity must be greater than zero.' };
    }

    if (slot.remaining_capacity < req.quantity) {
      return {
        success: false,
        error: `Requested payload of ${req.quantity} exceeds available slot capacity (${slot.remaining_capacity} available).`,
      };
    }

    const cargo = this.getCargoTypeById(req.cargoTypeId);
    if (!cargo || !cargo.is_active) {
      return { success: false, error: 'Invalid or inactive cargo type selected.' };
    }

    const serviceMultiplier = slot.service_type === 'express' ? 1.35 : 1.0;
    const unitRate = Math.round(slot.base_rate_per_unit * cargo.rate_multiplier * serviceMultiplier * 100) / 100;
    const totalCost = Math.round(unitRate * req.quantity * 100) / 100;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHash = Math.random().toString(36).substring(2, 7).toUpperCase();
    const bookingRef = `RR-${dateStr}-${randomHash}`;
    const bookingId = crypto.randomUUID();

    const newRemainingCapacity = slot.remaining_capacity - req.quantity;

    // 1. Decrement slot locally
    this.state.slots[slotIdx] = {
      ...slot,
      remaining_capacity: newRemainingCapacity,
    };

    const newBooking: Booking = {
      id: bookingId,
      booking_ref: bookingRef,
      org_id: req.orgId,
      user_id: req.userId,
      slot_id: req.slotId,
      cargo_type_id: req.cargoTypeId,
      quantity: req.quantity,
      unit_rate: unitRate,
      total_cost: totalCost,
      status: 'confirmed',
      handling_instructions: req.handlingInstructions || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.bookings.unshift(newBooking);
    this.saveState();

    // 2. Persist DIRECTLY into Supabase Database in Real-Time
    try {
      const { error: bookingInsertError } = await supabase.from('bookings').insert({
        id: bookingId,
        booking_ref: bookingRef,
        org_id: req.orgId,
        user_id: req.userId,
        slot_id: req.slotId,
        cargo_type_id: req.cargoTypeId,
        quantity: req.quantity,
        unit_rate: unitRate,
        total_cost: totalCost,
        status: 'confirmed',
        handling_instructions: req.handlingInstructions || null,
      });

      if (bookingInsertError) {
        console.error('Supabase booking insert error:', bookingInsertError);
      } else {
        console.log('>>> Booking persisted successfully into Supabase table "bookings"! <<<');
      }

      await supabase.from('slots').update({
        remaining_capacity: newRemainingCapacity,
      }).eq('id', req.slotId);
    } catch (e) {
      console.warn('Supabase direct insert exception:', e);
    }

    return {
      success: true,
      bookingId,
      bookingRef,
      totalCost,
      unitRate,
      quantity: req.quantity,
      remainingCapacity: newRemainingCapacity,
    };
  }

  // ATOMIC CANCELLATION ACTION (DIRECT SUPABASE PERSISTENCE)
  public async cancelBooking(bookingId: string, userId: string, reason: string): Promise<CancellationResult> {
    if (!reason || reason.trim() === '') {
      return { success: false, error: 'A valid cancellation reason is required for freight manifest audit.' };
    }

    const bookingIdx = this.state.bookings.findIndex((b) => b.id === bookingId);
    if (bookingIdx === -1) {
      return { success: false, error: 'Booking record not found.' };
    }

    const booking = this.state.bookings[bookingIdx];

    if (booking.status === 'cancelled') {
      return { success: false, error: 'This booking has already been cancelled.' };
    }

    if (booking.status !== 'confirmed') {
      return { success: false, error: `Cannot cancel booking with current status: ${booking.status}.` };
    }

    const slotIdx = this.state.slots.findIndex((s) => s.id === booking.slot_id);
    if (slotIdx === -1) {
      return { success: false, error: 'Associated freight train slot not found.' };
    }

    const slot = this.state.slots[slotIdx];
    if (new Date(slot.departure_time) <= new Date() || slot.status !== 'scheduled') {
      return {
        success: false,
        error: 'Cannot cancel reservation for a train that has already commenced loading/departure.',
      };
    }

    // Update locally
    this.state.bookings[bookingIdx] = {
      ...booking,
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    };

    const restoredCapacity = booking.quantity;
    const newRemaining = Math.min(slot.total_capacity, slot.remaining_capacity + restoredCapacity);
    this.state.slots[slotIdx] = {
      ...slot,
      remaining_capacity: newRemaining,
    };

    const cancellationId = crypto.randomUUID();
    const cancellation: Cancellation = {
      id: cancellationId,
      booking_id: bookingId,
      cancelled_by: userId,
      cancellation_reason: reason.trim(),
      restored_capacity: restoredCapacity,
      created_at: new Date().toISOString(),
    };

    this.state.cancellations.unshift(cancellation);
    this.saveState();

    // Persist directly into Supabase
    try {
      await supabase.from('bookings').update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      }).eq('id', bookingId);

      await supabase.from('slots').update({
        remaining_capacity: newRemaining,
      }).eq('id', booking.slot_id);

      await supabase.from('cancellations').insert({
        id: cancellationId,
        booking_id: bookingId,
        cancelled_by: userId,
        cancellation_reason: reason.trim(),
        restored_capacity: restoredCapacity,
      });

      console.log('>>> Cancellation updated successfully in Supabase! <<<');
    } catch (e) {
      console.warn('Supabase cancellation error:', e);
    }

    return {
      success: true,
      bookingId,
      bookingRef: booking.booking_ref,
      restoredCapacity,
      newSlotCapacity: newRemaining,
    };
  }

  // BOOKINGS DASHBOARD & QUERIES
  public getBookings(orgId?: string, statusFilter?: string): Booking[] {
    let list = this.state.bookings;

    if (orgId && this.state.currentRole !== 'railway_admin') {
      list = list.filter((b) => b.org_id === orgId);
    }

    if (statusFilter && statusFilter !== 'all') {
      list = list.filter((b) => b.status === statusFilter);
    }

    return list.map((b) => {
      const slot = this.getSlotById(b.slot_id);
      const cargoType = this.getCargoTypeById(b.cargo_type_id);
      const organization = this.state.organizations.find((o) => o.id === b.org_id);
      const profile = this.state.profiles.find((p) => p.id === b.user_id);
      const cancellation = this.state.cancellations.find((c) => c.booking_id === b.id) || null;

      return {
        ...b,
        slot,
        cargo_type: cargoType,
        organization,
        profile,
        cancellation,
      };
    });
  }

  public getBookingByRef(bookingRef: string): Booking | undefined {
    const booking = this.state.bookings.find((b) => b.booking_ref.toLowerCase() === bookingRef.toLowerCase());
    if (!booking) return undefined;

    const slot = this.getSlotById(booking.slot_id);
    const cargoType = this.getCargoTypeById(booking.cargo_type_id);
    const organization = this.state.organizations.find((o) => o.id === booking.org_id);
    const profile = this.state.profiles.find((p) => p.id === booking.user_id);
    const cancellation = this.state.cancellations.find((c) => c.booking_id === booking.id) || null;

    return {
      ...booking,
      slot,
      cargo_type: cargoType,
      organization,
      profile,
      cancellation,
    };
  }

  public resetToDefaults() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.syncWithSupabase();
  }
}

export const railwayService = new RailwayDataStore();
