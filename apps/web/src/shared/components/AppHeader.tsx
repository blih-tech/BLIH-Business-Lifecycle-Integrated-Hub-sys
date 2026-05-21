'use client';

import { Button } from '@/shared/components/ui/button';
import { Grip, Loader2, PanelLeftIcon, Plus, Sparkles } from 'lucide-react';

type AppHeaderProps = {
  onToggleSubnav?: () => void;
  onCreate?: () => void;
  createLabel?: string;
  showCreate?: boolean;
  onAppsClick?: () => void;
  isLoading?: boolean;
};

export function AppHeader({
  onToggleSubnav,
  onCreate,
  createLabel = 'Create',
  showCreate = true,
  onAppsClick,
  isLoading,
}: AppHeaderProps) {
  return (
    <header className="flex h-[56px] w-full items-center justify-between border-b border-border bg-background pl-8 pr-5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onToggleSubnav}
        className="h-8 w-8 p-0 rounded-[8px] text-muted-foreground hover:bg-muted"
        aria-label="Toggle section navigation"
      >
        <PanelLeftIcon className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-3">
        <div className="group flex items-center gap-2 rounded-full border border-[#ffe345] bg-white/95 px-4 py-1.5 text-[11px] text-muted-foreground shadow-[0px_4px_5.2px_rgba(0,0,0,0.05)] cursor-pointer transition-all duration-200 ease-out hover:-translate-y-[1px] hover:border-[#ffd633] hover:bg-white hover:shadow-[0_8px_16px_rgba(255,227,69,0.35)]">
          <Sparkles className="h-3.5 w-3.5 text-[#ffe345] transition-transform duration-200 group-hover:rotate-12 group-hover:scale-105" />
          <span>Snap AI</span>
        </div>

        {showCreate ? (
          <Button
            type="button"
            className="h-7 gap-2 rounded-[6px] bg-primary px-3 text-[12px] font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer disabled:opacity-70"
            onClick={onCreate}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            {createLabel}
          </Button>
        ) : null}

        <div aria-hidden className="h-6 w-px bg-[#cfcfd6]" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 rounded-[8px] text-muted-foreground hover:bg-muted cursor-pointer group"
          onClick={onAppsClick}
          aria-label="Apps"
        >
          <Grip className="size-6 group-hover:text-primary" />
        </Button>
      </div>
    </header>
  );
}
