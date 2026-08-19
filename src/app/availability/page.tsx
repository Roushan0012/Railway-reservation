'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { railwayService } from '@/lib/services/railwayService';
import { Route, CargoType, Slot, AvailabilitySearchParams } from '@/types/database';
import { SearchFilters } from '@/components/availability/SearchFilters';
import { SlotCard } from '@/components/availability/SlotCard';
import { BookingModal } from '@/components/booking/BookingModal';
import { Train, Layers, Zap, Info, ShieldCheck } from 'lucide-react';

export default function AvailabilityPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [cargoTypes, setCargoTypes] = useState<CargoType[]>([]);
  const [matchingSlots, setMatchingSlots] = useState<Slot[]>([]);
  const [searchParams, setSearchParams] = useState<AvailabilitySearchParams>({
    serviceType: 'all',
  });
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<Slot | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadData = () => {
    const r = railwayService.getRoutes();
    const c = railwayService.getCargoTypes();
    const s = railwayService.searchAvailability(searchParams);
    setRoutes(r);
    setCargoTypes(c);
    setMatchingSlots(s);
  };

  useEffect(() => {
    setMounted(true);
    loadData();
    window.addEventListener('railway_state_changed', loadData);
    return () => window.removeEventListener('railway_state_changed', loadData);
  }, [searchParams]);

  if (!mounted) return null;

  const activeCargo = cargoTypes.find((c) => c.id === searchParams.cargoTypeId);

  const handleBookingSuccess = (bookingRef: string) => {
    setSelectedSlotForBooking(null);
    router.push(`/confirmation/${bookingRef}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-mono space-y-8">
      {/* Page Header */}
      <div className="border-b-4 border-black pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-black text-white px-2 py-0.5 text-xs font-black">
              LIVE CARGO NETWORK INVENTORY
            </span>
            <span className="text-xs text-neutral-600 font-bold">
              REAL-TIME WDFC / EDFC DISPATCH
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            CHECK AVAILABILITY &amp; RESERVE SLOTS
          </h1>
          <p className="text-xs text-neutral-600 max-w-2xl font-sans mt-1">
            Query open freight slots across dedicated rail corridors, calculate automated tariffs, and reserve bulk payload capacity with immediate consignment confirmation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="border-2 border-black p-2 bg-neutral-50 text-right">
            <div className="text-[10px] text-neutral-600 uppercase font-bold">MATCHING SLOTS:</div>
            <div className="text-xl font-black">{matchingSlots.length} AVAILABLE</div>
          </div>
        </div>
      </div>

      {/* Search Filters Card */}
      <SearchFilters
        routes={routes}
        cargoTypes={cargoTypes}
        params={searchParams}
        onChange={(newParams) => setSearchParams(newParams)}
        onReset={() => setSearchParams({ serviceType: 'all' })}
      />

      {/* Corridor Notice Banner */}
      <div className="border-2 border-dashed border-black p-3 bg-white flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4" />
          <span>
            <strong>PRICING RULE:</strong> Express slots apply a 1.35x priority multiplier for guaranteed non-stop transit.
          </span>
        </div>
        <div className="font-bold">
          {activeCargo ? (
            <span>APPLYING MULTIPLIER: {activeCargo.name} ({activeCargo.rate_multiplier}x)</span>
          ) : (
            <span>SELECT CARGO CLASSIFICATION FOR EXACT TARIFF</span>
          )}
        </div>
      </div>

      {/* Slots Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-bold text-xs uppercase border-b-2 border-black pb-2">
          <span>SCHEDULED FREIGHT RAKE SLOTS ({matchingSlots.length})</span>
          <span>SORTED BY DEPARTURE TIME</span>
        </div>

        {matchingSlots.length === 0 ? (
          <div className="border-4 border-black p-12 bg-white text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <Train className="w-8 h-8 mx-auto" />
            <div className="text-base font-black uppercase">NO MATCHING FREIGHT SLOTS FOUND</div>
            <p className="text-xs text-neutral-600 font-sans max-w-md mx-auto">
              No open scheduled train rakes match the current origin, destination, or date filters. Try resetting the filters or check back for newly scheduled rakes.
            </p>
            <button
              onClick={() => setSearchParams({ serviceType: 'all' })}
              className="bw-btn-primary px-4 py-2 text-xs font-bold uppercase mt-2"
            >
              CLEAR SEARCH CRITERIA
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {matchingSlots.map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                selectedCargo={activeCargo}
                onBook={(s) => setSelectedSlotForBooking(s)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={!!selectedSlotForBooking}
        onClose={() => setSelectedSlotForBooking(null)}
        slot={selectedSlotForBooking}
        cargoTypes={cargoTypes}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
}
