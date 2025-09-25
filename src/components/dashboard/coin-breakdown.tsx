import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { AggregateMetrics } from "@/types/trade";

interface CoinBreakdownProps {
  metrics: AggregateMetrics;
  currency?: string;
}

export function CoinBreakdown({ metrics, currency = "USD" }: CoinBreakdownProps) {
  if (!metrics.perCoin.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border/30 bg-card/60 shadow-sm overflow-hidden">
      <div className="border-b border-border/20 px-6 py-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Performance by asset
        </h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-border/10">
            <TableHead className="text-muted-foreground">Asset</TableHead>
            <TableHead className="text-muted-foreground">Net PnL</TableHead>
            <TableHead className="text-muted-foreground">Volume (close)</TableHead>
            <TableHead className="text-muted-foreground">Trades</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.perCoin.map((coin) => (
            <TableRow key={coin.coin} className="border-border/10">
              <TableCell className="font-medium text-foreground">{coin.coin}</TableCell>
              <TableCell
                className={coin.netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}
              >
                {formatCurrency(coin.netProfit, currency)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatCurrency(coin.volume, currency)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatNumber(coin.trades, 0)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
