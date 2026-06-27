import { iconString, ICONS } from "../icons";
import { store } from "../state";
import { navigate } from "../router";
import { showToast } from "../main";

export function renderAuthModal(): void {
  // Remove existing modal if any
  document.querySelector(".modal-overlay")?.remove();

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay open";
  overlay.id = "authModal";
  overlay.innerHTML = `
    <div class="modal">
      <button class="modal-close" id="authClose">${iconString(ICONS.close, 20)}</button>
      <h2>${iconString(ICONS.flower2, 24)} Welcome to SMLife</h2>
      <p class="subtitle">Sign in to save calculations, track history, and unlock AI insights.</p>

      <div class="auth-tabs">
        <button class="auth-tab active" data-authtab="signin">Sign In</button>
        <button class="auth-tab" data-authtab="signup">Sign Up</button>
      </div>

      <form class="auth-form" id="authForm">
        <div id="authFields">
          <div class="input-group" id="nameField" style="display:none;">
            <label class="input-label">${iconString(ICONS.profile, 14)} Your Name</label>
            <input class="input-field" type="text" id="authName" placeholder="e.g. Aisha Bello" />
          </div>
          <div class="input-group" id="businessField" style="display:none;">
            <label class="input-label">${iconString(ICONS.store, 14)} Business Name</label>
            <input class="input-field" type="text" id="authBusiness" placeholder="e.g. Aisha's Handmade" />
          </div>
          <div class="input-group">
            <label class="input-label">${iconString(ICONS.mail, 14)} Email</label>
            <input class="input-field" type="email" id="authEmail" placeholder="you@example.com" />
          </div>
          <div class="input-group">
            <label class="input-label">${iconString(ICONS.lock, 14)} Password</label>
            <input class="input-field" type="password" id="authPassword" placeholder="••••••••" />
          </div>
        </div>
        <button type="submit" class="auth-submit" id="authSubmit">Sign In</button>
      </form>

      <div class="auth-divider">Demo access</div>
      <p class="auth-mock-note">This is a demo app — no real account needed. Sign in with any name and email to explore the full experience. Your data is stored locally.</p>
    </div>
  `;

  document.body.appendChild(overlay);

  let isSignUp = false;

  // Tab switching
  document.querySelectorAll("[data-authtab]").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll("[data-authtab]").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      isSignUp = (tab as HTMLElement).dataset.authtab === "signup";
      document.getElementById("nameField")!.style.display = isSignUp ? "flex" : "none";
      document.getElementById("businessField")!.style.display = isSignUp ? "flex" : "none";
      document.getElementById("authSubmit")!.textContent = isSignUp ? "Create Account" : "Sign In";
    });
  });

  // Close handlers
  document.getElementById("authClose")!.addEventListener("click", closeAuthModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeAuthModal();
  });

  // Submit
  document.getElementById("authForm")!.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = (document.getElementById("authEmail") as HTMLInputElement).value.trim();
    const password = (document.getElementById("authPassword") as HTMLInputElement).value.trim();

    if (!email || !password) {
      showToast("Please fill in all required fields");
      return;
    }

    let name = email.split("@")[0];
    let business = "";

    if (isSignUp) {
      name = (document.getElementById("authName") as HTMLInputElement).value.trim() || name;
      business = (document.getElementById("authBusiness") as HTMLInputElement).value.trim() || `${name}'s Business`;
    } else {
      business = `${name}'s Business`;
    }

    store.signIn(name, email, business);
    closeAuthModal();
    showToast(`Welcome, ${name}!`);
    navigate("/dashboard");
  });
}

function closeAuthModal(): void {
  const modal = document.getElementById("authModal");
  if (modal) {
    modal.classList.remove("open");
    setTimeout(() => modal.remove(), 300);
  }
}
