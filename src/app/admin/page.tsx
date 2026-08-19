'use client';

import React, { useState, useEffect } from 'react';
import { railwayService } from '@/lib/services/railwayService';
import { Route, CargoType, Slot } from '@/types/database';
import { RouteManager } from '@/components/admin/RouteManager';
import { CargoTypeManager } from '@/components/admin/CargoTypeManager';
import { SlotManager } from '@/components/admin/SlotManager';
import { Sliders, MapPin, Package, Train, ShieldCheck, Database, FileSpreadsheet } from 'lucide-react';

export default function AdminPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [cargoTypes, setCargoTypes] = useState<CargoType[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [activeTab, setActiveTab] = useState<'slots' | 'routes' | 'cargo'>('slots');
  const [mounted, setMounted] = useState(false);

  const loadData = () => {
    setRoutes(railwayService.getAllRoutesAdmin());
    setCargoTypes(railwayService.getAllCargoTypesAdmin());
    setSlots(railwayService.getSlots());
  };

  useEffect(() => {
    setMounted(true);
    loadData();
    window.addEventListener('railway_state_changed', loadData);
    return () => window.removeEventListener('railway_state_changed', loadData);
  }, []);

  if (!mounted) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-mono space-y-6">
      {/* Admin Header */}
      <div className="border-b-4 border-black pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-black text-white px-2 py-0.5 text-xs font-black">
              ADMIN CONTROL CENTER
            </span>
            <span className="text-xs text-neutral-600 font-bold">
              RAILWAY NETWORK OPERATOR &amp; INVENTORY DISPATCH
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            NETWORK INVENTORY &amp; OPERATIONS
          </h1>
          <p className="text-xs text-neutral-600 max-w-2xl font-sans mt-1">
            Manage rail corridors, freight rate multipliers, cargo categories, and scheduled rake allocations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="border-2 border-black p-2 bg-neutral-50 text-right text-xs">
            <span className="font-bold block">TOTAL NETWORK SLOTS:</span>
            <span className="font-black text-sm">{slots.length} SCHEDULED</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-black pb-2 text-xs">
        <button
          onClick={() => setActiveTab('slots')}
          className={`px-4 py-2.5 font-bold uppercase flex items-center gap-1.5 transition-colors ${
            activeTab === 'slots'
              ? 'bg-black text-white border-2 border-black'
              : 'bg-white text-black border-2 border-neutral-300 hover:border-black'
          }`}
        >
          <Train className="w-4 h-4" />
          <span>SCHEDULED SLOTS ({slots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('routes')}
          className={`px-4 py-2.5 font-bold uppercase flex items-center gap-1.5 transition-colors ${
            activeTab === 'routes'
              ? 'bg-black text-white border-2 border-black'
              : 'bg-white text-black border-2 border-neutral-300 hover:border-black'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>CORRIDORS &amp; ROUTES ({routes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cargo')}
          className={`px-4 py-2.5 font-bold uppercase flex items-center gap-1.5 transition-colors ${
            activeTab === 'cargo'
              ? 'bg-black text-white border-2 border-black'
              : 'bg-white text-black border-2 border-neutral-300 hover:border-black'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>CARGO TYPES &amp; TARIFFS ({cargoTypes.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'slots' && (
          <SlotManager slots={slots} routes={routes} onRefresh={loadData} />
        )}
        {activeTab === 'routes' && (
          <RouteManager routes={routes} onRefresh={loadData} />
        )}
        {activeTab === 'cargo' && (
          <CargoTypeManager cargoTypes={cargoTypes} onRefresh={loadData} />
        )}
      </div>
    </div>
  );
}
