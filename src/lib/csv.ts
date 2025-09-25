import Papa from "papaparse";
import { z } from "zod";

import { parseTradeTimestamp } from "@/lib/dates";
import type { TradeRecord, TradeSide } from "@/types/trade";

const rowSchema = z.object({
  time: z.string(),
  coin: z.string(),
  dir: z.string(),
  px: z.string(),
  sz: z.string(),
  ntl: z.string(),
  fee: z.string(),
  closedPnl: z.string(),
});

function parseNumber(raw: string): number {
  const normalized = raw.replace(/,/g, "").trim();
  if (normalized.length === 0) {
    return 0;
  }
  const value = Number(normalized);
  if (Number.isNaN(value)) {
    throw new Error(`Unable to parse numeric value: ${raw}`);
  }
  return value;
}

function deriveSide(dir: string): TradeSide {
  if (dir.toLowerCase().includes("long")) {
    return "long";
  }
  if (dir.toLowerCase().includes("short")) {
    return "short";
  }
  throw new Error(`Unknown side: ${dir}`);
}

function deriveAction(dir: string): "open" | "close" {
  if (dir.toLowerCase().startsWith("open")) {
    return "open";
  }
  if (dir.toLowerCase().startsWith("close")) {
    return "close";
  }
  throw new Error(`Unknown trade action: ${dir}`);
}

export function parseTradeCsv(content: string): TradeRecord[] {
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    throw new Error(
      `Unable to parse CSV: ${result.errors.map((err) => err.message).join(", ")}`,
    );
  }

  return result.data.map((row) => {
    const parsed = rowSchema.parse(row);
    const action = deriveAction(parsed.dir);
    const side = deriveSide(parsed.dir);

    return {
      timeRaw: parsed.time,
      timestamp: parseTradeTimestamp(parsed.time),
      coin: parsed.coin,
      direction: parsed.dir,
      action,
      side,
      price: parseNumber(parsed.px),
      size: parseNumber(parsed.sz),
      notional: parseNumber(parsed.ntl),
      fee: parseNumber(parsed.fee),
      closedPnl: parseNumber(parsed.closedPnl),
    } satisfies TradeRecord;
  });
}

export async function parseTradeFile(file: File): Promise<TradeRecord[]> {
  const text = await file.text();
  return parseTradeCsv(text);
}
