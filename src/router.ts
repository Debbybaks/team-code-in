import type { Route } from "./types";

type RouteHandler = (params: Record<string, string>) => void;

const handlers = new Map<Route, RouteHandler>();
let currentRoute: Route = "/";
let currentParams: Record<string, string> = {};

export function onRoute(route: Route, handler: RouteHandler): void {
  handlers.set(route, handler);
}

function matchRoute(hash: string): { route: Route; params: Record<string, string> } {
  const path = hash.replace(/^#/, "") || "/";

  // Try exact match first
  const exactMatch = [...handlers.keys()].find(r => r === path);
  if (exactMatch) return { route: exactMatch, params: {} };

  // Try parameterized routes like /calculator/:id
  for (const pattern of handlers.keys()) {
    const patternParts = pattern.split("/");
    const pathParts = path.split("/");
    if (patternParts.length !== pathParts.length) continue;

    const params: Record<string, string> = {};
    let match = true;
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(":")) {
        params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
      } else if (patternParts[i] !== pathParts[i]) {
        match = false;
        break;
      }
    }
    if (match) {
      // Find the original pattern route
      const matchedRoute = pattern as Route;
      return { route: matchedRoute, params };
    }
  }

  return { route: "/", params: {} };
}

function handleHashChange(): void {
  const { route, params } = matchRoute(window.location.hash);
  currentRoute = route;
  currentParams = params;
  const handler = handlers.get(route);
  if (handler) {
    handler(params);
  }
}

export function navigate(path: Route): void {
  window.location.hash = path;
}

export function getCurrentRoute(): Route {
  return currentRoute;
}

export function getCurrentParams(): Record<string, string> {
  return currentParams;
}

export function startRouter(): void {
  window.addEventListener("hashchange", handleHashChange);
  // Initial load
  if (!window.location.hash) {
    window.location.hash = "#/";
  } else {
    handleHashChange();
  }
}
