import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { TaxBreakdown } from "@/lib/tax";
import type { AggregateMetrics } from "@/types/trade";

interface SummaryCardsProps {
  metrics: AggregateMetrics;
  tax: TaxBreakdown;
  currency?: string;
}

export function SummaryCards({ metrics, tax, currency = "USD" }: SummaryCardsProps) {
  const afterTax = metrics.totals.netProfit - tax.totalTax;
  const feeRatio = metrics.totals.totalVolume
    ? (metrics.totals.totalFees / metrics.totals.totalVolume) * 100
    : 0;
  const avgTradeSize = metrics.positions.length
    ? metrics.totals.totalVolume / metrics.positions.length
    : 0;

  const items = [
    {
      title: "Net Profit",
      value: formatCurrency(metrics.totals.netProfit, currency),
      helper: `${metrics.positions.length} closed positions`,
    },
    {
      title: "Estimated Taxes",
      value: formatCurrency(tax.totalTax, currency),
      helper: `${formatPercent(tax.effectiveRate * 100)} effective rate`,
    },
    {
      title: "After Tax",
      value: formatCurrency(afterTax, currency),
      helper: tax.totalTax > 0 ? "Assuming no carryover losses" : "No tax owed",
    },
    {
      title: "Fees Paid",
      value: formatCurrency(metrics.totals.totalFees, currency),
      helper: `${formatPercent(feeRatio)} of closing volume`,
    },
    {
      title: "Win Rate",
      value: formatPercent(metrics.winLoss.winRate),
      helper: `${metrics.winLoss.winning} winners / ${metrics.positions.length} trades`,
    },
    {
      title: "Total Volume",
      value: formatCurrency(metrics.totals.totalVolume, currency),
      helper: `${formatNumber(avgTradeSize)} avg per position`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Card key={item.title} className="bg-card/80 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {item.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-foreground">{item.value}</div>
            <p className="text-xs text-muted-foreground mt-2">{item.helper}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
