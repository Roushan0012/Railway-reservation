'use client';

import React, { useState } from 'react';
import { Route } from '@/types/database';
import { railwayService } from '@/lib/services/railwayService';
import { Plus, MapPin, Check, X, Edit2, ArrowRight } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AlertBox } from '@/components/ui/AlertBox';

interface RouteManagerProps {
  routes: Route[];
  onRefresh: () => void;
}

export const RouteManager: React.FC<RouteManagerProps> = ({ routes, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  const [originCode, setOriginCode] = useState('');
  const [originName, setOriginName] = useState('');
  const [destinationCode, setDestinationCode] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [distanceKm, setDistanceKm] = useState<number>(1000);
  const [estimatedHours, setEstimatedHours] = useState<number>(20);
  const [isActive, setIsActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingRoute(null);
    setOriginCode('');
    setOriginName('');
    setDestinationCode('');
    setDestinationName('');
    setDistanceKm(1000);
    setEstimatedHours(20);
    setIsActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (r: Route) => {
    setEditingRoute(r);
    setOriginCode(r.origin_code);
    setOriginName(r.origin_name);
    setDestinationCode(r.destination_code);
    setDestinationName(r.destination_name);
    setDistanceKm(r.distance_km);
    setEstimatedHours(r.estimated_hours);
    setIsActive(r.is_active);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originCode || !originName || !destinationCode || !destinationName) {
      setErrorMsg('All terminal names and code identifiers are required.');
      return;
    }

    if (editingRoute) {
      await railwayService.updateRoute(editingRoute.id, {
        origin_code: originCode.toUpperCase().trim(),
        origin_name: originName.trim(),
        destination_code: destinationCode.toUpperCase().trim(),
        destination_name: destinationName.trim(),
        distance_km: Number(distanceKm),
        estimated_hours: Number(estimatedHours),
        is_active: isActive,
      });
    } else {
      await railwayService.createRoute({
        origin_code: originCode.toUpperCase().trim(),
        origin_name: originName.trim(),
        destination_code: destinationCode.toUpperCase().trim(),
        destination_name: destinationName.trim(),
        distance_km: Number(distanceKm),
        estimated_hours: Number(estimatedHours),
        is_active: isActive,
      });
    }

    window.dispatchEvent(new Event('railway_state_changed'));
    onRefresh();
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
        <div>
          <h2 className="text-base font-black uppercase font-mono tracking-tight">
            RAIL NETWORK FREIGHT CORRIDORS ({routes.length})
          </h2>
          <p className="text-xs text-neutral-600 font-mono">
            Define origin/destination freight terminals, track mileage, and non-stop transit benchmarks.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bw-btn-primary px-3.5 py-2 text-xs font-mono font-bold flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>ADD CORRIDOR ROUTE</span>
        </button>
      </div>

      {/* Table of Routes */}
      <div className="border-4 border-black overflow-x-auto bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-black text-white uppercase text-[11px] border-b-2 border-black">
              <th className="p-3">ORIGIN TERMINAL</th>
              <th className="p-3">DESTINATION HUB</th>
              <th className="p-3">DISTANCE</th>
              <th className="p-3">TRANSIT TIME</th>
              <th className="p-3">STATUS</th>
              <th className="p-3 text-right">OPERATIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black">
            {routes.map((r) => (
              <tr key={r.id} className="hover:bg-neutral-50">
                <td className="p-3 font-bold">
                  <span className="bg-black text-white px-1.5 py-0.5 mr-2 text-[10px]">
                    {r.origin_code}
                  </span>
                  <span>{r.origin_name}</span>
                </td>
                <td className="p-3 font-bold">
                  <span className="bg-black text-white px-1.5 py-0.5 mr-2 text-[10px]">
                    {r.destination_code}
                  </span>
                  <span>{r.destination_name}</span>
                </td>
                <td className="p-3">{r.distance_km} KM</td>
                <td className="p-3">{r.estimated_hours} HRS</td>
                <td className="p-3">
                  {r.is_active ? (
                    <span className="border-2 border-black bg-black text-white px-2 py-0.5 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="border-2 border-dashed border-black px-2 py-0.5 text-[10px] font-bold line-through">
                      INACTIVE
                    </span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => openEditModal(r)}
                    className="p-1 border border-black hover:bg-black hover:text-white transition-colors"
                    title="Edit Route"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Route Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoute ? 'EDIT FREIGHT CORRIDOR ROUTE' : 'REGISTER NEW FREIGHT CORRIDOR ROUTE'}
        subtitle="DFCCIL Dedicated Freight Network Infrastructure"
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">
          {errorMsg && (
            <AlertBox type="error" title="VALIDATION FAILED">
              {errorMsg}
            </AlertBox>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase text-black block">ORIGIN STATION CODE *</label>
              <input
                type="text"
                placeholder="e.g. DADRI-WDFC"
                value={originCode}
                onChange={(e) => setOriginCode(e.target.value)}
                className="w-full border-2 border-black p-2 font-bold uppercase bg-white focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase text-black block">ORIGIN TERMINAL NAME *</label>
              <input
                type="text"
                placeholder="e.g. Dadri Freight Complex (NCR)"
                value={originName}
                onChange={(e) => setOriginName(e.target.value)}
                className="w-full border-2 border-black p-2 font-bold bg-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase text-black block">DESTINATION STATION CODE *</label>
              <input
                type="text"
                placeholder="e.g. JNPT-PORT"
                value={destinationCode}
                onChange={(e) => setDestinationCode(e.target.value)}
                className="w-full border-2 border-black p-2 font-bold uppercase bg-white focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase text-black block">DESTINATION TERMINAL NAME *</label>
              <input
                type="text"
                placeholder="e.g. Jawaharlal Nehru Port Terminal"
                value={destinationName}
                onChange={(e) => setDestinationName(e.target.value)}
                className="w-full border-2 border-black p-2 font-bold bg-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase text-black block">DISTANCE (KM) *</label>
              <input
                type="number"
                min="1"
                step="any"
                value={distanceKm}
                onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)}
                className="w-full border-2 border-black p-2 font-bold bg-white focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase text-black block">ESTIMATED TRANSIT (HOURS) *</label>
              <input
                type="number"
                min="0.5"
                step="any"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)}
                className="w-full border-2 border-black p-2 font-bold bg-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="route_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-black border-2 border-black"
            />
            <label htmlFor="route_active" className="font-bold uppercase text-black">
              CORRIDOR ACTIVE FOR DISPATCH
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t-2 border-black">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="bw-btn-secondary px-4 py-2 uppercase font-bold"
            >
              CANCEL
            </button>
            <button type="submit" className="bw-btn-primary px-6 py-2 uppercase font-bold">
              {editingRoute ? 'UPDATE CORRIDOR' : 'CREATE CORRIDOR'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
