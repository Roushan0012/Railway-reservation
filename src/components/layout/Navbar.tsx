'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { railwayService } from '@/lib/services/railwayService';
import { UserRole } from '@/types/database';
import { Train, Shield, Building2, Search, ListFilter, Sliders, RefreshCw } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [session, setSession] = useState(railwayService.getSession());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setSession(railwayService.getSession());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    railwayService.setRole(newRole);
    setSession(railwayService.getSession());
    // Trigger custom event so any active page can re-render
    window.dispatchEvent(new Event('railway_state_changed'));
  };

  const handleOrgChange = (newOrgId: string) => {
    railwayService.setOrganization(newOrgId);
    setSession(railwayService.getSession());
    window.dispatchEvent(new Event('railway_state_changed'));
  };

  const handleReset = () => {
    if (confirm('Reset system data to initial state?')) {
      railwayService.resetToDefaults();
      setSession(railwayService.getSession());
      window.dispatchEvent(new Event('railway_state_changed'));
    }
  };

  if (!mounted) {
    return (
      <header className="w-full bg-black text-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-mono font-bold tracking-tight text-lg">FREIGHT RAIL // IRCTC-CARGO</div>
        </div>
      </header>
    );
  }

  const isCustomer = session.role === 'customer';

  return (
    <header className="w-full bg-black text-white border-b-4 border-black sticky top-0 z-40">
      {/* Top Banner: Actor Context & Environment */}
      <div className="bg-[#141414] border-b border-neutral-800 px-4 py-1.5 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="bg-white text-black font-bold px-1.5 py-0.5 text-[10px] tracking-wider uppercase">
              B2B FREIGHT CORRIDOR
            </span>
            <span className="hidden sm:inline text-neutral-400">
              NATIONAL RAIL NETWORK RESERVATION & LOGISTICS DISPATCH
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* Actor / Role Switcher */}
            <div className="flex items-center gap-1">
              <span className="text-neutral-400 uppercase text-[10px] mr-1">Actor View:</span>
              <button
                onClick={() => handleRoleChange('customer')}
                className={`px-2 py-0.5 border text-xs font-semibold transition-colors ${
                  isCustomer
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-neutral-400 border-neutral-700 hover:text-white'
                }`}
              >
                CUSTOMER
              </button>
              <button
                onClick={() => handleRoleChange('railway_admin')}
                className={`px-2 py-0.5 border text-xs font-semibold transition-colors ${
                  !isCustomer
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-neutral-400 border-neutral-700 hover:text-white'
                }`}
              >
                ADMIN / OPERATOR
              </button>
            </div>

            {/* Org Switcher for Customer */}
            {isCustomer && (
              <div className="flex items-center gap-1.5 border-l border-neutral-700 pl-3">
                <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                <select
                  value={session.org?.id || ''}
                  onChange={(e) => handleOrgChange(e.target.value)}
                  className="bg-black text-white border border-neutral-700 text-xs px-2 py-0.5 font-mono focus:outline-none focus:border-white"
                >
                  {session.allOrgs.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Reset Data */}
            <button
              onClick={handleReset}
              title="Reset sample data"
              className="p-1 text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-600 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-white text-black p-1.5 border-2 border-white group-hover:bg-black group-hover:text-white transition-colors">
            <Train className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-base font-black tracking-tight uppercase flex items-center gap-2">
              <span>FREIGHT RAIL RESERVATION</span>
              <span className="text-[10px] font-mono border border-white/40 px-1 py-0.2">v2.0</span>
            </div>
            <div className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
              Dedicated Freight Corridor Allocation
            </div>
          </div>
        </Link>

        {/* Primary Links */}
        <nav className="flex items-center gap-2 font-mono text-xs">
          <Link
            href="/availability"
            className={`px-3 py-2 border-2 flex items-center gap-1.5 font-bold transition-colors ${
              pathname === '/availability' || pathname === '/'
                ? 'bg-white text-black border-white'
                : 'border-neutral-800 hover:border-neutral-500 text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>CHECK AVAILABILITY</span>
          </Link>

          <Link
            href="/dashboard"
            className={`px-3 py-2 border-2 flex items-center gap-1.5 font-bold transition-colors ${
              pathname === '/dashboard'
                ? 'bg-white text-black border-white'
                : 'border-neutral-800 hover:border-neutral-500 text-white'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>
              {isCustomer ? 'MY CONSIGNMENTS' : 'NETWORK BOOKINGS'}
            </span>
          </Link>

          {/* Admin Management Section */}
          <Link
            href="/admin"
            className={`px-3 py-2 border-2 flex items-center gap-1.5 font-bold transition-colors ${
              pathname.startsWith('/admin')
                ? 'bg-white text-black border-white'
                : 'border-neutral-800 hover:border-neutral-500 text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>OPERATOR ADMIN</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};
