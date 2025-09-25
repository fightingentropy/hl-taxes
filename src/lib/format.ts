export function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, maximumFractionDigits = 1): string {
  return `${value.toFixed(maximumFractionDigits)}%`;
}

export function formatNumber(value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits,
  }).format(value);
}
