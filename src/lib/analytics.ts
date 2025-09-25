import type { AggregateMetrics, PositionResult, TradeRecord } from "@/types/trade";

interface OpenLot {
  trade: TradeRecord;
  remaining: number;
}

export function aggregateTrades(trades: TradeRecord[]): AggregateMetrics {
  if (trades.length === 0) {
    const now = new Date();
    return {
      trades,
      positions: [],
      totals: {
        netProfit: 0,
        totalClosedPnl: 0,
        totalFees: 0,
        totalVolume: 0,
      },
      timeframe: {
        start: now,
        end: now,
        tradeCount: 0,
      },
      winLoss: {
        winning: 0,
        losing: 0,
        breakeven: 0,
        winRate: 0,
      },
      perCoin: [],
      cumulativePnl: [],
      extremes: {},
      openPositionsRemaining: 0,
    };
  }

  const sorted = [...trades].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  );

  let totalClosedPnl = 0;
  let totalFees = 0;
  let totalVolume = 0;
  const cumulativePnl: Array<{ timestamp: Date; value: number }> = [];
  const perCoinMap = new Map<string, { netProfit: number; volume: number; trades: number }>();

  let runningPnl = 0;
  for (const trade of sorted) {
    totalClosedPnl += trade.closedPnl;
    totalFees += trade.fee;
    if (trade.action === "close") {
      totalVolume += trade.notional;
    }

    runningPnl += trade.closedPnl;
    cumulativePnl.push({ timestamp: trade.timestamp, value: runningPnl });

    const entry = perCoinMap.get(trade.coin) ?? {
      netProfit: 0,
      volume: 0,
      trades: 0,
    };
    entry.netProfit += trade.closedPnl;
    if (trade.action === "close") {
      entry.volume += trade.notional;
    }
    entry.trades += 1;
    perCoinMap.set(trade.coin, entry);
  }

  const openLots = new Map<string, OpenLot[]>();
  const positions: PositionResult[] = [];

  const getQueue = (key: string) => {
    if (!openLots.has(key)) {
      openLots.set(key, []);
    }
    return openLots.get(key)!;
  };

  sorted.forEach((trade) => {
    const key = `${trade.coin}-${trade.side}`;
    if (trade.action === "open") {
      const queue = getQueue(key);
      queue.push({ trade, remaining: trade.size });
      return;
    }

    let remaining = trade.size;
    const queue = getQueue(key);

    while (remaining > 0) {
      const lot = queue[0];
      if (!lot) {
        positions.push({
          coin: trade.coin,
          side: trade.side,
          openedAt: trade.timestamp,
          closedAt: trade.timestamp,
          size: remaining,
          entryNotional: 0,
          exitNotional: (trade.notional * remaining) / trade.size,
          netPnl: (trade.closedPnl * remaining) / trade.size,
          totalFees: (trade.fee * remaining) / trade.size,
        });
        remaining = 0;
        break;
      }

      const matchedSize = Math.min(lot.remaining, remaining);
      const fractionOpen = matchedSize / lot.trade.size;
      const fractionClose = matchedSize / trade.size;

      positions.push({
        coin: trade.coin,
        side: trade.side,
        openedAt: lot.trade.timestamp,
        closedAt: trade.timestamp,
        size: matchedSize,
        entryNotional: lot.trade.notional * fractionOpen,
        exitNotional: trade.notional * fractionClose,
        netPnl:
          lot.trade.closedPnl * fractionOpen + trade.closedPnl * fractionClose,
        totalFees: lot.trade.fee * fractionOpen + trade.fee * fractionClose,
      });

      lot.remaining -= matchedSize;
      remaining -= matchedSize;
      if (lot.remaining <= 1e-9) {
        queue.shift();
      }
    }
  });

  let openPositionsRemaining = 0;
  for (const queue of openLots.values()) {
    for (const lot of queue) {
      if (lot.remaining > 1e-9) {
        openPositionsRemaining += 1;
      }
    }
  }

  let winning = 0;
  let losing = 0;
  let best: PositionResult | undefined;
  let worst: PositionResult | undefined;

  for (const position of positions) {
    if (position.netPnl > 0) {
      winning += 1;
    } else if (position.netPnl < 0) {
      losing += 1;
    }

    if (!best || position.netPnl > best.netPnl) {
      best = position;
    }
    if (!worst || position.netPnl < worst.netPnl) {
      worst = position;
    }
  }

  const breakeven = positions.length - winning - losing;
  const winRate = positions.length ? (winning / positions.length) * 100 : 0;

  return {
    trades: sorted,
    positions,
    totals: {
      netProfit: totalClosedPnl,
      totalClosedPnl,
      totalFees,
      totalVolume,
    },
    timeframe: {
      start: sorted[0].timestamp,
      end: sorted[sorted.length - 1].timestamp,
      tradeCount: sorted.length,
    },
    winLoss: {
      winning,
      losing,
      breakeven,
      winRate,
    },
    perCoin: Array.from(perCoinMap.entries())
      .map(([coin, value]) => ({ coin, ...value }))
      .sort((a, b) => b.netProfit - a.netProfit),
    cumulativePnl,
    extremes: {
      best,
      worst,
    },
    openPositionsRemaining,
  };
}
