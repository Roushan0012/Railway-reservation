'use client';

import React, { useState } from 'react';
import { CargoType, CargoUnit } from '@/types/database';
import { railwayService } from '@/lib/services/railwayService';
import { Plus, Package, Edit2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AlertBox } from '@/components/ui/AlertBox';

interface CargoTypeManagerProps {
  cargoTypes: CargoType[];
  onRefresh: () => void;
}

export const CargoTypeManager: React.FC<CargoTypeManagerProps> = ({ cargoTypes, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<CargoType | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Bulk');
  const [unitOfMeasure, setUnitOfMeasure] = useState<CargoUnit>('MT');
  const [rateMultiplier, setRateMultiplier] = useState<number>(1.0);
  const [handlingNotes, setHandlingNotes] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingCargo(null);
    setCode('');
    setName('');
    setCategory('Bulk');
    setUnitOfMeasure('MT');
    setRateMultiplier(1.0);
    setHandlingNotes('');
    setIsActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: CargoType) => {
    setEditingCargo(c);
    setCode(c.code);
    setName(c.name);
    setCategory(c.category);
    setUnitOfMeasure(c.unit_of_measure);
    setRateMultiplier(c.rate_multiplier);
    setHandlingNotes(c.handling_notes || '');
    setIsActive(c.is_active);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !category.trim()) {
      setErrorMsg('Code, name, and category are mandatory.');
      return;
    }

    if (editingCargo) {
      await railwayService.updateCargoType(editingCargo.id, {
        code: code.toUpperCase().trim(),
        name: name.trim(),
        category: category.trim(),
        unit_of_measure: unitOfMeasure,
        rate_multiplier: Number(rateMultiplier),
        handling_notes: handlingNotes.trim() || null,
        is_active: isActive,
      });
    } else {
      await railwayService.createCargoType({
        code: code.toUpperCase().trim(),
        name: name.trim(),
        category: category.trim(),
        unit_of_measure: unitOfMeasure,
        rate_multiplier: Number(rateMultiplier),
        handling_notes: handlingNotes.trim() || null,
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
            COMMODITY &amp; CARGO CLASSIFICATIONS ({cargoTypes.length})
          </h2>
          <p className="text-xs text-neutral-600 font-mono">
            Configure tariff rate multipliers, rolling stock handling requirements, and freight billing units.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bw-btn-primary px-3.5 py-2 text-xs font-mono font-bold flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>NEW CARGO CLASSIFICATION</span>
        </button>
      </div>

      {/* Table of Cargo Types */}
      <div className="border-4 border-black overflow-x-auto bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-black text-white uppercase text-[11px] border-b-2 border-black">
              <th className="p-3">COMMODITY CODE</th>
              <th className="p-3">NAME &amp; CATEGORY</th>
              <th className="p-3">BILLING UNIT</th>
              <th className="p-3">RATE MULTIPLIER</th>
              <th className="p-3">HANDLING PROTOCOL</th>
              <th className="p-3">STATUS</th>
              <th className="p-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black">
            {cargoTypes.map((c) => (
              <tr key={c.id} className="hover:bg-neutral-50">
                <td className="p-3 font-bold">
                  <span className="bg-black text-white px-2 py-0.5 text-[10px]">
                    {c.code}
                  </span>
                </td>
                <td className="p-3">
                  <div className="font-bold text-black">{c.name}</div>
                  <div className="text-[10px] text-neutral-600 uppercase">CATEGORY: {c.category}</div>
                </td>
                <td className="p-3 font-black text-black">{c.unit_of_measure}</td>
                <td className="p-3 font-bold">{c.rate_multiplier.toFixed(2)}x</td>
                <td className="p-3 max-w-xs text-neutral-700 font-sans text-xs">
                  {c.handling_notes || '—'}
                </td>
                <td className="p-3">
                  {c.is_active ? (
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
                    onClick={() => openEditModal(c)}
                    className="p-1 border border-black hover:bg-black hover:text-white transition-colors"
                    title="Edit Cargo Classification"
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
        title={editingCargo ? 'EDIT CARGO CLASSIFICATION' : 'CREATE CARGO CLASSIFICATION'}
        subtitle="Railway Freight Tariff Class Definitions"
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
              <label className="font-bold uppercase text-black block">COMMODITY CODE *</label>
              <input
                type="text"
                placeholder="e.g. ISO_REEFER"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full border-2 border-black p-2 font-bold uppercase bg-white focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase text-black block">BILLING UNIT *</label>
              <select
                value={unitOfMeasure}
                onChange={(e) => setUnitOfMeasure(e.target.value as CargoUnit)}
                className="w-full border-2 border-black p-2 font-bold bg-white focus:outline-none"
              >
                <option value="MT">MT (Metric Tonnes)</option>
                <option value="TEU">TEU (Twenty-Foot Equivalent Units)</option>
                <option value="kL">kL (Kilo-Litres Liquid Tanker)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase text-black block">COMMODITY DESCRIPTION / NAME *</label>
            <input
              type="text"
              placeholder="e.g. Cold-Chain Temperature Controlled ISO Container"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-black p-2 font-bold bg-white focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase text-black block">CATEGORY *</label>
              <input
                type="text"
                placeholder="e.g. Bulk / Container / Liquid / Hazardous"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border-2 border-black p-2 font-bold bg-white focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase text-black block">RATE MULTIPLIER (e.g. 1.25) *</label>
              <input
                type="number"
                min="0.1"
                step="0.05"
                value={rateMultiplier}
                onChange={(e) => setRateMultiplier(parseFloat(e.target.value) || 1.0)}
                className="w-full border-2 border-black p-2 font-bold bg-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase text-black block">HANDLING PROTOCOLS / NOTES</label>
            <textarea
              rows={2}
              placeholder="e.g. Continuous genset power required, rotary tippler discharge..."
              value={handlingNotes}
              onChange={(e) => setHandlingNotes(e.target.value)}
              className="w-full border-2 border-black p-2 font-mono text-xs bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="cargo_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-black border-2 border-black"
            />
            <label htmlFor="cargo_active" className="font-bold uppercase text-black">
              ACTIVE FOR ALLOCATIONS
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
              {editingCargo ? 'UPDATE CLASSIFICATION' : 'CREATE CLASSIFICATION'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
