import React from 'react';
import { Check, X, Clock, Zap, Shield, AlertTriangle } from 'lucide-react';
import { BookingStatus, ServiceTier, SlotStatus } from '@/types/database';

interface BadgeProps {
  status?: BookingStatus | SlotStatus | ServiceTier | 'active' | 'inactive';
  label?: string;
  variant?: 'solid' | 'outline' | 'dashed' | 'double' | 'inverse';
  size?: 'sm' | 'md' | 'lg';
  icon?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  label,
  variant,
  size = 'md',
  icon = true,
  className = '',
}) => {
  let displayLabel = label || status || '';
  let badgeStyle = 'bw-border-solid bg-white text-black font-semibold';
  let IconComponent: React.ReactNode = null;

  // Resolve defaults based on status if variant not explicitly forced
  if (status === 'confirmed' || status === 'completed' || status === 'active') {
    badgeStyle = 'bg-black text-white border-2 border-black font-bold';
    IconComponent = icon ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null;
    displayLabel = label || (status === 'confirmed' ? 'CONFIRMED' : status === 'active' ? 'ACTIVE' : 'COMPLETED');
  } else if (status === 'cancelled') {
    badgeStyle = 'bg-white text-black border-2 border-dashed border-black font-bold line-through decoration-2';
    IconComponent = icon ? <X className="w-3.5 h-3.5 stroke-[2.5]" /> : null;
    displayLabel = label || 'CANCELLED';
  } else if (status === 'scheduled' || status === 'in_transit' || status === 'boarding') {
    badgeStyle = 'bg-white text-black border-2 border-black font-semibold';
    IconComponent = icon ? <Clock className="w-3.5 h-3.5 stroke-[2]" /> : null;
    displayLabel = label || status.toUpperCase().replace('_', ' ');
  } else if (status === 'express') {
    badgeStyle = 'bg-black text-white border-2 border-black font-bold tracking-wider';
    IconComponent = icon ? <Zap className="w-3.5 h-3.5 fill-white stroke-[2.5]" /> : null;
    displayLabel = label || 'EXPRESS FREIGHT';
  } else if (status === 'normal') {
    badgeStyle = 'bg-white text-black border-2 border-black font-medium';
    displayLabel = label || 'STANDARD FREIGHT';
  }

  // Explicit variant overrides
  if (variant === 'solid') {
    badgeStyle = 'bg-black text-white border border-black font-bold';
  } else if (variant === 'outline') {
    badgeStyle = 'bg-white text-black border-2 border-black font-semibold';
  } else if (variant === 'dashed') {
    badgeStyle = 'bg-white text-black border-2 border-dashed border-black font-semibold';
  } else if (variant === 'double') {
    badgeStyle = 'bg-white text-black border-4 border-double border-black font-bold';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs tracking-wide uppercase gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm tracking-wider uppercase gap-2',
  };

  return (
    <span
      className={`inline-flex items-center justify-center select-none font-mono ${sizeClasses[size]} ${badgeStyle} ${className}`}
    >
      {IconComponent}
      <span>{displayLabel}</span>
    </span>
  );
};
