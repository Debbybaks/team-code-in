import type { UserProfile, SavedCalc, CurrencyCode } from "./types";

export interface AppState {
  user: UserProfile | null;
  session: string | null;
  currency: CurrencyCode;
  savedCalcs: SavedCalc[];
  activeCalcId: string | null;
  sidebarOpen: boolean;
  theme: "light" | "dark";
}

type Listener = () => void;

const STORAGE_KEY = "smlife_v2";

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return {
        user: data.user ?? null,
        session: data.session ?? null,
        currency: data.currency ?? "NGN",
        savedCalcs: data.savedCalcs ?? [],
        activeCalcId: data.activeCalcId ?? null,
        sidebarOpen: false,
        theme: "light",
      };
    }
  } catch { /* ignore */ }
  return {
    user: null,
    session: null,
    currency: "NGN",
    savedCalcs: [],
    activeCalcId: null,
    sidebarOpen: false,
    theme: "light",
  };
}

function persist(state: AppState): void {
  const toStore = {
    user: state.user,
    session: state.session,
    currency: state.currency,
    savedCalcs: state.savedCalcs,
    activeCalcId: state.activeCalcId,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
}

class Store {
  state: AppState = load();
  private listeners = new Set<Listener>();

  get(): AppState {
    return this.state;
  }

  update(partial: Partial<AppState>): void {
    this.state = { ...this.state, ...partial };
    persist(this.state);
    this.notify();
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify(): void {
    for (const fn of this.listeners) fn();
  }

  // Auth helpers
  signIn(name: string, email: string, businessName: string): void {
    const session = crypto.randomUUID?.() ?? Date.now().toString(36);
    this.update({
      user: { name, email, businessName, currency: this.state.currency },
      session,
    });
  }

  signOut(): void {
    this.update({ user: null, session: null });
  }

  isAuthenticated(): boolean {
    return this.state.user !== null && this.state.session !== null;
  }

  // Calculator helpers
  saveCalc(calc: SavedCalc): void {
    const calcs = [calc, ...this.state.savedCalcs].slice(0, 50);
    this.update({ savedCalcs: calcs, activeCalcId: calc.id });
  }

  deleteCalc(id: string): void {
    this.update({
      savedCalcs: this.state.savedCalcs.filter(c => c.id !== id),
      activeCalcId: this.state.activeCalcId === id ? null : this.state.activeCalcId,
    });
  }

  getCalc(id: string): SavedCalc | undefined {
    return this.state.savedCalcs.find(c => c.id === id);
  }

  clearCalcs(): void {
    this.update({ savedCalcs: [], activeCalcId: null });
  }
}

export const store = new Store();
