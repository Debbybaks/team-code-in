import { iconString, ICONS } from "../icons";

export function renderEmpowermentBanner(): void {
  const el = document.getElementById("bannerSection")!;
  el.innerHTML = `
    <div class="empowerment-banner">
      <h2>She Calculates. She Profits. She Grows.</h2>
      <p>SMLife was built for the woman who makes, creates, and delivers, to ensure that every product she sells is a step toward financial freedom rather than further into loss.</p>
      <button class="btn btn-rose btn-lg" id="bannerCalcBtn">${iconString(ICONS.calculator, 18)} Start Calculating Now</button>
    </div>
  `;

  document.getElementById("bannerCalcBtn")!.addEventListener("click", () => {
    document.getElementById("calcSection")?.scrollIntoView({ behavior: "smooth" });
  });
}
