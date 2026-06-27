export interface CalcInputs {
  productName: string;
  rawMaterials: number;
  packaging: number;
  equipment: number;
  unitsPerMonth: number;
  rent: number;
  electricity: number;
  water: number;
  internet: number;
  marketing: number;
  otherOverhead: number;
  fuelPerTrip: number;
  tripsPerMonth: number;
  transportMarket: number;
  courierFees: number;
  stallFees: number;
  myHourlyRate: number;
  hoursPerUnit: number;
  staffWages: number;
  training: number;
  desiredMargin: number;
  competitorPrice: number;
  savingsGoal: number;
  contingency: number;
  taxRate: number;
}

export interface CostBreakdown {
  label: string;
  amount: number;
  icon: string;
}

export interface CalcResult {
  totalCostPerUnit: number;
  breakeven: number;
  recommended: number;
  profitPerUnit: number;
  actualMargin: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  breakdown: CostBreakdown[];
  totalOverheadMo: number;
  totalLogisticsMo: number;
}

export interface SavedCalc {
  id: string;
  date: string;
  productName: string;
  inputs: CalcInputs;
  result: CalcResult;
}

export interface UserProfile {
  name: string;
  email: string;
  businessName: string;
  currency: CurrencyCode;
  photo?: string;
}

export type CurrencyCode = keyof typeof CURRENCY_MAP;

export const CURRENCY_MAP = {
  NGN: { symbol: "₦", code: "NGN", name: "Nigerian Naira" },
  USD: { symbol: "$", code: "USD", name: "US Dollar" },
  GBP: { symbol: "£", code: "GBP", name: "British Pound" },
  EUR: { symbol: "€", code: "EUR", name: "Euro" },
  KES: { symbol: "KSh", code: "KES", name: "Kenyan Shilling" },
  GHS: { symbol: "₵", code: "GHS", name: "Ghanaian Cedi" },
  ZAR: { symbol: "R", code: "ZAR", name: "South African Rand" },
  UGX: { symbol: "USh", code: "UGX", name: "Ugandan Shilling" },
  TZS: { symbol: "TSh", code: "TZS", name: "Tanzanian Shilling" },
  RWF: { symbol: "FRw", code: "RWF", name: "Rwandan Franc" },
  XAF: { symbol: "FCFA", code: "XAF", name: "Central African CFA" },
  XOF: { symbol: "FCFA", code: "XOF", name: "West African CFA" },
} as const;

export type Route = "/" | "/dashboard" | "/calculator" | "/history" | "/profile" | "/pricing";
export const ROUTES: Route[] = ["/", "/dashboard", "/calculator", "/history", "/profile", "/pricing"];

export interface AIInsight {
  type: "insight" | "optimization" | "market" | "coach";
  title: string;
  content: string;
  isLoading?: boolean;
}

export const DEFAULT_INPUTS: CalcInputs = {
  productName: "",
  rawMaterials: 0,
  packaging: 0,
  equipment: 0,
  unitsPerMonth: 1,
  rent: 0,
  electricity: 0,
  water: 0,
  internet: 0,
  marketing: 0,
  otherOverhead: 0,
  fuelPerTrip: 0,
  tripsPerMonth: 0,
  transportMarket: 0,
  courierFees: 0,
  stallFees: 0,
  myHourlyRate: 0,
  hoursPerUnit: 0,
  staffWages: 0,
  training: 0,
  desiredMargin: 25,
  competitorPrice: 0,
  savingsGoal: 0,
  contingency: 5,
  taxRate: 0,
};
