import { iconString, ICONS } from "../icons";
import { store } from "../state";
import { fmt, fmtCompact } from "../currency";
import { navigate } from "../router";
import { renderCalculator } from "./Calculator";
import { showToast } from "../main";

export function renderDashboard(): void {
  const el = document.getElementById("dashboardPage")!;
  const state = store.get();
  const user = state.user;
  const calcs = state.savedCalcs;

  const avgMargin = calcs.length > 0
    ? calcs.reduce((sum, c) => sum + c.result.actualMargin, 0) / calcs.length
    : 0;
  const totalMonthlyProfit = calcs.reduce((sum, c) => sum + c.result.monthlyProfit, 0);

  el.innerHTML = `
    <div class="dashboard page">
      <div class="dashboard-header">
        <div class="dashboard-welcome">Welcome back, ${user?.name?.split(" ")[0] || "Entrepreneur"} 👋</div>
        <div class="dashboard-sub">${user?.businessName || "Your Business"} · ${calcs.length} saved product${calcs.length !== 1 ? "s" : ""}</div>
      </div>

      <div class="dashboard-stats">
        <div class="dashboard-stat-card">
          <div class="dashboard-stat-value">${calcs.length}</div>
          <div class="dashboard-stat-label">Products Saved</div>
        </div>
        <div class="dashboard-stat-card">
          <div class="dashboard-stat-value">${avgMargin > 0 ? avgMargin.toFixed(1) + "%" : "—"}</div>
          <div class="dashboard-stat-label">Avg. Profit Margin</div>
        </div>
        <div class="dashboard-stat-card">
          <div class="dashboard-stat-value">${totalMonthlyProfit > 0 ? fmtCompact(totalMonthlyProfit) : "—"}</div>
          <div class="dashboard-stat-label">Total Monthly Profit</div>
        </div>
      </div>

      <div class="dashboard-section-title">
        <span>${iconString(ICONS.history, 18)} Recent Calculations</span>
        <button class="btn btn-sm btn-ghost" id="viewAllBtn">View All ${iconString(ICONS.arrowRight, 14)}</button>
      </div>

      <div id="dashboardCalcList">
        ${calcs.length === 0 ? renderEmptyState() : renderCalcList(calcs.slice(0, 5))}
      </div>

      <div style="margin-top:1.5rem;display:flex;gap:0.75rem;flex-wrap:wrap;margin-bottom:2rem;">
        <button class="btn btn-rose btn-md" id="dashCoachBtn">${iconString(ICONS.sparkles, 18)} Open AI Coach</button>
      </div>

      <div id="calcSection"></div>
    </div>
  `;

  // Render the ported calculator
  renderCalculator();

  document.getElementById("viewAllBtn")!.addEventListener("click", () => navigate("/history"));
  
  document.getElementById("dashCoachBtn")!.addEventListener("click", () => {
    const toggle = document.getElementById("coachToggle");
    if (toggle) toggle.click();
  });

  // Bind empty state button
  document.getElementById("emptyCalcBtn")?.addEventListener("click", () => {
    document.getElementById("calcSection")?.scrollIntoView({ behavior: "smooth" });
  });

  // Bind delete buttons
  document.querySelectorAll("#dashboardCalcList [data-delete-id]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.deleteId!;
      store.deleteCalc(id);
      showToast("Calculation deleted");
      renderDashboard();
    });
  });

  // Bind item clicks to load calculation
  document.querySelectorAll("#dashboardCalcList [data-calc-id]").forEach(item => {
    item.addEventListener("click", () => {
      const id = (item as HTMLElement).dataset.calcId;
      if (id) {
        store.update({ activeCalcId: id });
        renderCalculator();
        document.getElementById("calcSection")?.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

function renderEmptyState(): string {
  return `
    <div class="empty-state">
      ${iconString(ICONS.barChart3, 40)}
      <p>No products saved yet. Calculate your first price and save it to track your profits.</p>
      <button class="btn btn-primary btn-sm" id="emptyCalcBtn">${iconString(ICONS.calculator, 16)} Calculate a Price</button>
    </div>
  `;
}

function renderCalcList(calcs: import("../types").SavedCalc[]): string {
  return `<div class="calc-history-list">
    ${calcs.map(c => {
      const margin = c.result.actualMargin;
      const marginClass = margin < 10 ? "status-bad" : margin < 20 ? "status-ok" : "status-good";
      return `
        <div class="calc-history-item" data-calc-id="${c.id}">
          <div class="calc-history-info">
            <div class="calc-history-name">${iconString(ICONS.package, 14)} ${c.productName}</div>
            <div class="calc-history-meta">
              <span>${fmt(c.result.recommended)}/unit</span>
              <span class="margin-badge ${marginClass}">${margin.toFixed(1)}%</span>
              <span>${timeAgo(c.date)}</span>
            </div>
          </div>
          <button class="calc-history-delete" data-delete-id="${c.id}">${iconString(ICONS.trash, 16)}</button>
        </div>
      `;
    }).join("")}
  </div>`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function cleanupDashboard(): void {
  // no-op
}
