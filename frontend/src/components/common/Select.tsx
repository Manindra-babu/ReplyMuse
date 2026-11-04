import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-[#2B2B2B] mb-1.5 font-sans">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full bg-white border rounded-xl px-3.5 py-2 text-sm text-[#2B2B2B] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]/25 focus:border-[#1F7A5C] disabled:bg-[#F7F3E8] disabled:opacity-75 shadow-2xs ${
            error ? 'border-[#D9381E] focus:ring-[#D9381E]/20' : 'border-[#E5DFD3]'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-[#D9381E] font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
