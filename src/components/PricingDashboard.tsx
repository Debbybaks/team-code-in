import React, { useState, useCallback, useMemo } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { calculate } from "../pricing-engine";
import { iconString, ICONS } from "../icons";
import { store } from "../state";
import { setCurrency, getCurrency, fmt } from "../currency";
import { getRuleBasedInsight } from "../ai/client";
import { parseMarkdown } from "../markdown";
import type { CalcInputs, CalcResult, SavedCalc, CurrencyCode } from "../types";
import { renderAuthModal } from "./Auth";

const BAR_COLORS = ["#C9847A","#9B4DCA","#3D1A5E","#E67E22","#27AE60","#D4A853","#5C2E8A","#8BBFA3","#E8A89E","#F39C12"];

const ICON_MAP: Record<string, string> = {
  "Raw Materials": "leaf", "Packaging": "package", "Equipment": "wrench",
  "Overhead": "home", "Logistics": "truck", "Your Labour": "clock",
  "Staff": "users", "Savings": "piggy-bank", "Buffer": "shield", "Tax": "receipt",
};

const Icon = ({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) => {
  return (
    <span 
      className={`icon-span ${className}`} 
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", verticalAlign: "middle" }}
      dangerouslySetInnerHTML={{ __html: iconString(name, size) }} 
    />
  );
};

// We store inputs as strings to allow natural typing of decimals and zeros
type ReactInputs = Record<keyof CalcInputs, string>;

function getInitialInputs(): ReactInputs {
  const s = store.get().savedCalcs.find(c => c.id === store.get().activeCalcId);
  const base: CalcInputs = s ? { ...s.inputs } : {
    productName: "", rawMaterials: 0, packaging: 0, equipment: 0, unitsPerMonth: 1,
    rent: 0, electricity: 0, water: 0, internet: 0, marketing: 0, otherOverhead: 0,
    fuelPerTrip: 0, tripsPerMonth: 0, transportMarket: 0, courierFees: 0, stallFees: 0,
    myHourlyRate: 0, hoursPerUnit: 0, staffWages: 0, training: 0,
    desiredMargin: 25, competitorPrice: 0, savingsGoal: 0, contingency: 5, taxRate: 0,
  };
  
  if (s) {
    store.update({ activeCalcId: null });
  }

  const res = {} as ReactInputs;
  for (const [k, v] of Object.entries(base)) {
    res[k as keyof CalcInputs] = String(v);
  }
  return res;
}

export function PricingDashboard() {
  const [inputs, setInputs] = useState<ReactInputs>(getInitialInputs);
  const [activeTab, setActiveTab] = useState("production");
  const [currency, setCurr] = useState(getCurrency);
  const [showResults, setShowResults] = useState(false);
  const [insightText, setInsightText] = useState("Start filling in your costs to see your pricing insight.");

  // Parse string inputs to numbers for calculation
  const parsedInputs = useMemo((): CalcInputs => {
    const res = {} as CalcInputs;
    for (const [k, v] of Object.entries(inputs)) {
      if (k === "productName") {
        res[k] = v;
      } else if (k === "unitsPerMonth") {
        res[k] = Math.max(parseInt(v) || 1, 1);
      } else {
        res[k as Exclude<keyof CalcInputs, "productName">] = parseFloat(v) || 0;
      }
    }
    return res;
  }, [inputs]);

  const result: CalcResult = useMemo(() => calculate(parsedInputs), [parsedInputs]);
  const { totalCostPerUnit, breakeven, recommended, profitPerUnit, actualMargin, monthlyRevenue, monthlyProfit, breakdown } = result;

  const update = useCallback((patch: Partial<ReactInputs>) => {
    setInputs(prev => {
      const next = { ...prev, ...patch };
      // Also generate rule based insight in real-time
      const nextParsed = {} as CalcInputs;
      for (const [k, v] of Object.entries(next)) {
        if (k === "productName") {
          nextParsed[k] = v;
        } else if (k === "unitsPerMonth") {
          nextParsed[k] = Math.max(parseInt(v) || 1, 1);
        } else {
          nextParsed[k as Exclude<keyof CalcInputs, "productName">] = parseFloat(v) || 0;
        }
      }
      setInsightText(getRuleBasedInsight(nextParsed, calculate(nextParsed)));
      return next;
    });
  }, []);

  const handleNumChange = useCallback((field: keyof CalcInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    update({ [field]: e.target.value });
  }, [update]);

  const resetAll = useCallback(() => {
    setInputs(getInitialInputs());
    setShowResults(false);
  }, []);

  const handleCalculate = useCallback(() => {
    setShowResults(true);
    // Smooth scroll to results
    setTimeout(() => {
      const el = document.getElementById("resultsBreakdownHeader");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, []);

  const saveCalc = useCallback(() => {
    if (!store.isAuthenticated()) { renderAuthModal(); return; }
    const name = inputs.productName || `Product ${store.get().savedCalcs.length + 1}`;
    const calc: SavedCalc = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      date: new Date().toISOString(),
      productName: name,
      inputs: { ...parsedInputs },
      result: { ...result },
    };
    store.saveCalc(calc);
  }, [inputs, parsedInputs, result]);

  const handleCurrency = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value as CurrencyCode;
    setCurrency(code);
    setCurr(code);
    store.update({ currency: code });
  }, []);

  const tabs = [
    { id: "production", icon: "leaf", label: "Production" },
    { id: "overhead", icon: "home", label: "Overhead" },
    { id: "logistics", icon: "truck", label: "Logistics" },
    { id: "labour", icon: "clock", label: "Labour" },
    { id: "pricing", icon: "target", label: "Goals" },
  ];

  const meterPct = Math.min((actualMargin / 50) * 100, 100);
  let meterStatusLabel: string;
  let meterStatusClass: string;
  let meterGradient: string;
  if (actualMargin < 10) {
    meterStatusLabel = "At Risk";
    meterStatusClass = "status-bad";
    meterGradient = "linear-gradient(90deg,#E74C3C,#C0392B)";
  } else if (actualMargin < 25) {
    meterStatusLabel = "Could Improve";
    meterStatusClass = "status-ok";
    meterGradient = "linear-gradient(90deg,#F39C12,#E67E22)";
  } else {
    meterStatusLabel = "Healthy";
    meterStatusClass = "status-good";
    meterGradient = "linear-gradient(90deg,var(--mint-dark),var(--success))";
  }

  return (
    <>
      <div className="section" style={{ paddingTop: "1rem", paddingBottom: 0 }}>
        <p className="section-eyebrow"><Icon name={ICONS.sparkles} size={14} /> AI Smart Pricing Engine</p>
        <h2 className="section-title">Calculate Your True Product Price</h2>
        <p className="section-body">Enter your costs below, from raw materials to the fuel you burn on delivery runs. SMLife calculates your breakeven, recommended price, and profit health.</p>
      </div>

      <div className="calculator-section">
        <div className="calc-header">
          <div className="calc-icon-box"><Icon name={ICONS.calculator} size={22} /></div>
          <div className="calc-title-block">
            <h2>Pricing Calculator</h2>
            <p>Fill in each tab. The more detail you add, the more accurate your price</p>
          </div>
          <div className="calc-currency-wrap">
            <span>Currency:</span>
            <select id="calcCurrency" value={currency} onChange={handleCurrency}>
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

        <div className="product-name-input">
          <div className="input-group">
            <label className="input-label"><Icon name={ICONS.package} size={14} /> Product Name <span style={{ fontWeight: 400, color: "var(--text-light)" }}>(optional)</span></label>
            <input className="input-field" type="text" value={inputs.productName} onChange={e => update({ productName: e.target.value })} placeholder="e.g. Handmade Shea Butter" />
          </div>
        </div>

        <div className="tab-nav">
          {tabs.map(t => (
            <button key={t.id} className={`tab-btn${activeTab === t.id ? " active" : ""}`} onClick={() => setActiveTab(t.id)}>
              <Icon name={(ICONS as any)[t.icon]} size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* Production Tab */}
        {activeTab === "production" && (
          <div className="input-grid">
            <InputGroup icon="leaf" label="Raw Materials Cost" value={inputs.rawMaterials} onChange={handleNumChange("rawMaterials")} />
            <InputGroup icon="package" label="Packaging Cost (per unit)" value={inputs.packaging} onChange={handleNumChange("packaging")} />
            <InputGroup icon="wrench" label="Equipment / Tools Cost" value={inputs.equipment} onChange={handleNumChange("equipment")} />
            <div className="input-group">
              <label className="input-label"><Icon name={ICONS.factory} size={14} /> Units Produced per Month</label>
              <input className="input-field" type="text" value={inputs.unitsPerMonth} onChange={e => update({ unitsPerMonth: e.target.value })} placeholder="e.g. 50" />
            </div>
          </div>
        )}

        {/* Overhead Tab */}
        {activeTab === "overhead" && (
          <div className="input-grid">
            <InputGroup icon="home" label="Monthly Rent / Workspace" value={inputs.rent} onChange={handleNumChange("rent")} />
            <InputGroup icon="zap" label="Monthly Electricity Bill" value={inputs.electricity} onChange={handleNumChange("electricity")} />
            <InputGroup icon="droplet" label="Water / Utilities" value={inputs.water} onChange={handleNumChange("water")} />
            <InputGroup icon="smartphone" label="Internet / Phone / Software" value={inputs.internet} onChange={handleNumChange("internet")} />
            <InputGroup icon="megaphone" label="Monthly Marketing Spend" value={inputs.marketing} onChange={handleNumChange("marketing")} />
            <InputGroup icon="refreshCw" label="Other Monthly Overheads" value={inputs.otherOverhead} onChange={handleNumChange("otherOverhead")} />
          </div>
        )}

        {/* Logistics Tab */}
        {activeTab === "logistics" && (
          <div className="input-grid">
            <InputGroup icon="fuel" label="Fuel Cost per Delivery Trip" value={inputs.fuelPerTrip} onChange={handleNumChange("fuelPerTrip")} />
            <div className="input-group">
              <label className="input-label"><Icon name={ICONS.repeat} size={14} /> Delivery Trips per Month</label>
              <input className="input-field" type="text" value={inputs.tripsPerMonth} onChange={e => update({ tripsPerMonth: e.target.value })} placeholder="e.g. 10" />
            </div>
            <InputGroup icon="truck" label="Transport to Market / Supplier" value={inputs.transportMarket} onChange={handleNumChange("transportMarket")} />
            <InputGroup icon="mail" label="Courier / Delivery Fees (monthly)" value={inputs.courierFees} onChange={handleNumChange("courierFees")} />
            <InputGroup icon="store" label="Market Stall / Platform Fees" value={inputs.stallFees} onChange={handleNumChange("stallFees")} />
          </div>
        )}

        {/* Labour Tab */}
        {activeTab === "labour" && (
          <div className="input-grid">
            <InputGroup icon="clock" label="Your Hourly Rate (what you're worth)" value={inputs.myHourlyRate} onChange={handleNumChange("myHourlyRate")} />
            <div className="input-group">
              <label className="input-label"><Icon name={ICONS.timer} size={14} /> Hours per Unit to Produce</label>
              <input className="input-field" type="text" value={inputs.hoursPerUnit} onChange={e => update({ hoursPerUnit: e.target.value })} placeholder="e.g. 2" />
            </div>
            <InputGroup icon="users" label="Staff / Helper Wages (monthly)" value={inputs.staffWages} onChange={handleNumChange("staffWages")} />
            <InputGroup icon="graduationCap" label="Training / Upskilling (monthly)" value={inputs.training} onChange={handleNumChange("training")} />
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === "pricing" && (
          <div className="input-grid">
            <div className="input-group">
              <label className="input-label"><Icon name={ICONS.target} size={14} /> Desired Profit Margin (%)</label>
              <input className="input-field" type="text" value={inputs.desiredMargin} onChange={e => update({ desiredMargin: e.target.value })} placeholder="e.g. 30" />
            </div>
            <InputGroup icon="trendingUp" label="Competitor Price (optional)" value={inputs.competitorPrice} onChange={handleNumChange("competitorPrice")} />
            <InputGroup icon="piggyBank" label="Monthly Savings Goal" value={inputs.savingsGoal} onChange={handleNumChange("savingsGoal")} />
            <div className="input-group">
              <label className="input-label"><Icon name={ICONS.shield} size={14} /> Buffer / Contingency (%)</label>
              <input className="input-field" type="text" value={inputs.contingency} onChange={e => update({ contingency: e.target.value })} placeholder="e.g. 5" />
            </div>
            <div className="input-group">
              <label className="input-label"><Icon name={ICONS.receipt} size={14} /> Tax / VAT Rate (%)</label>
              <input className="input-field" type="text" value={inputs.taxRate} onChange={e => update({ taxRate: e.target.value })} placeholder="e.g. 7.5" />
            </div>
          </div>
        )}

        <div className="calc-actions">
          <button className="btn btn-primary btn-lg" onClick={handleCalculate}><Icon name={ICONS.calculator} size={18} /> Calculate My Price</button>
          <button className="btn btn-outline btn-lg" onClick={resetAll}><Icon name={ICONS.refreshCw} size={18} /> Reset All</button>
        </div>

        {/* Results */}
        <div id="resultsBreakdownHeader" className={`results-panel ${showResults ? "visible" : ""}`} style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--blush)", display: showResults ? "block" : "none" }}>
          <div className="results-header"><Icon name={ICONS.barChart3} size={14} /> Your Pricing Breakdown</div>

          <div className="profit-meter-wrap">
            <div className="profit-meter-header">
              <span className="profit-meter-label"><Icon name={ICONS.trendingUp} size={16} /> Profit Health Meter</span>
              <span className={`profit-meter-status ${meterStatusClass}`}>{meterStatusLabel}</span>
            </div>
            <div className="meter-track">
              <div className="meter-fill" style={{ width: `${meterPct}%`, background: meterGradient }}></div>
            </div>
            <div className="meter-labels">
              <span>0% margin</span><span>25% (healthy)</span><span>50%+</span>
            </div>
          </div>

          <div className="results-grid">
            <ResultCard label="Total Cost Per Unit" value={fmt(totalCostPerUnit)} sub="Everything included" />
            <ResultCard label="Breakeven Price" value={fmt(breakeven)} sub="Minimum to not lose money" />
            <ResultCard label="Recommended Price" value={fmt(recommended)} sub={`${actualMargin.toFixed(1)}% margin included`} highlight />
            <ResultCard label="Net Profit per Unit" value={fmt(profitPerUnit)} sub={`${actualMargin.toFixed(1)}% profit margin`} />
            <ResultCard label="Monthly Revenue (est.)" value={fmt(monthlyRevenue)} sub={`${parsedInputs.unitsPerMonth} units/mo at recommended price`} />
            <ResultCard label="Monthly Net Profit (est.)" value={fmt(monthlyProfit)} sub="After all costs" />
          </div>

          {parsedInputs.competitorPrice > 0 && (
            <div className="competitor-box visible">
              <div className="competitor-box-title"><Icon name={ICONS.trendingUp} size={14} /> Competitor Comparison</div>
              <div className="competitor-msg" dangerouslySetInnerHTML={{ __html: compMsg(parsedInputs.competitorPrice, recommended) }} />
            </div>
          )}

          <div className="breakdown-section">
            <p className="breakdown-title"><Icon name={ICONS.list} size={14} /> Cost Breakdown by Category</p>
            <div className="breakdown-bars">
              {breakdown.map((c, i) => {
                const maxAmt = Math.max(...breakdown.map(b => b.amount), 1);
                return (
                  <div className="bar-row" key={c.label}>
                    <span className="bar-label"><Icon name={(ICONS as any)[ICON_MAP[c.label] || "circle"]} size={12} /> {c.label}</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${(c.amount / maxAmt) * 100}%`, background: BAR_COLORS[i % BAR_COLORS.length] }}></div>
                    </div>
                    <span className="bar-amount">{fmt(c.amount)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="ai-insight">
            <div className="ai-insight-header">
              <div className="ai-insight-avatar"><Icon name={ICONS.sparkles} size={16} /></div>
              <span className="ai-insight-title">AI Pricing Insight <span style={{ fontSize: "0.7rem", fontWeight: 600, padding: "0.1rem 0.35rem", borderRadius: 10, background: "rgba(224,86,118,0.12)", color: "var(--rose)", marginLeft: "0.4rem", display: "inline-block", verticalAlign: "middle" }}>₦1,200/mo</span></span>
            </div>
            <div className="ai-insight-text" dangerouslySetInnerHTML={{ __html: parseMarkdown(insightText) }} />
            <div className="ai-insight-actions">
              <button className="btn btn-sm btn-ghost" onClick={saveCalc}><Icon name={ICONS.download} size={14} /> Save</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InputGroup({ icon, label, value, onChange }: { icon: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  const sym = getCurrency() === "NGN" ? "₦" : getCurrency() === "USD" ? "$" : getCurrency() === "GBP" ? "£" : "€";
  return (
    <div className="input-group">
      <label className="input-label"><Icon name={(ICONS as any)[icon]} size={14} /> {label}</label>
      <div className="input-prefix">
        <span className="prefix-symbol">{sym}</span>
        <input className="input-field" type="text" value={value === "0" ? "" : value} onChange={onChange} placeholder="0.00" />
      </div>
    </div>
  );
}

function ResultCard({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className={`result-card${highlight ? " highlight" : ""}`}>
      <div className="result-label">{label}</div>
      <div className="result-value">{value}</div>
      <div className="result-sub">{sub}</div>
    </div>
  );
}

function compMsg(competitorPrice: number, recommended: number): string {
  const diff = competitorPrice - recommended;
  const diffPct = Math.abs((diff / recommended) * 100).toFixed(1);
  if (diff < -recommended * 0.1) {
    return `Your recommended price of ${fmt(recommended)} is <strong>${diffPct}% higher</strong> than the competitor's ${fmt(competitorPrice)}. This may be intentional (premium positioning), but consider whether your value justifies the difference.`;
  } else if (diff > recommended * 0.1) {
    return `Your recommended price of ${fmt(recommended)} is <strong>${diffPct}% below</strong> the competitor's ${fmt(competitorPrice)}. You have room to price higher, so don't leave money on the table!`;
  }
  return `Your recommended price of ${fmt(recommended)} is closely aligned with the competitor's ${fmt(competitorPrice)}, meaning you're competitively priced while covering all your costs.`;
}

let reactRoot: Root | null = null;

export function renderReactCalculator(): void {
  const el = document.getElementById("calcSection");
  if (!el) return;
  const root = createRoot(el);
  reactRoot = root;
  root.render(<PricingDashboard />);
}

export function unmountReactCalculator(): void {
  if (reactRoot) {
    reactRoot.unmount();
    reactRoot = null;
  }
}
