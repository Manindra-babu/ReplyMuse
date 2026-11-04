import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
  maxLength?: number;
  minRows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, showCount, maxLength, minRows, rows, value, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const currentLength = typeof value === 'string' ? value.length : 0;
    const computedRows = rows || minRows || 3;

    return (
      <div className="w-full">
        <div className={`flex items-center ${label ? 'justify-between' : 'justify-end'} mb-1.5`}>
          {label && (
            <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-[#2B2B2B] font-sans">
              {label}
            </label>
          )}
          {showCount && maxLength && (
            <span className="text-xs text-[#7A7468] font-mono">
              {currentLength} / {maxLength}
            </span>
          )}
        </div>
        <textarea
          id={inputId}
          ref={ref}
          value={value}
          rows={computedRows}
          maxLength={maxLength}
          className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-[#2B2B2B] placeholder:text-[#A1A59C] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]/25 focus:border-[#1F7A5C] resize-y min-h-[100px] disabled:bg-[#F7F3E8] disabled:opacity-75 shadow-2xs ${
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

Textarea.displayName = 'Textarea';
