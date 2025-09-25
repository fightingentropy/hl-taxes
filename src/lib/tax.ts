import type { PositionResult } from "@/types/trade";

export interface TaxSettings {
  shortTermRate: number; // expressed as decimal (e.g. 0.37)
  longTermRate: number; // decimal (e.g. 0.2)
  thresholdDays: number; // number of days before gains qualify as long-term
}

export interface TaxBreakdown {
  shortTermNet: number;
  longTermNet: number;
  shortTermTax: number;
  longTermTax: number;
  totalTax: number;
  effectiveRate: number;
}

function holdingPeriodDays(position: PositionResult): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return (position.closedAt.getTime() - position.openedAt.getTime()) / msPerDay;
}

export function calculateTax(
  positions: PositionResult[],
  settings: TaxSettings,
): TaxBreakdown {
  let shortTermNet = 0;
  let longTermNet = 0;

  positions.forEach((position) => {
    const days = holdingPeriodDays(position);
    if (Number.isNaN(days)) {
      return;
    }
    if (days >= settings.thresholdDays) {
      longTermNet += position.netPnl;
    } else {
      shortTermNet += position.netPnl;
    }
  });

  const shortTermTax = Math.max(shortTermNet, 0) * settings.shortTermRate;
  const longTermTax = Math.max(longTermNet, 0) * settings.longTermRate;
  const totalTax = shortTermTax + longTermTax;
  const totalNet = shortTermNet + longTermNet;

  return {
    shortTermNet,
    longTermNet,
    shortTermTax,
    longTermTax,
    totalTax,
    effectiveRate: totalNet > 0 ? totalTax / totalNet : 0,
  };
}
