import { iconString, ICONS } from "../icons";
import { navigate } from "../router";

export function renderHero(): void {
  const el = document.getElementById("heroSection")!;
  el.innerHTML = `
    <section class="hero" id="heroEl">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="orb orb-4"></div>

      <div class="hero-badge">${iconString(ICONS.sparkles, 14)} Powered by AI · Built for Women-Led SMEs</div>

      <h1 class="hero-logo">SM<span>Life</span></h1>

      <p class="hero-tagline">
        The AI Smart Pricing Assistant that calculates every hidden cost,
        from fuel to packaging, so you never undersell yourself again.
      </p>

      <div class="hero-cta">
        <button class="btn-primary" id="heroCalcBtn">${iconString(ICONS.calculator, 18)} Get Started</button>
        <button class="btn-ghost" id="heroDashboardBtn">${iconString(ICONS.dashboard, 18)} Dashboard</button>
      </div>

      <div class="scroll-hint">Scroll to begin</div>
    </section>
  `;

  document.getElementById("heroCalcBtn")!.addEventListener("click", () => {
    document.getElementById("calcSection")?.scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("heroDashboardBtn")!.addEventListener("click", () => {
    navigate("/dashboard");
  });
}
