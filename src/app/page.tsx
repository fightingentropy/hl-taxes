"use client";

import { useMemo, useState } from "react";

import { CsvUploader } from "@/components/dashboard/csv-uploader";
import { Highlights } from "@/components/dashboard/highlights";
import { CoinBreakdown } from "@/components/dashboard/coin-breakdown";
import { PositionsTable } from "@/components/dashboard/positions-table";
import { ProfitChart } from "@/components/dashboard/profit-chart";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TaxControls } from "@/components/dashboard/tax-controls";
import { aggregateTrades } from "@/lib/analytics";
import { formatDateRange } from "@/lib/dates";
import { formatCurrency } from "@/lib/format";
import { calculateTax, type TaxSettings } from "@/lib/tax";
import type { TradeRecord } from "@/types/trade";

const defaultTaxSettings: TaxSettings = {
  shortTermRate: 0.37,
  longTermRate: 0.2,
  thresholdDays: 365,
};

export default function Home() {
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [taxSettings, setTaxSettings] = useState<TaxSettings>(defaultTaxSettings);

  const metrics = useMemo(() => {
    if (trades.length === 0) {
      return null;
    }
    return aggregateTrades(trades);
  }, [trades]);

  const taxBreakdown = useMemo(() => {
    if (!metrics) {
      return null;
    }
    return calculateTax(metrics.positions, taxSettings);
  }, [metrics, taxSettings]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-12">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-400">
            HL Taxes
          </p>
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Your crypto trading tax cockpit.
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Upload a CSV export of your trades to instantly see realized profit, fees paid, and
            estimated short vs. long-term taxes—all calculated locally in your browser.
          </p>
          {metrics && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>
                Period: {formatDateRange(metrics.timeframe.start, metrics.timeframe.end)}
              </span>
              <span>Trades parsed: {metrics.timeframe.tradeCount}</span>
              <span>
                Net profit: {formatCurrency(metrics.totals.netProfit)}
              </span>
            </div>
          )}
        </header>

        <CsvUploader onParsed={setTrades} />

        {metrics && taxBreakdown ? (
          <div className="space-y-10">
            <SummaryCards metrics={metrics} tax={taxBreakdown} />
            {metrics.openPositionsRemaining > 0 && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 px-6 py-4 text-sm text-amber-300">
                {metrics.openPositionsRemaining} open position
                {metrics.openPositionsRemaining > 1 ? "s remain" : " remains"} in this CSV.
                These are excluded from the tax estimate until you add the matching closes.
              </div>
            )}
            <TaxControls
              settings={taxSettings}
              onChange={setTaxSettings}
              positions={metrics.positions}
            />
            <Highlights metrics={metrics} />
            <ProfitChart metrics={metrics} />
            <CoinBreakdown metrics={metrics} />
            <PositionsTable positions={metrics.positions} />
          </div>
        ) : (
          <div className="rounded-xl border border-border/20 bg-card/50 p-10 text-center text-sm text-muted-foreground">
            <p>Select a CSV to get started. We never upload your data—everything stays on this page.</p>
          </div>
        )}
      </div>
    </main>
  );
}
