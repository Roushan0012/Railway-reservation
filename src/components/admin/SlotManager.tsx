'use client';

import React, { useState } from 'react';
import { Slot, Route, ServiceTier, SlotStatus } from '@/types/database';
import { railwayService } from '@/lib/services/railwayService';
import { Plus, Train, Edit2, Zap, Clock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AlertBox } from '@/components/ui/AlertBox';
import { Badge } from '@/components/ui/Badge';
import { CapacityMeter } from '@/components/ui/CapacityMeter';

interface SlotManagerProps {
  slots: Slot[];
  routes: Route[];
  onRefresh: () => void;
}

export const SlotManager: React.FC<SlotManagerProps> = ({ slots, routes, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);

  const [slotNumber, setSlotNumber] = useState('');
  const [routeId, setRouteId] = useState(routes[0]?.id || '');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [serviceType, setServiceType] = useState<ServiceTier>('normal');
  const [totalCapacity, setTotalCapacity] = useState<number>(2000);
  const [baseRatePerUnit, setBaseRatePerUnit] = useState<number>(120);
  const [status, setStatus] = useState<SlotStatus>('scheduled');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingSlot(null);
    const dateNum = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(10 + Math.random() * 90);
    setSlotNumber(`FL-RAKE-${dateNum}-${rand}`);
    setRouteId(routes[0]?.id || '');

    // Default departure tomorrow
    const d1 = new Date();
    d1.setDate(d1.getDate() + 1);
    d1.setHours(8, 0, 0, 0);
    const d2 = new Date(d1.getTime() + 24 * 3600000);

    setDepartureTime(d1.toISOString().slice(0, 16));
    setArrivalTime(d2.toISOString().slice(0, 16));
    setServiceType('normal');
    setTotalCapacity(2200);
    setBaseRatePerUnit(125);
    setStatus('scheduled');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (s: Slot) => {
    setEditingSlot(s);
    setSlotNumber(s.slot_number);
    setRouteId(s.route_id);
    setDepartureTime(new Date(s.departure_time).toISOString().slice(0, 16));
    setArrivalTime(new Date(s.arrival_time).toISOString().slice(0, 16));
    setServiceType(s.service_type);
    setTotalCapacity(s.total_capacity);
    setBaseRatePerUnit(s.base_rate_per_unit);
    setStatus(s.status);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotNumber.trim() || !routeId || !departureTime || !arrivalTime) {
      setErrorMsg('All slot parameters and schedule timings are mandatory.');
      return;
    }

    const d1 = new Date(departureTime);
    const d2 = new Date(arrivalTime);

    if (d2 <= d1) {
      setErrorMsg('Arrival time must be strictly after Departure time.');
      return;
    }

    if (editingSlot) {
      await railwayService.updateSlot(editingSlot.id, {
        slot_number: slotNumber.toUpperCase().trim(),
        route_id: routeId,
        departure_time: new Date(departureTime).toISOString(),
        arrival_time: new Date(arrivalTime).toISOString(),
        service_type: serviceType,
        total_capacity: Number(totalCapacity),
        base_rate_per_unit: Number(baseRatePerUnit),
        status,
      });
    } else {
      await railwayService.createSlot({
        slot_number: slotNumber.toUpperCase().trim(),
        route_id: routeId,
        departure_time: new Date(departureTime).toISOString(),
        arrival_time: new Date(arrivalTime).toISOString(),
        service_type: serviceType,
        total_capacity: Number(totalCapacity),
        base_rate_per_unit: Number(baseRatePerUnit),
        status,
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
            FREIGHT RAKE SLOTS &amp; CAPACITY ALLOCATIONS ({slots.length})
          </h2>
          <p className="text-xs text-neutral-600 font-mono">
            Schedule train rakes across corridors, set baseline tariffs, and assign service priority tiers.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bw-btn-primary px-3.5 py-2 text-xs font-mono font-bold flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>SCHEDULE FREIGHT SLOT</span>
        </button>
      </div>

      {/* Slots Table */}
      <div className="border-4 border-black overflow-x-auto bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-black text-white uppercase text-[11px] border-b-2 border-black">
              <th className="p-3">SLOT RAKE ID</th>
              <th className="p-3">CORRIDOR ROUTE</th>
              <th className="p-3">DEPARTURE &rarr; ARRIVAL</th>
              <th className="p-3">SERVICE TIER</th>
              <th className="p-3">CAPACITY GAUGE</th>
              <th className="p-3">BASE RATE</th>
              <th className="p-3">STATUS</th>
              <th className="p-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black">
            {slots.map((s) => (
              <tr key={s.id} className="hover:bg-neutral-50">
                <td className="p-3 font-bold">
                  <span className="bg-black text-white px-2 py-0.5 text-[10px] block w-fit">
                    {s.slot_number}
                  </span>
                </td>
                <td className="p-3 font-bold">
                  <div>{s.route?.origin_code} &rarr; {s.route?.destination_code}</div>
                  <div className="text-[10px] text-neutral-600 font-normal">
                    {s.route?.distance_km} KM &middot; {s.route?.estimated_hours}h
                  </div>
                </td>
                <td className="p-3 text-[11px]">
                  <div>DEP: {new Date(s.departure_time).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</div>
                  <div>ARR: {new Date(s.arrival_time).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</div>
                </td>
                <td className="p-3">
                  <Badge status={s.service_type} size="sm" />
                </td>
                <td className="p-3 min-w-[160px]">
                  <CapacityMeter
                    totalCapacity={s.total_capacity}
                    remainingCapacity={s.remaining_capacity}
                    unit="MT"
                    size="sm"
                  />
                </td>
                <td className="p-3 font-bold">₹{s.base_rate_per_unit}/MT</td>
                <td className="p-3">
                  <Badge status={s.status} size="sm" />
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => openEditModal(s)}
                    className="p-1 border border-black hover:bg-black hover:text-white transition-colors"
                    title="Edit Slot"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSlot ? 'EDIT FREIGHT TRAIN SLOT' : 'SCHEDULE NEW FREIGHT TRAIN SLOT'}
        subtitle="Rake Capacity & Dispatch Timing Management"
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
              <label className="font-bold uppercase text-black block">SLOT IDENTIFIER *</label>
              <input
                type="text"
                placeholder="e.g. FL-WDFC-EX-09"
                value={slotNumber}
                onChange={(e) => setSlotNumber(e.target.value)}
                className="w-full border-2 border-black p-2 font-bold uppercase bg-white focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase text-black block">CORRIDOR ROUTE *</label>
              <select
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                className="w-full border-2 border-black p-2 font-bold bg-white focus:outline-none"
                required
              >
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    [{r.origin_code} &rarr; {r.destination_code}] {r.distance_km}km
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase text-black block">DEPARTURE DATETIME *</label>
              <input
                type="datetime-local"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full border-2 border-black p-2 font-bold bg-white focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase text-black block">ESTIMATED ARRIVAL *</label>
              <input
                type="datetime-local"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full border-2 border-black p-2 font-bold bg-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase text-black block">SERVICE TIER *</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as ServiceTier)}
                className="w-full border-2 border-black p-2 font-bold bg-white focus:outline-none"
              >
                <option value="normal">NORMAL FREIGHT</option>
                <option value="express">EXPRESS (+35%)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase text-black block">TOTAL CAPACITY (MT) *</label>
              <input
                type="number"
                min="100"
                step="50"
                value={totalCapacity}
                onChange={(e) => setTotalCapacity(parseFloat(e.target.value) || 0)}
                className="w-full border-2 border-black p-2 font-bold bg-white focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase text-black block">BASE RATE (₹/MT) *</label>
              <input
                type="number"
                min="1"
                step="5"
                value={baseRatePerUnit}
                onChange={(e) => setBaseRatePerUnit(parseFloat(e.target.value) || 0)}
                className="w-full border-2 border-black p-2 font-bold bg-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase text-black block">OPERATIONAL STATUS</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SlotStatus)}
              className="w-full border-2 border-black p-2 font-bold bg-white focus:outline-none"
            >
              <option value="scheduled">SCHEDULED (OPEN FOR BOOKING)</option>
              <option value="boarding">BOARDING / SIDING LOADING</option>
              <option value="in_transit">IN TRANSIT / DEPARTED</option>
              <option value="completed">COMPLETED / DISCHARGED</option>
              <option value="cancelled">CANCELLED</option>
            </select>
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
              {editingSlot ? 'UPDATE SLOT' : 'CREATE SLOT'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
