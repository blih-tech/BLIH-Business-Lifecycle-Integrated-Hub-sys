'use client';

import * as React from 'react';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';

type SearchInputProps = {
  placeholder?: string;
  icon?: React.ReactNode;
  onChange?: (value: string) => void;
  variant?: 'glass' | 'light';
};

export function SearchInput({
  placeholder = 'Search...',
  icon,
  onChange,
  variant = 'glass',
}: SearchInputProps) {
  const [value, setValue] = React.useState('');

  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-black">
        {icon}
      </div>
      <Input
        type="search"
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          setValue(nextValue);
          onChange?.(nextValue);
        }}
        placeholder={placeholder}
        className={cn(
          'h-[30px] rounded-lg pl-8 text-xs shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none',
          variant === 'glass' &&
            'border border-white/20 bg-white/10 text-white placeholder:text-white/70 focus-visible:border-white/50',
          variant === 'light' &&
            'border border-[#e5e5e5] bg-white text-[#111] placeholder:text-[#666] focus-visible:border-[#d6d6d6]',
        )}
      />
    </div>
  );
}
