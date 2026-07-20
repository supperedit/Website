export function scaleAmount(amount: string, factor: number): string {
  if (!amount || factor === 1) return amount;

  const match = amount.match(/^(\d+(?:[.,]\d+)?)(.*)$/);
  if (!match) return amount;

  const [, numberPart, rest] = match;
  const value = parseFloat(numberPart.replace(",", "."));
  if (!Number.isFinite(value)) return amount;

  const scaled = value * factor;
  const rounded = scaled < 10 ? Math.round(scaled * 2) / 2 : Math.round(scaled);
  const formatted = Number.isInteger(rounded) ? String(rounded) : String(rounded).replace(".", ",");

  return `${formatted}${rest}`;
}

export function scaleServingsText(text: string, factor: number): string {
  if (!text || factor === 1) return text;

  return text.replace(/\d+(?:[.,]\d+)?/, (match) => {
    const value = parseFloat(match.replace(",", "."));
    if (!Number.isFinite(value)) return match;
    const scaled = value * factor;
    const rounded = scaled < 10 ? Math.round(scaled * 2) / 2 : Math.round(scaled);
    return Number.isInteger(rounded) ? String(rounded) : String(rounded).replace(".", ",");
  });
}