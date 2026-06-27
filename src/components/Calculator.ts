import { iconString, ICONS } from "../icons";
import { store } from "../state";
import { setCurrency, getCurrency, fmt } from "../currency";
import { calculate } from "../pricing-engine";
import { DEFAULT_INPUTS } from "../types";
import type { CalcInputs, CalcResult, SavedCalc, CurrencyCode } from "../types";
import { getRuleBasedInsight, getAIInsight } from "../ai/client";
import { showToast } from "../main";
import { renderAuthModal } from "./Auth";
import { parseMarkdown } from "../markdown";

const BAR_COLORS = ["#C9847A","#9B4DCA","#3D1A5E","#E67E22","#27AE60","#D4A853","#5C2E8A","#8BBFA3","#E8A89E","#F39C12"];

let lastInputs: CalcInputs = { ...DEFAULT_INPUTS };
let lastResult: CalcResult | null = null;

export function renderCalculator(): void {
  const el = document.getElementById("calcSection")!;
  el.innerHTML = `
    <div class="section" style="padding-top:1rem;padding-bottom:0;">
      <p class="section-eyebrow">${iconString(ICONS.sparkles, 14)} AI Smart Pricing Engine</p>
      <h2 class="section-title">Calculate Your True Product Price</h2>
      <p class="section-body">Enter your costs below, from raw materials to the fuel you burn on delivery runs. SMLife calculates your breakeven, recommended price, and profit health.</p>
    </div>

    <div class="calculator-section">
      <div class="calc-header">
        <div class="calc-icon-box">${iconString(ICONS.calculator, 22)}</div>
        <div class="calc-title-block">
          <h2>Pricing Calculator</h2>
          <p>Fill in each tab. The more detail you add, the more accurate your price</p>
        </div>
        <div class="calc-currency-wrap">
          <span>Currency:</span>
          <select id="calcCurrency">
            <option value="NGN">₦ NGN</option>
            <option value="USD">$ USD</option>
            <option value="GBP">£ GBP</option>
            <option value="EUR">€ EUR</option>
            <option value="KES">KSh KES</option>
            <option value="GHS">₵ GHS</option>
            <option value="ZAR">R ZAR</option>
            <option value="UGX">USh UGX</option>
            <option value="TZS">TSh TZS</option>
            <option value="RWF">FRw RWF</option>
          </select>
        </div>
      </div>

      <div class="product-name-input">
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.package, 14)} Product Name <span style="font-weight:400;color:var(--text-light);">(optional)</span></label>
          <input class="input-field" type="text" id="productName" placeholder="e.g. Handmade Shea Butter" />
        </div>
      </div>

      <div class="tab-nav" id="calcTabNav">
        <button class="tab-btn active" data-tab="production">${iconString(ICONS.leaf, 14)} Production</button>
        <button class="tab-btn" data-tab="overhead">${iconString(ICONS.home, 14)} Overhead</button>
        <button class="tab-btn" data-tab="logistics">${iconString(ICONS.truck, 14)} Logistics</button>
        <button class="tab-btn" data-tab="labour">${iconString(ICONS.clock, 14)} Labour</button>
        <button class="tab-btn" data-tab="pricing">${iconString(ICONS.target, 14)} Goals</button>
      </div>

      <div id="calcTabPanels">
        ${renderProductionTab()}
        ${renderOverheadTab()}
        ${renderLogisticsTab()}
        ${renderLabourTab()}
        ${renderPricingTab()}
      </div>

      <div class="calc-actions">
        <button class="btn btn-primary btn-lg" id="calcBtn">${iconString(ICONS.calculator, 18)} Calculate My Price</button>
        <button class="btn btn-outline btn-lg" id="resetBtn">${iconString(ICONS.refreshCw, 18)} Reset All</button>
      </div>

      <div class="results-panel" id="resultsPanel">
        <div class="results-header">${iconString(ICONS.barChart3, 14)} Your Pricing Breakdown</div>

        <div class="profit-meter-wrap">
          <div class="profit-meter-header">
            <span class="profit-meter-label">${iconString(ICONS.trendingUp, 16)} Profit Health Meter</span>
            <span class="profit-meter-status" id="meterStatus">Calculating…</span>
          </div>
          <div class="meter-track">
            <div class="meter-fill" id="meterFill" style="width:0%;"></div>
          </div>
          <div class="meter-labels">
            <span>0% margin</span><span>25% (healthy)</span><span>50%+</span>
          </div>
        </div>

        <div class="results-grid">
          <div class="result-card">
            <div class="result-label">Total Cost Per Unit</div>
            <div class="result-value" id="resTotalCost">—</div>
            <div class="result-sub">Everything included</div>
          </div>
          <div class="result-card">
            <div class="result-label">Breakeven Price</div>
            <div class="result-value" id="resBreakeven">—</div>
            <div class="result-sub">Minimum to not lose money</div>
          </div>
          <div class="result-card highlight">
            <div class="result-label">${iconString(ICONS.sparkles, 12)} Recommended Price</div>
            <div class="result-value" id="resRecommended">—</div>
            <div class="result-sub" id="resMarginNote">Based on your goals</div>
          </div>
          <div class="result-card">
            <div class="result-label">Net Profit per Unit</div>
            <div class="result-value" id="resProfit">—</div>
            <div class="result-sub" id="resProfitNote">At recommended price</div>
          </div>
          <div class="result-card">
            <div class="result-label">Monthly Revenue (est.)</div>
            <div class="result-value" id="resMonthlyRevenue">—</div>
            <div class="result-sub" id="resUnitsNote">—</div>
          </div>
          <div class="result-card">
            <div class="result-label">Monthly Net Profit (est.)</div>
            <div class="result-value" id="resMonthlyProfit">—</div>
            <div class="result-sub">After all costs</div>
          </div>
        </div>

        <div class="competitor-box" id="competitorBox">
          <div class="competitor-box-title">${iconString(ICONS.trendingUp, 14)} Competitor Comparison</div>
          <div class="competitor-msg" id="compMsg"></div>
        </div>

        <div class="breakdown-section">
          <p class="breakdown-title">${iconString(ICONS.list, 14)} Cost Breakdown by Category</p>
          <div class="breakdown-bars" id="breakdownBars"></div>
        </div>

        <div class="ai-insight" id="aiInsight">
          <div class="ai-insight-header">
            <div class="ai-insight-avatar">${iconString(ICONS.sparkles, 16)}</div>
            <span class="ai-insight-title">AI Pricing Insight <span style="font-size:0.7rem;font-weight:600;padding:0.1rem 0.35rem;border-radius:10px;background:rgba(224,86,118,0.12);color:var(--rose);margin-left:0.4rem;display:inline-block;vertical-align:middle;">₦2,400/mo</span></span>
          </div>
          <div class="ai-insight-text" id="aiInsightText">
            Click "Calculate" to get your personalised pricing insight.
          </div>
          <div class="ai-insight-actions" id="aiInsightActions">
            <button class="btn btn-sm btn-ghost" data-ai="insight">${iconString(ICONS.sparkles, 14)} Refresh</button>
            <button class="btn btn-sm btn-ghost" data-ai="optimization">${iconString(ICONS.zap, 14)} Optimize Costs</button>
            <button class="btn btn-sm btn-ghost" data-ai="market">${iconString(ICONS.trendingUp, 14)} Market Context</button>
            <button class="btn btn-sm btn-rose" id="saveCalcBtn">${iconString(ICONS.download, 14)} Save</button>
          </div>
        </div>
      </div>
    </div>
  `;

  bindCalculatorEvents();
}

