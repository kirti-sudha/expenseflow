/**
 * Currency utility functions for handling precise decimal calculations
 */

// Convert number to cents to avoid floating point errors
export const toCents = (amount: number): number => {
  return Math.round(amount * 100);
};

// Convert cents back to currency amount
export const fromCents = (cents: number): number => {
  return cents / 100;
};

// Add two currency amounts precisely
export const addCurrency = (a: number, b: number): number => {
  return fromCents(toCents(a) + toCents(b));
};

// Subtract two currency amounts precisely
export const subtractCurrency = (a: number, b: number): number => {
  return fromCents(toCents(a) - toCents(b));
};

// Multiply currency amount precisely
export const multiplyCurrency = (amount: number, multiplier: number): number => {
  return fromCents(Math.round(toCents(amount) * multiplier));
};

// Format currency for display
export const formatCurrency = (amount: number, showDecimals: boolean = true): string => {
  const rounded = Math.round(amount * 100) / 100; // Round to 2 decimal places
  
  if (showDecimals) {
    return rounded.toFixed(2);
  } else {
    // For whole numbers, don't show decimals
    return Math.round(rounded).toString();
  }
};

// Parse currency input string to number
export const parseCurrency = (value: string): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
};

// Check if amount should be displayed as whole number
export const isWholeNumber = (amount: number): boolean => {
  return Math.abs(amount - Math.round(amount)) < 0.01;
};

// Format for Indian currency display
export const formatIndianCurrency = (amount: number, showDecimals: boolean = true): string => {
  const rounded = Math.round(amount * 100) / 100;
  
  if (!showDecimals && isWholeNumber(rounded)) {
    return Math.round(rounded).toLocaleString('en-IN');
  }
  
  return rounded.toLocaleString('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2
  });
};