import { iconString, ICONS } from "../icons";

export function renderFeatures(): void {
  const el = document.getElementById("featuresSection")!;
  el.innerHTML = `
    <div class="features-bg">
      <div class="section" style="padding-bottom:1.5rem;">
        <p class="section-eyebrow">${iconString(ICONS.sparkles, 14)} What Makes SMLife Different</p>
        <h2 class="section-title">Every Cost Counted. Every Woman Supported.</h2>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon-box" style="background:linear-gradient(135deg,#F7D6D0,#FBBAB4);">
            ${iconString(ICONS.search, 22)}
          </div>
          <h3>Hidden Cost Detection</h3>
          <p>We surface costs most women forget, including fuel, electricity, rent per unit, and your own time, so your price is never built on a lie.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon-box" style="background:linear-gradient(135deg,#D4EDE1,#A8D8BE);">
            ${iconString(ICONS.barChart3, 22)}
          </div>
          <h3>Profit Health Meter</h3>
          <p>A live visual indicator shows whether your pricing is healthy, borderline, or dangerously low at a glance.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon-box" style="background:linear-gradient(135deg,#E8D5F5,#C9A0F0);">
            ${iconString(ICONS.sparkles, 22)}
          </div>
          <h3>AI-Powered Insights <span style="font-size:0.75rem;font-weight:600;padding:0.15rem 0.4rem;border-radius:12px;background:rgba(224,86,118,0.12);color:var(--rose);margin-left:0.5rem;display:inline-block;vertical-align:middle;">₦2,400/mo</span></h3>
          <p>Get personalised pricing strategy, cost optimization tips, and market context, powered by AI instead of generic rules.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon-box" style="background:linear-gradient(135deg,#FFF8E1,#FFE57F);">
            ${iconString(ICONS.target, 22)}
          </div>
          <h3>Goal-Based Pricing</h3>
          <p>Set your desired margin, savings goal, and contingency buffer. The engine works backwards to give you the right price.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon-box" style="background:linear-gradient(135deg,#E3F2FD,#90CAF9);">
            ${iconString(ICONS.trendingUp, 22)}
          </div>
          <h3>Competitor Benchmarking</h3>
          <p>Enter a competitor's price and we'll tell you if you're undercharging, overcharging, or right on target, with AI-powered context.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon-box" style="background:linear-gradient(135deg,#FCE4EC,#F48FB1);">
            ${iconString(ICONS.globe, 22)}
          </div>
          <h3>Multi-Currency Support</h3>
          <p>Works in Naira, USD, GBP, Kenyan Shilling, Ghanaian Cedi, and more, built for African and global women entrepreneurs.</p>
        </div>
      </div>
    </div>
  `;
}
