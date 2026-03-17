"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/shared/lib/utils";

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    color?: string;
  };
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn("flex aspect-video justify-center text-xs", className)}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(([, configItem]) => configItem.color);
  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
[data-chart=${id}] {
${colorConfig.map(([key, item]) => `  --color-${key}: ${item.color};`).join("\n")}
}
`,
      }}
    />
  );
}

const ChartTooltip = RechartsPrimitive.Tooltip;

type ChartTooltipItem = {
  color?: string;
  dataKey?: string | number;
  name?: React.ReactNode;
  payload?: { month?: string } & Record<string, unknown>;
  value?: React.ReactNode;
};

type ChartTooltipContentProps = React.ComponentProps<"div"> & {
  active?: boolean;
  formatter?: (
    value: ChartTooltipItem["value"],
    name: ChartTooltipItem["name"],
    item: ChartTooltipItem,
    index: number,
    payload: ChartTooltipItem[],
  ) => React.ReactNode;
  hideLabel?: boolean;
  payload?: ChartTooltipItem[];
};

function ChartTooltipContent({
  active,
  payload,
  className,
  formatter,
  hideLabel = false,
}: ChartTooltipContentProps) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  return (
    <div className={cn("rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs shadow-sm", className)}>
      {!hideLabel ? <p className="mb-1 text-muted-foreground">{payload[0]?.payload?.month ?? payload[0]?.name}</p> : null}
      <div className="space-y-1">
        {payload.map((item, index) => {
          const key = String(item.dataKey ?? index);
          const configItem = config[key];
          const label = configItem?.label ?? item.name;
          const value = formatter ? formatter(item.value, item.name, item, index, payload) : item.value;

          return (
            <div key={key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color || `var(--color-${key})` }} />
                <span className="text-muted-foreground">{label}</span>
              </div>
              <span className="font-medium text-foreground">{value as React.ReactNode}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { ChartContainer, ChartTooltip, ChartTooltipContent };
