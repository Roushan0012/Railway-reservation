'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Slot, CargoType } from '@/types/database';
import { railwayService } from '@/lib/services/railwayService';
import { Modal } from '@/components/ui/Modal';
import { AlertBox } from '@/components/ui/AlertBox';
import { Badge } from '@/components/ui/Badge';
import { Train, Package, ShieldCheck, CheckCircle2, ArrowRight, Building2, User } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: Slot | null;
  cargoTypes: CargoType[];
  onBookingSuccess?: (bookingRef: string) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  slot,
  cargoTypes,
  onBookingSuccess,
}) => {
  const router = useRouter();
  const session = railwayService.getSession();

  const [selectedCargoId, setSelectedCargoId] = useState<string>(cargoTypes[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(50);
  const [handlingInstructions, setHandlingInstructions] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!slot) return null;

  const activeCargo = cargoTypes.find((c) => c.id === selectedCargoId) || cargoTypes[0];
  const unit = activeCargo?.unit_of_measure || 'MT';
  const isExpress = slot.service_type === 'express';

  // Live Pricing Breakdown
  const baseRate = slot.base_rate_per_unit;
  const cargoMultiplier = activeCargo?.rate_multiplier || 1.0;
  const serviceMultiplier = isExpress ? 1.35 : 1.0;
  const unitRate = Math.round(baseRate * cargoMultiplier * serviceMultiplier * 100) / 100;
  const totalCost = Math.round(unitRate * (quantity || 0) * 100) / 100;

  const maxCapacity = slot.remaining_capacity;
  const isOverCapacity = quantity > maxCapacity;
  const isInvalidQuantity = !quantity || quantity <= 0 || isOverCapacity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isInvalidQuantity) {
      if (isOverCapacity) {
        setErrorMsg(`Requested quantity (${quantity} ${unit}) exceeds available capacity (${maxCapacity} ${unit}).`);
      } else {
        setErrorMsg('Please specify a valid quantity greater than zero.');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await railwayService.bookSlot({
        orgId: session.org.id,
        userId: session.user.id,
        slotId: slot.id,
        cargoTypeId: selectedCargoId,
        quantity: Number(quantity),
        handlingInstructions: handlingInstructions.trim() || undefined,
      });

      if (!result.success || !result.bookingRef) {
        setErrorMsg(result.error || 'Failed to complete freight reservation.');
        setIsSubmitting(false);
        return;
      }

      // Notify state change and close
      window.dispatchEvent(new Event('railway_state_changed'));
      onClose();

      if (onBookingSuccess) {
        onBookingSuccess(result.bookingRef);
      } else {
        router.push(`/confirmation/${result.bookingRef}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during slot booking.');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="RAIL FREIGHT SLOT CONSIGNMENT DISPATCH"
      subtitle={`RESERVATION FOR RAKE ${slot.slot_number} &middot; ${slot.route?.origin_code} TO ${slot.route?.destination_code}`}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 font-mono text-xs">
        {/* Error Feedback */}
        {errorMsg && (
          <AlertBox type="error" title="RESERVATION REJECTED" onClose={() => setErrorMsg(null)}>
            {errorMsg}
          </AlertBox>
        )}

        {/* Corridor Summary Card */}
        <div className="p-3 border-2 border-black bg-neutral-50 space-y-2">
          <div className="flex items-center justify-between border-b border-black/20 pb-2">
            <span className="font-bold uppercase flex items-center gap-1.5 text-black">
              <Train className="w-4 h-4" />
              SLOT DETAILS &middot; {slot.slot_number}
            </span>
            <Badge status={slot.service_type} size="sm" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-[10px] text-neutral-500 uppercase">FROM:</div>
              <div className="font-bold text-black">{slot.route?.origin_name}</div>
            </div>
            <div>
              <div className="text-[10px] text-neutral-500 uppercase">TO:</div>
              <div className="font-bold text-black">{slot.route?.destination_name}</div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[11px] pt-1 text-black font-semibold border-t border-black/10">
            <span>AVAILABLE CAPACITY: {slot.remaining_capacity.toLocaleString()} {unit}</span>
            <span>TRANSIT: {slot.route?.estimated_hours} HOURS</span>
          </div>
        </div>

        {/* Shipper & Tenant Context */}
        <div className="p-3 border-2 border-dashed border-black bg-white space-y-1.5">
          <div className="text-[10px] font-bold uppercase text-neutral-600 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            BOOKING ENTITY &amp; AUDIT CONTEXT
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-black">
            <span>ORGANIZATION: {session.org.name}</span>
            <span className="border border-black px-1.5 py-0.2 bg-black text-white text-[10px]">
              TAX ID: {session.org.tax_id || 'REGISTERED'}
            </span>
          </div>
          <div className="text-[11px] text-neutral-700 flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>DISPATCH OFFICER: {session.user.full_name} ({session.user.email})</span>
          </div>
        </div>

        {/* Cargo Classification Selection */}
        <div className="space-y-1.5">
          <label className="block font-bold uppercase text-black">
            SELECT CARGO COMMODITY TYPE *
          </label>
          <select
            value={selectedCargoId}
            onChange={(e) => setSelectedCargoId(e.target.value)}
            className="w-full border-2 border-black p-2.5 font-bold text-xs bg-white focus:outline-none focus:bg-neutral-50"
            required
          >
            {cargoTypes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — Multiplier: {c.rate_multiplier}x ({c.unit_of_measure})
              </option>
            ))}
          </select>
          {activeCargo?.handling_notes && (
            <div className="text-[11px] text-neutral-700 font-sans border-l-2 border-black pl-2 py-0.5">
              Handling note: {activeCargo.handling_notes}
            </div>
          )}
        </div>

        {/* Quantity / Payload Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-bold uppercase text-black">
              CONSIGNMENT PAYLOAD WEIGHT / QUANTITY ({unit}) *
            </label>
            <span className="font-semibold text-black">
              MAX: {maxCapacity.toLocaleString()} {unit}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={maxCapacity}
              step="any"
              value={quantity || ''}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              className={`w-full border-2 p-2.5 font-mono text-sm font-bold bg-white focus:outline-none ${
                isOverCapacity ? 'border-4 border-black bg-neutral-100' : 'border-black'
              }`}
              required
            />
            <span className="font-black text-sm border-2 border-black px-3 py-2.5 bg-black text-white">
              {unit}
            </span>
          </div>
          {isOverCapacity && (
            <div className="text-[11px] font-bold uppercase text-black border-2 border-dashed border-black p-1 text-center bg-white">
              ! ERROR: QUANTITY EXCEEDS MAXIMUM REMAINING CAPACITY
            </div>
          )}
        </div>

        {/* Handling Instructions */}
        <div className="space-y-1.5">
          <label className="block font-bold uppercase text-black">
            SPECIAL SIDING / HANDLING INSTRUCTIONS (OPTIONAL)
          </label>
          <textarea
            rows={2}
            value={handlingInstructions}
            onChange={(e) => setHandlingInstructions(e.target.value)}
            placeholder="e.g. Requires covered siding delivery, priority twist-lock inspection..."
            className="w-full border-2 border-black p-2 font-mono text-xs bg-white focus:outline-none"
          />
        </div>

        {/* Live Calculation & Invoice Preview */}
        <div className="p-4 border-4 border-black bg-neutral-50 space-y-2">
          <div className="font-bold uppercase text-black border-b-2 border-black pb-1 flex items-center justify-between">
            <span>TARIFF INVOICE ESTIMATION</span>
            <span className="text-[10px] bg-black text-white px-1.5 py-0.2">REAL-TIME ACID RATE</span>
          </div>

          <div className="space-y-1 text-xs text-neutral-800">
            <div className="flex justify-between">
              <span>Base Freight Tariff:</span>
              <span className="font-bold">₹{baseRate.toFixed(2)} / {unit}</span>
            </div>
            <div className="flex justify-between">
              <span>Cargo Category Multiplier:</span>
              <span className="font-bold">{cargoMultiplier.toFixed(2)}x ({activeCargo?.name})</span>
            </div>
            {isExpress && (
              <div className="flex justify-between font-bold text-black">
                <span>Express Corridor Surcharge (+35%):</span>
                <span>1.35x Priority Tier</span>
              </div>
            )}
            <div className="flex justify-between border-t border-neutral-300 pt-1">
              <span>Effective Unit Rate:</span>
              <span className="font-black text-black">₹{unitRate.toFixed(2)} / {unit}</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline border-t-2 border-black pt-2 text-black">
            <span className="font-black text-xs uppercase">TOTAL ESTIMATED CHARGE:</span>
            <span className="font-black text-xl tracking-tight">₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
          <button
            type="button"
            onClick={onClose}
            className="bw-btn-secondary px-4 py-2.5 uppercase font-bold text-xs"
          >
            CANCEL
          </button>
          <button
            type="submit"
            disabled={isInvalidQuantity || isSubmitting}
            className="bw-btn-primary px-6 py-2.5 uppercase font-bold text-xs flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{isSubmitting ? 'COMMITTING ATOMIC LOCK...' : 'CONFIRM & BOOK SLOT'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </Modal>
  );
};
