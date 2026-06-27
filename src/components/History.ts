import { iconString, ICONS } from "../icons";
import { store } from "../state";
import { fmt } from "../currency";
import { navigate } from "../router";
import { showToast } from "../main";

export function renderHistory(): void {
  const el = document.getElementById("historyPage")!;
  const calcs = store.get().savedCalcs;

  el.innerHTML = `
    <div class="dashboard page">
      <div class="dashboard-header">
        <div class="dashboard-welcome">${iconString(ICONS.history, 22)} Saved Calculations</div>
        <div class="dashboard-sub">${calcs.length} product${calcs.length !== 1 ? "s" : ""} · Sorted by newest</div>
      </div>

      ${calcs.length === 0 ? renderEmpty() : renderList(calcs)}

      <div style="margin-top:1.5rem;display:flex;gap:0.75rem;flex-wrap:wrap;">
        <button class="btn btn-primary btn-md" id="historyNewCalc">${iconString(ICONS.plus, 18)} New Calculation</button>
        ${calcs.length > 0 ? `<button class="btn btn-outline btn-md" id="clearAllBtn">${iconString(ICONS.trash, 18)} Clear All</button>` : ""}
      </div>
    </div>
  `;

  document.getElementById("historyNewCalc")?.addEventListener("click", () => navigate("/"));

  const clearBtn = document.getElementById("clearAllBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Clear all saved calculations? This cannot be undone.")) {
        store.clearCalcs();
        showToast("All calculations cleared");
        renderHistory();
      }
    });
  }

  // Bind delete buttons
  document.querySelectorAll("[data-delete-id]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.deleteId!;
      store.deleteCalc(id);
      showToast("Calculation deleted");
      renderHistory();
    });
  });

  // Bind item clicks
  document.querySelectorAll("[data-calc-id]").forEach(item => {
    item.addEventListener("click", () => {
      const id = (item as HTMLElement).dataset.calcId;
      if (id) {
        navigate("/");
        // Load inputs into calculator — store active calc for loading
        store.update({ activeCalcId: id });
      }
    });
  });
}

function renderEmpty(): string {
  return `
    <div class="empty-state">
      ${iconString(ICONS.history, 48)}
      <p>No saved calculations yet. Start by pricing your first product!</p>
    </div>
  `;
}

function renderList(calcs: import("../types").SavedCalc[]): string {
  return `<div class="calc-history-list">
    ${calcs.map(c => {
      const margin = c.result.actualMargin;
      const marginClass = margin < 10 ? "status-bad" : margin < 20 ? "status-ok" : "status-good";
      const date = new Date(c.date);
      return `
        <div class="calc-history-item" data-calc-id="${c.id}">
          <div class="calc-history-info">
            <div class="calc-history-name">${iconString(ICONS.package, 14)} ${c.productName}</div>
            <div class="calc-history-meta">
              <span>${fmt(c.result.recommended)}/unit</span>
              <span style="font-weight:700;color:var(--text-dark);">${fmt(c.result.totalCostPerUnit)} cost</span>
              <span class="margin-badge ${marginClass}">${margin.toFixed(1)}% margin</span>
              <span>${date.toLocaleDateString()}</span>
            </div>
          </div>
          <button class="calc-history-delete" data-delete-id="${c.id}">${iconString(ICONS.trash, 16)}</button>
        </div>
      `;
    }).join("")}
  </div>`;
}
