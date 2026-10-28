const fractions: Record<string, number> = { '¼': 1/4, '½': 1/2, '¾': 3/4, '⅐': 1/7, '⅑': 1/9, '⅒': 1/10, '⅓': 1/3, '⅔': 2/3, '⅕': 1/5, '⅖': 2/5, '⅗': 3/5, '⅘': 4/5, '⅙': 1/6, '⅚': 5/6, '⅛': 1/8, '⅜': 3/8, '⅝': 5/8, '⅞': 7/8 };
const fractionChars = Object.keys(fractions).join('');
const number = `(?:\\d+\\s+\\d+[/⁄]\\d+|\\d+[/⁄]\\d+|\\d*\\s*[${fractionChars}]|\\d+(?:[.,]\\d+)?)`;
const quantity = new RegExp(`^(\\s*(?:(?:ca\\.?|etwa|circa)\\s+)?)(${number})(?:([ \\t]*(?:–|—|-|bis)[ \\t]*)(${number}))?(.*)$`, 'i');
function parse(value: string): number {
  const last = value.slice(-1);
  if (fractions[last]) return Number(value.slice(0, -1).trim() || 0) + fractions[last];
  if (/[/⁄]/.test(value)) {
    const parts = value.trim().split(/\s+/);
    const [a, b] = parts.pop()!.split(/[/⁄]/).map(Number);
    return b ? Number(parts[0] || 0) + a / b : NaN;
  }
  return Number(value.replace(',', '.'));
}
function round(value: number): string {
  const rounded = value >= 50 ? Math.round(value) : value >= 10 ? Math.round(value * 10) / 10 : Math.round(value * 100) / 100;
  return String(rounded).replace('.', ',');
}
function format(value: number): string {
  if (value >= 10) return round(value);
  const whole = Math.floor(value + 1e-10);
  const part = value - whole;
  if (Math.abs(part * 100 - Math.round(part * 100)) < 1e-8) return round(value);
  for (const denominator of [3, 6, 7, 9]) {
    const numerator = Math.round(part * denominator);
    if (numerator > 0 && numerator < denominator && Math.abs(part - numerator / denominator) < 1e-9) {
      return `${whole ? `${whole} ` : ''}${numerator}/${denominator}`;
    }
  }
  return round(value);
}
export function scaleAmount(amount: string, factor: number): string {
  if (!amount || factor === 1 || !Number.isFinite(factor) || factor <= 0) return amount;
  const match = amount.match(quantity);
  if (!match) return amount;
  const [, prefix, first, separator, second, rest] = match;
  if (/^\s*[/⁄]/.test(rest) || /^\s*[x×]\s*\d/.test(rest)) return amount;
  const a = parse(first), b = second ? parse(second) : null;
  if (!Number.isFinite(a) || (b !== null && !Number.isFinite(b))) return amount;
  return `${prefix}${format(a * factor)}${b === null ? '' : separator + format(b * factor)}${rest}`;
}
export function scaleServingsText(text: string, factor: number): string {
  if (/\b(?:form|blech|springform)\b/i.test(text)) return text;
  return scaleAmount(text, factor);
}
