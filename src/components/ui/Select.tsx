import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  options?: Array<{ label: string; value: string | number; disabled?: boolean }>;
  children?: React.ReactNode;
  id?: string;
  name?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

/* Custom dropdown with the same API as the old native select:
   callers keep using value + onChange={(e) => setX(e.target.value)}. */
export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      children,
      id,
      name,
      value,
      defaultValue,
      onChange,
      disabled,
      placeholder,
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const childOptions: SelectOption[] = useMemo(() => {
      const out: SelectOption[] = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === 'option') {
          const p = child.props as { value?: string | number; disabled?: boolean; children?: React.ReactNode };
          out.push({ label: String(p.children ?? p.value ?? ''), value: p.value ?? '', disabled: p.disabled });
        }
      });
      return out;
    }, [children]);

    const allOptions: SelectOption[] = options && options.length > 0 ? options : childOptions;

    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<string>(defaultValue !== undefined ? String(defaultValue) : '');
    const current = isControlled ? String(value) : internal;
    const selected = allOptions.find((o) => String(o.value) === current);

    const [open, setOpen] = useState(false);
    const [highlight, setHighlight] = useState(-1);
    const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const keyboardNav = useRef(false);

    const setTriggerRef = (el: HTMLButtonElement | null) => {
      triggerRef.current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
    };

    const updatePos = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left, width: r.width });
    };

    useEffect(() => {
      if (!open) return;
      updatePos();
      const onPointerDown = (e: PointerEvent) => {
        const t = e.target as Node;
        if (containerRef.current?.contains(t)) return;
        if (popoverRef.current?.contains(t)) return;
        setOpen(false);
      };
      const onEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };
      const onScrollResize = () => updatePos();
      document.addEventListener('pointerdown', onPointerDown);
      document.addEventListener('keydown', onEscape);
      window.addEventListener('resize', onScrollResize);
      document.addEventListener('scroll', onScrollResize, true);
      return () => {
        document.removeEventListener('pointerdown', onPointerDown);
        document.removeEventListener('keydown', onEscape);
        window.removeEventListener('resize', onScrollResize);
        document.removeEventListener('scroll', onScrollResize, true);
      };
    }, [open ]);

    // Keep the keyboard-highlighted option visible while navigating
    useEffect(() => {
      if (!open || !keyboardNav.current || highlight < 0) return;
      keyboardNav.current = false;
      popoverRef.current
        ?.querySelector(`[data-opt-idx="${highlight}"]`)
        ?.scrollIntoView({ block: 'nearest' });
    }, [open, highlight]);

    const choose = (opt: SelectOption) => {
      if (opt.disabled) return;
      if (!isControlled) setInternal(String(opt.value));
      const synthetic = { target: { value: opt.value, name: name || '' } } as unknown as React.ChangeEvent<HTMLSelectElement>;
      onChange?.(synthetic);
      setOpen(false);
    };

    const openMenu = () => {
      if (disabled) return;
      setHighlight(Math.max(0, allOptions.findIndex((o) => String(o.value) === current)));
      setOpen(true);
    };

    const onTriggerKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        openMenu();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        keyboardNav.current = true;
        setHighlight((h) => {
          const dir = e.key === 'ArrowDown' ? 1 : -1;
          const next = (((h < 0 ? 0 : h) + dir) % allOptions.length + allOptions.length) % allOptions.length;
          return next;
        });
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const opt = allOptions[highlight];
        if (opt) choose(opt);
      }
    };

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-[13px] font-semibold text-ink dark:text-slate-200 select-none">
            {label}
          </label>
        )}
        <div ref={containerRef} className="relative w-full">
          <button
            type="button"
            id={selectId}
            ref={setTriggerRef}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => (open ? setOpen(false) : openMenu())}
            onKeyDown={onTriggerKeyDown}
            className={twMerge(
              clsx(
                'w-full h-9 flex items-center justify-between gap-2 rounded-xl border bg-white dark:bg-ink-2 pl-3 pr-2.5 py-1.5 text-xs sm:text-sm text-ink dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand disabled:cursor-not-allowed disabled:bg-frost dark:disabled:bg-slate-800/60 disabled:text-muted-light cursor-pointer',
                error ? 'border-rose-500 focus:ring-rose-500/30 focus:border-rose-500' : 'border-line dark:border-slate-700',
                open && !error && 'border-brand dark:border-indigo-500 ring-2 ring-brand/40',
                !disabled && !open && 'hover:bg-surface dark:hover:bg-slate-800/60',
                className
              )
            )}
          >
            <span className={clsx('truncate', !selected && 'text-muted-light dark:text-slate-500')}>
              {selected ? selected.label : placeholder || 'Select…'}
            </span>
            <ChevronDown className={clsx('w-4 h-4 shrink-0 text-muted dark:text-slate-400 transition-transform duration-150', open && 'rotate-180')} />
          </button>

          {/* Popover in a portal: never clipped by modal/drawer overflow */}
          {open && pos && createPortal(
            <div
              ref={popoverRef}
              role="listbox"
              aria-labelledby={selectId}
              style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 100 }}
              className="max-h-60 overflow-y-auto rounded-xl border border-line dark:border-slate-700 bg-white dark:bg-ink-2 p-1 shadow-xl shadow-slate-900/10"
            >
              {allOptions.length === 0 ? (
                <div className="px-3 py-2.5 text-xs text-muted dark:text-slate-400">No options</div>
              ) : (
                allOptions.map((opt, idx) => {
                  const isSelected = String(opt.value) === current;
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      role="option"
                      data-opt-idx={idx}
                      aria-selected={isSelected}
                      disabled={opt.disabled}
                      onClick={() => choose(opt)}
                      onMouseEnter={() => setHighlight(idx)}
                      className={twMerge(
                        clsx(
                          'w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-left transition-colors cursor-pointer',
                          isSelected
                            ? 'bg-brand-soft dark:bg-indigo-500/15 text-brand dark:text-indigo-300 font-semibold'
                            : 'text-muted-strong dark:text-slate-300',
                          !isSelected && !opt.disabled && 'hover:bg-surface dark:hover:bg-slate-800',
                          idx === highlight && !isSelected && 'bg-surface dark:bg-slate-800',
                          opt.disabled && 'opacity-50 cursor-not-allowed'
                        )
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>,
            document.body
          )}
        </div>
        {error && <p className="text-xs text-rose-600 dark:text-rose-400 leading-tight">{error}</p>}
        {!error && helperText && <p className="text-xs text-muted dark:text-slate-400 leading-tight">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
