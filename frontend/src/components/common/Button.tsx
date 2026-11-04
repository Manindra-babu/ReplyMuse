import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'coral' | 'vermillion' | 'emerald' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1F7A5C] disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#1F7A5C] text-white hover:bg-[#18634B] active:bg-[#124F3A] shadow-xs border border-transparent font-semibold',
    emerald:
      'bg-[#1F7A5C] text-white hover:bg-[#18634B] active:bg-[#124F3A] shadow-xs border border-transparent font-semibold',
    coral:
      'bg-[#EE6A4B] text-white hover:bg-[#D95A3D] active:bg-[#C44A2F] shadow-xs border border-transparent font-semibold focus:ring-[#EE6A4B]',
    vermillion:
      'bg-[#EE6A4B] text-white hover:bg-[#D95A3D] active:bg-[#C44A2F] shadow-xs border border-transparent font-semibold focus:ring-[#EE6A4B]',
    secondary:
      'bg-white border border-[#E5DFD3] text-[#2B2B2B] hover:bg-[#F7F3E8] hover:border-[#D5CDBD] shadow-2xs font-medium',
    outline:
      'border border-[#1F7A5C] text-[#1F7A5C] bg-white hover:bg-[#DCEBE3]/60 font-semibold',
    ghost:
      'text-[#7A7468] hover:text-[#2B2B2B] hover:bg-[#F7F3E8] font-medium',
    danger:
      'bg-[#D9381E] text-white hover:bg-[#B82810] shadow-xs border border-transparent font-semibold focus:ring-[#D9381E]',
    amber:
      'bg-[#F5A623] text-white hover:bg-[#DE9215] shadow-xs border border-transparent font-semibold focus:ring-[#F5A623]',
  }[variant] || 'bg-[#1F7A5C] text-white hover:bg-[#18634B]';

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="shrink-0 flex items-center">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
