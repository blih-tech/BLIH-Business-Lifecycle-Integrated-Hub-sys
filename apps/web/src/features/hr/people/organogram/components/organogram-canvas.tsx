import Image from 'next/image';

import { OrganogramTip } from '@/features/hr/people/organogram/components/organogram-tip';
import { OrganogramToolbar } from '@/features/hr/people/organogram/components/organogram-toolbar';

const chartCanvasImage =
  'https://www.figma.com/api/mcp/asset/910589c4-8517-446a-8c4e-0dff613e9b29';

type OrganogramCanvasProps = {
  zoomPercent: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onToggleFullscreen: () => void;
};

export function OrganogramCanvas({
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleFullscreen,
}: OrganogramCanvasProps) {
  return (
    <div className="relative h-[628px] w-full overflow-hidden rounded-[12px] border border-[#e5e5e5] bg-white">
      <div className="absolute left-4 top-4 z-10">
        <OrganogramToolbar
          zoomPercent={zoomPercent}
          onZoomOut={onZoomOut}
          onZoomIn={onZoomIn}
          onResetZoom={onResetZoom}
          onToggleFullscreen={onToggleFullscreen}
        />
      </div>

      <div
        className="absolute left-[8.5px] top-[10px] h-[604px] w-[1005px] origin-top-left overflow-hidden rounded-[12px]"
        style={{ transform: `scale(${zoomPercent / 100})` }}
      >
        <Image
          src={chartCanvasImage}
          alt="Organogram chart"
          fill
          className="pointer-events-none object-contain"
        />
      </div>

      <div className="absolute left-[17px] top-[551px]">
        <OrganogramTip />
      </div>
    </div>
  );
}
