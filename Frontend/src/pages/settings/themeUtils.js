const THEME_STORAGE_KEY = "arca-theme";

export function getStoredTheme() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === "dark" || storedTheme === "light" ? storedTheme : null;
}

export function getSystemTheme() {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getThemePreferenceFromDocument() {
  const storedTheme = getStoredTheme();

  if (storedTheme === "dark") {
    return "oscuro";
  }

  if (storedTheme === "light") {
    return "claro";
  }

  return getSystemTheme() === "dark" ? "oscuro" : "claro";
}

export function applyThemePreference(preference) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const nextTheme =
    preference === "claro"
      ? "light"
      : preference === "sistema"
        ? getSystemTheme()
        : "dark";

  if (preference === "sistema") {
    window.localStorage.removeItem(THEME_STORAGE_KEY);
  } else {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }

  root.classList.toggle("dark", nextTheme === "dark");
  root.style.colorScheme = nextTheme;
  window.dispatchEvent(new Event("arca-theme-change"));
}
