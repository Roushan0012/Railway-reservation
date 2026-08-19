import React from 'react';
import { Train, ShieldCheck, FileText, Activity } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white text-black border-t-4 border-black mt-20 no-print font-mono">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b-2 border-black text-xs">
          {/* Col 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-black uppercase text-sm">
              <Train className="w-4 h-4" />
              <span>FREIGHT IRCTC // WDFC</span>
            </div>
            <p className="text-neutral-600 font-sans leading-relaxed">
              National Commodity & Bulk Cargo Rail Allocation Terminal. Dedicated Freight Corridors (WDFC/EDFC)
              operating under automated atomic slot dispatch.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <div className="font-bold uppercase tracking-wider text-black border-b border-black pb-1">
              SYSTEM CAPABILITIES
            </div>
            <ul className="space-y-1.5 text-neutral-700">
              <li>• Real-Time Atomic Slot Reservation</li>
              <li>• Double-Stack Container Wagons</li>
              <li>• Reefer Cold Chain Telemetry</li>
              <li>• Liquid Petrochemical POL Tanks</li>
              <li>• Instant Capacity Restoration</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <div className="font-bold uppercase tracking-wider text-black border-b border-black pb-1">
              COMPLIANCE & AUDIT
            </div>
            <ul className="space-y-1.5 text-neutral-700">
              <li>• Multi-Tenant Row Level Security</li>
              <li>• GSTIN-Traceable Consignment Notes</li>
              <li>• Mandatory Cancellation Reasons</li>
              <li>• Automated Electronic Waybills</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <div className="font-bold uppercase tracking-wider text-black border-b border-black pb-1">
              DISPATCH NETWORK STATUS
            </div>
            <div className="p-3 border-2 border-black bg-neutral-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold">GRID DISPATCH:</span>
                <span className="bg-black text-white px-1 text-[10px] font-bold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span>LOCK MECHANISM:</span>
                <span className="font-semibold">ACID ATOMIC</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span>THEME COMPLIANCE:</span>
                <span className="font-semibold">STRICT MONO B&amp;W</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-between text-xs text-neutral-600 gap-4">
          <div>
            © {new Date().getFullYear()} INDIAN RAIL FREIGHT NETWORK &middot; ALL RIGHTS RESERVED
          </div>
          <div className="flex items-center gap-4">
            <span className="border border-black px-2 py-0.5 font-bold text-black">
              HIGH CONTRAST B&amp;W EDITION
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
