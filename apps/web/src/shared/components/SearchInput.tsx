'use client';

import * as React from 'react';
import { Input } from '@/shared/components/ui/input';

type SearchInputProps = {
  placeholder?: string;
  icon?: React.ReactNode;
  onChange?: (value: string) => void;
};

export function SearchInput({
  placeholder = 'Search...',
  icon,
  onChange,
}: SearchInputProps) {
  const [value, setValue] = React.useState('');

  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-white">
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
        className="h-[30px] rounded-full border border-white/20 bg-white/10 pl-8 text-xs text-white placeholder:text-white/70 shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus-visible:border-white/50"
      />
    </div>
  );
}
