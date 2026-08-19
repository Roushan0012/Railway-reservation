'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { railwayService } from '@/lib/services/railwayService';
import { Route, CargoType, Slot } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { CapacityMeter } from '@/components/ui/CapacityMeter';
import {
  Train,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw,
  Building2,
  Layers,
  ArrowUpRight,
  MapPin,
  Clock,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [cargoTypes, setCargoTypes] = useState<CargoType[]>([]);
  const [featuredSlots, setFeaturedSlots] = useState<Slot[]>([]);
  const [originCode, setOriginCode] = useState('');
  const [destinationCode, setDestinationCode] = useState('');
  const [serviceTier, setServiceTier] = useState<string>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRoutes(railwayService.getRoutes());
    setCargoTypes(railwayService.getCargoTypes());
    setFeaturedSlots(railwayService.getSlots().slice(0, 3));
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (originCode) query.set('origin', originCode);
    if (destinationCode) query.set('destination', destinationCode);
    if (serviceTier && serviceTier !== 'all') query.set('service', serviceTier);
    router.push(`/availability?${query.toString()}`);
  };

  if (!mounted) return null;

  return (
    <div className="w-full font-mono space-y-16 py-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="border-4 border-black p-6 sm:p-10 bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          {/* Subtle Grid Accent */}
          <div className="absolute inset-0 opacity-5 bw-grid-bg pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Header Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-black text-white font-black px-2 py-0.5 text-xs tracking-wider uppercase">
                B2B FREIGHT IRCTC
              </span>
              <span className="border-2 border-black px-2 py-0.5 text-xs font-bold text-black uppercase">
                DEDICATED FREIGHT CORRIDORS (WDFC / EDFC)
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-black leading-none">
                RAIL COMMODITY &amp; FREIGHT RESERVATION SYSTEM
              </h1>
              <p className="text-sm sm:text-base font-sans text-neutral-800 max-w-3xl leading-relaxed">
                Industrial bulk, ISO container, tanker and refrigerated payload allocation on India&apos;s rail freight network. Real-time availability checking, atomic slot bookings, instant cancellations, and capacity replenishment.
              </p>
            </div>

            {/* Quick Search Widget */}
            <form
              onSubmit={handleQuickSearch}
              className="p-5 border-4 border-black bg-neutral-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4"
            >
              <div className="text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 border-black pb-2">
                <Search className="w-4 h-4" />
                <span>RAPID FREIGHT AVAILABILITY LOCATOR</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Origin */}
                <div className="space-y-1">
                  <label className="font-bold uppercase text-neutral-700 block">ORIGIN FREIGHT SIDING</label>
                  <select
                    value={originCode}
                    onChange={(e) => setOriginCode(e.target.value)}
                    className="w-full border-2 border-black p-2 font-bold bg-white text-xs focus:outline-none"
                  >
                    <option value="">-- ALL ORIGIN SIDINGS --</option>
                    {routes.map((r) => (
                      <option key={r.id} value={r.origin_code}>
                        [{r.origin_code}] {r.origin_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination */}
                <div className="space-y-1">
                  <label className="font-bold uppercase text-neutral-700 block">DESTINATION PORT / HUB</label>
                  <select
                    value={destinationCode}
                    onChange={(e) => setDestinationCode(e.target.value)}
                    className="w-full border-2 border-black p-2 font-bold bg-white text-xs focus:outline-none"
                  >
                    <option value="">-- ALL DESTINATION HUBS --</option>
                    {routes.map((r) => (
                      <option key={r.id} value={r.destination_code}>
                        [{r.destination_code}] {r.destination_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service Tier */}
                <div className="space-y-1">
                  <label className="font-bold uppercase text-neutral-700 block">SERVICE TIER</label>
                  <select
                    value={serviceTier}
                    onChange={(e) => setServiceTier(e.target.value)}
                    className="w-full border-2 border-black p-2 font-bold bg-white text-xs focus:outline-none"
                  >
                    <option value="all">ALL SERVICE TIERS</option>
                    <option value="express">EXPRESS FREIGHT (+35% TIER)</option>
                    <option value="normal">STANDARD FREIGHT</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-[11px] text-neutral-600">
                  <span>Guaranteed ACID atomic slot allocation &middot; Zero double-booking risk</span>
                </div>
                <button
                  type="submit"
                  className="bw-btn-primary px-6 py-2.5 text-xs font-bold uppercase flex items-center gap-2"
                >
                  <span>SEARCH AVAILABLE SLOTS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Slots Section */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b-4 border-black pb-3">
          <div>
            <div className="text-xs font-bold uppercase text-neutral-600">UPCOMING DEPARTURES</div>
            <h2 className="text-xl sm:text-2xl font-black uppercase">FEATURED FREIGHT RAKE SCHEDULES</h2>
          </div>
          <Link
            href="/availability"
            className="bw-btn-secondary px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5"
          >
            <span>VIEW ALL SCHEDULES</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredSlots.map((slot) => {
            const isExpress = slot.service_type === 'express';
            return (
              <div
                key={slot.id}
                className="border-4 border-black bg-white p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="bg-black text-white font-black px-2 py-0.5 text-xs">
                      {slot.slot_number}
                    </span>
                    <Badge status={slot.service_type} size="sm" />
                  </div>

                  <div>
                    <div className="text-xs font-bold text-black flex items-center gap-1">
                      <span>{slot.route?.origin_code}</span>
                      <span>&rarr;</span>
                      <span>{slot.route?.destination_code}</span>
                    </div>
                    <div className="text-[11px] text-neutral-600 truncate">
                      {slot.route?.origin_name}
                    </div>
                  </div>

                  <div className="text-[11px] text-neutral-700 space-y-0.5 border-t border-neutral-200 pt-2">
                    <div>DEP: {new Date(slot.departure_time).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</div>
                    <div>TRANSIT: {slot.route?.estimated_hours}h non-stop</div>
                  </div>

                  <CapacityMeter
                    totalCapacity={slot.total_capacity}
                    remainingCapacity={slot.remaining_capacity}
                    unit="MT"
                    size="sm"
                  />
                </div>

                <div className="pt-3 border-t-2 border-black flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-neutral-500 font-bold uppercase">BASE TARIFF</div>
                    <div className="text-lg font-black text-black">₹{slot.base_rate_per_unit}/MT</div>
                  </div>

                  <Link
                    href={`/availability`}
                    className="bw-btn-primary px-3 py-1.5 text-xs font-bold uppercase flex items-center gap-1"
                  >
                    <span>RESERVE</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Architectural Pillars / System Highlights */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="border-4 border-black bg-neutral-50 p-6 sm:p-8 space-y-6">
          <div className="border-b-2 border-black pb-3">
            <h2 className="text-lg sm:text-xl font-black uppercase">
              RAILWAY FREIGHT ARCHITECTURAL GUARANTEES
            </h2>
            <p className="text-xs text-neutral-600">
              Built for high-volume B2B logistics shippers with rigorous operational integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Guarantee 1 */}
            <div className="border-2 border-black p-4 bg-white space-y-2">
              <div className="p-2 border-2 border-black bg-black text-white w-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm uppercase">ATOMIC CAPACITY LOCKS</div>
              <p className="text-neutral-700 font-sans leading-relaxed">
                Reservations are executed through transactional database stored procedures with row-level locks (<code className="font-mono text-black font-bold">FOR UPDATE</code>), preventing overbooking under high concurrency.
              </p>
            </div>

            {/* Guarantee 2 */}
            <div className="border-2 border-black p-4 bg-white space-y-2">
              <div className="p-2 border-2 border-black bg-black text-white w-fit">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm uppercase">INSTANT CAPACITY RESTORATION</div>
              <p className="text-neutral-700 font-sans leading-relaxed">
                Upon order cancellation, slot capacity is automatically replenished in real-time and made immediately available for secondary logistics booking with full audit logging.
              </p>
            </div>

            {/* Guarantee 3 */}
            <div className="border-2 border-black p-4 bg-white space-y-2">
              <div className="p-2 border-2 border-black bg-black text-white w-fit">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm uppercase">MULTI-TENANT ORG CONTEXT</div>
              <p className="text-neutral-700 font-sans leading-relaxed">
                Complete multi-tenant isolation via Row Level Security (RLS). Every consignment is strictly scoped to an organization and audit-stamped with the issuing logistics officer.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
