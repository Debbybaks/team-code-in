export function renderFooter(): void {
  const el = document.getElementById("footerSection")!;
  el.innerHTML = `
    <footer>
      <p>Built with purpose for <strong>women-led SMEs across Africa and beyond</strong> · SMLife AI Smart Pricing Assistant</p>
      <p style="margin-top:0.35rem;font-size:0.72rem;opacity:0.5;">Empowering women entrepreneurs through intelligent, inclusive financial tools · SME Growth Track</p>
    </footer>
  `;
}