function bindCalculatorEvents(): void {
  // Currency select
  const currencySelect = document.getElementById("calcCurrency") as HTMLSelectElement;
  currencySelect.value = getCurrency();
  currencySelect.addEventListener("change", () => {
    const code = currencySelect.value as CurrencyCode;
    setCurrency(code);
    store.update({ currency: code });
    updatePrefixSymbols();
    if (lastResult) runCalculation();
  });

  // Tab switching
  document.querySelectorAll("[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-tab]").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const panel = document.getElementById(`tab-${(btn as HTMLElement).dataset.tab}`);
      if (panel) panel.classList.add("active");
    });
  });

  // Calculate
  document.getElementById("calcBtn")!.addEventListener("click", () => {
    const btn = document.getElementById("calcBtn")!;
    btn.innerHTML = `<span class="ai-spinner"></span> Calculating…`;
    btn.setAttribute("disabled", "true");

    setTimeout(() => {
      btn.innerHTML = `${iconString(ICONS.calculator, 18)} Calculate My Price`;
      btn.removeAttribute("disabled");
      runCalculation();
    }, 600);
  });

  // Reset
  document.getElementById("resetBtn")!.addEventListener("click", resetAll);

  // AI insight actions
  document.querySelectorAll("[data-ai]").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = (btn as HTMLElement).dataset.ai as "insight" | "optimization" | "market";
      getAIInsightAndDisplay(type);
    });
  });

  // Save
  document.getElementById("saveCalcBtn")!.addEventListener("click", saveCalculation);

  // Load active calculation if any
  const state = store.get();
  if (state.activeCalcId) {
    const saved = state.savedCalcs.find(c => c.id === state.activeCalcId);
    if (saved) {
      lastInputs = { ...saved.inputs };
      lastResult = { ...saved.result };

      const fields: Record<string, any> = {
        productName: saved.productName || "",
        rawMaterials: saved.inputs.rawMaterials || "",
        packaging: saved.inputs.packaging || "",
        equipment: saved.inputs.equipment || "",
        unitsPerMonth: saved.inputs.unitsPerMonth || "",
        rent: saved.inputs.rent || "",
        electricity: saved.inputs.electricity || "",
        water: saved.inputs.water || "",
        internet: saved.inputs.internet || "",
        marketing: saved.inputs.marketing || "",
        otherOverhead: saved.inputs.otherOverhead || "",
        fuelPerTrip: saved.inputs.fuelPerTrip || "",
        tripsPerMonth: saved.inputs.tripsPerMonth || "",
        transportMarket: saved.inputs.transportMarket || "",
        courierFees: saved.inputs.courierFees || "",
        stallFees: saved.inputs.stallFees || "",
        myHourlyRate: saved.inputs.myHourlyRate || "",
        hoursPerUnit: saved.inputs.hoursPerUnit || "",
        staffWages: saved.inputs.staffWages || "",
        training: saved.inputs.training || "",
        desiredMargin: saved.inputs.desiredMargin || "",
        competitorPrice: saved.inputs.competitorPrice || "",
        savingsGoal: saved.inputs.savingsGoal || "",
        contingency: saved.inputs.contingency || "",
        taxRate: saved.inputs.taxRate || "",
      };

      for (const [id, val] of Object.entries(fields)) {
        const field = document.getElementById(id) as HTMLInputElement;
        if (field) field.value = String(val);
      }

      displayResults(saved.inputs, saved.result);
      getRuleInsight(saved.inputs, saved.result);
      updatePrefixSymbols();
    }
    // Clear the active calculation id from store
    store.update({ activeCalcId: null });
  }
}

