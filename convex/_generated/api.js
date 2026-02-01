// Stub — run `npx convex dev` to generate real module
// This stub enables import in Vite when no Convex backend is configured
export const api = new Proxy({}, {
  get(_target, moduleName) {
    return new Proxy({}, {
      get(_t, fnName) {
        return `${String(moduleName)}:${String(fnName)}`;
      }
    });
  }
});
