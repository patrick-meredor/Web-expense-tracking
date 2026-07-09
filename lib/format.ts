const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date + "T00:00:00"));
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateTime(dateStr: string, createdAtStr: string): string {
  const formattedDate = formatDate(dateStr);
  try {
    const d = new Date(createdAtStr);
    if (!isNaN(d.getTime())) {
      const timeStr = d.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return `${formattedDate} • ${timeStr}`;
    }
  } catch (e) {}
  return formattedDate;
}
