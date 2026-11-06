'use client';

import React, { useState } from 'react';

export interface DisclosureProps {
  summary: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string;
  defaultOpen?: boolean;
  className?: string;
  summaryClassName?: string;
  contentClassName?: string;
}

export const Disclosure: React.FC<DisclosureProps> = ({
  summary,
  children,
  icon,
  badge,
  defaultOpen = false,
  className = '',
  summaryClassName = '',
  contentClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <details
      open={isOpen}
      onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
      className={`group rounded-2xl border border-zinc-800/80 bg-zinc-900/40 transition-all duration-200 open:border-emerald-500/30 open:bg-zinc-900/70 ${className}`}
    >
      <summary
        className={`flex items-center justify-between p-3.5 sm:p-4 text-xs sm:text-sm font-semibold text-zinc-200 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden hover:text-emerald-300 transition-colors ${summaryClassName}`}
      >
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-base shrink-0">{icon}</span>}
          <span>{summary}</span>
          {badge && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-medium">
              {badge}
            </span>
          )}
        </div>

        <span
          aria-hidden="true"
          className="ml-2 transform text-zinc-400 group-open:rotate-180 transition-transform duration-200 text-xs shrink-0"
        >
          ▼
        </span>
      </summary>

      <div
        className={`px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-1 text-xs sm:text-sm text-zinc-300 border-t border-zinc-800/40 leading-relaxed ${contentClassName}`}
      >
        {children}
      </div>
    </details>
  );
};

