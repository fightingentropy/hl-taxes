import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/dates";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { AggregateMetrics } from "@/types/trade";

interface HighlightsProps {
  metrics: AggregateMetrics;
  currency?: string;
}

export function Highlights({ metrics, currency = "USD" }: HighlightsProps) {
  const { best, worst } = metrics.extremes;

  if (!best && !worst) {
    return null;
  }

  const cards = [
    best
      ? {
          title: "Best trade",
          subtitle: `${best.coin} · ${formatDateTime(best.closedAt)}`,
          value: formatCurrency(best.netPnl, currency),
          footer: `${best.side.toUpperCase()} · size ${formatNumber(best.size)} · fees ${formatCurrency(best.totalFees, currency)}`,
          positive: true,
        }
      : null,
    worst
      ? {
          title: "Toughest trade",
          subtitle: `${worst.coin} · ${formatDateTime(worst.closedAt)}`,
          value: formatCurrency(worst.netPnl, currency),
          footer: `${worst.side.toUpperCase()} · size ${formatNumber(worst.size)} · fees ${formatCurrency(worst.totalFees, currency)}`,
          positive: false,
        }
      : null,
  ].filter(Boolean) as Array<{
    title: string;
    subtitle: string;
    value: string;
    footer: string;
    positive: boolean;
  }>;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cards.map((card) => (
        <Card key={card.title} className="bg-card/70 border-border/40">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">
              {card.title}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{card.subtitle}</p>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-semibold ${card.positive ? "text-emerald-400" : "text-rose-400"}`}
            >
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{card.footer}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
