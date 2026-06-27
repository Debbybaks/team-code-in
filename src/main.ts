import "./styles/main.css";
import { startRouter, onRoute, navigate } from "./router";
import { store } from "./state";
import { setCurrency } from "./currency";
import type { Route } from "./types";
import { iconString, ICONS } from "./icons";
import { initAllAnimations } from "./animations";
import { renderHero } from "./components/Hero";
import { renderFeatures } from "./components/Features";
import { renderTipsSection } from "./components/TipsSection";
import { renderEmpowermentBanner } from "./components/EmpowermentBanner";
import { renderFooter } from "./components/Footer";
import { renderCalculator, cleanupCalculator } from "./components/Calculator";
import { renderDashboard, cleanupDashboard } from "./components/Dashboard";
import { renderHistory } from "./components/History";
import { renderProfile } from "./components/Profile";
import { renderAuthModal } from "./components/Auth";
import { renderPricingSection, renderPricingPage } from "./components/Pricing";
import { renderAICoach, cleanupAICoach } from "./components/AICoach";

const app = document.getElementById("app")!;

/* ── Bootstrap ── */
function bootstrap(): void {
  // Restore currency from state
  setCurrency(store.get().currency);

  // Build shell
  app.innerHTML = `
    <nav class="top-nav" id="topNav">
      <div class="nav-brand" id="navBrand">SM<span>Life</span></div>
      <div class="nav-desktop" id="navDesktop">
        <button class="nav-link" data-route="/">${iconString(ICONS.calculator, 16)} Calculator</button>
        <button class="nav-link" data-route="/dashboard">${iconString(ICONS.dashboard, 16)} Dashboard</button>
        <button class="nav-link" data-route="/history">${iconString(ICONS.history, 16)} History</button>
        <button class="nav-link" data-route="/pricing">${iconString(ICONS.sparkles, 16)} Pricing</button>
        <button id="authDesktopBtn" class="nav-btn nav-btn-primary">${iconString(ICONS.signIn, 16)} Sign In</button>
      </div>
      <button class="nav-hamburger" id="hamburgerBtn">${iconString(ICONS.menu, 24)}</button>
    </nav>

    <div class="drawer-overlay" id="drawerOverlay"></div>
    <div class="drawer" id="drawer">
      <div class="drawer-header">
        <span class="nav-brand">SM<span>Life</span></span>
        <button class="drawer-close" id="drawerClose">${iconString(ICONS.close, 20)}</button>
      </div>
      <button class="drawer-link" data-route="/">${iconString(ICONS.calculator, 18)} Calculator</button>
      <button class="drawer-link" data-route="/dashboard">${iconString(ICONS.dashboard, 18)} Dashboard</button>
      <button class="drawer-link" data-route="/history">${iconString(ICONS.history, 18)} History</button>
      <button class="drawer-link" data-route="/profile">${iconString(ICONS.profile, 18)} Profile</button>
      <button class="drawer-link" data-route="/pricing">${iconString(ICONS.sparkles, 18)} Pricing</button>
      <div class="drawer-divider"></div>
      <button class="drawer-link" id="authDrawerBtn">${iconString(ICONS.signIn, 18)} Sign In</button>
      <div class="drawer-footer">SMLife · AI Smart Pricing Assistant</div>
    </div>

    <main id="mainContent"></main>

    <nav class="bottom-nav" id="bottomNav">
      <button class="bottom-nav-btn active" data-route="/">
        ${iconString(ICONS.calculator, 20)}<span>Calculator</span>
      </button>
      <button class="bottom-nav-btn" data-route="/dashboard">
        ${iconString(ICONS.dashboard, 20)}<span>Dashboard</span>
      </button>
      <button class="bottom-nav-btn" data-route="/history">
        ${iconString(ICONS.history, 20)}<span>History</span>
      </button>
      <button class="bottom-nav-btn" data-route="/profile">
        ${iconString(ICONS.profile, 20)}<span>Profile</span>
      </button>
    </nav>

    <button class="coach-chat-toggle" id="coachToggle" style="display:none;">
      ${iconString(ICONS.sparkles, 22)}
    </button>

    <div class="toast-container" id="toastContainer"></div>
  `;

  // Bind navigation events
  document.querySelectorAll("[data-route]").forEach(el => {
    el.addEventListener("click", () => {
      const route = (el as HTMLElement).dataset.route as Route;
      if (route === "/dashboard" || route === "/history" || route === "/profile") {
        if (!store.isAuthenticated()) {
          renderAuthModal();
          closeDrawer();
          return;
        }
      }
      if (route === "/") {
        if (window.location.hash === "#/" || window.location.hash === "") {
          document.getElementById("calcSection")?.scrollIntoView({ behavior: "smooth" });
          closeDrawer();
          return;
        } else {
          navigate("/");
          setTimeout(() => {
            document.getElementById("calcSection")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
          closeDrawer();
          return;
        }
      }
      navigate(route);
      closeDrawer();
    });
  });

  document.getElementById("hamburgerBtn")!.addEventListener("click", openDrawer);
  document.getElementById("drawerClose")!.addEventListener("click", closeDrawer);
  document.getElementById("drawerOverlay")!.addEventListener("click", closeDrawer);

  document.getElementById("authDesktopBtn")!.addEventListener("click", () => {
    if (store.isAuthenticated()) {
      store.signOut();
      updateAuthUI();
      navigate("/");
      return;
    }
    renderAuthModal();
  });

  document.getElementById("authDrawerBtn")!.addEventListener("click", () => {
    if (store.isAuthenticated()) {
      store.signOut();
      updateAuthUI();
      closeDrawer();
      navigate("/");
      return;
    }
    renderAuthModal();
    closeDrawer();
  });

  // Nav scroll
  window.addEventListener("scroll", () => {
    const nav = document.getElementById("topNav")!;
    nav.classList.toggle("scrolled", window.scrollY > 60);
  });

  // Coach toggle
  document.getElementById("coachToggle")!.addEventListener("click", () => {
    console.log("Coach toggle clicked");
    const panel = document.querySelector(".coach-panel");
    if (panel) {
      console.log("Toggling panel open state");
      panel.classList.toggle("open");
    } else {
      console.log("Panel not found, rendering AI Coach");
      renderAICoach();
    }
  });

  // Subscribe to auth changes
  store.subscribe(updateAuthUI);

  // Initial auth UI
  console.log("Calling initial updateAuthUI");
  updateAuthUI();

  // Register routes
  setupRoutes();

  // Start hash router
  startRouter();
}

function openDrawer(): void {
  document.getElementById("drawerOverlay")!.classList.add("open");
  document.getElementById("drawer")!.classList.add("open");
}

function closeDrawer(): void {
  document.getElementById("drawerOverlay")!.classList.remove("open");
  document.getElementById("drawer")!.classList.remove("open");
}

function updateAuthUI(): void {
  console.log("updateAuthUI called");
  const isAuth = store.isAuthenticated();
  const user = store.get().user;
  const desktopBtn = document.getElementById("authDesktopBtn")!;
  const drawerBtn = document.getElementById("authDrawerBtn")!;
  const coachToggle = document.getElementById("coachToggle")!;

  console.log(`Authentication state: ${isAuth}, User: ${user?.name}`);
  if (isAuth && user) {
    console.log("User is authenticated");
    desktopBtn.innerHTML = `${iconString(ICONS.profile, 16)} ${user.name.split(" ")[0]}`;
    desktopBtn.className = "nav-btn nav-btn-ghost";
    drawerBtn.innerHTML = `${iconString(ICONS.signOut, 18)} Sign Out`;
  } else {
    console.log("User is not authenticated");
    desktopBtn.innerHTML = `${iconString(ICONS.signIn, 16)} Sign In`;
    desktopBtn.className = "nav-btn nav-btn-primary";
    drawerBtn.innerHTML = `${iconString(ICONS.signIn, 18)} Sign In`;
  }

  // Show coach toggle only when authenticated
  coachToggle.style.display = isAuth ? "flex" : "none";
}

function updateBottomNav(route: Route): void {
  document.querySelectorAll(".bottom-nav-btn").forEach(btn => {
    btn.classList.toggle("active", (btn as HTMLElement).dataset.route === route);
  });
}

function setupRoutes(): void {
  onRoute("/", () => {
    cleanupDashboard();
    cleanupAICoach();
    updateBottomNav("/");
    const main = document.getElementById("mainContent")!;
    main.innerHTML = `
      <div class="page" id="landingPage">
        <div id="heroSection"></div>
        <div id="tickerSection"></div>
        <div id="statsSection"></div>
        <div id="costAlert"></div>
        <div id="calcSection"></div>
        <div id="featuresSection" class="lazy-load"></div>
        <div id="pricingSection" class="lazy-load"></div>
        <div id="tipsSection" class="lazy-load"></div>
        <div id="bannerSection" class="lazy-load"></div>
        <div id="footerSection"></div>
      </div>
    `;
    renderHero();
    renderTicker();
    renderStats();
    renderCostAlert();
    renderCalculator();

    // Set up IntersectionObserver for lazy loading
    const lazySections = document.querySelectorAll('.lazy-load');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          switch(sectionId) {
            case 'featuresSection':
              renderFeatures();
              break;
            case 'pricingSection':
              renderPricingSection();
              break;
            case 'tipsSection':
              renderTipsSection();
              break;
            case 'bannerSection':
              renderEmpowermentBanner();
              break;
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    lazySections.forEach(section => {
      observer.observe(section);
    });

    renderFooter();
    window.scrollTo(0, 0);
  });

  onRoute("/pricing", () => {
    cleanupCalculator();
    cleanupDashboard();
    cleanupAICoach();
    updateBottomNav("/pricing");
    const main = document.getElementById("mainContent")!;
    main.innerHTML = `<div class="page" id="pricingPage"></div>`;
    renderPricingPage();
    window.scrollTo(0, 0);
  });

  onRoute("/dashboard", () => {
    cleanupCalculator();
    cleanupAICoach();
    updateBottomNav("/dashboard");
    if (!store.isAuthenticated()) { renderAuthModal(); return; }
    const main = document.getElementById("mainContent")!;
    main.innerHTML = `<div class="page" id="dashboardPage"></div>`;
    renderDashboard();
    window.scrollTo(0, 0);
  });

  onRoute("/history", () => {
    cleanupCalculator();
    cleanupDashboard();
    cleanupAICoach();
    updateBottomNav("/history");
    if (!store.isAuthenticated()) { renderAuthModal(); return; }
    const main = document.getElementById("mainContent")!;
    main.innerHTML = `<div class="page" id="historyPage"></div>`;
    renderHistory();
    window.scrollTo(0, 0);
  });

  onRoute("/profile", () => {
    cleanupCalculator();
    cleanupDashboard();
    cleanupAICoach();
    updateBottomNav("/profile");
    if (!store.isAuthenticated()) { renderAuthModal(); return; }
    const main = document.getElementById("mainContent")!;
    main.innerHTML = `<div class="page" id="profilePage"></div>`;
    renderProfile();
    window.scrollTo(0, 0);
  });
}

/* ── Helpers rendered inline ── */

function renderTicker(): void {
  const tips = [
    "Many women-led businesses undercharge by 30–40% due to hidden costs",
    "Always include packaging in your unit cost, as it adds up fast",
    "Electricity & rent should be split across all products you make monthly",
    "Delivery and transport fees are real costs, never absorb them yourself",
    "A healthy profit margin for most SMEs is between 20–40%",
    "Price your worth, because your time, skill, and expertise deserve compensation",
  ];
  const items = tips.map(t => `<span class="ticker-item"><span class="ticker-dot"></span>${t}</span>`).join("");
  document.getElementById("tickerSection")!.innerHTML = `
    <div class="tips-ticker">
      <div class="ticker-inner">${items}${items}</div>
    </div>
  `;
}

function renderStats(): void {
  document.getElementById("statsSection")!.innerHTML = `
    <div class="stats-strip">
      <div class="stat-item">
        <div class="stat-number" id="stat1">67%</div>
        <div class="stat-label">of women SMEs underprice products</div>
      </div>
      <div class="stat-item">
        <div class="stat-number" id="stat2">12+</div>
        <div class="stat-label">hidden cost categories tracked</div>
      </div>
      <div class="stat-item">
        <div class="stat-number" id="stat3">3×</div>
        <div class="stat-label">faster than manual costing</div>
      </div>
      <div class="stat-item">
        <div class="stat-number" id="stat4">100%</div>
        <div class="stat-label">free to use, always</div>
      </div>
    </div>
  `;
}

function renderCostAlert(): void {
  document.getElementById("costAlert")!.innerHTML = `
    <div class="section" style="padding-bottom:0;">
      <div class="hidden-costs-wrap">
        <h3>Are Hidden Costs Eating Your Profits?</h3>
        <p>Most small business owners only count raw materials, missing transport, fuel, electricity, packaging, delivery, rent, and their own time. SMLife surfaces <strong>every cost</strong> so your price truly reflects what it costs to make and deliver your product.</p>
      </div>
    </div>
  `;
}

// Toast notification
export function showToast(message: string): void {
  const container = document.getElementById("toastContainer")!;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `${iconString(ICONS.check, 16)} ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Boot
bootstrap();

// Initialize animations after bootstrap
setTimeout(initAllAnimations, 100);
