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
          Calculate your true product price with AI — surfacing hidden costs like fuel, electricity, packaging, and your time — so you price confidently and profitably.
        </p>

        <div class="hero-cta">
          <button class="btn-primary btn-lg" id="heroCalcBtn">${iconString(ICONS.calculator, 18)} Calculate My Price</button>
          <button class="btn-ghost btn-lg" id="heroDashboardBtn">${iconString(ICONS.dashboard, 18)} View Dashboard</button>
        </div>

      <div class="scroll-hint">Scroll to begin</div>
    </section>
  `;

  document.getElementById("heroCalcBtn")!.addEventListener("click", () => {
    if (window.location.hash === "#/" || window.location.hash === "") {
      document.getElementById("calcSection")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document.getElementById("calcSection")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  });

  document.getElementById("heroDashboardBtn")!.addEventListener("click", () => {
    navigate("/dashboard");
  });
}
