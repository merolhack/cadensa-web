'use client';

import React, { useState, useId } from 'react';

export interface CollapsibleProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
  title,
  subtitle,
  icon,
  badge,
  isOpen: controlledIsOpen,
  defaultOpen = false,
  onToggle,
  children,
  className = '',
  headerClassName = '',
  contentClassName = '',
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const contentId = useId();
  const headerId = useId();

  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    const next = !open;
    if (!isControlled) {
      setInternalIsOpen(next);
    }
    if (onToggle) {
      onToggle(next);
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        open
          ? 'bg-zinc-900/70 border-zinc-700/80 shadow-lg'
          : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700/60'
      } ${className}`}
    >
      <button
        type="button"
        id={headerId}
        aria-expanded={open}
        aria-controls={contentId}
        onClick={handleToggle}
        className={`w-full flex items-center justify-between p-3.5 sm:p-4 text-left cursor-pointer select-none transition-colors rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-950 ${headerClassName}`}
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-lg shrink-0">{icon}</div>}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-zinc-100">{title}</span>
              {badge && <span>{badge}</span>}
            </div>
            {subtitle && (
              <span className="text-[11px] text-zinc-400 font-normal mt-0.5">{subtitle}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-zinc-400 shrink-0">
          <span className="text-[11px] font-medium hidden sm:inline text-zinc-400">
            {open ? 'Ocultar' : 'Mostrar'}
          </span>
          <span
            aria-hidden="true"
            className={`transform transition-transform duration-200 text-xs ${
              open ? 'rotate-180 text-emerald-400' : 'rotate-0'
            }`}
          >
            ▼
          </span>
        </div>
      </button>

      <div
        id={contentId}
        role="region"
        aria-labelledby={headerId}
        hidden={!open}
        className={`p-3.5 sm:p-4 pt-1 sm:pt-1 border-t border-zinc-800/60 ${
          open ? 'block animate-fade-in' : 'hidden'
        } ${contentClassName}`}
      >
        {children}
      </div>
    </div>
  );
};
