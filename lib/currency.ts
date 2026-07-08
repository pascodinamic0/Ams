export type SchoolCurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "GHS"
  | "NGN"
  | "KES"
  | "ZAR"
  | "CAD"
  | "AUD"
  | "INR";

export type SchoolCurrency = {
  code: SchoolCurrencyCode;
  label: string;
  symbol: string;
};

export const DEFAULT_CURRENCY_CODE: SchoolCurrencyCode = "USD";

export const SCHOOL_CURRENCIES: SchoolCurrency[] = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "\u20ac" },
  { code: "GBP", label: "British Pound", symbol: "\u00a3" },
  { code: "GHS", label: "Ghanaian Cedi", symbol: "\u20b5" },
  { code: "NGN", label: "Nigerian Naira", symbol: "\u20a6" },
  { code: "KES", label: "Kenyan Shilling", symbol: "KSh" },
  { code: "ZAR", label: "South African Rand", symbol: "R" },
  { code: "CAD", label: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$" },
  { code: "INR", label: "Indian Rupee", symbol: "\u20b9" },
];

const currencyByCode = new Map(
  SCHOOL_CURRENCIES.map((currency) => [currency.code, currency])
);

export function normalizeCurrencyCode(
  code: string | null | undefined
): SchoolCurrencyCode {
  if (code && currencyByCode.has(code as SchoolCurrencyCode)) {
    return code as SchoolCurrencyCode;
  }
  return DEFAULT_CURRENCY_CODE;
}

export function getSchoolCurrency(
  code: string | null | undefined
): SchoolCurrency {
  return currencyByCode.get(normalizeCurrencyCode(code))!;
}

export function formatMoney(
  value: number,
  currencyCode: string | null | undefined,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
) {
  const code = normalizeCurrencyCode(currencyCode);
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: code,
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(value);
}
