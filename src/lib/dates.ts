/** Parse dates coming from the CSV (`DD/MM/YYYY - HH:mm:ss`). */
export function parseTradeTimestamp(raw: string): Date {
  const [datePart, timePart] = raw.split(" - ");
  if (!datePart || !timePart) {
    throw new Error(`Invalid timestamp format: ${raw}`);
  }

  const [day, month, year] = datePart.split("/").map(Number);
  const [hours, minutes, seconds] = timePart.split(":").map(Number);

  if (
    [day, month, year, hours, minutes, seconds].some(
      (value) => Number.isNaN(value) || value === undefined,
    )
  ) {
    throw new Error(`Invalid timestamp format: ${raw}`);
  }

  return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
}

export function formatDateRange(start: Date, end: Date): string {
  const formatter = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  return `${formatter.format(start)} → ${formatter.format(end)}`;
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
