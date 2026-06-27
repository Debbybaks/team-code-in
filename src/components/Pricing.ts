import { iconString, ICONS } from "../icons";
import { store } from "../state";
import { showToast } from "../main";

export function renderPricingSection(containerId = "pricingSection"): void {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = `
    <div style="background:var(--bg-light);padding:4rem 1.25rem;" id="pricingWrap">
      <div class="section" style="padding:0 0 2.5rem;">
        <p class="section-eyebrow">${iconString(ICONS.sparkles, 14)} Choose Your Plan</p>
        <h2 class="section-title">Invest in Your Business Growth</h2>
        <p class="section-body" style="max-width:600px;margin:0.5rem auto 0;">Scale up with AI-powered pricing strategies and direct business coaching built to maximize your profits.</p>
      </div>
      
      ${renderPricingCards()}
    </div>
  `;

  bindPricingEvents();
}

export function renderPricingPage(): void {
  const el = document.getElementById("pricingPage")!;
  if (!el) return;

  el.innerHTML = `
    <div class="pricing-page page" style="padding:2rem 1.25rem 4rem;">
      <div class="section" style="padding:0 0 3rem;">
        <p class="section-eyebrow">${iconString(ICONS.sparkles, 14)} Premium Plans</p>
        <h2 class="section-title">Upgrade to SMLife Premium</h2>
        <p class="section-body" style="max-width:600px;margin:0.5rem auto 0;">Unlock advanced competitor analysis and the full power of your AI Pricing Coach.</p>
      </div>

      ${renderPricingCards()}
    </div>
  `;

  bindPricingEvents();
}

