// Stub for Node-only built-ins pulled in by WASM glue (e.g. mupdf's `await import("module")`).
// Only reached on the Node code path, which never runs in the browser worker.
export const createRequire = () => () => ({});
const shim = {};
export default shim;
