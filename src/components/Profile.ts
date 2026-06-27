import { iconString, ICONS } from "../icons";
import { store } from "../state";
import { allCurrencies, setCurrency, getCurrency } from "../currency";
import { navigate } from "../router";
import { showToast } from "../main";
import type { CurrencyCode } from "../types";

export function renderProfile(): void {
  const el = document.getElementById("profilePage")!;
  const user = store.get().user;
  if (!user) { navigate("/"); return; }

  el.innerHTML = `
    <div class="profile-page page">
      <div class="profile-avatar">${iconString(ICONS.profile, 32)}</div>
      <div class="profile-name">${user.name}</div>
      <div class="profile-email">${user.email}</div>

      <div class="profile-section">
        <h3>${iconString(ICONS.profile, 16)} Account</h3>
        <div class="profile-field">
          <span class="profile-field-label">Name</span>
          <span class="profile-field-value" id="profName">${user.name}</span>
        </div>
        <div class="profile-field">
          <span class="profile-field-label">Email</span>
          <span class="profile-field-value">${user.email}</span>
        </div>
        <div class="profile-field">
          <span class="profile-field-label">Business</span>
          <span class="profile-field-value">${user.businessName}</span>
        </div>
      </div>

      <div class="profile-section">
        <h3>${iconString(ICONS.settings, 16)} Preferences</h3>
        <div class="profile-field">
          <span class="profile-field-label">Default Currency</span>
          <span class="profile-field-value">
            <select id="profileCurrency" style="border:1.5px solid #EDE0F5;border-radius:8px;padding:0.3rem 0.5rem;font-size:0.8rem;color:var(--text-mid);outline:none;">
              ${allCurrencies().map(c => `
                <option value="${c.code}" ${c.code === getCurrency() ? "selected" : ""}>${c.symbol} ${c.code}</option>
              `).join("")}
            </select>
          </span>
        </div>
      </div>

      <div class="profile-section">
        <h3>${iconString(ICONS.info, 16)} About</h3>
        <div class="profile-field">
          <span class="profile-field-label">Version</span>
          <span class="profile-field-value">2.0.0</span>
        </div>
        <div class="profile-field">
          <span class="profile-field-label">Data Storage</span>
          <span class="profile-field-value" style="color:var(--text-light);font-size:0.76rem;">Local browser only</span>
        </div>
      </div>

      <button class="btn btn-danger btn-md" id="signOutBtn" style="width:100%;margin-top:0.5rem;">
        ${iconString(ICONS.signOut, 18)} Sign Out
      </button>
    </div>
  `;

  document.getElementById("profileCurrency")!.addEventListener("change", (e) => {
    const code = (e.target as HTMLSelectElement).value as CurrencyCode;
    setCurrency(code);
    store.update({ currency: code });
    showToast(`Currency changed to ${code}`);
  });

  document.getElementById("signOutBtn")!.addEventListener("click", () => {
    store.signOut();
    showToast("Signed out");
    navigate("/");
  });
}
