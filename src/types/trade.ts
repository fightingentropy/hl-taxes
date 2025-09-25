export type TradeSide = "long" | "short";

export interface TradeRecord {
  /** original timestamp string as provided in CSV */
  timeRaw: string;
  /** parsed JavaScript date (in UTC) */
  timestamp: Date;
  coin: string;
  direction: string;
  side: TradeSide;
  action: "open" | "close";
  price: number;
  size: number;
  notional: number;
  fee: number;
  closedPnl: number;
}

export interface PositionResult {
  coin: string;
  side: TradeSide;
  openedAt: Date;
  closedAt: Date;
  size: number;
  entryNotional: number;
  exitNotional: number;
  netPnl: number;
  totalFees: number;
}

export interface AggregateMetrics {
  trades: TradeRecord[];
  positions: PositionResult[];
  totals: {
    netProfit: number;
    totalClosedPnl: number;
    totalFees: number;
    totalVolume: number;
  };
  timeframe: {
    start: Date;
    end: Date;
    tradeCount: number;
  };
  winLoss: {
    winning: number;
    losing: number;
    breakeven: number;
    winRate: number;
  };
  perCoin: Array<{
    coin: string;
    netProfit: number;
    volume: number;
    trades: number;
  }>;
  cumulativePnl: Array<{
    timestamp: Date;
    value: number;
  }>;
  extremes: {
    best?: PositionResult;
    worst?: PositionResult;
  };
  openPositionsRemaining: number;
}
