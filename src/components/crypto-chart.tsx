"use client";

import * as React from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { CryptoDataPoint, Currency, TimeRange } from "@/lib/data";

interface CryptoChartProps {
  data: CryptoDataPoint[];
  currency: Currency;
  cryptoId: string;
  timeRange: TimeRange;
}

const chartConfig = {
  price: {
    label: "Price",
  },
  BTC: {
    label: "BTC",
    color: "hsl(var(--primary))",
  },
  ETH: {
    label: "ETH",
    color: "hsl(var(--primary))",
  },
  SOL: {
    label: "SOL",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function CryptoChart({ data, currency, cryptoId, timeRange }: CryptoChartProps) {
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const currencySymbol = currency === "BRL" ? "R$" : "$";

  const formatTick = (value: string) => {
    const date = new Date(value);
    switch (timeRange) {
      case '30m':
      case '1h':
        return date.toLocaleTimeString("default", { hour: '2-digit', minute:'2-digit' });
      case '24h':
      case '7d':
        return date.toLocaleDateString("default", { weekday: 'short' });
      case '30d':
        return date.toLocaleDateString("default", { day: 'numeric' });
      case '1y':
        return date.toLocaleDateString("default", { month: 'short' });
      default:
        return date.toLocaleDateString("default");
    }
  }

  const formatTooltipLabel = (label: string, payload: any) => {
    const dataPoint = payload[0]?.payload;
    if (dataPoint) {
      const date = new Date(dataPoint.date);
      switch (timeRange) {
        case '30m':
        case '1h':
        case '24h':
          return date.toLocaleTimeString("default", {
            hour: '2-digit',
            minute: '2-digit',
          });
        case '7d':
        case '30d':
        case '1y':
          return date.toLocaleDateString("default", {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        default:
          return label;
      }
    }
    return label;
  }

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full sm:h-[400px]">
      <LineChart
        accessibilityLayer
        data={data}
        margin={{
          top: 20,
          right: 20,
          left: 20,
          bottom: 10,
        }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={formatTick}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => {
            if (value >= 1000000) {
              return `${currencySymbol}${(value / 1000000).toFixed(1)}M`;
            }
            if (value >= 1000) {
              return `${currencySymbol}${(value / 1000).toFixed(0)}k`;
            }
            return `${currencySymbol}${value.toFixed(0)}`;
          }}
        />
        <Tooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={formatTooltipLabel}
              formatter={(value) => currencyFormatter.format(value as number)}
            />
          }
        />
        <Line
          dataKey="price"
          type="monotone"
          stroke={`var(--color-${cryptoId})`}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
