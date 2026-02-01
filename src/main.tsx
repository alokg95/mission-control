// P0-001: ConvexProvider when VITE_CONVEX_URL is set, MockStoreProvider fallback
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import "./index.css";
import App from "./App";
import { USE_CONVEX, MockStoreProvider } from "./lib/store-context";

function Root() {
  if (USE_CONVEX) {
    const client = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);
    return (
      <ConvexProvider client={client}>
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
