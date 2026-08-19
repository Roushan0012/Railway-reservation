import React from 'react';
import { Layers } from 'lucide-react';

interface CapacityMeterProps {
  totalCapacity: number;
  remainingCapacity: number;
  unit?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CapacityMeter: React.FC<CapacityMeterProps> = ({
  totalCapacity,
  remainingCapacity,
  unit = 'MT',
  showLabels = true,
  size = 'md',
}) => {
  const occupied = Math.max(0, totalCapacity - remainingCapacity);
  const percentageOccupied = totalCapacity > 0 ? Math.min(100, Math.round((occupied / totalCapacity) * 100)) : 0;
  const isFull = remainingCapacity <= 0;
  const isLowCapacity = remainingCapacity > 0 && remainingCapacity <= totalCapacity * 0.2;

  const barHeight = {
    sm: 'h-2.5',
    md: 'h-4',
    lg: 'h-6',
  }[size];

  return (
    <div className="w-full space-y-1.5 font-mono">
      {showLabels && (
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-1 text-black uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            Capacity Status
          </span>
          <div className="flex items-center gap-2">
            <span className={`font-bold ${isFull ? 'line-through' : ''}`}>
              {remainingCapacity.toLocaleString()} {unit} AVAILABLE
            </span>
            <span className="border border-black px-1.5 py-0.2 text-[10px] uppercase font-bold bg-white text-black">
              {percentageOccupied}% BOOKED
            </span>
          </div>
        </div>
      )}

      {/* Progress Track (Monochrome) */}
      <div className={`w-full border-2 border-black bg-white overflow-hidden p-[2px] ${barHeight}`}>
        <div
          className="h-full bg-black transition-all duration-300 relative"
          style={{ width: `${percentageOccupied}%` }}
        >
          {/* Subtle stripe for high contrast */}
          <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#fff,#fff_2px,transparent_2px,transparent_4px)]" />
        </div>
      </div>

      {showLabels && (
        <div className="flex justify-between items-center text-[10px] text-black uppercase">
          <span>0 {unit}</span>
          {isFull ? (
            <span className="font-bold border border-black bg-black text-white px-1">
              [ SLOT FULLY RESERVED ]
            </span>
          ) : isLowCapacity ? (
            <span className="font-bold border border-dashed border-black px-1">
              [ LOW CAPACITY ALERT: &lt;20% ]
            </span>
          ) : (
            <span>Total Rake Payload: {totalCapacity.toLocaleString()} {unit}</span>
          )}
          <span>{totalCapacity.toLocaleString()} {unit}</span>
        </div>
      )}
    </div>
  );
};
