'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { railwayService } from '@/lib/services/railwayService';
import { Booking } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { CancellationModal } from '@/components/cancellations/CancellationModal';
import { Train, Printer, ArrowLeft, XCircle, ShieldCheck, MapPin, Building2, Calendar, FileText, CheckCircle } from 'lucide-react';

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const bookingRef = params?.ref as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const loadBooking = () => {
    if (!bookingRef) return;
    const b = railwayService.getBookingByRef(bookingRef);
    setBooking(b || null);
  };

  useEffect(() => {
    setMounted(true);
    loadBooking();
    window.addEventListener('railway_state_changed', loadBooking);
    return () => window.removeEventListener('railway_state_changed', loadBooking);
  }, [bookingRef]);

  if (!mounted) return null;

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center font-mono">
        <div className="border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="text-xl font-black uppercase">CONSIGNMENT NOT FOUND</div>
          <p className="text-xs text-neutral-600">
            No freight reservation matches reference ID: <strong className="text-black">{bookingRef}</strong>
          </p>
          <Link href="/availability" className="bw-btn-primary inline-flex px-6 py-2.5 text-xs font-bold uppercase">
            RETURN TO AVAILABILITY SEARCH
          </Link>
        </div>
      </div>
    );
  }

  const unit = booking.cargo_type?.unit_of_measure || 'MT';
  const isCancelled = booking.status === 'cancelled';
  const depDate = booking.slot ? new Date(booking.slot.departure_time) : null;
  const arrDate = booking.slot ? new Date(booking.slot.arrival_time) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-mono">
      {/* Navigation and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 no-print">
        <Link
          href="/dashboard"
          className="bw-btn-secondary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO CONSIGNMENTS</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="bw-btn-secondary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT CONSIGNMENT NOTE</span>
          </button>

          {!isCancelled && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="bw-btn-danger px-4 py-2 text-xs font-bold flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>CANCEL RESERVATION</span>
            </button>
          )}
        </div>
      </div>

      {/* Official Rail Consignment Note Container */}
      <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] print:shadow-none space-y-6">
        {/* Header Document Banner */}
        <div className="border-b-4 border-black pb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-black text-white p-1">
                <Train className="w-5 h-5" />
              </div>
              <span className="text-lg font-black tracking-tight uppercase">
                INDIAN RAILWAYS FREIGHT CORRIDOR
              </span>
            </div>
            <div className="text-[10px] text-neutral-600 font-bold tracking-widest uppercase">
              ELECTRONIC RAILWAY RECEIPT &middot; CONSIGNMENT NOTE (F-RR 2026)
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-neutral-500 uppercase font-bold">BOOKING REFERENCE:</div>
            <div className="text-xl font-black bg-black text-white px-2 py-0.5 inline-block tracking-wider">
              {booking.booking_ref}
            </div>
            <div className="mt-1">
              <Badge status={booking.status} size="sm" />
            </div>
          </div>
        </div>

        {/* Barcode & Timestamp Strip */}
        <div className="p-3 border-2 border-black bg-neutral-50 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-[10px] text-neutral-500 block uppercase">DISPATCH TIMESTAMP:</span>
            <span className="font-bold">{new Date(booking.created_at).toLocaleString('en-GB')}</span>
          </div>

          {/* High Contrast Simulated Barcode */}
          <div className="flex flex-col items-center">
            <div className="flex gap-[2px] h-6 items-center">
              {[4, 2, 6, 1, 3, 5, 2, 4, 1, 6, 3, 2, 5, 1, 4, 2, 6, 3, 2, 4, 5, 1, 3, 2].map((w, i) => (
                <div key={i} className="bg-black h-full" style={{ width: `${w}px` }} />
              ))}
            </div>
            <span className="text-[9px] font-mono tracking-widest mt-0.5">{booking.booking_ref}</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-neutral-500 block uppercase">SLOT RAKE ID:</span>
            <span className="font-bold text-black">{booking.slot?.slot_number}</span>
          </div>
        </div>

        {/* Entity / Shipper Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Consignor (Customer) */}
          <div className="border-2 border-black p-4 space-y-2">
            <div className="text-[10px] font-bold uppercase text-neutral-500 flex items-center gap-1 border-b border-neutral-300 pb-1">
              <Building2 className="w-3.5 h-3.5 text-black" />
              CONSIGNOR BUSINESS ACCOUNT
            </div>
            <div className="font-bold text-sm uppercase text-black">{booking.organization?.name}</div>
            <div className="text-xs text-neutral-700">
              <div>TAX ID / GSTIN: <strong className="text-black font-mono">{booking.organization?.tax_id || 'N/A'}</strong></div>
              <div>BILLING SIDING: {booking.organization?.billing_address}</div>
              <div>OFFICER: {booking.profile?.full_name} ({booking.profile?.email})</div>
            </div>
          </div>

          {/* Carrier Details */}
          <div className="border-2 border-black p-4 space-y-2">
            <div className="text-[10px] font-bold uppercase text-neutral-500 flex items-center gap-1 border-b border-neutral-300 pb-1">
              <Train className="w-3.5 h-3.5 text-black" />
              RAIL CARRIER &amp; SERVICE TIER
            </div>
            <div className="font-bold text-sm uppercase text-black">
              DFCCIL {booking.slot?.service_type === 'express' ? 'EXPRESS FREIGHT RAKE' : 'STANDARD FREIGHT RAKE'}
            </div>
            <div className="text-xs text-neutral-700">
              <div>SERVICE PRIORITY: <strong className="text-black uppercase">{booking.slot?.service_type}</strong></div>
              <div>TOTAL DISTANCE: {booking.slot?.route?.distance_km} KM</div>
              <div>ESTIMATED TRANSIT: {booking.slot?.route?.estimated_hours} HOURS</div>
            </div>
          </div>
        </div>

        {/* Route Routing Section */}
        <div className="border-2 border-black p-4 space-y-3">
          <div className="text-[10px] font-bold uppercase text-neutral-500 border-b border-neutral-300 pb-1">
            DISPATCH ROUTE CORRIDOR
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-black uppercase">ORIGIN SIDING:</div>
              <div className="font-bold text-sm">{booking.slot?.route?.origin_name}</div>
              <div className="font-mono text-xs font-black bg-black text-white px-1.5 py-0.2 inline-block">
                [{booking.slot?.route?.origin_code}]
              </div>
              <div className="text-xs text-neutral-700 pt-1">
                DEPARTURE: {depDate?.toLocaleString('en-GB')}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold text-black uppercase">DESTINATION TERMINAL:</div>
              <div className="font-bold text-sm">{booking.slot?.route?.destination_name}</div>
              <div className="font-mono text-xs font-black bg-black text-white px-1.5 py-0.2 inline-block">
                [{booking.slot?.route?.destination_code}]
              </div>
              <div className="text-xs text-neutral-700 pt-1">
                ARRIVAL: {arrDate?.toLocaleString('en-GB')}
              </div>
            </div>
          </div>
        </div>

        {/* Cargo Commodity & Billing Table */}
        <div className="border-2 border-black overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black text-white uppercase text-[10px]">
                <th className="p-2.5">COMMODITY DESCRIPTION</th>
                <th className="p-2.5">CLASS / CATEGORY</th>
                <th className="p-2.5">PAYLOAD QUANTITY</th>
                <th className="p-2.5">TARIFF UNIT RATE</th>
                <th className="p-2.5 text-right">TOTAL INVOICE (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black">
                <td className="p-3 font-bold">
                  <div>{booking.cargo_type?.name}</div>
                  <div className="text-[10px] text-neutral-500 font-normal">
                    {booking.handling_instructions ? `Note: ${booking.handling_instructions}` : 'Standard handling protocols'}
                  </div>
                </td>
                <td className="p-3 font-bold uppercase">{booking.cargo_type?.category}</td>
                <td className="p-3 font-black text-sm">
                  {booking.quantity.toLocaleString()} {unit}
                </td>
                <td className="p-3 font-bold">₹{booking.unit_rate.toFixed(2)} / {unit}</td>
                <td className="p-3 text-right font-black text-base">
                  ₹{booking.total_cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Cancellation Audit Strip if Cancelled */}
        {isCancelled && booking.cancellation && (
          <div className="border-4 border-dashed border-black p-4 bg-white space-y-1.5">
            <div className="font-black uppercase text-xs flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              CANCELLATION AUDIT MANIFEST
            </div>
            <div className="text-xs text-neutral-800">
              <div>CANCELLED AT: {new Date(booking.cancellation.created_at).toLocaleString('en-GB')}</div>
              <div>REASON: <strong className="text-black">{booking.cancellation.cancellation_reason}</strong></div>
              <div>CAPACITY RESTORED: <strong className="text-black">{booking.cancellation.restored_capacity} {unit} returned to slot</strong></div>
            </div>
          </div>
        )}

        {/* Footer Audit Signatures */}
        <div className="border-t-2 border-black pt-4 flex flex-wrap items-center justify-between text-[10px] text-neutral-600 gap-4">
          <div>
            GENERATED ELECTRONICALLY BY FREIGHT IRCTC SYSTEM &middot; SECURE AUDIT SIGNED
          </div>
          <div className="font-bold text-black uppercase">
            STATUS: {booking.status.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      <CancellationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        booking={booking}
        onCancellationSuccess={() => {
          loadBooking();
          setIsCancelModalOpen(false);
        }}
      />
    </div>
  );
}
