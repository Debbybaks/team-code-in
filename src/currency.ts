import type { CurrencyCode } from "./types";
import { CURRENCY_MAP } from "./types";

let _currency: CurrencyCode = "NGN";

export function getCurrency(): CurrencyCode {
  return _currency;
}

export function setCurrency(code: CurrencyCode): void {
  _currency = code;
}

export function getSymbol(): string {
  return CURRENCY_MAP[_currency]?.symbol ?? "₦";
}

export function fmt(n: number): string {
  const sym = getSymbol();
  const prefix = _currency === "KES" || _currency === "UGX" || _currency === "TZS" || _currency === "RWF"
    ? sym + " "
    : sym;
  return prefix + Number(n).toLocaleString("en", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function fmtCompact(n: number): string {
  const sym = getSymbol();
  const prefix = _currency === "KES" || _currency === "UGX" || _currency === "TZS" || _currency === "RWF"
    ? sym + " "
    : sym;
  if (n >= 1_000_000) return prefix + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return prefix + (n / 1_000).toFixed(1) + "K";
  return prefix + Number(n).toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function allCurrencies() {
  return Object.values(CURRENCY_MAP);
}
