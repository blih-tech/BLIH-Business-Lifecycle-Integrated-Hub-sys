import { Expand, Search, ZoomIn, ZoomOut } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

type OrganogramToolbarProps = {
  zoomPercent: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onToggleFullscreen: () => void;
};

export function OrganogramToolbar({
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleFullscreen,
}: OrganogramToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 items-center rounded-[6px] border border-[#e5e5e5] bg-white px-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-[#666]"
          onClick={onZoomOut}
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs font-normal text-[#666] hover:bg-transparent"
          onClick={onResetZoom}
        >
          <Search className="mr-1 h-3.5 w-3.5" />
          {zoomPercent}%
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-[#666]"
          onClick={onZoomIn}
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="h-8 w-8 rounded-[6px] border-[#e5e5e5] text-[#666]"
        onClick={onToggleFullscreen}
      >
        <Expand className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
