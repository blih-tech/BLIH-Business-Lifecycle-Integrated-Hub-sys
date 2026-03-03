"use client";

import { useRef, useState } from "react";

import { organogramMeta } from "@/features/hr/people/organogram/mock-data";
import { OrganogramCanvas, OrganogramHeader } from "@/features/hr/people/organogram/components";

export function PeopleOrganogramContent() {
  const [zoomPercent, setZoomPercent] = useState(organogramMeta.initialZoomPercent);
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);

  function clampZoom(value: number) {
    return Math.max(organogramMeta.minZoomPercent, Math.min(organogramMeta.maxZoomPercent, value));
  }

  function handleZoomIn() {
    setZoomPercent((prev) => clampZoom(prev + organogramMeta.zoomStep));
  }

  function handleZoomOut() {
    setZoomPercent((prev) => clampZoom(prev - organogramMeta.zoomStep));
  }

  function handleResetZoom() {
    setZoomPercent(organogramMeta.initialZoomPercent);
  }

  async function handleToggleFullscreen() {
    const container = canvasWrapperRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await container.requestFullscreen();
  }

  return (
    <main className="mx-auto w-full max-w-[1024px] space-y-6 px-4 py-4 md:px-5 md:py-5">
      <OrganogramHeader />

      <section ref={canvasWrapperRef}>
        <OrganogramCanvas
          zoomPercent={zoomPercent}
          onZoomOut={handleZoomOut}
          onZoomIn={handleZoomIn}
          onResetZoom={handleResetZoom}
          onToggleFullscreen={handleToggleFullscreen}
        />
      </section>
    </main>
  );
}
