"use client";

import * as React from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { CryptoDataPoint, Currency } from "@/lib/data";

interface CryptoChartProps {
  data: CryptoDataPoint[];
  currency: Currency;
  cryptoId: string;
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

export function CryptoChart({ data, currency, cryptoId }: CryptoChartProps) {
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const currencySymbol = currency === "BRL" ? "R$" : "$";

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
          tickFormatter={(value) => {
            const date = new Date(value);
            if (data.length > 31) { // 1 year
               return date.toLocaleDateString("default", { month: 'short' });
            }
            if(data.length > 7){ // 30 days
                return date.toLocaleDateString("default", { day: 'numeric' });
            }
            return date.toLocaleDateString("default", { weekday: 'short' }); // 7 days or 24h
          }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `${currencySymbol}${value / 1000}k`}
        />
        <Tooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(label, payload) => {
                 const dataPoint = payload[0]?.payload;
                 if (dataPoint) {
                   return new Date(dataPoint.date).toLocaleDateString("default", {
                     year: 'numeric',
                     month: 'long',
                     day: 'numeric',
                   })
                 }
                 return label;
              }}
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
