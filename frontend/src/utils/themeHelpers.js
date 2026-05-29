/**
 * Theme helpers
 */

export function normalizeTheme(theme) {
  return theme === "dark" ? "dark" : "light";
}

export function readInitialTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = window.localStorage.getItem("campusride-theme");

  if (savedTheme) {
    return normalizeTheme(savedTheme);
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    ? "dark"
    : "light";
}
