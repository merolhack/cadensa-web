'use client';

import React, { KeyboardEvent } from 'react';

export interface ToggleProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  activeColor?: 'emerald' | 'cyan' | 'purple' | 'amber';
  className?: string;
  'aria-label'?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  id,
  checked,
  onChange,
  label,
  description,
  icon,
  disabled = false,
  size = 'md',
  activeColor = 'emerald',
  className = '',
  'aria-label': ariaLabel,
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  // Dimensiones del riel y de la perilla según tamaño
  const sizeStyles = {
    sm: {
      track: 'w-8 h-4.5 p-0.5',
      knob: 'w-3.5 h-3.5',
      translate: 'translate-x-3.5',
    },
    md: {
      track: 'w-11 h-6 p-0.5',
      knob: 'w-5 h-5',
      translate: 'translate-x-5',
    },
    lg: {
      track: 'w-14 h-7.5 p-1',
      knob: 'w-5.5 h-5.5',
      translate: 'translate-x-6.5',
    },
  }[size];

  // Paleta de color al estar activo
  const activeColorStyles = {
    emerald: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.35)]',
    cyan: 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.35)]',
    purple: 'bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.35)]',
    amber: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.35)]',
  }[activeColor];

  const trackBg = checked
    ? activeColorStyles
    : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80';

  return (
    <div className={`inline-flex items-center justify-between gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {(label || description || icon) && (
        <div className="flex items-center gap-2 select-none cursor-pointer" onClick={handleToggle}>
          {icon && <span className="text-base">{icon}</span>}
          <div className="flex flex-col">
            {label && (
              <span className="text-xs sm:text-sm font-semibold text-zinc-200 leading-tight">
                {label}
              </span>
            )}
            {description && (
              <span className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                {description}
              </span>
            )}
          </div>
        </div>
      )}

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-950 ${sizeStyles.track} ${trackBg}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${sizeStyles.knob} ${
            checked ? sizeStyles.translate : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

