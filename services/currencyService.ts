
export interface CurrencyInfo {
  code: string;
  symbol: string;
  rate: number; // Rate relative to 1 USD
}

export const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  "United States of America": { code: "USD", symbol: "$", rate: 1 },
  "Nigeria": { code: "NGN", symbol: "₦", rate: 1600 },
  "United Kingdom": { code: "GBP", symbol: "£", rate: 0.79 },
  "Canada": { code: "CAD", symbol: "C$", rate: 1.36 },
  "India": { code: "INR", symbol: "₹", rate: 83.45 },
  "Ghana": { code: "GHS", symbol: "GH₵", rate: 15.20 },
  "Kenya": { code: "KES", symbol: "KSh", rate: 131.50 },
  "South Africa": { code: "ZAR", symbol: "R", rate: 18.80 },
  "Pakistan": { code: "PKR", symbol: "Rs", rate: 278.50 },
  "Mexico": { code: "MXN", symbol: "$", rate: 16.70 },
  "Brazil": { code: "BRL", symbol: "R$", rate: 5.15 },
  "United Arab Emirates": { code: "AED", symbol: "AED", rate: 3.67 },
  "Australia": { code: "AUD", symbol: "A$", rate: 1.52 },
  "Germany": { code: "EUR", symbol: "€", rate: 0.92 },
  "France": { code: "EUR", symbol: "€", rate: 0.92 },
};

export const DEFAULT_CURRENCY: CurrencyInfo = { code: "USD", symbol: "$", rate: 1 };

/**
 * Paystack supported currencies for Nigerian merchants
 */
export const PAYSTACK_SUPPORTED_CURRENCIES = ["NGN", "USD", "GHS", "KES", "ZAR"];

/**
 * Returns formatted localized price based on country
 */
export const formatLocalPrice = (usdAmount: number, country: string = "United States of America"): string => {
  const info = CURRENCY_MAP[country] || DEFAULT_CURRENCY;
  const localValue = usdAmount * info.rate;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: info.code,
    currencyDisplay: 'symbol',
  }).format(localValue).replace(info.code, info.symbol);
};

/**
 * Returns currency info for a specific country
 */
export const getCurrencyForCountry = (country: string): CurrencyInfo => {
  return CURRENCY_MAP[country] || DEFAULT_CURRENCY;
};

/**
 * Returns the best Paystack-supported currency for a given country
 * Falls back to USD if the local currency isn't natively supported by Paystack
 */
export const getPaystackCurrency = (country: string): CurrencyInfo => {
    const local = CURRENCY_MAP[country] || DEFAULT_CURRENCY;
    if (PAYSTACK_SUPPORTED_CURRENCIES.includes(local.code)) {
        return local;
    }
    return DEFAULT_CURRENCY;
};
