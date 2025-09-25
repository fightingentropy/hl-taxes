"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { AggregateMetrics } from "@/types/trade";

interface ProfitChartProps {
  metrics: AggregateMetrics;
  currency?: string;
}

export function ProfitChart({ metrics, currency = "USD" }: ProfitChartProps) {
  if (!metrics.cumulativePnl.length) {
    return null;
  }

  const chartData = metrics.cumulativePnl.map((point) => ({
    time: point.timestamp,
    label: point.timestamp.toISOString(),
    value: point.value,
  }));

  return (
    <Card className="bg-card/60 border-border/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">
            Cumulative realized PnL
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: 12, right: 12, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(34,197,94)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="rgb(34,197,94)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                new Intl.DateTimeFormat("en", {
                  month: "short",
                  day: "numeric",
                }).format(value as Date)
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => formatCurrency(Number(val), currency)}
              width={90}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              formatter={(val: number) => formatCurrency(val, currency)}
              labelFormatter={(label: string) =>
                new Intl.DateTimeFormat("en", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(label))
              }
              contentStyle={{
                background: "#0f172a",
                borderRadius: 12,
                border: "1px solid rgba(148, 163, 184, 0.2)",
                padding: "12px 16px",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="rgb(74, 222, 128)"
              strokeWidth={2}
              fill="url(#pnlGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