function renderProductionTab(): string {
  return `
    <div class="tab-panel active" id="tab-production">
      <div class="input-grid">
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.leaf, 14)} Raw Materials Cost</label>
          <div class="input-prefix"><span class="prefix-symbol">₦</span><input class="input-field" type="number" id="rawMaterials" placeholder="0.00" min="0" step="0.01"></div>
        </div>
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.package, 14)} Packaging Cost (per unit)</label>
          <div class="input-prefix"><span class="prefix-symbol">₦</span><input class="input-field" type="number" id="packaging" placeholder="0.00" min="0" step="0.01"></div>
        </div>
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.wrench, 14)} Equipment / Tools Cost</label>
          <div class="input-prefix"><span class="prefix-symbol">₦</span><input class="input-field" type="number" id="equipment" placeholder="0.00" min="0" step="0.01"></div>
        </div>
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.factory, 14)} Units Produced per Month</label>
          <input class="input-field" type="number" id="unitsPerMonth" placeholder="e.g. 50" min="1" step="1">
        </div>
      </div>
    </div>
  `;
}

function renderOverheadTab(): string {
  return `
    <div class="tab-panel" id="tab-overhead">
      <div class="input-grid">
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.home, 14)} Monthly Rent / Workspace</label>
          <div class="input-prefix"><span class="prefix-symbol">₦</span><input class="input-field" type="number" id="rent" placeholder="0.00" min="0" step="0.01"></div>
        </div>
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.zap, 14)} Monthly Electricity Bill</label>
          <div class="input-prefix"><span class="prefix-symbol">₦</span><input class="input-field" type="number" id="electricity" placeholder="0.00" min="0" step="0.01"></div>
        </div>
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.droplet, 14)} Water / Utilities</label>
          <div class="input-prefix"><span class="prefix-symbol">₦</span><input class="input-field" type="number" id="water" placeholder="0.00" min="0" step="0.01"></div>
        </div>
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.smartphone, 14)} Internet / Phone / Software</label>
          <div class="input-prefix"><span class="prefix-symbol">₦</span><input class="input-field" type="number" id="internet" placeholder="0.00" min="0" step="0.01"></div>
        </div>
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.megaphone, 14)} Monthly Marketing Spend</label>
          <div class="input-prefix"><span class="prefix-symbol">₦</span><input class="input-field" type="number" id="marketing" placeholder="0.00" min="0" step="0.01"></div>
        </div>
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.refreshCw, 14)} Other Monthly Overheads</label>
          <div class="input-prefix"><span class="prefix-symbol">₦</span><input class="input-field" type="number" id="otherOverhead" placeholder="0.00" min="0" step="0.01"></div>
        </div>
      </div>
    </div>
  `;
}

