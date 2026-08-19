import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* High-contrast backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-none transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative z-10 w-full ${maxWidthClass} bg-white text-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] flex flex-col`}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-black text-white p-4 flex items-start justify-between border-b-2 border-black">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase border border-white/40 px-1.5 py-0.5 inline-block mb-1">
              SYSTEM MODAL
            </span>
            <h3 className="text-base font-bold uppercase tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-white/80 font-mono mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 border border-white hover:bg-white hover:text-black transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto font-sans flex-1">{children}</div>
      </div>
    </div>
  );
};
