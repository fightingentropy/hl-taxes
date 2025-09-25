"use client";

import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseTradeCsv, parseTradeFile } from "@/lib/csv";
import type { TradeRecord } from "@/types/trade";

interface CsvUploaderProps {
  onParsed: (trades: TradeRecord[]) => void;
  onError?: (message: string) => void;
}

export function CsvUploader({ onParsed, onError }: CsvUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) {
        return;
      }
      const file = files[0];
      setIsParsing(true);
      setError(null);
      setFileName(file.name);
      try {
        const trades = await parseTradeFile(file);
        onParsed(trades);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to parse file";
        setError(message);
        onError?.(message);
      } finally {
        setIsParsing(false);
      }
    },
    [onParsed, onError],
  );

  const loadSample = useCallback(async () => {
    setIsParsing(true);
    setError(null);
    try {
      const response = await fetch("/sample-trade-history.csv");
      if (!response.ok) {
        throw new Error("Unable to load sample data");
      }
      const text = await response.text();
      const trades = parseTradeCsv(text);
      setFileName("sample-trade-history.csv");
      onParsed(trades);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load sample";
      setError(message);
      onError?.(message);
    } finally {
      setIsParsing(false);
    }
  }, [onParsed, onError]);

  return (
    <Card className="bg-card/70 border-border/40">
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
          Upload trade history
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`relative flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-8 transition-colors ${
            isDragging
              ? "border-emerald-400/60 bg-emerald-400/5"
              : "border-border/40 bg-background/20"
          }`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            handleFiles(event.dataTransfer?.files ?? null);
          }}
        >
          <p className="text-sm text-muted-foreground text-center">
            Drop your exchange export CSV here or click to choose a file.
          </p>
          <Button
            type="button"
            variant="outline"
            className="border-border/50"
            onClick={() => inputRef.current?.click()}
            disabled={isParsing}
          >
            {isParsing ? "Parsing..." : "Select file"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />
          {fileName && (
            <p className="text-xs text-muted-foreground">Loaded: {fileName}</p>
          )}
          {error && <p className="text-xs text-rose-400">{error}</p>}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>We parse the file directly in your browser—no data ever leaves this page.</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-emerald-300 hover:text-emerald-200"
            onClick={loadSample}
            disabled={isParsing}
          >
            Try sample data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
