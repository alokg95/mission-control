// P0-001: ConvexProvider when VITE_CONVEX_URL is set, MockStoreProvider fallback
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import "./index.css";
import App from "./App";
import { USE_CONVEX, MockStoreProvider } from "./lib/store-context";

// Create client outside component to avoid recreation on every render
const convexClient = USE_CONVEX
  ? new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)
  : null;

function Root() {
  if (USE_CONVEX && convexClient) {
    return (
      <ConvexProvider client={convexClient}>
        <App />
      </ConvexProvider>
    );
  }
  return (
    <MockStoreProvider>
      <App />
    </MockStoreProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
