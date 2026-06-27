import type { CalcInputs, CalcResult, CurrencyCode } from "../types";

const API_KEY = (typeof import.meta !== "undefined" && import.meta.env?.VITE_OPENROUTER_API_KEY) || "";
const MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

function buildSystemPrompt(): string {
  return `You are SMLife's AI Pricing Coach — an expert in micro-business pricing, cost analysis, and SME growth strategies.

Your role:
1. Analyze the user's pricing inputs and results
2. Provide specific, actionable, personalized advice
3. Be encouraging but honest — if their pricing is weak, say so constructively
4. Use plain language — no jargon
5. Keep responses concise (3-5 sentences max)
6. If applicable, reference the user's currency and numbers
7. Be warm and supportive — you're speaking to a woman entrepreneur

Your capabilities:
- Pricing insight: Analyze their margin, costs, and pricing strategy
- Cost optimization: Suggest specific ways to reduce costs based on their inputs
- Market context: Give general market context for pricing (specific to their product type if mentioned)`;
}

function buildInsightPrompt(inputs: CalcInputs, result: CalcResult, currency: CurrencyCode): string {
  return `The user is pricing a product${inputs.productName ? ` called "${inputs.productName}"` : ""}. Here are their inputs and results:

PRODUCT INFO:
${inputs.productName ? `Product: ${inputs.productName}` : ""}
Units per month: ${inputs.unitsPerMonth}
Desired margin: ${inputs.desiredMargin}%
Competitor price: ${inputs.competitorPrice || "Not provided"}
Savings goal: ${inputs.savingsGoal || "None"}
Contingency buffer: ${inputs.contingency}%
Tax rate: ${inputs.taxRate}%

COST BREAKDOWN:
${result.breakdown.map(b => `- ${b.label}: ${currency} ${b.amount.toFixed(2)}`).join("\n")}

RESULTS:
Total cost per unit: ${currency} ${result.totalCostPerUnit.toFixed(2)}
Breakeven: ${currency} ${result.breakeven.toFixed(2)}
Recommended price: ${currency} ${result.recommended.toFixed(2)}
Net profit per unit: ${currency} ${result.profitPerUnit.toFixed(2)}
Actual margin: ${result.actualMargin.toFixed(1)}%
Monthly revenue: ${currency} ${result.monthlyRevenue.toFixed(2)}
Monthly net profit: ${currency} ${result.monthlyProfit.toFixed(2)}

Please provide a personalized pricing insight and recommendation.`;
}

function buildOptimizationPrompt(inputs: CalcInputs, result: CalcResult): string {
  return `Based on these business costs, suggest 2-3 specific, actionable ways to reduce costs or improve profitability:

- Raw materials: ${inputs.rawMaterials}
- Packaging: ${inputs.packaging}
- Overhead (rent, electricity, etc): ${result.totalOverheadMo}
- Logistics (fuel, delivery): ${result.totalLogisticsMo}
- Labour: ${inputs.myHourlyRate} × ${inputs.hoursPerUnit} hours/unit
- Current margin: ${result.actualMargin.toFixed(1)}%

Give specific, practical suggestions this type of business can implement.`;
}

function buildMarketPrompt(inputs: CalcInputs, result: CalcResult): string {
  return `Give brief market context (1-2 sentences) about pricing for a small business with:
- Product: ${inputs.productName || "a handcrafted product"}
- Price point: at ${result.recommended.toFixed(2)} per unit
- Margin: ${result.actualMargin.toFixed(1)}%
- Monthly volume: ${inputs.unitsPerMonth} units

Focus on whether this positioning makes sense and what the business owner should consider.`;
}

export function getRuleBasedInsight(inputs: CalcInputs, result: CalcResult): string {
  const { actualMargin, recommended, monthlyProfit, breakdown } = result;
  const topCost = breakdown.length > 0 ? breakdown.sort((a, b) => b.amount - a.amount)[0] : null;

  if (result.totalCostPerUnit === 0) {
    return "Start filling in your costs across all tabs to get a personalised pricing recommendation. Every cost you add brings you closer to your true price.";
  }

  let insight = "";

  if (actualMargin < 10) {
    insight = `Your margin of **${actualMargin.toFixed(1)}%** is critically low. `;
    if (topCost) insight += `Your biggest cost driver is **${topCost.label}** at ${topCost.amount.toFixed(2)} per unit. `;
    insight += `Consider reviewing your supplier costs or increasing your selling price. At this margin, one bad month could wipe out your profits.`;
  } else if (actualMargin < 20) {
    insight = `You're in the **moderate zone** at ${actualMargin.toFixed(1)}% margin. `;
    if (topCost) insight += `Focus on reducing **${topCost.label.toLowerCase()}** costs — even small savings add meaningful profit per unit. `;
    insight += `You're close to a healthy margin — small changes matter!`;
  } else if (actualMargin < 40) {
    insight = `Your **${actualMargin.toFixed(1)}% margin** is healthy and sustainable. `;
    insight += `At this rate, you're on track for **${monthlyProfit.toFixed(2)}** monthly net profit. `;
    insight += `Consider reinvesting a portion into marketing to grow volume and compound your earnings.`;
  } else {
    insight = `Excellent — your **${actualMargin.toFixed(1)}% margin** is strong. `;
    insight += `You have pricing power. If demand is steady, test a slight increase or bundle with premium options to maximize per-customer value.`;
  }

  if (inputs.myHourlyRate === 0 && inputs.hoursPerUnit > 0) {
    insight += ` *Reminder:* You haven't entered your hourly rate — your time is a real cost. Add it in Labour to pay yourself properly.`;
  }

  if (inputs.competitorPrice > 0) {
    const diff = ((recommended - inputs.competitorPrice) / inputs.competitorPrice * 100);
    if (Math.abs(diff) > 15) {
      insight += ` Your price is ${diff > 0 ? `${diff.toFixed(0)}% above` : `${Math.abs(diff).toFixed(0)}% below`} your competitor's. ${diff > 0 ? "Make sure your value proposition justifies the premium." : "You may have room to increase price without losing customers."}`;
    }
  }

  return insight;
}

export async function getAIInsight(
  type: "insight" | "optimization" | "market",
  inputs: CalcInputs,
  result: CalcResult,
  currency: CurrencyCode,
): Promise<string> {
  if (!API_KEY) throw new Error("No API key");

  const promptMap = {
    insight: () => buildInsightPrompt(inputs, result, currency),
    optimization: () => buildOptimizationPrompt(inputs, result),
    market: () => buildMarketPrompt(inputs, result),
  };

  const systemPrompt = buildSystemPrompt();
  const userPrompt = promptMap[type]();

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "SMLife AI Pricing Assistant",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "I couldn't generate an insight right now. Please try again.";
}
