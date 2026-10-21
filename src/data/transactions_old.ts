export type TransactionType = "income" | "expense";
export type Period = "today" | "month" | "quarter" | "year";

export type Transaction = {
  id: string;
  vendor: string;
  category: string;
  amount: number; // always positive, `type` decides the sign/colour
  type: TransactionType;
  date: string; // ISO string
};

export type Filters = {
  vendors: string[];
  categories: string[];
  min: string;
  max: string;
};

export const EMPTY_FILTERS: Filters = {
  vendors: [],
  categories: [],
  min: "",
  max: "",
};

export const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "month", label: "This Month" },
  { key: "quarter", label: "This Quarter" },
  { key: "year", label: "This Year" },
];

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

// Replace with your real data source (API / store / DB).
export const TRANSACTIONS: Transaction[] = [
  { id: "1", vendor: "Apple Inc", category: "Salary", amount: 2000, type: "income", date: daysAgo(0) },
  { id: "2", vendor: "Dunnes Store", category: "Groceries", amount: 200, type: "expense", date: daysAgo(0) },
  { id: "3", vendor: "Tax Refund", category: "Misc", amount: 100, type: "income", date: daysAgo(0) },
  { id: "4", vendor: "Barbers", category: "Enjoy", amount: 2000, type: "expense", date: daysAgo(0) },
  { id: "5", vendor: "Apple Inc", category: "Salary", amount: 2000, type: "income", date: daysAgo(0) },
  { id: "6", vendor: "Dunnes Store", category: "Groceries", amount: 2000, type: "income", date: daysAgo(0) },
  { id: "7", vendor: "Netflix", category: "Subscriptions", amount: 15.99, type: "expense", date: daysAgo(3) },
  { id: "8", vendor: "Luas", category: "Transport", amount: 42.5, type: "expense", date: daysAgo(12) },
  { id: "9", vendor: "Airbnb", category: "Travel", amount: 640, type: "expense", date: daysAgo(45) },
  { id: "10", vendor: "Apple Inc", category: "Salary", amount: 2000, type: "income", date: daysAgo(120) },
];

export function inPeriod(iso: string, period: Period) {
  const d = new Date(iso);
  const n = new Date();
  const sameYear = d.getFullYear() === n.getFullYear();

  switch (period) {
    case "year":
      return sameYear;
    case "quarter":
      return sameYear && Math.floor(d.getMonth() / 3) === Math.floor(n.getMonth() / 3);
    case "month":
      return sameYear && d.getMonth() === n.getMonth();
    default:
      return d.toDateString() === n.toDateString();
  }
}

export function countActiveFilters(f: Filters) {
  return (
    (f.vendors.length ? 1 : 0) +
    (f.categories.length ? 1 : 0) +
    (f.min !== "" || f.max !== "" ? 1 : 0)
  );
}

export function formatAmount(value: number) {
  return `€ ${value.toLocaleString("en-IE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