function renderLogisticsTab(): string {
  return `
    <div class="tab-panel" id="tab-logistics">
      <div class="input-grid">
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.fuel, 14)} Fuel Cost per Delivery Trip</label>
          <div class="input-prefix"><span class="prefix-symbol">₦</span><input class="input-field" type="number" id="fuelPerTrip" placeholder="0.00" min="0" step="0.01"></div>
        </div>
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.repeat, 14)} Delivery Trips per Month</label>
          <input class="input-field" type="number" id="tripsPerMonth" placeholder="e.g. 10" min="0" step="1">
        </div>
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.truck, 14)} Transport to Market / Supplier</label>
          <div class="input-prefix"><span class="prefix-symbol">₦</span><input class="input-field" type="number" id="transportMarket" placeholder="0.00" min="0" step="0.01"></div>
        </div>
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.mail, 14)} Courier / Delivery Fees (monthly)</label>
          <div class="input-prefix"><span class="prefix-symbol">₦</span><input class="input-field" type="number" id="courierFees" placeholder="0.00" min="0" step="0.01"></div>
        </div>
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.store, 14)} Market Stall / Platform Fees</label>
          <div class="input-prefix"><span class="prefix-symbol">₦</span><input class="input-field" type="number" id="stallFees" placeholder="0.00" min="0" step="0.01"></div>
        </div>
      </div>
    </div>
  `;
}

function renderLabourTab(): string {
  return `
    <div class="tab-panel" id="tab-labour">
      <div class="input-grid">
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.clock, 14)} Your Hourly Rate (what you're worth)</label>
          <div class="input-prefix"><span class="prefix-symbol">₦</span><input class="input-field" type="number" id="myHourlyRate" placeholder="0.00" min="0" step="0.01"></div>
        </div>
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.timer, 14)} Hours per Unit to Produce</label>
          <input class="input-field" type="number" id="hoursPerUnit" placeholder="e.g. 2" min="0" step="0.25">
        </div>
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.users, 14)} Staff / Helper Wages (monthly)</label>
          <div class="input-prefix"><span class="prefix-symbol">₦</span><input class="input-field" type="number" id="staffWages" placeholder="0.00" min="0" step="0.01"></div>
        </div>
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.graduationCap, 14)} Training / Upskilling (monthly)</label>
          <div class="input-prefix"><span class="prefix-symbol">₦</span><input class="input-field" type="number" id="training" placeholder="0.00" min="0" step="0.01"></div>
        </div>
      </div>
    </div>
  `;
}

