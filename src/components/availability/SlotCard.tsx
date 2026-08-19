import React from 'react';
import { Slot, CargoType } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { CapacityMeter } from '@/components/ui/CapacityMeter';
import { ArrowRight, Clock, MapPin, Train, Zap, Shield, ArrowUpRight } from 'lucide-react';

interface SlotCardProps {
  slot: Slot & { calculatedRate?: number };
  selectedCargo?: CargoType;
  onBook: (slot: Slot) => void;
}

export const SlotCard: React.FC<SlotCardProps> = ({ slot, selectedCargo, onBook }) => {
  const isFull = slot.remaining_capacity <= 0;
  const isExpress = slot.service_type === 'express';

  // Format datetimes
  const depDate = new Date(slot.departure_time);
  const arrDate = new Date(slot.arrival_time);

  const formatDateTime = (d: Date) => {
    return {
      date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' HRS',
    };
  };

  const depFmt = formatDateTime(depDate);
  const arrFmt = formatDateTime(arrDate);

  // Rate calculations
  const unit = selectedCargo?.unit_of_measure || 'MT';
  const cargoMultiplier = selectedCargo?.rate_multiplier || 1.0;
  const serviceMultiplier = isExpress ? 1.35 : 1.0;
  const finalRate = Math.round(slot.base_rate_per_unit * cargoMultiplier * serviceMultiplier * 100) / 100;

  return (
    <div className="w-full bg-white text-black border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3 mb-4 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="bg-black text-white font-black px-2 py-0.5 tracking-wider">
            {slot.slot_number}
          </span>
          <Badge status={slot.service_type} size="sm" />
          <Badge status={slot.status} size="sm" />
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <span>DISTANCE: {slot.route?.distance_km} KM</span>
          <span>&bull;</span>
          <span>EST. TRANSIT: {slot.route?.estimated_hours} HRS</span>
        </div>
      </div>

      {/* Corridor Schedule Details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center mb-6">
        {/* Origin */}
        <div className="md:col-span-4 p-3 border-2 border-black bg-neutral-50 space-y-1">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-black" />
            ORIGIN TERMINAL
          </div>
          <div className="font-bold text-sm uppercase leading-snug">
            {slot.route?.origin_name}
          </div>
          <div className="font-mono text-xs font-black bg-black text-white px-1.5 py-0.5 inline-block">
            {slot.route?.origin_code}
          </div>
          <div className="pt-2 border-t border-neutral-300 font-mono text-xs">
            <div className="text-[10px] text-neutral-500 uppercase">DEPARTURE:</div>
            <div className="font-bold text-black">{depFmt.date} &middot; {depFmt.time}</div>
          </div>
        </div>

        {/* Transit Graphic */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-2 text-center">
          <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
            DEDICATED FREIGHT CORRIDOR
          </div>
          <div className="w-full flex items-center gap-2">
            <div className="h-[2px] bg-black flex-1 border-t-2 border-black" />
            <div className="p-1.5 border-2 border-black bg-white rounded-none">
              <Train className="w-4 h-4" />
            </div>
            <div className="h-[2px] bg-black flex-1 border-t-2 border-black" />
          </div>
          <div className="font-mono text-xs font-bold mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{slot.route?.estimated_hours}h NON-STOP</span>
          </div>
        </div>

        {/* Destination */}
        <div className="md:col-span-4 p-3 border-2 border-black bg-neutral-50 space-y-1">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-black" />
            DESTINATION PORT / SIDING
          </div>
          <div className="font-bold text-sm uppercase leading-snug">
            {slot.route?.destination_name}
          </div>
          <div className="font-mono text-xs font-black bg-black text-white px-1.5 py-0.5 inline-block">
            {slot.route?.destination_code}
          </div>
          <div className="pt-2 border-t border-neutral-300 font-mono text-xs">
            <div className="text-[10px] text-neutral-500 uppercase">ESTIMATED ARRIVAL:</div>
            <div className="font-bold text-black">{arrFmt.date} &middot; {arrFmt.time}</div>
          </div>
        </div>
      </div>

      {/* Capacity & Live Pricing Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border-t-2 border-black pt-4">
        {/* Capacity Meter */}
        <div className="md:col-span-7">
          <CapacityMeter
            totalCapacity={slot.total_capacity}
            remainingCapacity={slot.remaining_capacity}
            unit={unit}
          />
        </div>

        {/* Pricing Breakdown & Action */}
        <div className="md:col-span-5 flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-end lg:items-center justify-between gap-3 font-mono">
          <div>
            <div className="text-[10px] font-bold uppercase text-neutral-600">
              FREIGHT TARIFF RATE
            </div>
            <div className="text-xl font-black tracking-tight text-black flex items-baseline gap-1">
              <span>₹{finalRate.toLocaleString()}</span>
              <span className="text-xs font-bold text-neutral-600">/ {unit}</span>
            </div>
            {isExpress && (
              <div className="text-[10px] font-bold text-black border-b border-black inline-block">
                INCL. 35% EXPRESS TIER
              </div>
            )}
          </div>

          <button
            onClick={() => onBook(slot)}
            disabled={isFull}
            className={`w-full sm:w-auto px-4 py-2.5 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
              isFull
                ? 'bg-neutral-200 text-neutral-600 border-2 border-dashed border-neutral-400 cursor-not-allowed line-through'
                : 'bw-btn-primary cursor-pointer'
            }`}
          >
            <span>{isFull ? 'SLOT FULL' : 'RESERVE CARGO'}</span>
            {!isFull && <ArrowUpRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
