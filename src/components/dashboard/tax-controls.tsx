"use client";

import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatCurrency, formatPercent } from "@/lib/format";
import { calculateTax, type TaxBreakdown, type TaxSettings } from "@/lib/tax";
import type { PositionResult } from "@/types/trade";

interface TaxControlsProps {
  settings: TaxSettings;
  onChange: (settings: TaxSettings) => void;
  positions: PositionResult[];
  currency?: string;
}

export function TaxControls({
  settings,
  onChange,
  positions,
  currency = "USD",
}: TaxControlsProps) {
  const breakdown: TaxBreakdown = useMemo(
    () => calculateTax(positions, settings),
    [positions, settings],
  );

  const handleRateChange = (key: "shortTermRate" | "longTermRate") =>
    (value: number[]) => {
      onChange({
        ...settings,
        [key]: value[0] / 100,
      });
    };

  return (
    <Card className="bg-card/70 border-border/40">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">
          Tax assumptions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs uppercase text-muted-foreground">
              <span>Short-term gains</span>
              <span>{Math.round(settings.shortTermRate * 100)}%</span>
            </div>
            <Slider
              value={[settings.shortTermRate * 100]}
              min={0}
              max={60}
              step={1}
              onValueChange={handleRateChange("shortTermRate")}
            />
            <p className="text-xs text-muted-foreground">
              Net short-term result {formatCurrency(breakdown.shortTermNet, currency)}
              {" "}
              @ {formatPercent(settings.shortTermRate * 100)} →
              {" "}
              <span className="text-foreground font-medium">
                {formatCurrency(breakdown.shortTermTax, currency)} tax
              </span>
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs uppercase text-muted-foreground">
              <span>Long-term gains</span>
              <span>{Math.round(settings.longTermRate * 100)}%</span>
            </div>
            <Slider
              value={[settings.longTermRate * 100]}
              min={0}
              max={40}
              step={1}
              onValueChange={handleRateChange("longTermRate")}
            />
            <p className="text-xs text-muted-foreground">
              Net long-term result {formatCurrency(breakdown.longTermNet, currency)}
              {" "}
              @ {formatPercent(settings.longTermRate * 100)} →
              {" "}
              <span className="text-foreground font-medium">
                {formatCurrency(breakdown.longTermTax, currency)} tax
              </span>
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="threshold" className="text-xs uppercase text-muted-foreground">
              Long-term threshold (days)
            </Label>
            <Input
              id="threshold"
              type="number"
              min={0}
              value={settings.thresholdDays}
              onChange={(event) =>
                onChange({
                  ...settings,
                  thresholdDays: Math.max(0, Number(event.target.value) || 0),
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Positions held at least this many days use the long-term rate.
            </p>
          </div>
          <div className="rounded-lg border border-border/30 bg-background/20 p-4">
            <p className="text-xs text-muted-foreground uppercase">Estimated tax bill</p>
            <p className="text-2xl font-semibold mt-1">
              {formatCurrency(breakdown.totalTax, currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Effective rate {formatPercent(breakdown.effectiveRate * 100)}
            </p>
          </div>
          <div className="rounded-lg border border-border/30 bg-background/20 p-4">
            <p className="text-xs text-muted-foreground uppercase">After-tax profit</p>
            <p className="text-2xl font-semibold mt-1">
              {formatCurrency(
                breakdown.shortTermNet + breakdown.longTermNet - breakdown.totalTax,
                currency,
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Includes only realized results from uploaded CSV.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