function renderPricingTab(): string {
  return `
    <div class="tab-panel" id="tab-pricing">
      <div class="input-grid">
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.target, 14)} Desired Profit Margin (%)</label>
          <input class="input-field" type="number" id="desiredMargin" placeholder="e.g. 30" min="0" max="100" step="1" value="25">
        </div>
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.trendingUp, 14)} Competitor Price (optional)</label>
          <div class="input-prefix"><span class="prefix-symbol">₦</span><input class="input-field" type="number" id="competitorPrice" placeholder="0.00" min="0" step="0.01"></div>
        </div>
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.piggyBank, 14)} Monthly Savings Goal</label>
          <div class="input-prefix"><span class="prefix-symbol">₦</span><input class="input-field" type="number" id="savingsGoal" placeholder="0.00" min="0" step="0.01"></div>
        </div>
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.shield, 14)} Buffer / Contingency (%)</label>
          <input class="input-field" type="number" id="contingency" placeholder="e.g. 5" min="0" max="50" step="1" value="5">
        </div>
        <div class="input-group">
          <label class="input-label">${iconString(ICONS.receipt, 14)} Tax / VAT Rate (%)</label>
          <input class="input-field" type="number" id="taxRate" placeholder="e.g. 7.5" min="0" max="50" step="0.25">
        </div>
      </div>
    </div>
  `;
}

function gatherInputs(): CalcInputs {
  return {
    productName: (document.getElementById("productName") as HTMLInputElement)?.value || "",
    rawMaterials: parseFloat((document.getElementById("rawMaterials") as HTMLInputElement)?.value) || 0,
    packaging: parseFloat((document.getElementById("packaging") as HTMLInputElement)?.value) || 0,
    equipment: parseFloat((document.getElementById("equipment") as HTMLInputElement)?.value) || 0,
    unitsPerMonth: parseFloat((document.getElementById("unitsPerMonth") as HTMLInputElement)?.value) || 1,
    rent: parseFloat((document.getElementById("rent") as HTMLInputElement)?.value) || 0,
    electricity: parseFloat((document.getElementById("electricity") as HTMLInputElement)?.value) || 0,
    water: parseFloat((document.getElementById("water") as HTMLInputElement)?.value) || 0,
    internet: parseFloat((document.getElementById("internet") as HTMLInputElement)?.value) || 0,
    marketing: parseFloat((document.getElementById("marketing") as HTMLInputElement)?.value) || 0,
    otherOverhead: parseFloat((document.getElementById("otherOverhead") as HTMLInputElement)?.value) || 0,
    fuelPerTrip: parseFloat((document.getElementById("fuelPerTrip") as HTMLInputElement)?.value) || 0,
    tripsPerMonth: parseFloat((document.getElementById("tripsPerMonth") as HTMLInputElement)?.value) || 0,
    transportMarket: parseFloat((document.getElementById("transportMarket") as HTMLInputElement)?.value) || 0,
    courierFees: parseFloat((document.getElementById("courierFees") as HTMLInputElement)?.value) || 0,
    stallFees: parseFloat((document.getElementById("stallFees") as HTMLInputElement)?.value) || 0,
    myHourlyRate: parseFloat((document.getElementById("myHourlyRate") as HTMLInputElement)?.value) || 0,
    hoursPerUnit: parseFloat((document.getElementById("hoursPerUnit") as HTMLInputElement)?.value) || 0,
    staffWages: parseFloat((document.getElementById("staffWages") as HTMLInputElement)?.value) || 0,
    training: parseFloat((document.getElementById("training") as HTMLInputElement)?.value) || 0,
    desiredMargin: parseFloat((document.getElementById("desiredMargin") as HTMLInputElement)?.value) || 25,
    competitorPrice: parseFloat((document.getElementById("competitorPrice") as HTMLInputElement)?.value) || 0,
    savingsGoal: parseFloat((document.getElementById("savingsGoal") as HTMLInputElement)?.value) || 0,
    contingency: parseFloat((document.getElementById("contingency") as HTMLInputElement)?.value) || 5,
    taxRate: parseFloat((document.getElementById("taxRate") as HTMLInputElement)?.value) || 0,
  };
}

