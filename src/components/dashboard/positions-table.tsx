import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/dates";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { PositionResult } from "@/types/trade";

interface PositionsTableProps {
  positions: PositionResult[];
  currency?: string;
}

export function PositionsTable({ positions, currency = "USD" }: PositionsTableProps) {
  if (!positions.length) {
    return null;
  }

  const latestPositions = [...positions]
    .sort((a, b) => b.closedAt.getTime() - a.closedAt.getTime())
    .slice(0, 12);

  return (
    <div className="rounded-xl border border-border/30 bg-card/60 shadow-sm overflow-hidden">
      <div className="border-b border-border/20 px-6 py-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Recent realized trades
        </h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-border/10">
            <TableHead>Closed</TableHead>
            <TableHead>Opened</TableHead>
            <TableHead>Asset</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Net PnL</TableHead>
            <TableHead>Fees</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {latestPositions.map((position, index) => (
            <TableRow key={`${position.coin}-${index}`} className="border-border/10">
              <TableCell className="text-muted-foreground">
                {formatDateTime(position.closedAt)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(position.openedAt)}
              </TableCell>
              <TableCell className="text-foreground font-medium uppercase">
                {position.coin}
              </TableCell>
              <TableCell className="text-muted-foreground capitalize">
                {position.side}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatNumber(position.size)}
              </TableCell>
              <TableCell
                className={position.netPnl >= 0 ? "text-emerald-400" : "text-rose-400"}
              >
                {formatCurrency(position.netPnl, currency)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatCurrency(position.totalFees, currency)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
