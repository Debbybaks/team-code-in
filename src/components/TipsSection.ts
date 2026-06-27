import { iconString, ICONS } from "../icons";

export function renderTipsSection(): void {
  const el = document.getElementById("tipsSection")!;
  el.innerHTML = `
    <div style="background:var(--white);padding:3rem 1.25rem;" id="tipsWrap">
      <div class="section" style="padding:0 0 1.5rem;">
        <p class="section-eyebrow">${iconString(ICONS.lightbulb, 14)} Smart Pricing Tips</p>
        <h2 class="section-title">Wisdom for Women Who Mean Business</h2>
      </div>
      <div class="tips-grid">
        <div class="tip-card">
          <h4>${iconString(ICONS.truck, 18)} The True Cost of "Free Delivery"</h4>
          <p>When you offer free delivery, <em>you</em> pay for it. Fuel, time, and vehicle wear are real costs. Add them to your product price or charge separately rather than absorbing them silently.</p>
        </div>
        <div class="tip-card tip-card-2">
          <h4>${iconString(ICONS.home, 18)} Split Overhead by Units</h4>
          <p>Divide your monthly rent, electricity, and water by units produced. If you make 50 items and rent is ₦50,000/month, each item carries ₦1,000 of overhead, which you must recover.</p>
        </div>
        <div class="tip-card tip-card-3">
          <h4>${iconString(ICONS.piggyBank, 18)} Pay Yourself First</h4>
          <p>Your time is a cost. Set an hourly rate for yourself, even a modest one, and include it in every unit. If the business can't afford to pay you, the price needs to go up.</p>
        </div>
        <div class="tip-card tip-card-4">
          <h4>${iconString(ICONS.package, 18)} Packaging Is Not Optional</h4>
          <p>Boxes, bags, labels, tissue paper, and tape, so remember to calculate packaging per unit, not in bulk. A beautiful package increases perceived value and can justify a higher price point.</p>
        </div>
        <div class="tip-card tip-card-5">
          <h4>${iconString(ICONS.shield, 18)} Build In a Buffer</h4>
          <p>Add a 5–10% contingency to every price. Prices rise, suppliers change, unexpected costs happen. A buffer means you never suddenly make a loss because fuel went up.</p>
        </div>
        <div class="tip-card tip-card-6">
          <h4>${iconString(ICONS.trendingUp, 18)} Review Prices Quarterly</h4>
          <p>Costs change every 3 months, including raw materials, fuel, and utilities. A price set in January may lose you money by April. Set a reminder to recalculate every quarter.</p>
        </div>
      </div>
    </div>
  `;
}
