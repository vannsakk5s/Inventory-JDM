"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Currency = "USD" | "KHR";

interface CurrencyContextType {
  currency: Currency;
  exchangeRate: number;
  setCurrency: (currency: Currency) => void;
  setExchangeRate: (rate: number) => void;
  formatPrice: (amountInUSD: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const [exchangeRate, setExchangeRateState] = useState<number>(4000);

  // Load from localStorage if available
  useEffect(() => {
    const storedCurrency = localStorage.getItem("app-currency");
    const storedRate = localStorage.getItem("app-exchange-rate");
    if (storedCurrency === "USD" || storedCurrency === "KHR") {
      setCurrencyState(storedCurrency);
    }
    if (storedRate) {
      const parsed = parseFloat(storedRate);
      if (!isNaN(parsed) && parsed > 0) {
        setExchangeRateState(parsed);
      }
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("app-currency", newCurrency);
  };

  const setExchangeRate = (newRate: number) => {
    setExchangeRateState(newRate);
    localStorage.setItem("app-exchange-rate", newRate.toString());
  };

  const formatPrice = (amountInUSD: number) => {
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amountInUSD);
    } else {
      const amountInKHR = amountInUSD * exchangeRate;
      return new Intl.NumberFormat("km-KH", {
        style: "currency",
        currency: "KHR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amountInKHR).replace("KHR", "៛");
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, exchangeRate, setCurrency, setExchangeRate, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
