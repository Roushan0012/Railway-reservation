'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { railwayService } from '@/lib/services/railwayService';
import { Booking, BookingStatus } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { CancellationModal } from '@/components/cancellations/CancellationModal';
import {
  ListFilter,
  Search,
  Train,
  XCircle,
  FileText,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  Plus,
} from 'lucide-react';

export default function DashboardPage() {
  const [session, setSession] = useState(railwayService.getSession());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadData = () => {
    const s = railwayService.getSession();
    setSession(s);
    const orgId = s.role === 'customer' ? s.org.id : undefined;
    const list = railwayService.getBookings(orgId, statusFilter);
    setBookings(list);
  };

  useEffect(() => {
    setMounted(true);
    loadData();
    window.addEventListener('railway_state_changed', loadData);
    return () => window.removeEventListener('railway_state_changed', loadData);
  }, [statusFilter]);

  if (!mounted) return null;

  const isCustomer = session.role === 'customer';

  // Filter by search query
  const filteredBookings = bookings.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.booking_ref.toLowerCase().includes(q) ||
      b.cargo_type?.name.toLowerCase().includes(q) ||
      b.slot?.slot_number.toLowerCase().includes(q) ||
      b.organization?.name.toLowerCase().includes(q)
    );
  });

  // Calculate Metrics
  const totalBookingsCount = bookings.length;
  const activeCount = bookings.filter((b) => b.status === 'confirmed').length;
  const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;
  const totalTonnage = bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((acc, b) => acc + Number(b.quantity), 0);
  const totalFreightValue = bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((acc, b) => acc + Number(b.total_cost), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-mono space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-black text-white px-2 py-0.5 text-xs font-black">
              {isCustomer ? 'CONSIGNOR PORTAL' : 'RAILWAY OPERATOR OVERVIEW'}
            </span>
            <span className="text-xs text-neutral-600 font-bold">
              {isCustomer ? session.org.name : 'NATIONAL DISPATCH GRID'}
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight mt-1">
            {isCustomer ? 'MY FREIGHT CONSIGNMENTS' : 'SYSTEM-WIDE BOOKINGS & AUDIT'}
          </h1>
          <p className="text-xs text-neutral-600">
            {isCustomer
              ? `Manage active rail slots, consignment notes, and cancellations for ${session.org.name}.`
              : 'Master audit log across all corporate shippers and freight corridors.'}
          </p>
        </div>

        <Link
          href="/availability"
          className="bw-btn-primary px-4 py-2.5 text-xs font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>BOOK NEW CARGO SLOT</span>
        </Link>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-[10px] uppercase font-bold text-neutral-600">ACTIVE RESERVATIONS</div>
          <div className="text-2xl font-black text-black mt-1">{activeCount}</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">READY FOR LOADING</div>
        </div>

        <div className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-[10px] uppercase font-bold text-neutral-600">COMMITTED PAYLOAD</div>
          <div className="text-2xl font-black text-black mt-1">{totalTonnage.toLocaleString()} MT</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">TOTAL ALLOCATED WEIGHT</div>
        </div>

        <div className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-[10px] uppercase font-bold text-neutral-600">ACTIVE FREIGHT TARIFF</div>
          <div className="text-2xl font-black text-black mt-1">₹{totalFreightValue.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">INVOICE COMMITMENT</div>
        </div>

        <div className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-[10px] uppercase font-bold text-neutral-600">CANCELLED ORDERS</div>
          <div className="text-2xl font-black text-black mt-1">{cancelledCount}</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">CAPACITY RESTORED</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="border-4 border-black p-4 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <span className="text-[10px] font-bold text-neutral-600 uppercase mr-2">STATUS:</span>
          {['all', 'confirmed', 'cancelled', 'departed', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-bold uppercase transition-colors ${
                statusFilter === st
                  ? 'bg-black text-white border-2 border-black'
                  : 'bg-white text-black border-2 border-transparent hover:border-black'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-neutral-600" />
            <input
              type="text"
              placeholder="Search reference, cargo, slot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border-2 border-black text-xs font-bold bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table / List */}
      <div className="border-4 border-black overflow-x-auto bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-black text-white uppercase text-[10px] border-b-2 border-black">
              <th className="p-3">CONSIGNMENT REF</th>
              {!isCustomer && <th className="p-3">ORGANIZATION</th>}
              <th className="p-3">CORRIDOR / RAKE</th>
              <th className="p-3">COMMODITY PAYLOAD</th>
              <th className="p-3">TARIFF TOTAL</th>
              <th className="p-3">STATUS</th>
              <th className="p-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={isCustomer ? 6 : 7} className="p-8 text-center text-neutral-600">
                  <div className="font-bold uppercase text-sm">NO CONSIGNMENT RECORDS FOUND</div>
                  <p className="text-xs mt-1">Try changing status filters or search parameters.</p>
                </td>
              </tr>
            ) : (
              filteredBookings.map((b) => {
                const unit = b.cargo_type?.unit_of_measure || 'MT';
                const isCancelled = b.status === 'cancelled';
                const isExpress = b.slot?.service_type === 'express';

                return (
                  <tr key={b.id} className="hover:bg-neutral-50">
                    {/* Booking Reference */}
                    <td className="p-3 font-bold">
                      <Link
                        href={`/confirmation/${b.booking_ref}`}
                        className="bg-black text-white px-2 py-0.5 text-xs hover:bg-neutral-800 transition-colors inline-block"
                      >
                        {b.booking_ref}
                      </Link>
                      <div className="text-[10px] text-neutral-500 mt-1">
                        {new Date(b.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </td>

                    {/* Organization (Admin View) */}
                    {!isCustomer && (
                      <td className="p-3">
                        <div className="font-bold text-black">{b.organization?.name}</div>
                        <div className="text-[10px] text-neutral-500">{b.profile?.full_name}</div>
                      </td>
                    )}

                    {/* Corridor & Slot */}
                    <td className="p-3">
                      <div className="font-bold text-black flex items-center gap-1">
                        <span>{b.slot?.route?.origin_code} &rarr; {b.slot?.route?.destination_code}</span>
                        {isExpress && <span className="border border-black px-1 text-[9px] bg-black text-white">EXP</span>}
                      </div>
                      <div className="text-[10px] text-neutral-600">
                        RAKE: {b.slot?.slot_number}
                      </div>
                    </td>

                    {/* Commodity */}
                    <td className="p-3">
                      <div className="font-bold text-black">{b.cargo_type?.name}</div>
                      <div className="font-black text-xs text-black">
                        {b.quantity.toLocaleString()} {unit}
                      </div>
                    </td>

                    {/* Tariff */}
                    <td className="p-3">
                      <div className="font-black text-sm text-black">
                        ₹{b.total_cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-neutral-600">
                        @ ₹{b.unit_rate.toFixed(2)}/{unit}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3">
                      <Badge status={b.status} size="sm" />
                      {isCancelled && b.cancellation && (
                        <div className="text-[10px] text-neutral-600 mt-0.5 max-w-[140px] truncate" title={b.cancellation.cancellation_reason}>
                          Reason: {b.cancellation.cancellation_reason}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/confirmation/${b.booking_ref}`}
                          className="bw-btn-secondary px-2.5 py-1 text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>NOTE</span>
                        </Link>

                        {!isCancelled && (
                          <button
                            onClick={() => setSelectedBookingForCancel(b)}
                            className="bw-btn-danger px-2.5 py-1 text-[11px] font-bold inline-flex items-center gap-1"
                            title="Cancel Booking & Restore Capacity"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>CANCEL</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Cancellation Modal */}
      <CancellationModal
        isOpen={!!selectedBookingForCancel}
        onClose={() => setSelectedBookingForCancel(null)}
        booking={selectedBookingForCancel}
        onCancellationSuccess={() => {
          loadData();
          setSelectedBookingForCancel(null);
        }}
      />
    </div>
  );
}
