import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR' | 'CAD';

interface ExchangeRates {
  NGN: number;
  USD: number;
  GBP: number;
  EUR: number;
  CAD: number;
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (priceInNGN: number) => number;
  formatPrice: (priceInNGN: number) => string;
  exchangeRates: ExchangeRates;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
  EUR: '€',
  CAD: 'CA$',
};

// Fallback rates relative to NGN (approximate)
const FALLBACK_RATES: ExchangeRates = {
  NGN: 1,
  USD: 0.00065,
  GBP: 0.00051,
  EUR: 0.00060,
  CAD: 0.00089,
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('currency');
    return (saved as Currency) || 'NGN';
  });

  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(FALLBACK_RATES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/NGN');
        const data = await response.json();
        setExchangeRates({
          NGN: 1,
          USD: data.rates.USD ?? FALLBACK_RATES.USD,
          GBP: data.rates.GBP ?? FALLBACK_RATES.GBP,
          EUR: data.rates.EUR ?? FALLBACK_RATES.EUR,
          CAD: data.rates.CAD ?? FALLBACK_RATES.CAD,
        });
      } catch (error) {
        console.error('Failed to fetch exchange rates, using fallback:', error);
        // keep fallback rates already set
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 3600000);
    return () => clearInterval(interval);
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  const convertPrice = (priceInNGN: number): number => {
    return priceInNGN * (exchangeRates[currency] ?? 1);
  };

  const formatPrice = (priceInNGN: number): string => {
    const converted = convertPrice(priceInNGN);
    const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
    return `${symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: currency === 'NGN' ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, convertPrice, formatPrice, exchangeRates, loading }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};
