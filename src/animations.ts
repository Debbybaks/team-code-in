import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export function initHeroAnimations() {
  // Hero stagger entrance animation
  gsap.from(".hero-content h1, .hero-content p, .hero-content .cta-group", {
    opacity: 0,
    y: 30,
    duration: 0.8,
    stagger: 0.2,
    ease: "power3.out"
  });

  // Hero orbs floating animation
  const orbs = document.querySelectorAll(".hero-orb");
  orbs.forEach((orb, index) => {
    const delay = index * 0.2;
    const duration = 4 + Math.random() * 2;
    const xRange = 20 + Math.random() * 30;
    const yRange = 20 + Math.random() * 30;
    
    gsap.to(orb, {
      x: `+=${xRange * (Math.random() > 0.5 ? 1 : -1)}`,
      y: `+=${yRange * (Math.random() > 0.5 ? 1 : -1)}`,
      duration: duration,
      delay: delay,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    });
  });
}

export function initStatsCountUp() {
  // Stats count-up on scroll
  gsap.utils.toArray(".stat-number").forEach((el: any) => {
    const endValue = parseFloat(el.textContent.replace(/[^0-9.]/g, ""));
    
    ScrollTrigger.create({
      trigger: el,
      start: "top 80%",
      onEnter: () => {
        gsap.fromTo(el, {
          innerText: 0
        }, {
          innerText: endValue,
          duration: 2,
          snap: { innerText: 1 },
          ease: "power3.out"
        });
      }
    });
  });
}

export function initFeaturesStagger() {
  // Features stagger fade-in on scroll
  gsap.from(".feature-card", {
    opacity: 0,
    y: 30,
    duration: 0.6,
    stagger: 0.15,
    scrollTrigger: {
      trigger: "#featuresSection",
      start: "top 80%",
      toggleActions: "play none none none"
    }
  });
}

export function initCalculatorResultsTween() {
  // Calculator results number tween
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.textContent?.includes("₦")) {
        const resultElements = document.querySelectorAll(".calc-result-card .result-value");
        resultElements.forEach((el: any) => {
          const endValue = parseFloat(el.textContent.replace(/[^0-9.]/g, ""));
          
          gsap.fromTo(el, {
            innerText: 0
          }, {
            innerText: endValue,
            duration: 1.5,
            snap: { innerText: 0.01 },
            ease: "power3.out"
          });
        });
      }
    });
  });
  
  const calcResults = document.getElementById("calcResults");
  if (calcResults) {
    observer.observe(calcResults, { childList: true, subtree: true });
  }
}

export function initProfitMeterAnimation() {
  // Profit meter smooth fill
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      const meterFill = document.querySelector(".profit-meter-fill");
      const meterText = document.querySelector(".profit-meter-text");
      
      if (meterFill && meterText) {
        const width = meterFill.getAttribute("data-width");
        gsap.to(meterFill, {
          width: width + "%",
          duration: 1.5,
          ease: "power3.out"
        });
      }
    });
  });
  
  const meterContainer = document.querySelector(".profit-meter");
  if (meterContainer) {
    observer.observe(meterContainer, { childList: true, subtree: true });
  }
}

export function initAuthModalAnimation() {
  // Auth modal scale-in animation
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
       if ((mutation.target as HTMLElement).classList.contains("open")) {
        gsap.from(".auth-modal-content", {
          scale: 0.9,
          opacity: 0,
          duration: 0.3,
          ease: "back.out(1.7)"
        });
      }
    });
  });
  
  const authModal = document.getElementById("authModal");
  if (authModal) {
    observer.observe(authModal, { attributes: true, attributeFilter: ["class"] });
  }
}

export function initDashboardStagger() {
  // Dashboard stagger cards
  gsap.from(".dashboard-card", {
    opacity: 0,
    y: 30,
    duration: 0.6,
    stagger: 0.15,
    scrollTrigger: {
      trigger: "#dashboardPage",
      start: "top 80%",
      toggleActions: "play none none none"
    }
  });
}

export function initAllAnimations() {
  initHeroAnimations();
  initStatsCountUp();
  initFeaturesStagger();
  initCalculatorResultsTween();
  initProfitMeterAnimation();
  initAuthModalAnimation();
  initDashboardStagger();
}