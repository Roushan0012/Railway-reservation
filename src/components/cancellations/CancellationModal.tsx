'use client';

import React, { useState } from 'react';
import { Booking } from '@/types/database';
import { railwayService } from '@/lib/services/railwayService';
import { Modal } from '@/components/ui/Modal';
import { AlertBox } from '@/components/ui/AlertBox';
import { ShieldAlert, AlertTriangle, RotateCcw, XCircle } from 'lucide-react';

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onCancellationSuccess?: () => void;
}

export const CancellationModal: React.FC<CancellationModalProps> = ({
  isOpen,
  onClose,
  booking,
  onCancellationSuccess,
}) => {
  const session = railwayService.getSession();
  const [reason, setReason] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!booking) return null;

  const unit = booking.cargo_type?.unit_of_measure || 'MT';
  const isAlreadyCancelled = booking.status === 'cancelled';
  const isDeparted = booking.slot && new Date(booking.slot.departure_time) <= new Date();

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!reason.trim()) {
      setErrorMsg('A mandatory operational cancellation reason is required for freight audit.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await railwayService.cancelBooking(booking.id, session.user.id, reason.trim());

      if (!result.success) {
        setErrorMsg(result.error || 'Failed to cancel freight booking.');
        setIsSubmitting(false);
        return;
      }

      window.dispatchEvent(new Event('railway_state_changed'));
      setIsSubmitting(false);
      onClose();
      if (onCancellationSuccess) onCancellationSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during reservation cancellation.');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CANCEL RAILWAY COMMODITY RESERVATION"
      subtitle={`CONSIGNMENT REF: ${booking.booking_ref} &middot; RAKE ${booking.slot?.slot_number || ''}`}
      maxWidth="md"
    >
      <form onSubmit={handleCancel} className="space-y-4 font-mono text-xs">
        {errorMsg && (
          <AlertBox type="error" title="CANCELLATION BLOCKED" onClose={() => setErrorMsg(null)}>
            {errorMsg}
          </AlertBox>
        )}

        {isAlreadyCancelled ? (
          <AlertBox type="warning" title="ALREADY CANCELLED">
            This reservation was previously cancelled and capacity has been restored to the slot.
          </AlertBox>
        ) : isDeparted ? (
          <AlertBox type="error" title="DEPARTED RAKE">
            This freight train has already commenced siding operations / departed. Cancellation is forbidden.
          </AlertBox>
        ) : null}

        {/* Consignment Overview */}
        <div className="p-3 border-2 border-black bg-neutral-50 space-y-2">
          <div className="flex justify-between items-center border-b border-neutral-300 pb-1.5 font-bold">
            <span>CONSIGNMENT:</span>
            <span className="bg-black text-white px-1.5 py-0.5">{booking.booking_ref}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-neutral-500 block">CARGO TYPE:</span>
              <span className="font-bold text-black">{booking.cargo_type?.name}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">RESERVED PAYLOAD:</span>
              <span className="font-bold text-black">{booking.quantity} {unit}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">ROUTE:</span>
              <span className="font-bold text-black">{booking.slot?.route?.origin_code} &rarr; {booking.slot?.route?.destination_code}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">INVOICE TOTAL:</span>
              <span className="font-bold text-black">₹{booking.total_cost.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Capacity Restoration Notice */}
        <div className="p-3 border-2 border-dashed border-black bg-white space-y-1">
          <div className="font-bold uppercase text-black flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4" />
            AUTOMATIC CAPACITY RESTORATION PROTOCOL
          </div>
          <p className="text-[11px] font-sans text-neutral-700 leading-snug">
            Upon confirmation, <strong className="font-mono text-black">{booking.quantity} {unit}</strong> of payload capacity
            will be immediately returned to slot <strong className="font-mono text-black">{booking.slot?.slot_number}</strong> for
            other logistics operators.
          </p>
        </div>

        {/* Mandatory Reason Input */}
        <div className="space-y-1.5">
          <label className="block font-bold uppercase text-black">
            MANDATORY CANCELLATION REASON / DISPATCH LOG *
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isAlreadyCancelled || isDeparted}
            placeholder="e.g. Consignment delayed at factory siding, rolling stock defect, route diversion..."
            className="w-full border-2 border-black p-2 font-mono text-xs bg-white focus:outline-none focus:bg-neutral-50 disabled:bg-neutral-100 disabled:cursor-not-allowed"
            required
          />
        </div>

        {/* Audit Disclaimer */}
        <div className="text-[10px] text-neutral-600 font-mono">
          AUDIT STAMP: Action logged by {session.user.full_name} ({session.user.email}) under {session.org.name}.
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
          <button
            type="button"
            onClick={onClose}
            className="bw-btn-secondary px-4 py-2 uppercase font-bold text-xs"
          >
            KEEP RESERVATION
          </button>
          <button
            type="submit"
            disabled={isAlreadyCancelled || isDeparted || !reason.trim() || isSubmitting}
            className="bw-btn-danger px-5 py-2 uppercase font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <XCircle className="w-4 h-4" />
            <span>{isSubmitting ? 'PROCESSING...' : 'CONFIRM CANCELLATION'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
