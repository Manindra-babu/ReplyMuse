import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'coral' | 'vermillion' | 'success' | 'warning' | 'error' | 'amber' | 'ink' | 'muted' | 'default' | 'violet' | 'obsidian' | 'info' | 'teal' | 'copper' | 'sapphire' | 'tangerine' | 'sage';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }[size];

  const variantClasses = {
    default: 'bg-white border border-[#E5DFD3] text-[#2B2B2B]',
    emerald: 'bg-[#DCEBE3] text-[#1F7A5C] border border-[#BEE0D0] font-medium',
    coral: 'bg-[#FDF1EE] text-[#EE6A4B] border border-[#F8CEC4] font-medium',
    vermillion: 'bg-[#FDF1EE] text-[#EE6A4B] border border-[#F8CEC4] font-medium',
    success: 'bg-[#DCEBE3] text-[#1F7A5C] border border-[#BEE0D0] font-medium',
    warning: 'bg-[#FEF7EE] text-[#D97706] border border-[#F9DBAF] font-medium',
    amber: 'bg-[#FEF7EE] text-[#D97706] border border-[#F9DBAF] font-medium',
    error: 'bg-[#FDF0ED] text-[#D9381E] border border-[#F9CDC9] font-medium',
    ink: 'bg-[#2B2B2B] text-white border border-transparent font-medium',
    muted: 'bg-[#F7F3E8] text-[#7A7468] border border-[#E5DFD3]',

    // Backward compatibility aliases
    violet: 'bg-[#DCEBE3] text-[#1F7A5C] border border-[#BEE0D0] font-medium',
    obsidian: 'bg-[#2B2B2B] text-white border border-transparent font-medium',
    info: 'bg-[#DCEBE3] text-[#1F7A5C] border border-[#BEE0D0] font-medium',
    sapphire: 'bg-[#DCEBE3] text-[#1F7A5C] border border-[#BEE0D0] font-medium',
    teal: 'bg-[#DCEBE3] text-[#1F7A5C] border border-[#BEE0D0] font-medium',
    tangerine: 'bg-[#FEF7EE] text-[#D97706] border border-[#F9DBAF] font-medium',
    copper: 'bg-[#FDF1EE] text-[#EE6A4B] border border-[#F8CEC4] font-medium',
    sage: 'bg-[#DCEBE3] text-[#1F7A5C] border border-[#BEE0D0] font-medium',
  }[variant] || 'bg-white border border-[#E5DFD3] text-[#2B2B2B]';

  return (
    <span className={`inline-flex items-center rounded-full font-sans tracking-wide capitalize ${sizeClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
};
