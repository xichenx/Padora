import type { AppPreferences } from "../types";
import { PREF_KEY } from "./constants";

export function loadPrefs(): AppPreferences {
  try {
    return JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
  } catch {
    return {};
  }
}

export function savePrefs(prefs: AppPreferences): void {
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore quota errors */
  }
}

export const PREFS = loadPrefs();