function renderPricingCards(): string {
  return `
    <style>
      .pricing-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        max-width: 900px;
        margin: 0 auto;
        padding: 0 1rem;
      }
      .pricing-card {
        background: var(--white);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 2.5rem 2rem;
        position: relative;
        display: flex;
        flex-direction: column;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(0,0,0,0.02);
      }
      .pricing-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 20px rgba(0,0,0,0.05);
      }
      .pricing-card.premium {
        border-color: var(--rose);
        background: linear-gradient(180deg, var(--white), #FFF5F7);
      }
      .pricing-card.premium::after {
        content: "MOST POPULAR";
        position: absolute;
        top: 1rem;
        right: 1.5rem;
        background: var(--rose);
        color: var(--white);
        font-size: 0.65rem;
        font-weight: 700;
        padding: 0.25rem 0.6rem;
        border-radius: 20px;
        letter-spacing: 0.05em;
      }
      .pricing-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-dark);
        margin-bottom: 0.5rem;
      }
      .pricing-price {
        font-size: 2.25rem;
        font-weight: 800;
        color: var(--text-dark);
        margin: 1rem 0;
        display: flex;
        align-items: baseline;
        gap: 0.25rem;
      }
      .pricing-price span {
        font-size: 0.875rem;
        color: var(--text-light);
        font-weight: 400;
      }
      .pricing-desc {
        color: var(--text-light);
        font-size: 0.875rem;
        line-height: 1.4;
        margin-bottom: 2rem;
        min-height: 40px;
      }
      .pricing-features {
        list-style: none;
        padding: 0;
        margin: 0 0 2.5rem 0;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        flex-grow: 1;
      }
      .pricing-features li {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.875rem;
        color: var(--text-medium);
      }
      .pricing-features li svg {
        flex-shrink: 0;
      }
      .pricing-features li.disabled {
        color: var(--text-light);
        text-decoration: line-through;
      }
      .pricing-features li.disabled svg {
        opacity: 0.4;
      }
      .pricing-btn {
        width: 100%;
        padding: 0.875rem;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
      }
      /* Custom Modal Styles */
      .pricing-modal {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(61, 26, 94, 0.4);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      .pricing-modal.open {
        opacity: 1;
        pointer-events: auto;
      }
      .pricing-modal-content {
        background: var(--white);
        border-radius: 20px;
        width: 90%;
        max-width: 440px;
        padding: 2rem;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
        transform: scale(0.95);
        transition: transform 0.3s ease;
        text-align: center;
      }
      .pricing-modal.open .pricing-modal-content {
        transform: scale(1);
      }
    </style>

    <div class="pricing-grid">
      <!-- Free Plan -->
      <div class="pricing-card">
        <div class="pricing-title">Standard Free</div>
        <div class="pricing-price">₦0 <span>/ month</span></div>
        <div class="pricing-desc">Essential product cost calculations for early-stage entrepreneurs.</div>
        <ul class="pricing-features">
          <li>${iconString(ICONS.check, 16, "color:var(--success)")} Complete 5-tab pricing calculator</li>
          <li>${iconString(ICONS.check, 16, "color:var(--success)")} Local calculation cost breakdown</li>
          <li>${iconString(ICONS.check, 16, "color:var(--success)")} Static Rule-Based estimates</li>
          <li class="disabled">${iconString(ICONS.close, 16, "color:var(--text-light)")} Save calculations to history</li>
          <li class="disabled">${iconString(ICONS.close, 16, "color:var(--text-light)")} Unlimited AI pricing insights</li>
          <li class="disabled">${iconString(ICONS.close, 16, "color:var(--text-light)")} AI Pricing Coach Chat Panel</li>
          <li class="disabled">${iconString(ICONS.close, 16, "color:var(--text-light)")} Competitor comparison reports</li>
        </ul>
        <button class="btn btn-outline pricing-btn" id="freePlanBtn" disabled>Your Current Plan</button>
      </div>

      <!-- Premium Plan -->
      <div class="pricing-card premium">
        <div class="pricing-title">AI Premium</div>
        <div class="pricing-price">₦1,200 <span>/ month</span></div>
        <div class="pricing-desc">Unleash the full potential of your business with interactive AI assistance and deep analytics.</div>
        <ul class="pricing-features">
          <li>${iconString(ICONS.check, 16, "color:var(--rose)")} Everything in Standard Free</li>
          <li>${iconString(ICONS.check, 16, "color:var(--rose)")} <strong>Save Unlimited Products</strong> to Cloud</li>
          <li>${iconString(ICONS.check, 16, "color:var(--rose)")} <strong>AI Pricing Coach Chat Panel</strong></li>
          <li>${iconString(ICONS.check, 16, "color:var(--rose)")} <strong>AI-Powered Insights</strong> on margins</li>
          <li>${iconString(ICONS.check, 16, "color:var(--rose)")} <strong>Cost Optimization</strong> recommendations</li>
          <li>${iconString(ICONS.check, 16, "color:var(--rose)")} Detailed Competitor Benchmarking</li>
        </ul>
        <button class="btn btn-rose pricing-btn" id="premiumPlanBtn">
          Upgrade to Premium
        </button>
      </div>
    </div>

    <!-- Upgrade Custom Checkout Modal -->
    <div class="pricing-modal" id="checkoutModal">
      <div class="pricing-modal-content">
        <h3 style="margin-bottom:0.5rem;font-size:1.4rem;color:var(--text-dark);">${iconString(ICONS.sparkles, 24, "color:var(--rose)")}<br>SMLife Premium Checkout</h3>
        <p style="color:var(--text-light);font-size:0.875rem;margin-bottom:1.5rem;">Simulated Sandbox checkout for <strong>AI Premium (₦1,200/month)</strong>.</p>
        
        <div style="background:var(--bg-light);border-radius:12px;padding:1rem;margin-bottom:1.5rem;text-align:left;">
          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;font-size:0.875rem;">
            <span>Plan:</span><strong style="color:var(--text-dark);">AI Premium</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.875rem;">
            <span>Recurring Price:</span><strong style="color:var(--text-dark);">₦1,200/mo</strong>
          </div>
        </div>

        <div style="display:flex;gap:0.75rem;">
          <button class="btn btn-outline" style="flex:1;" id="cancelCheckoutBtn">Cancel</button>
          <button class="btn btn-rose" style="flex:1;" id="confirmCheckoutBtn">Pay & Upgrade</button>
        </div>
      </div>
    </div>
  `;
}

function bindPricingEvents(): void {
  const premiumBtn = document.getElementById("premiumPlanBtn");
  const modal = document.getElementById("checkoutModal");
  const cancelBtn = document.getElementById("cancelCheckoutBtn");
  const confirmBtn = document.getElementById("confirmCheckoutBtn");

  if (premiumBtn && modal) {
    premiumBtn.addEventListener("click", () => {
      // Must be authenticated to upgrade
      if (!store.isAuthenticated()) {
        showToast("Please sign in or sign up first to upgrade");
        // Trigger auth modal
        const authBtn = document.getElementById("authDesktopBtn");
        if (authBtn) authBtn.click();
        return;
      }
      modal.classList.add("open");
    });
  }

  if (cancelBtn && modal) {
    cancelBtn.addEventListener("click", () => {
      modal.classList.remove("open");
    });
  }

  if (confirmBtn && modal) {
    confirmBtn.addEventListener("click", () => {
      modal.classList.remove("open");
      showToast("Success! Upgraded to AI Premium.");
    });
  }
}