function updatePrefixSymbols(): void {
  const sym = document.querySelector(".calc-currency-wrap select") as HTMLSelectElement;
  const symbol = sym ? sym.options[sym.selectedIndex]?.text?.charAt(0) || "₦" : "₦";
  document.querySelectorAll(".prefix-symbol").forEach(el => el.textContent = symbol);
}

export function runCalculation(): void {
  const inputs = gatherInputs();
  lastInputs = { ...inputs };
  const result = calculate(inputs);
  lastResult = result;

  displayResults(inputs, result);
  getRuleInsight(inputs, result);
}

function displayResults(inputs: CalcInputs, result: CalcResult): void {
  const { totalCostPerUnit, breakeven, recommended, profitPerUnit, actualMargin, monthlyRevenue, monthlyProfit } = result;

  document.getElementById("resTotalCost")!.textContent = fmt(totalCostPerUnit);
  document.getElementById("resBreakeven")!.textContent = fmt(breakeven);
  document.getElementById("resRecommended")!.textContent = fmt(recommended);
  document.getElementById("resMarginNote")!.textContent = `${actualMargin.toFixed(1)}% margin included`;
  document.getElementById("resProfit")!.textContent = fmt(profitPerUnit);
  document.getElementById("resProfitNote")!.textContent = `${actualMargin.toFixed(1)}% profit margin`;
  document.getElementById("resMonthlyRevenue")!.textContent = fmt(monthlyRevenue);
  document.getElementById("resUnitsNote")!.textContent = `${inputs.unitsPerMonth} units/mo at recommended price`;
  document.getElementById("resMonthlyProfit")!.textContent = fmt(monthlyProfit);

  // Profit meter
  const meterPct = Math.min((actualMargin / 50) * 100, 100);
  const meterFill = document.getElementById("meterFill")!;
  const meterStatus = document.getElementById("meterStatus")!;
  meterFill.style.width = `${meterPct}%`;

  if (actualMargin < 10) {
    meterFill.style.background = "linear-gradient(90deg,#E74C3C,#C0392B)";
    meterStatus.textContent = "At Risk";
    meterStatus.className = "profit-meter-status status-bad";
  } else if (actualMargin < 20) {
    meterFill.style.background = "linear-gradient(90deg,#F39C12,#E67E22)";
    meterStatus.textContent = "Could Improve";
    meterStatus.className = "profit-meter-status status-ok";
  } else {
    meterFill.style.background = "linear-gradient(90deg,var(--mint-dark),var(--success))";
    meterStatus.textContent = "Healthy";
    meterStatus.className = "profit-meter-status status-good";
  }

  // Competitor comparison
  const compBox = document.getElementById("competitorBox")!;
  if (inputs.competitorPrice > 0) {
    compBox.classList.add("visible");
    const diff = inputs.competitorPrice - recommended;
    const diffPct = Math.abs((diff / recommended) * 100).toFixed(1);
    let msg = "";
    if (diff < -recommended * 0.1) {
      msg = `Your recommended price of ${fmt(recommended)} is <strong>${diffPct}% higher</strong> than the competitor's ${fmt(inputs.competitorPrice)}. This may be intentional (premium positioning), but consider whether your value justifies the difference.`;
    } else if (diff > recommended * 0.1) {
      msg = `Your recommended price of ${fmt(recommended)} is <strong>${diffPct}% below</strong> the competitor's ${fmt(inputs.competitorPrice)}. You have room to price higher, so don't leave money on the table!`;
    } else {
      msg = `Your recommended price of ${fmt(recommended)} is closely aligned with the competitor's ${fmt(inputs.competitorPrice)}, meaning you're competitively priced while covering all your costs.`;
    }
    document.getElementById("compMsg")!.innerHTML = msg;
  } else {
    compBox.classList.remove("visible");
  }

  // Breakdown bars
  const maxAmt = Math.max(...result.breakdown.map(c => c.amount), 1);
  const barsEl = document.getElementById("breakdownBars")!;
  barsEl.innerHTML = result.breakdown.map((c, i) => `
    <div class="bar-row">
      <span class="bar-label">${iconString(getIconForLabel(c.label), 12)} ${c.label}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${(c.amount/maxAmt)*100}%;background:${BAR_COLORS[i % BAR_COLORS.length]};"></div>
      </div>
      <span class="bar-amount">${fmt(c.amount)}</span>
    </div>
  `).join("");

  // Show results
  document.getElementById("resultsPanel")!.classList.add("visible");
  document.getElementById("resultsPanel")!.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getIconForLabel(label: string): string {
  const map: Record<string, string> = {
    "Raw Materials": "leaf", "Packaging": "package", "Equipment": "wrench",
    "Overhead": "home", "Logistics": "truck", "Your Labour": "clock",
    "Staff": "users", "Savings": "piggy-bank", "Buffer": "shield", "Tax": "receipt",
  };
  return map[label] || "circle";
}

function getRuleInsight(inputs: CalcInputs, result: CalcResult): void {
  const insight = getRuleBasedInsight(inputs, result);
  document.getElementById("aiInsightText")!.innerHTML = parseMarkdown(insight);
}

async function getAIInsightAndDisplay(type: "insight" | "optimization" | "market"): Promise<void> {
  if (!lastResult || !lastInputs) return;

  const textEl = document.getElementById("aiInsightText")!;
  textEl.innerHTML = `<span class="ai-spinner"></span> Thinking…`;

  try {
    const aiResult = await getAIInsight(type, lastInputs, lastResult, getCurrency());
    textEl.innerHTML = parseMarkdown(aiResult);
  } catch {
    // Fallback to rule-based
    const insight = getRuleBasedInsight(lastInputs, lastResult);
    textEl.innerHTML = parseMarkdown(insight) + `<br><br><em style="font-size:0.78rem;color:var(--text-light);">(AI unavailable — showing smart estimate. Add an OpenRouter API key in .env for AI-powered insights.)</em>`;
  }
}

function saveCalculation(): void {
  if (!lastResult || !lastInputs) return;

  if (!store.isAuthenticated()) {
    showToast("Please sign in or sign up to save calculations");
    renderAuthModal();
    return;
  }

  const name = lastInputs.productName || `Product ${store.get().savedCalcs.length + 1}`;
  const calc: SavedCalc = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    date: new Date().toISOString(),
    productName: name,
    inputs: { ...lastInputs },
    result: { ...lastResult },
  };

  store.saveCalc(calc);
  showToast(`"${name}" saved successfully`);
}

function resetAll(): void {
  document.querySelectorAll(".input-field").forEach(f => {
    const field = f as HTMLInputElement;
    const id = field.id;
    if (id === "desiredMargin" || id === "contingency") {
      field.value = id === "desiredMargin" ? "25" : "5";
    } else if (id === "taxRate") {
      field.value = "";
    } else if (id === "unitsPerMonth" || id === "hoursPerUnit" || id === "tripsPerMonth") {
      field.value = "";
    } else {
      field.value = "";
    }
  });

  document.getElementById("resultsPanel")!.classList.remove("visible");
  document.getElementById("meterFill")!.style.width = "0%";
  lastResult = null;
}

export function cleanupCalculator(): void {
  lastResult = null;
}
