import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-[#2B2B2B] mb-1.5 font-sans">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full bg-white border rounded-xl px-3.5 py-2 text-sm text-[#2B2B2B] placeholder:text-[#A1A59C] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]/25 focus:border-[#1F7A5C] disabled:bg-[#F7F3E8] disabled:opacity-75 shadow-2xs ${
            error ? 'border-[#D9381E] focus:ring-[#D9381E]/20 focus:border-[#D9381E]' : 'border-[#E5DFD3]'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-[#D9381E] font-medium">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-[#7A7468]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
