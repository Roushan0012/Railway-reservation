import React from 'react';
import { AlertTriangle, Info, CheckCircle2, ShieldAlert, X } from 'lucide-react';

interface AlertBoxProps {
  type?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const AlertBox: React.FC<AlertBoxProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  let borderClass = 'border-2 border-black';
  let icon = <Info className="w-5 h-5 flex-shrink-0" />;
  let badgeText = 'NOTICE';

  if (type === 'error') {
    borderClass = 'border-4 border-black';
    icon = <ShieldAlert className="w-5 h-5 flex-shrink-0 stroke-[2.5]" />;
    badgeText = 'SYSTEM ERROR';
  } else if (type === 'warning') {
    borderClass = 'border-2 border-dashed border-black';
    icon = <AlertTriangle className="w-5 h-5 flex-shrink-0 stroke-[2]" />;
    badgeText = 'OPERATIONAL WARNING';
  } else if (type === 'success') {
    borderClass = 'border-2 border-black bg-white';
    icon = <CheckCircle2 className="w-5 h-5 flex-shrink-0 stroke-[2.5]" />;
    badgeText = 'TRANSACTION COMPLETED';
  }

  return (
    <div className={`p-4 bg-white text-black ${borderClass} relative ${className}`}>
      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-black uppercase tracking-wider bg-black text-white px-1.5 py-0.5">
              {badgeText}
            </span>
            {title && <span className="font-bold text-sm uppercase">{title}</span>}
          </div>
          <div className="text-sm leading-relaxed font-sans">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 border border-black hover:bg-black hover:text-white transition-colors"
            aria-label="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
