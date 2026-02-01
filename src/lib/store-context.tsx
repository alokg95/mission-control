import { createContext, useContext, useSyncExternalStore, useCallback, type ReactNode } from "react";
import { store, type MockStore } from "./mock-data";

const StoreContext = createContext<MockStore>(store);

export function StoreProvider({ children }: { children: ReactNode }) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): MockStore {
  return useContext(StoreContext);
}

export function useAgents() {
  const s = useStore();
  return useSyncExternalStore(
    useCallback((cb: () => void) => s.subscribe(cb), [s]),
    () => s.agents
  );
}

export function useTasks() {
  const s = useStore();
  return useSyncExternalStore(
    useCallback((cb: () => void) => s.subscribe(cb), [s]),
    () => s.tasks
  );
}

export function useActivities() {
  const s = useStore();
  return useSyncExternalStore(
    useCallback((cb: () => void) => s.subscribe(cb), [s]),
    () => s.activities
  );
}

export function useMessages() {
  const s = useStore();
  return useSyncExternalStore(
    useCallback((cb: () => void) => s.subscribe(cb), [s]),
    () => s.messages
  );
}
