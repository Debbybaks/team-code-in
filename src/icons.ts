import { icons } from "lucide";

const iconCache = new Map<string, SVGElement>();

function renderIcon(iconStructure: any): SVGElement {
  const [tag, attrs, children] = iconStructure;
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, val] of Object.entries(attrs || {})) {
    el.setAttribute(key, String(val));
  }
  if (children && Array.isArray(children)) {
    for (const child of children) {
      el.appendChild(renderIcon(child));
    }
  }
  return el;
}

export function icon(name: string, size = 20, className = ""): SVGElement {
  if (!name || typeof name !== "string") {
    const fallback = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    fallback.setAttribute("width", String(size));
    fallback.setAttribute("height", String(size));
    fallback.setAttribute("viewBox", "0 0 24 24");
    fallback.innerHTML = `<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>`;
    if (className) fallback.setAttribute("class", className);
    return fallback;
  }

  const cacheKey = `${name}_${size}_${className}`;
  const cached = iconCache.get(cacheKey);
  if (cached) return cached.cloneNode(true) as SVGElement;

  const IconComponent = (icons as Record<string, unknown>)[iconName(name)];
  if (!IconComponent || !Array.isArray(IconComponent)) {
    const fallback = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    fallback.setAttribute("width", String(size));
    fallback.setAttribute("height", String(size));
    fallback.setAttribute("viewBox", "0 0 24 24");
    fallback.innerHTML = `<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>`;
    if (className) fallback.setAttribute("class", className);
    return fallback;
  }

  const el = renderIcon(IconComponent);
  el.setAttribute("width", String(size));
  el.setAttribute("height", String(size));
  if (className) el.setAttribute("class", className);

  iconCache.set(cacheKey, el.cloneNode(true) as SVGElement);
  return el;
}

export function iconString(name: string, size = 20, className = ""): string {
  const el = icon(name, size, className);
  return el.outerHTML;
}

export function iconElement(name: string, size = 20, className = ""): HTMLElement {
  return icon(name, size, className) as unknown as HTMLElement;
}

function iconName(name: string): string {
  return name
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export const ICONS = {
  calculator: "calculator",
  dashboard: "layout-dashboard",
  history: "clock-3",
  profile: "user",
  signOut: "log-out",
  signIn: "log-in",
  plus: "plus",
  trash: "trash-2",
  copy: "clipboard-copy",
  close: "x",
  menu: "menu",
  arrowLeft: "arrow-left",
  arrowRight: "arrow-right",
  check: "check",
  alertTriangle: "alert-triangle",
  checkCircle: "check-circle",
  info: "info",
  sparkles: "sparkles",
  flower2: "flower-2",
  leaf: "leaf",
  package: "package",
  wrench: "wrench",
  home: "home",
  zap: "zap",
  droplet: "droplet",
  smartphone: "smartphone",
  megaphone: "megaphone",
  refreshCw: "refresh-cw",
  fuel: "fuel",
  repeat: "repeat",
  truck: "truck",
  mail: "mail",
  store: "store",
  clock: "clock",
  timer: "timer",
  users: "users",
  graduationCap: "graduation-cap",
  target: "target",
  barChart3: "bar-chart-3",
  piggyBank: "piggy-bank",
  shield: "shield",
  lightbulb: "lightbulb",
  trendingUp: "trending-up",
  venus: "venus",
  search: "search",
  settings: "settings",
  moon: "moon",
  sun: "sun",
  share2: "share-2",
  download: "download",
  externalLink: "external-link",
  receipt: "receipt",
  factory: "factory",
  lock: "lock",
  list: "list",
  globe: "globe",
} as const;
