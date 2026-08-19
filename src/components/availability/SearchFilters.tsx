'use client';

import React from 'react';
import { Route, CargoType, ServiceTier, AvailabilitySearchParams } from '@/types/database';
import { Search, MapPin, Calendar, Package, Zap, RotateCcw } from 'lucide-react';

interface SearchFiltersProps {
  routes: Route[];
  cargoTypes: CargoType[];
  params: AvailabilitySearchParams;
  onChange: (params: AvailabilitySearchParams) => void;
  onReset: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  routes,
  cargoTypes,
  params,
  onChange,
  onReset,
}) => {
  // Extract unique origins and destinations
  const origins = Array.from(new Set(routes.map((r) => r.origin_code))).map((code) => {
    const route = routes.find((r) => r.origin_code === code);
    return { code, name: route?.origin_name || code };
  });

  const destinations = Array.from(new Set(routes.map((r) => r.destination_code))).map((code) => {
    const route = routes.find((r) => r.destination_code === code);
    return { code, name: route?.destination_name || code };
  });

  return (
    <div className="w-full bg-white text-black border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4 font-mono">
        <div className="flex items-center gap-2 font-black text-sm uppercase">
          <Search className="w-4 h-4" />
          <span>QUERY FREIGHT SLOTS &amp; CAPACITY</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-bold border border-black px-2 py-1 hover:bg-black hover:text-white transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>RESET FILTERS</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        {/* Origin Terminal */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1 font-bold uppercase tracking-wider text-black">
            <MapPin className="w-3.5 h-3.5" />
            Origin Terminal
          </label>
          <select
            value={params.originCode || ''}
            onChange={(e) => onChange({ ...params, originCode: e.target.value || undefined })}
            className="w-full border-2 border-black bg-white p-2 text-xs font-bold focus:outline-none focus:bg-neutral-50"
          >
            <option value="">-- ALL ORIGIN SIDINGS --</option>
            {origins.map((o) => (
              <option key={o.code} value={o.code}>
                [{o.code}] {o.name}
              </option>
            ))}
          </select>
        </div>

        {/* Destination Terminal */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1 font-bold uppercase tracking-wider text-black">
            <MapPin className="w-3.5 h-3.5" />
            Destination Port / Hub
          </label>
          <select
            value={params.destinationCode || ''}
            onChange={(e) => onChange({ ...params, destinationCode: e.target.value || undefined })}
            className="w-full border-2 border-black bg-white p-2 text-xs font-bold focus:outline-none focus:bg-neutral-50"
          >
            <option value="">-- ALL DESTINATION HUBS --</option>
            {destinations.map((d) => (
              <option key={d.code} value={d.code}>
                [{d.code}] {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Cargo Classification */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1 font-bold uppercase tracking-wider text-black">
            <Package className="w-3.5 h-3.5" />
            Cargo Classification
          </label>
          <select
            value={params.cargoTypeId || ''}
            onChange={(e) => onChange({ ...params, cargoTypeId: e.target.value || undefined })}
            className="w-full border-2 border-black bg-white p-2 text-xs font-bold focus:outline-none focus:bg-neutral-50"
          >
            <option value="">-- ALL CARGO TYPES (DEFAULT 1.0X) --</option>
            {cargoTypes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.unit_of_measure} &middot; {c.rate_multiplier}x)
              </option>
            ))}
          </select>
        </div>

        {/* Service Tier */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1 font-bold uppercase tracking-wider text-black">
            <Zap className="w-3.5 h-3.5" />
            Service Tier Priority
          </label>
          <select
            value={params.serviceType || 'all'}
            onChange={(e) => onChange({ ...params, serviceType: e.target.value as ServiceTier | 'all' })}
            className="w-full border-2 border-black bg-white p-2 text-xs font-bold focus:outline-none focus:bg-neutral-50"
          >
            <option value="all">ALL SERVICE TIERS</option>
            <option value="express">EXPRESS FREIGHT (PRIORITIZED +35%)</option>
            <option value="normal">STANDARD FREIGHT (NORMAL TRANSIT)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
