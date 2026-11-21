import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, disabled, id, className }) => {
  const switchId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label
      htmlFor={switchId}
      className={twMerge(
        clsx('inline-flex items-center gap-2 select-none', disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer', className)
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        id={switchId}
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
        className={clsx(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
          checked ? 'bg-brand' : 'bg-slate-200 dark:bg-slate-700'
        )}
      >
        <span
          className={clsx(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-150',
            checked ? 'left-[18px]' : 'left-0.5'
          )}
        />
      </button>
      {label && <span className="text-xs font-medium text-ink dark:text-slate-200">{label}</span>}
    </label>
  );
};

Switch.displayName = 'Switch';
