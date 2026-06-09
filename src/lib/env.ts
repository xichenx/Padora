/** True only inside the Tauri webview; lets the UI still render in a plain browser. */
export const IS_TAURI =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
