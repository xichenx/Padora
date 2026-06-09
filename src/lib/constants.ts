export const IMAGE_EXT = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"];
export const MD_EXT = ["md", "markdown", "mdx"];
export const PREF_KEY = "padora.prefs";

export const ICON_PATHS: Record<string, string> = {
  sidebar:
    "M3 4h18v16H3V4zm6 0v16M5 8h2M5 12h2M5 16h2",
  file:
    "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6zM14 3v6h6",
  folder:
    "M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z",
  save:
    "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
  search:
    "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  list:
    "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  up: "M18 15l-6-6-6 6",
  down: "M6 9l6 6 6-6",
  close: "M18 6L6 18M6 6l12 12",
  moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z",
  sun:
    "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
};

/** Pairs that wrap the selection when typed while text is selected. */
export const WRAP_PAIRS: Record<string, string> = {
  "*": "*",
  "`": "`",
  _: "_",
  "(": ")",
  "[": "]",
  '"': '"',
  "“": "”",
  "（": "）",
};
