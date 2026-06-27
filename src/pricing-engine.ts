import type { CalcInputs, CalcResult, CostBreakdown } from "./types";

export function calculate(inputs: CalcInputs): CalcResult {
  const {
    rawMaterials, packaging, equipment, unitsPerMonth,
    rent, electricity, water, internet, marketing, otherOverhead,
    fuelPerTrip, tripsPerMonth, transportMarket, courierFees, stallFees,
    myHourlyRate, hoursPerUnit, staffWages, training,
    desiredMargin, savingsGoal, contingency, taxRate,
  } = inputs;

  const u = Math.max(unitsPerMonth, 1);

  // Production
  const directCost = rawMaterials + packaging + equipment;

  // Overhead per unit (handle 0 units case)
  const totalOverheadMo = rent + electricity + water + internet + marketing + otherOverhead;
  const overheadPerUnit = u > 0 ? totalOverheadMo / u : 0;

  // Logistics per unit (handle 0 units case)
  const totalLogisticsMo = (fuelPerTrip * tripsPerMonth) + transportMarket + courierFees + stallFees;
  const logisticsPerUnit = u > 0 ? totalLogisticsMo / u : 0;

  // Labour
  const myLabourPerUnit = myHourlyRate * hoursPerUnit;
  const staffPerUnit = u > 0 ? (staffWages + training) / u : 0;

  // Savings per unit (handle 0 units case)
  const savingsPerUnit = u > 0 ? savingsGoal / u : 0;

  // Total cost
  const totalCostPerUnit = directCost + overheadPerUnit + logisticsPerUnit + myLabourPerUnit + staffPerUnit + savingsPerUnit;

  // Contingency buffer
  const contingencyAmount = totalCostPerUnit * (contingency / 100);
  const totalWithBuffer = totalCostPerUnit + contingencyAmount;

  // Tax (applied to final price)
  const taxMultiplier = 1 + (taxRate / 100);

  // Pricing
  const breakeven = totalWithBuffer;
  const marginMultiplier = 1 / (1 - (desiredMargin / 100));
  const recommended = breakeven * marginMultiplier * taxMultiplier;
  const profitPerUnit = recommended - breakeven * taxMultiplier;
  const actualMargin = recommended > 0 ? ((profitPerUnit / recommended) * 100) : 0;

  const monthlyRevenue = recommended * u;
  const monthlyProfit = profitPerUnit * u;

  // Breakdown (for bar chart)
  const breakdown: CostBreakdown[] = [
    { label: "Raw Materials", amount: rawMaterials, icon: "leaf" },
    { label: "Packaging", amount: packaging, icon: "package" },
    { label: "Equipment", amount: equipment, icon: "wrench" },
    { label: "Overhead", amount: overheadPerUnit, icon: "home" },
    { label: "Logistics", amount: logisticsPerUnit, icon: "truck" },
    { label: "Your Labour", amount: myLabourPerUnit, icon: "clock" },
    { label: "Staff", amount: staffPerUnit, icon: "users" },
    { label: "Savings", amount: savingsPerUnit, icon: "piggy-bank" },
    { label: "Buffer", amount: contingencyAmount, icon: "shield" },
    { label: "Tax", amount: recommended - (recommended / taxMultiplier), icon: "receipt" },
  ].filter(c => c.amount > 0.01);

  return {
    totalCostPerUnit,
    breakeven,
    recommended,
    profitPerUnit,
    actualMargin,
    monthlyRevenue,
    monthlyProfit,
    breakdown,
    totalOverheadMo,
    totalLogisticsMo,
  };
}
